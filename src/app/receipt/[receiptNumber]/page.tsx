import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatINR, formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";
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
    <div className="min-h-screen bg-stone-200 p-4 print:bg-white print:p-0">
      {/* Print: force background colors/gradients */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          .no-print { display: none !important; }
          body { margin: 0 !important; background: white !important; }
        }
      `}</style>
      <div className="mx-auto max-w-2xl">
        {/* Top controls — hidden on print */}
        <div className="no-print mb-4 flex items-center justify-between">
          <BackButton label="← वापस जाएं" />
          <PrintButton />
        </div>

        {/* ─── Receipt Card ─── */}
        <div className="print-page relative overflow-hidden rounded-2xl bg-white shadow-xl print:shadow-none">

          {/* NYS Watermark Logo */}
          {s.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logoUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 select-none object-contain"
              style={{ opacity: 0.05 }}
            />
          )}

          {/* Header — Saffron to Maroon gradient */}
          <div className="relative z-10" style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}>
            <div className="flex items-center justify-between px-7 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <LogoMark className="h-11 w-11" imageUrl={s.logoUrl} />
                </div>
                <div>
                  <div className="text-base font-extrabold leading-tight text-white">{s.name}</div>
                  <div className="text-[11px] text-orange-100">{s.address}</div>
                  <div className="text-[11px] text-orange-100">{s.mobile} · {s.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-sm font-bold uppercase tracking-widest text-white">दान रसीद</div>
                  <div className="text-[10px] tracking-wider text-orange-100">DONATION RECEIPT</div>
                </div>
              </div>
            </div>
            {/* Decorative wave */}
            <svg viewBox="0 0 700 30" className="block w-full" preserveAspectRatio="none" style={{ height: 28 }}>
              <path d="M0,0 C175,30 525,30 700,0 L700,30 L0,30 Z" fill="white" />
            </svg>
          </div>

          {/* Body */}
          <div className="relative z-10 px-7 pb-7 pt-2">
            {/* Receipt details grid */}
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Row label="रसीद संख्या" value={donation.receiptNumber} accent />
              <Row label="दिनांक" value={formatDateHi(donation.paidAt)} />
              <Row label="दानदाता" value={donation.donorName} />
              <Row label="भुगतान मोड" value={donation.mode} />
              <Row label="उद्देश्य" value={purposeLabel} />
              <Row label="ट्रांज़ैक्शन ID" value={donation.gatewayTxnId ?? "—"} />
            </div>

            {/* Amount box */}
            <div className="mt-6 rounded-xl border-2 border-saffron-200 bg-gradient-to-r from-saffron-50 to-orange-50 p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-widest text-stone-500">प्राप्त राशि</div>
              <div className="mt-1 text-4xl font-extrabold text-saffron-800">{formatINR(donation.amount)}</div>
            </div>

            {/* Legal */}
            {s.legal.showLegalOnSite && (s.legal.registrationNo || s.legal.pan) && (
              <div className="mt-3 text-center text-xs text-stone-500">
                {s.legal.registrationNo && <span>पंजीकरण सं.: <strong>{s.legal.registrationNo}</strong> </span>}
                {s.legal.pan && <span>· PAN: <strong>{s.legal.pan}</strong></span>}
              </div>
            )}

            {/* Footer row */}
            <div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-4">
              <div className="text-xs text-stone-400 leading-relaxed">
                यह एक कंप्यूटर जनित रसीद है।<br />
                NYS आपके सहयोग के लिए आभारी है।
              </div>
              <div className="text-center">
                {s.branding.treasurerSignUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.branding.treasurerSignUrl} alt="हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                ) : (
                  <div className="mb-1 h-10 w-32 border-b-2 border-stone-400" />
                )}
                {s.branding.treasurerSealUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.branding.treasurerSealUrl} alt="सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                )}
                <div className="text-xs text-stone-500">कोषाध्यक्ष / अधिकृत हस्ताक्षर</div>
              </div>
            </div>

            {/* Bank details */}
            {(s.bank.upiId || s.bank.accountNumber) && (
              <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-600 space-y-0.5">
                {s.bank.accountName && <div><span className="font-medium">खाता:</span> {s.bank.accountName}</div>}
                {s.bank.bankName && <div><span className="font-medium">बैंक:</span> {s.bank.bankName}{s.bank.branch ? ` · ${s.bank.branch}` : ""}</div>}
                {s.bank.accountNumber && <div><span className="font-medium">A/C:</span> {s.bank.accountNumber}</div>}
                {s.bank.ifsc && <div><span className="font-medium">IFSC:</span> {s.bank.ifsc}</div>}
                {s.bank.upiId && <div><span className="font-medium">UPI:</span> {s.bank.upiId}</div>}
              </div>
            )}
          </div>

          {/* Bottom accent bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400">{label}</div>
      <div className={`mt-0.5 font-semibold ${accent ? "text-saffron-800" : "text-ink"}`}>{value}</div>
    </div>
  );
}
