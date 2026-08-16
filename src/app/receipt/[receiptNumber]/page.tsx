import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatINR, formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";
import { DONATION_PURPOSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// दान रसीद — print-friendly (Save as PDF)।
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ receiptNumber: string }>;
}) {
  const { receiptNumber } = await params;
  const [donation, s] = await Promise.all([
    prisma.donation.findUnique({ where: { receiptNumber }, include: { campaign: true } }),
    getSettings(),
  ]);

  if (!donation || donation.status !== "SUCCESS") notFound();

  const purposeLabel =
    donation.campaign?.title ??
    DONATION_PURPOSES.find((p) => p.key === donation.purpose)?.label ??
    donation.purpose;

  return (
    <div className="min-h-screen bg-stone-100 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="no-print mb-4 flex justify-between">
          <a href="/" className="text-sm text-stone-500">← होम</a>
          <PrintButton />
        </div>

        <div className="print-page overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="nys-accent-bar h-2" />
          <div className="p-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <LogoMark className="h-14 w-14" imageUrl={s.logoUrl} />
                <div>
                  <div className="text-lg font-extrabold text-ink">{s.name}</div>
                  <div className="text-xs text-stone-500">{s.address}</div>
                  <div className="text-xs text-stone-500">{s.mobile} · {s.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-saffron-800">दान रसीद</div>
                <div className="text-xs text-stone-500">DONATION RECEIPT</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Row label="रसीद संख्या" value={donation.receiptNumber} />
              <Row label="दिनांक" value={formatDateHi(donation.paidAt)} />
              <Row label="दानदाता" value={donation.donorName} />
              <Row label="भुगतान मोड" value={donation.mode} />
              <Row label="उद्देश्य" value={purposeLabel} />
              <Row label="ट्रांज़ैक्शन ID" value={donation.gatewayTxnId ?? "—"} />
            </div>

            <div className="mt-6 rounded-xl bg-saffron-50 p-4 text-center">
              <div className="text-xs text-stone-500">प्राप्त राशि</div>
              <div className="text-3xl font-extrabold text-saffron-800">{formatINR(donation.amount)}</div>
            </div>

            {s.legal.showLegalOnSite && (s.legal.registrationNo || s.legal.pan) && (
              <div className="mt-4 text-center text-xs text-stone-500">
                {s.legal.registrationNo && <span>पंजीकरण सं.: {s.legal.registrationNo} </span>}
                {s.legal.pan && <span>· PAN: {s.legal.pan}</span>}
              </div>
            )}

            <div className="mt-8 flex items-end justify-between">
              <div className="text-xs text-stone-400">
                यह एक कंप्यूटर जनित रसीद है।<br />NYS आपके सहयोग के लिए आभारी है।
              </div>
              <div className="text-center">
                {s.branding.treasurerSignUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.branding.treasurerSignUrl} alt="हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                ) : (
                  <div className="mb-1 h-10 w-32 border-b border-stone-400" />
                )}
                {s.branding.treasurerSealUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.branding.treasurerSealUrl} alt="सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                )}
                <div className="text-xs text-stone-500">कोषाध्यक्ष / अधिकृत हस्ताक्षर</div>
              </div>
            </div>

            {(s.bank.upiId || s.bank.accountNumber) && (
              <div className="mt-6 rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-600">
                {s.bank.accountName && <div>खाता: {s.bank.accountName}</div>}
                {s.bank.bankName && <div>बैंक: {s.bank.bankName}{s.bank.branch ? ` · ${s.bank.branch}` : ""}</div>}
                {s.bank.accountNumber && <div>A/C: {s.bank.accountNumber}</div>}
                {s.bank.ifsc && <div>IFSC: {s.bank.ifsc}</div>}
                {s.bank.upiId && <div>UPI: {s.bank.upiId}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="font-semibold text-ink">{value}</div>
    </div>
  );
}
