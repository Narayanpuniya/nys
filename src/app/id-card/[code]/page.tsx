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
            className="print-page relative h-[240px] w-[380px] overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "#f0f4fb" }}
          >
            {/* Watermark logo */}
            {s.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-3 bottom-8 select-none object-contain"
                style={{ width: 90, height: 90, opacity: 0.06 }}
              />
            )}

            {/* Decorative left accent bar */}
            <div className="absolute left-0 top-0 h-full w-1" style={{ background: "linear-gradient(180deg, #c9950a 0%, #0f2d52 60%, #c9950a 100%)" }} />

            {/* Header band — deep navy */}
            <div
              className="relative flex items-center gap-3 pl-5 pr-4 py-2.5"
              style={{ background: "linear-gradient(120deg, #0c1e3e 0%, #1a3a6b 100%)" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <LogoMark className="h-6 w-6" imageUrl={s.logoUrl} />
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-[8px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#c9950a" }}>www.nys.org.in</div>
                <div className="truncate text-[12px] font-extrabold text-white">{s.name}</div>
                <div className="truncate text-[9px] text-blue-200/70">{s.address}</div>
              </div>
              <div className="shrink-0 rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest" style={{ borderColor: "#c9950a55", color: "#c9950a" }}>
                ID Card
              </div>
            </div>

            {/* Gold rule */}
            <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #c9950a 0%, #f0c040 50%, #c9950a 100%)" }} />

            {/* Body */}
            <div className="flex gap-3 pl-5 pr-4 pt-3 pb-2">
              {/* Photo */}
              <div
                className="relative flex h-[124px] w-[94px] shrink-0 items-center justify-center overflow-hidden text-4xl"
                style={{ borderRadius: 10, border: "2px solid #1a3a6b", background: "#e8edf8" }}
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                ) : "🙂"}
                {/* Photo bottom label */}
                <div className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[7px] font-bold tracking-widest text-white" style={{ background: "#0c1e3edd" }}>PHOTO</div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold leading-tight" style={{ color: "#0c1e3e" }}>{member.fullName}</div>
                {member.guardianName && (
                  <div className="mt-0.5 text-[9.5px]" style={{ color: "#4a5a7a" }}>पिता/पति: {member.guardianName}</div>
                )}
                {/* Member code badge */}
                <div className="mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white" style={{ background: "#0c1e3e" }}>
                  {member.memberCode}
                </div>
                <div className="mt-2 space-y-0.5 text-[9.5px]" style={{ color: "#334466" }}>
                  <div><span className="font-semibold" style={{ color: "#0c1e3e" }}>प्रकार:</span> {member.plan?.name ?? "सदस्य"}</div>
                  <div><span className="font-semibold" style={{ color: "#0c1e3e" }}>सदस्यता:</span> {formatDateHi(member.joiningDate)}</div>
                  <div><span className="font-semibold" style={{ color: "#0c1e3e" }}>मान्य:</span> {member.validUntil ? formatDateHi(member.validUntil) : "—"}</div>
                </div>
              </div>

              {/* QR */}
              <div className="self-end pb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR" className="rounded" style={{ width: 56, height: 56, border: "1.5px solid #1a3a6b44" }} />
                <div className="mt-0.5 text-center text-[7px]" style={{ color: "#7a8aaa" }}>Scan</div>
              </div>
            </div>

            {/* Gold bottom stripe */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: "linear-gradient(90deg, #c9950a 0%, #f0c040 50%, #c9950a 100%)" }} />
          </div>

          {/* ─── BACK CARD ─── */}
          <div
            className="print-page relative h-[240px] w-[380px] overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "linear-gradient(140deg, #0c1e3e 0%, #122848 55%, #1a3a6b 100%)" }}
          >
            {/* Watermark logo — center */}
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none object-contain"
                style={{ width: 180, height: 180, opacity: 0.08 }}
              />
            ) : null}

            {/* Decorative circles — top right */}
            <div className="pointer-events-none absolute -right-8 -top-8 rounded-full" style={{ width: 140, height: 140, border: "1.5px solid rgba(201,149,10,0.18)" }} />
            <div className="pointer-events-none absolute -right-4 -top-4 rounded-full" style={{ width: 90, height: 90, border: "1px solid rgba(201,149,10,0.12)" }} />

            {/* Gold top stripe */}
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #c9950a 0%, #f0c040 50%, #c9950a 100%)" }} />

            <div className="relative z-10 flex h-full flex-col justify-between px-5 py-3">
              {/* Org info */}
              <div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#c9950a" }}>www.nys.org.in</div>
                <div className="mt-0.5 text-[13px] font-extrabold leading-snug text-white">{s.name}</div>
                <div className="mt-0.5 text-[9.5px]" style={{ color: "#aab8d0" }}>{s.address}</div>
                <div className="text-[9.5px]" style={{ color: "#aab8d0" }}>{s.mobile} · {s.email}</div>
                {s.legal?.registrationNo && (
                  <div className="mt-1 text-[8.5px]" style={{ color: "#c9950a99" }}>
                    Reg: {s.legal.registrationNo}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <ul className="space-y-0.5 text-[9px]" style={{ color: "#8899bb" }}>
                <li>• यह कार्ड केवल NYS सदस्यता की पहचान हेतु है।</li>
                <li>• खो जाने पर संस्था को तुरंत सूचित करें।</li>
                <li>• QR स्कैन कर सदस्यता सत्यापित करें।</li>
                <li>• यह कार्ड अहस्तांतरणीय है।</li>
              </ul>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="QR verify" className="rounded bg-white p-0.5" style={{ width: 52, height: 52 }} />
                  <div className="mt-0.5 text-[7.5px]" style={{ color: "#556677" }}>सत्यापन हेतु</div>
                </div>
                <div className="text-center">
                  {s.branding.presidentSignUrl ? (
                    <div className="mx-auto mb-1 flex h-11 w-28 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.branding.presidentSignUrl} alt="हस्ताक्षर" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="mb-1 h-8 w-28" style={{ borderBottom: "1px solid rgba(201,149,10,0.4)" }} />
                  )}
                  <div className="text-[8.5px] font-semibold tracking-wide" style={{ color: "#c9950a" }}>अधिकृत हस्ताक्षर</div>
                </div>
              </div>
            </div>

            {/* Gold bottom stripe */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: "linear-gradient(90deg, #c9950a 0%, #f0c040 50%, #c9950a 100%)" }} />
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
