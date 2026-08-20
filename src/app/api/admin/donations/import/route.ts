import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";

function genReceipt(date: Date): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rnd = String(Math.floor(1000 + Math.random() * 9000));
  return `DNT-${ymd}-${rnd}`;
}

/** Simple CSV parser — handles quoted fields with commas inside */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { result.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]).map(h =>
    h.toLowerCase()
      .replace(/नाम|name/i, "name")
      .replace(/मोबाइल|mobile|phone|फोन/i, "mobile")
      .replace(/राशि|amount|रकम/i, "amount")
      .replace(/दिनांक|date|तारीख/i, "date")
      .replace(/माध्यम|mode|payment/i, "mode")
      .replace(/उद्देश्य|purpose|category/i, "purpose")
      .replace(/संदेश|message|note/i, "message")
      .replace(/स्थिति|status/i, "status")
  );

  return lines.slice(1).map(line => {
    const vals = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

/** Normalize payment mode */
function normalizeMode(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("upi") || s.includes("gpay") || s.includes("phonepe") || s.includes("paytm")) return "UPI";
  if (s.includes("cash") || s.includes("नकद")) return "CASH";
  if (s.includes("bank") || s.includes("neft") || s.includes("rtgs") || s.includes("बैंक")) return "BANK_TRANSFER";
  if (s.includes("cheque") || s.includes("check") || s.includes("चेक")) return "CHEQUE";
  if (s.includes("card") || s.includes("कार्ड")) return "CARD";
  return "CASH"; // default
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "फ़ाइल नहीं मिली।" }, { status: 400 });

  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "CSV फ़ाइल आवश्यक है।" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: "CSV खाली है या format गलत है।" }, { status: 400 });

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based + header

    const nameRaw = (row["name"] || row["नाम"] || "").trim();
    const amtRaw = (row["amount"] || row["राशि"] || "").replace(/[₹,\s]/g, "");
    const amt = parseInt(amtRaw, 10);

    if (!nameRaw) { errors.push(`Row ${rowNum}: नाम खाली है — skip`); skipped++; continue; }
    if (!amt || amt <= 0) { errors.push(`Row ${rowNum}: राशि गलत "${amtRaw}" — skip`); skipped++; continue; }

    const mobileRaw = (row["mobile"] || row["मोबाइल"] || "").replace(/\D/g, "").slice(-10);
    const dateRaw = (row["date"] || row["दिनांक"] || "").trim();
    const modeRaw = (row["mode"] || row["माध्यम"] || "CASH").trim();
    const purposeRaw = (row["purpose"] || row["उद्देश्य"] || "GENERAL").trim().toUpperCase();
    const messageRaw = (row["message"] || row["संदेश"] || "").trim();
    const statusRaw = (row["status"] || row["स्थिति"] || "SUCCESS").trim().toUpperCase();

    // Parse date
    let paidAt: Date | null = null;
    if (dateRaw) {
      // Support: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
      const parts = dateRaw.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        if (c > 1000) paidAt = new Date(c, b - 1, a); // DD/MM/YYYY
        else if (a > 1000) paidAt = new Date(a, b - 1, c); // YYYY-MM-DD
      }
    }
    if (!paidAt || isNaN(paidAt.getTime())) paidAt = new Date();

    // Donor
    let donorId: string | null = null;
    if (mobileRaw.length >= 10) {
      const existing = await prisma.donor.findFirst({ where: { mobile: mobileRaw } });
      if (existing) {
        donorId = existing.id;
        // Update name if not set
        if (!existing.name || existing.name.trim() === "") {
          await prisma.donor.update({ where: { id: existing.id }, data: { name: nameRaw } });
        }
      } else {
        const d = await prisma.donor.create({ data: { name: nameRaw, mobile: mobileRaw } });
        donorId = d.id;
      }
    }

    // Unique receipt
    let receiptNumber = genReceipt(paidAt);
    let tries = 0;
    while (await prisma.donation.findUnique({ where: { receiptNumber } }) && tries < 10) {
      await new Promise(r => setTimeout(r, 5));
      receiptNumber = genReceipt(paidAt!);
      tries++;
    }

    const validStatus = ["SUCCESS", "PAID", "PENDING", "FAILED", "VOID"].includes(statusRaw) ? statusRaw : "SUCCESS";
    const validPurpose = ["GENERAL", "EDUCATION", "SPORTS", "ENVIRONMENT", "FOOD", "MEDICAL", "OTHER"].includes(purposeRaw) ? purposeRaw : "GENERAL";

    try {
      await prisma.donation.create({
        data: {
          receiptNumber,
          donorName: nameRaw,
          donorId,
          amount: amt,
          mode: normalizeMode(modeRaw),
          purpose: validPurpose,
          status: validStatus,
          message: messageRaw || null,
          paidAt: validStatus === "SUCCESS" || validStatus === "PAID" ? paidAt : null,
          createdAt: paidAt,
        },
      });
      imported++;
    } catch (e) {
      errors.push(`Row ${rowNum}: DB error — ${e instanceof Error ? e.message : "unknown"}`);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, total: rows.length, errors: errors.slice(0, 20) });
}
