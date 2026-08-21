import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatINR, formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

// सदस्यता भुगतान रसीद — admin जारी करें / print / PDF
export default async function MembershipReceiptPage({
  params,
}: {
  params: Promise<{ receiptNumber: string }>;
}) {
  const { receiptNumber } = await params;

  const [payment, s] = await Promise.all([
    prisma.membershipPayment.findUnique({
      where: { receiptNumber },
      include: {
        member: { include: { plan: true } },
        plan: true,
      },
    }),
    getSettings(),
  ]);

  if (!payment || payment.status === "FAILED") notFound();

  const member = payment.member;
  const isPending = payment.status === "PENDING";

  return (
    <div className="min-h-screen bg-stone-200 p-4 print:bg-white print:p-0">
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          .no-print { display: none !important; }
          body { margin: 0 !important; background: white !important; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl">
        {/* Controls */}
        <div className="no-print mb-4 flex items-center justify-between">
          <BackButton label="← वापस जाएं" fallback="/admin/members" />
          <PrintButton label="रसीद प्रिंट / PDF" />
        </div>

        {/* PENDING banner */}
        {isPending && (
          <div className="no-print mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⏳ यह <strong>प्रारंभिक पावती</strong> है — Admin स्वीकृति के बाद ऑफिशियल रसीद जारी होगी।
          </div>
        )}

        {/* ─── Receipt Card ─── */}
        <div className="print-page relative overflow-hidden rounded-2xl bg-white shadow-xl print:shadow-none">

          {/* PENDING watermark */}
          {isPending && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center select-none" aria-hidden="true">
              <div className="text-6xl font-black tracking-widest text-amber-400"
                style={{ opacity: 0.12, transform: "rotate(-35deg)", whiteSpace: "nowrap" }}>
                सत्यापन लंबित
              </div>
            </div>
          )}

          {/* Logo watermark */}
          {s.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="" aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 select-none object-contain"
              style={{ opacity: 0.05 }} />
          )}

          {/* Header */}
          <div className="relative z-10" style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}>
            <div className="flex items-center justify-between px-7 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <LogoMark className="h-11 w-11" imageUrl={s.logoUrl} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-orange-200">www.nys.org.in</div>
                  <div className="text-base font-extrabold leading-tight text-white">{s.name}</div>
                  <div className="text-[11px] text-orange-100">{s.address}</div>
                  {s.mobile && <div className="text-[11px] text-orange-100">{s.mobile}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5">
                  <div className="text-sm font-bold uppercase tracking-widest text-white">सदस्यता रसीद</div>
                  <div className="text-[10px] tracking-wider text-orange-100">MEMBERSHIP RECEIPT</div>
                </div>
              </div>
            </div>
            <svg viewBox="0 0 700 30" className="block w-full" preserveAspectRatio="none" style={{ height: 28 }}>
              <path d="M0,0 C175,30 525,30 700,0 L700,30 L0,30 Z" fill="white" />
            </svg>
          </div>

          {/* Body */}
          <div className="relative z-10 px-8 pb-8 pt-4">

            {/* Member info box */}
            <div className="flex items-center gap-4 rounded-xl border border-saffron-100 bg-saffron-50 p-4">
              {member.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoUrl} alt={member.fullName}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-saffron-300 object-cover" />
              )}
              <div>
                <div className="text-lg font-extrabold text-maroon-800">{member.fullName}</div>
                {member.guardianName && (
                  <div className="text-sm text-stone-500">पुत्र/पुत्री: {member.guardianName}</div>
                )}
                <div className="mt-0.5 text-sm text-stone-600">
                  सदस्य ID: <span className="font-semibold text-saffron-800">{member.memberCode}</span>
                </div>
                {member.mobile && <div className="text-sm text-stone-500">📱 {member.mobile}</div>}
                {member.village && <div className="text-xs text-stone-400">{member.village}{member.district ? `, ${member.district}` : ""}</div>}
              </div>
            </div>

            {/* Receipt details */}
            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Row label="रसीद संख्या" value={payment.receiptNumber} accent />
              <Row label="दिनांक" value={formatDateHi(payment.paidAt)} />
              <Row label="सदस्यता योजना" value={payment.plan?.name ?? member.plan?.name ?? "सदस्यता"} />
              <Row label="भुगतान मोड" value={payment.mode} />
              <Row label="सदस्यता अवधि" value={`${formatDateHi(payment.periodStart)} – ${formatDateHi(payment.periodEnd)}`} />
              {payment.notes && <Row label="नोट" value={payment.notes} />}
              {payment.gatewayTxnId && <Row label="ट्रांज़ैक्शन ID" value={payment.gatewayTxnId} />}
            </div>

            {/* Amount box */}
            <div className="mt-6 rounded-xl border-2 border-saffron-200 bg-gradient-to-r from-saffron-50 to-orange-50 p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-widest text-stone-500">प्राप्त राशि</div>
              <div className="mt-1 text-4xl font-extrabold text-saffron-800">{formatINR(payment.amount)}</div>
              <div className="mt-1 text-xs text-stone-500">
                स्थिति: <span className={isPending ? "font-semibold text-amber-700" : "font-semibold text-green-700"}>
                  {isPending ? "सत्यापन लंबित" : "✓ सफल"}
                </span>
              </div>
            </div>

            {/* Legal */}
            {(s.legal.registrationNo || s.legal.pan) && (
              <div className="mt-3 text-center text-xs text-stone-500">
                {s.legal.registrationNo && <span>पंजीकरण सं.: <strong>{s.legal.registrationNo}</strong> </span>}
                {s.legal.pan && <span>· PAN: <strong>{s.legal.pan}</strong></span>}
              </div>
            )}

            {/* Signature row */}
            <div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-4">
              <div className="text-xs leading-relaxed text-stone-400">
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
          </div>

          {/* Bottom bar */}
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
