import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { qrDataUrl, siteUrl } from "@/lib/qr";
import { formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

// डिजिटल सदस्य ID कार्ड (front + back), print-friendly।
export default async function IdCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [member, s] = await Promise.all([
    prisma.member.findUnique({ where: { memberCode: code }, include: { plan: true } }),
    getSettings(),
  ]);
  if (!member) notFound();

  const qr = await qrDataUrl(siteUrl(`/verify?code=${member.memberCode}`));

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
      <div className="mx-auto max-w-3xl">
        {/* Controls */}
        <div className="no-print mb-4 flex items-center justify-between">
          <BackButton label="← वापस जाएं" fallback="/downloads" />
          <PrintButton label="ID कार्ड प्रिंट / PDF" />
        </div>

        <div className="flex flex-wrap justify-center gap-8">

          {/* ─── FRONT CARD ─── */}
          <div
            className="print-page relative h-[240px] w-[380px] overflow-hidden rounded-2xl shadow-xl"
            style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)" }}
          >
            {/* Watermark logo */}
            {s.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-2 bottom-2 select-none object-contain"
                style={{ width: 100, height: 100, opacity: 0.07 }}
              />
            )}

            {/* Header band */}
            <div
              className="relative flex items-center gap-3 px-4 py-3"
              style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <LogoMark className="h-7 w-7" imageUrl={s.logoUrl} />
              </div>
              <div className="flex-1 leading-tight">
                <div className="text-[9px] font-semibold tracking-widest text-orange-200">www.nys.org.in</div>
                <div className="text-sm font-extrabold text-white">{s.name}</div>
                <div className="text-[10px] tracking-wider text-orange-100">{s.address}</div>
              </div>
              <div className="shrink-0 rounded border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                सदस्य ID
              </div>
            </div>

            {/* Body */}
            <div className="flex gap-4 p-4">
              {/* Photo */}
              <div
                className="relative flex h-[130px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-saffron-300 bg-saffron-50 text-4xl shadow-sm"
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                ) : "🙂"}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 text-xs">
                <div className="text-base font-extrabold leading-tight text-ink">{member.fullName}</div>
                {member.guardianName && (
                  <div className="mt-0.5 text-[10px] text-stone-500">S/o: {member.guardianName}</div>
                )}
                <div className="mt-2 inline-block rounded-md bg-saffron-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  {member.memberCode}
                </div>
                <div className="mt-2 space-y-1 text-stone-600">
                  <div><span className="font-medium">प्रकार:</span> {member.plan?.name ?? "सदस्य"}</div>
                  <div><span className="font-medium">सदस्यता:</span> {formatDateHi(member.joiningDate)}</div>
                  <div><span className="font-medium">मान्य:</span> {member.validUntil ? formatDateHi(member.validUntil) : "—"}</div>
                </div>
              </div>

              {/* QR */}
              <div className="self-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR" className="h-[62px] w-[62px] rounded-lg" />
                <div className="mt-0.5 text-center text-[8px] text-stone-400">Scan</div>
              </div>
            </div>

            {/* Bottom stripe */}
            <div className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }} />
          </div>

          {/* ─── BACK CARD ─── */}
          <div
            className="print-page relative h-[240px] w-[380px] overflow-hidden rounded-2xl shadow-xl"
            style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)" }}
          >
            {/* Watermark logo — center */}
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none object-contain"
                style={{ width: 180, height: 180, opacity: 0.07 }}
              />
            ) : null}

            {/* Header band — same as front */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}
            >
              <div className="flex-1 leading-tight">
                <div className="text-[9px] font-semibold tracking-widest text-orange-200">www.nys.org.in</div>
                <div className="text-[12px] font-extrabold text-white">{s.name}</div>
              </div>
              <div className="shrink-0 rounded border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                पिछला
              </div>
            </div>

            {/* Bottom stripe of header */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }} />

            <div className="flex h-[calc(100%-56px)] flex-col justify-between px-5 py-2.5">
              {/* Org contact info */}
              <div>
                <div className="text-[10px] text-stone-600">{s.address}</div>
                <div className="text-[10px] text-stone-600">{s.mobile} · {s.email}</div>
                {s.legal?.registrationNo && (
                  <div className="mt-0.5 text-[9px] font-semibold text-amber-700">
                    Reg: {s.legal.registrationNo}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <ul className="space-y-0.5 text-[9.5px] text-stone-600">
                <li>• यह कार्ड केवल NYS सदस्यता की पहचान हेतु है।</li>
                <li>• खो जाने पर संस्था को तुरंत सूचित करें।</li>
                <li>• QR स्कैन कर सदस्यता सत्यापित करें।</li>
                <li>• यह कार्ड अहस्तांतरणीय है।</li>
              </ul>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="QR verify" className="h-14 w-14 rounded-lg border border-amber-200 bg-white p-0.5" />
                  <div className="mt-0.5 text-[8px] text-stone-400">सत्यापन हेतु</div>
                </div>
                <div className="text-center">
                  {s.branding.presidentSignUrl ? (
                    <div className="mx-auto mb-1 flex h-12 w-32 items-center justify-center rounded-lg border border-saffron-200 bg-white p-1 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.branding.presidentSignUrl} alt="हस्ताक्षर" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="mb-1 h-8 w-28 border-b border-amber-400" />
                  )}
                  <div className="text-[9px] font-semibold tracking-wide text-amber-700">अधिकृत हस्ताक्षर</div>
                </div>
              </div>
            </div>

            {/* Bottom stripe */}
            <div className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }} />
          </div>

        </div>

        {/* Print note */}
        <p className="no-print mt-4 text-center text-xs text-stone-500">
          💡 प्रिंट / PDF के लिए ऊपर बटन दबाएं — क्रेडिट कार्ड साइज़ में कटाई के लिए A4 पर प्रिंट करें
        </p>
      </div>
    </div>
  );
}
