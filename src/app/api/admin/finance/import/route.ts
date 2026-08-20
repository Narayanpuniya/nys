import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { generateTxnCode } from "@/lib/sequence";

/** Simple CSV parser — handles quoted fields */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "", inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { result.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    result.push(cur.trim());
    return result;
  }

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase()
    .replace(/दिनांक|date|तारीख/i, "date")
    .replace(/श्रेणी|category|विभाग|वर्ग/i, "category")
    .replace(/राशि|amount|रकम/i, "amount")
    .replace(/विवरण|description|note|विवरण\/टिप्पणी/i, "description")
    .replace(/माध्यम|mode|payment/i, "mode")
    .replace(/स्रोत|source/i, "source")
    .replace(/प्रकार|type/i, "type")
  );

  return lines.slice(1).map(line => {
    const vals = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

function normalizeMode(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("upi") || s.includes("gpay") || s.includes("phonepe")) return "UPI";
  if (s.includes("bank") || s.includes("neft") || s.includes("rtgs")) return "BANK_TRANSFER";
  if (s.includes("cheque") || s.includes("check") || s.includes("चेक")) return "CHEQUE";
  if (s.includes("card")) return "CARD";
  return "CASH";
}

function parseDate(raw: string): Date {
  if (!raw?.trim()) return new Date();
  const parts = raw.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    const d = c > 1000 ? new Date(c, b - 1, a) : new Date(a, b - 1, c);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.FINANCE_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "फ़ाइल नहीं मिली।" }, { status: 400 });

  const file = fd.get("file") as File | null;
  const importType = (fd.get("type") as string) || "expense"; // "expense" | "income"

  if (!file) return NextResponse.json({ error: "CSV फ़ाइल आवश्यक है।" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: "CSV खाली है या format गलत है।" }, { status: 400 });

  let imported = 0, skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const amtRaw = (row["amount"] || row["राशि"] || "").replace(/[₹,\s]/g, "");
    const amt = parseInt(amtRaw, 10);
    if (!amt || amt <= 0) { errors.push(`Row ${rowNum}: राशि गलत "${amtRaw}" — skip`); skipped++; continue; }

    const category = (row["category"] || row["श्रेणी"] || "अन्य").trim();
    const description = (row["description"] || row["विवरण"] || "").trim();
    const dateRaw = row["date"] || row["दिनांक"] || "";
    const modeRaw = row["mode"] || row["माध्यम"] || "CASH";
    const date = parseDate(dateRaw);
    const mode = normalizeMode(modeRaw);

    try {
      if (importType === "income") {
        const source = (row["source"] || row["स्रोत"] || "अन्य").trim();
        const txnCode = await generateTxnCode("INC");
        await prisma.income.create({
          data: { txnCode, amount: amt, category, source, description, mode, date, createdById: user.id, createdAt: date },
        });
      } else {
        const txnCode = await generateTxnCode("EXP");
        await prisma.expense.create({
          data: { txnCode, amount: amt, category, description, mode, date, createdById: user.id, createdAt: date },
        });
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${rowNum}: DB error — ${e instanceof Error ? e.message : "unknown"}`);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, total: rows.length, errors: errors.slice(0, 20) });
}
