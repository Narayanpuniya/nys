import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { memberSchema } from "@/lib/validation";
import { generateMemberCode, generateMembershipReceipt } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";
import { saveReceiptProof } from "@/lib/upload";
import { logAudit } from "@/lib/audit";
import { hashMemberPassword } from "@/lib/member-auth";

/**
 * ऑफलाइन सदस्यता: UPI/बैंक भुगतान की रसीद अपलोड → PENDING सदस्य + PENDING भुगतान।
 * एडमिन रसीद देखकर स्वीकृत करेगा।
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const proof = form.get("proof");

    const raw = {
      fullName: String(form.get("fullName") ?? ""),
      guardianName: String(form.get("guardianName") ?? ""),
      dob: String(form.get("dob") ?? ""),
      gender: String(form.get("gender") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      email: String(form.get("email") ?? ""),
      address: String(form.get("address") ?? ""),
      village: String(form.get("village") ?? ""),
      tehsil: String(form.get("tehsil") ?? ""),
      district: String(form.get("district") ?? ""),
      state: String(form.get("state") ?? "Rajasthan"),
      occupation: String(form.get("occupation") ?? ""),
      bloodGroup: String(form.get("bloodGroup") ?? ""),
      emergencyContact: String(form.get("emergencyContact") ?? ""),
      photoUrl: String(form.get("photoUrl") ?? ""),
      planId: String(form.get("planId") ?? ""),
      consent: form.get("consent") === "true" || form.get("consent") === "on",
    };
    const rawPassword = String(form.get("password") ?? "").trim();

    const parsed = memberSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "अमान्य डेटा", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (!(proof instanceof File) || proof.size === 0) {
      return NextResponse.json({ error: "कृपया भुगतान रसीद / स्क्रीनशॉट अपलोड करें।" }, { status: 400 });
    }

    let proofUrl: string;
    try {
      proofUrl = await saveReceiptProof(proof, { maxBytes: 2 * 1024 * 1024 });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "रसीद अपलोड विफल।" },
        { status: 400 },
      );
    }

    const d = parsed.data;

    // ── Duplicate mobile check ──
    const existingMobile = await prisma.member.findFirst({
      where: { mobile: d.mobile, deletedAt: null },
      select: { id: true },
    });
    if (existingMobile) {
      return NextResponse.json(
        { error: "यह मोबाइल नंबर पहले से पंजीकृत है। Admin से संपर्क करें या अपनी पुरानी सदस्यता देखें।" },
        { status: 409 },
      );
    }

    const plan = await prisma.membershipPlan.findUnique({ where: { id: d.planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "सदस्यता योजना अमान्य।" }, { status: 400 });
    }

    const settings = await getSettings();
    const memberCode = await generateMemberCode(settings.memberIdPrefix);
    const receiptNumber = await generateMembershipReceipt(settings.membershipReceiptPrefix);

    const passwordHash = rawPassword.length >= 6
      ? await hashMemberPassword(rawPassword)
      : null;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.periodDays * 86400000);
    const modeRaw = String(form.get("mode") ?? "UPI").toUpperCase();
    const mode = modeRaw === "BANK_TRANSFER" ? "BANK_TRANSFER" : "UPI";
    const notes = String(form.get("notes") ?? "").trim() || null;

    const member = await prisma.member.create({
      data: {
        memberCode,
        fullName: d.fullName,
        guardianName: d.guardianName || null,
        dob: d.dob ? new Date(d.dob) : null,
        gender: d.gender || null,
        mobile: d.mobile,
        whatsapp: d.whatsapp || null,
        email: d.email || null,
        address: d.address || null,
        village: d.village || null,
        tehsil: d.tehsil || null,
        district: d.district || null,
        state: d.state || "Rajasthan",
        occupation: d.occupation || null,
        bloodGroup: d.bloodGroup || null,
        photoUrl: d.photoUrl || null,
        emergencyContact: d.emergencyContact || null,
        planId: plan.id,
        status: "PENDING",
        consent: true,
        showMobile: settings.privacy.showMemberMobileDefault,
        validUntil: periodEnd,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await prisma.membershipPayment.create({
      data: {
        receiptNumber,
        memberId: member.id,
        planId: plan.id,
        amount: plan.amount,
        periodStart: now,
        periodEnd,
        mode,
        status: "PENDING",
        proofUrl,
        notes,
      },
    });

    // ── स्वयंसेवक auto-create ──
    const wantVolunteer = form.get("wantVolunteer") === "true";
    const volunteerAreasRaw = String(form.get("volunteerAreas") ?? "[]");
    let volunteerAreas: string[] = [];
    try { volunteerAreas = JSON.parse(volunteerAreasRaw); } catch { /* ignore */ }
    if (wantVolunteer && volunteerAreas.length > 0) {
      await prisma.volunteer.create({
        data: {
          memberId: member.id,
          name: member.fullName,
          mobile: member.mobile,
          areas: JSON.stringify(volunteerAreas),
          note: "सदस्यता फ़ॉर्म से स्वयंसेवक हेतु आवेदन",
          status: "NEW",
        },
      });
    }

    await logAudit({
      action: "CREATE",
      entity: "Member",
      entityId: member.id,
      summary: `ऑफलाइन आवेदन + रसीद: ${member.fullName} (${memberCode})`,
    });

    return NextResponse.json({
      ok: true,
      memberId: member.id,
      memberCode,
      status: "PENDING",
      mode: "receipt",
    });
  } catch (err) {
    console.error("[POST /api/members/offline]", err);
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      {
        error: `आवेदन सहेजा नहीं जा सका। ${detail.includes("connect") || detail.includes("P1001") || detail.includes("P1017") ? "Hostinger DATABASE_URL (Neon Direct) जाँचें।" : detail.slice(0, 180)}`,
      },
      { status: 500 },
    );
  }
}
