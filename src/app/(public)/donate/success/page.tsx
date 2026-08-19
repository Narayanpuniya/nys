import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { formatINR, formatDateHi } from "@/lib/utils";
import { ShareButtons } from "@/components/public/ShareButtons";
import { DonationProofUpload } from "@/components/public/DonationProofUpload";

export const dynamic = "force-dynamic";

export default async function DonationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ receipt?: string }>;
}) {
  const { receipt } = await searchParams;
  const donation = receipt
    ? await prisma.donation.findUnique({ where: { receiptNumber: receipt } })
    : null;

  // ── No donation found ──────────────────────────────────────────────────────
  if (!donation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
        <h1 className="text-2xl font-bold text-ink">दान रिकॉर्ड नहीं मिला</h1>
        <p className="mt-2 text-stone-500">रसीद संख्या गलत हो सकती है।</p>
        <ButtonLink href="/" variant="outline" className="mt-6">होम पर जाएँ</ButtonLink>
      </div>
    );
  }

  const isSuccess = donation.status === "SUCCESS";
  const isPaid    = donation.status === "PAID";    // payment done, admin approval pending
  const isPending = donation.status === "PENDING";  // payment not yet captured
  const isFailed  = donation.status === "FAILED";

  // ── FAILED ────────────────────────────────────────────────────────────────
  if (isFailed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink">भुगतान अस्वीकृत</h1>
        <p className="mt-2 text-stone-500">
          {donation.adminNote || "आपका भुगतान सत्यापित नहीं हो सका। कृपया संपर्क करें।"}
        </p>
        <div className="mt-4 inline-block rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          रसीद: {donation.receiptNumber}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/donate" variant="outline">फिर से प्रयास करें</ButtonLink>
          <ButtonLink href="/contact">संपर्क करें</ButtonLink>
        </div>
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-ink">धन्यवाद! 🙏</h1>
        <p className="mt-2 text-stone-600">
          आपने NYS के सामाजिक कार्य में सहयोग किया। आपका योगदान समाज के लिए अमूल्य है।
        </p>
        <Card className="mt-8 p-6 text-left">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-stone-500">रसीद संख्या</span><div className="font-semibold">{donation.receiptNumber}</div></div>
            <div><span className="text-stone-500">राशि</span><div className="font-semibold">{formatINR(donation.amount)}</div></div>
            <div><span className="text-stone-500">दानदाता</span><div className="font-semibold">{donation.donorName}</div></div>
            <div><span className="text-stone-500">दिनांक</span><div className="font-semibold">{formatDateHi(donation.paidAt ?? donation.createdAt)}</div></div>
            {donation.verifiedBy && (
              <div className="col-span-2">
                <span className="text-stone-500">सत्यापित</span>
                <div className="font-semibold text-green-700">✓ {donation.verifiedBy}</div>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={`/receipt/${donation.receiptNumber}`} target="_blank">
              <Download className="h-4 w-4" /> रसीद डाउनलोड करें
            </ButtonLink>
            <ShareButtons
              url={`/receipt/${donation.receiptNumber}`}
              text="मैंने NYS के सामाजिक कार्य में सहयोग किया।"
            />
          </div>
        </Card>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/campaigns" variant="outline">अभियान देखें</ButtonLink>
          <ButtonLink href="/" variant="ghost">होम पर जाएँ</ButtonLink>
        </div>
      </div>
    );
  }

  // ── PENDING / PAID — awaiting admin verification ──────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      {/* Status icon */}
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-12 w-12 text-amber-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-ink">
        {isPaid ? "भुगतान प्राप्त हुआ! 🙏" : "आवेदन प्राप्त हुआ! 🙏"}
      </h1>
      <p className="mt-2 text-stone-600">
        {isPaid
          ? "आपका भुगतान हमें मिल गया है। Admin सत्यापन के बाद रसीद जारी होगी।"
          : "आपका दान आवेदन प्राप्त हो गया है। भुगतान के बाद Admin सत्यापन करेंगे।"}
      </p>

      {/* Status badge */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800">
        <Clock className="h-4 w-4" />
        Admin सत्यापन प्रतीक्षित
      </div>

      {/* Donation summary */}
      <Card className="mt-6 p-6 text-left">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-stone-500">रसीद संख्या</span><div className="font-semibold">{donation.receiptNumber}</div></div>
          <div><span className="text-stone-500">राशि</span><div className="font-semibold text-amber-800">{formatINR(donation.amount)}</div></div>
          <div><span className="text-stone-500">दानदाता</span><div className="font-semibold">{donation.donorName}</div></div>
          <div><span className="text-stone-500">दिनांक</span><div className="font-semibold">{formatDateHi(donation.createdAt)}</div></div>
          <div className="col-span-2">
            <span className="text-stone-500">स्थिति</span>
            <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              <Clock className="h-3 w-3" /> सत्यापन लंबित
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-semibold">📌 अगला कदम:</p>
          <p className="mt-1">
            नीचे अपना भुगतान स्क्रीनशॉट या बैंक रसीद अपलोड करें।
            Admin सत्यापन के बाद आपकी ऑफिशियल रसीद जारी होगी।
          </p>
        </div>
      </Card>

      {/* ── Proof Upload ── */}
      <div className="mt-6">
        <DonationProofUpload
          receiptNumber={donation.receiptNumber}
          existingProofUrl={donation.paymentProofUrl}
        />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left text-sm">
        <p className="font-semibold text-stone-700">📞 सहायता के लिए संपर्क करें</p>
        <p className="mt-1 text-stone-500">
          WhatsApp या कॉल पर रसीद संख्या <span className="font-bold text-ink">{donation.receiptNumber}</span> बताएँ।
        </p>
        <Link href="/contact" className="mt-2 inline-block text-xs font-semibold text-saffron-700 hover:underline">
          संपर्क करें →
        </Link>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/campaigns" variant="outline">अभियान देखें</ButtonLink>
        <ButtonLink href="/" variant="ghost">होम पर जाएँ</ButtonLink>
      </div>
    </div>
  );
}
