import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { qrDataUrl, siteUrl } from "@/lib/qr";
import { formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

// सदस्यता प्रमाणपत्र — print-friendly।
// code = memberCode (NYS-2026-001) या certNumber (NYS-CERT-2026-00002) दोनों काम करेंगे
export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // पहले certNumber से ढूँढो, नहीं मिला तो memberCode से
  let member = null;
  const cert = await prisma.certificate.findUnique({
    where: { certNumber: code },
    include: { member: { include: { plan: true, certificates: true } } },
  });
  if (cert) {
    member = cert.member;
  } else {
    member = await prisma.member.findUnique({
      where: { memberCode: code },
      include: { plan: true, certificates: true },
    });
  }

  const [s] = await Promise.all([getSettings()]);
  if (!member) notFound();
  if (member.status !== "ACTIVE") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-stone-600">इस सदस्य की सदस्यता अभी सक्रिय नहीं है, इसलिए प्रमाणपत्र उपलब्ध नहीं है।</p>
      </div>
    );
  }

  // सदस्य ID ही certificate number के रूप में दिखाएं — एक ही ID सब जगह
  const certNumber = member.memberCode;
  const qr = await qrDataUrl(siteUrl(`/verify?code=${member.memberCode}`));

  return (
    <div className="min-h-screen bg-stone-200 p-4 print:bg-white print:p-0">
      {/* Print: force background colors/gradients to render */}
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
          <PrintButton label="प्रमाणपत्र प्रिंट / PDF" />
        </div>

        {/* ─── Certificate Card ─── */}
        <div className="print-page relative overflow-hidden rounded-2xl bg-white shadow-xl print:shadow-none">

          {/* NYS Logo Watermark — large centered */}
          {s.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logoUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none object-contain"
              style={{ width: 340, height: 340, opacity: 0.05 }}
            />
          )}

          {/* Outer decorative border */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border-4 border-double" style={{ borderColor: "#d97706" }} />
          <div className="pointer-events-none absolute inset-[14px] rounded-lg border border-saffron-200" />

          {/* Top gradient band */}
          <div className="relative z-10" style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}>
            <div className="flex items-center justify-center gap-4 py-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <LogoMark className="h-12 w-12" imageUrl={s.logoUrl} />
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold tracking-wide text-white">{s.name}</div>
                <div className="text-[11px] tracking-wider text-orange-100">{s.address}</div>
              </div>
            </div>
            <svg viewBox="0 0 700 28" className="block w-full" preserveAspectRatio="none" style={{ height: 26 }}>
              <path d="M0,0 C175,28 525,28 700,0 L700,28 L0,28 Z" fill="white" />
            </svg>
          </div>

          {/* Body */}
          <div className="relative z-10 px-10 pb-10 pt-3">
            {/* Title */}
            <div className="text-center">
              <div className="inline-block rounded-lg border-2 border-saffron-300 bg-saffron-50 px-6 py-1.5">
                <h2 className="text-xl font-bold tracking-widest text-maroon-800">सदस्यता प्रमाणपत्र</h2>
                <div className="text-[10px] font-medium tracking-widest text-stone-400">MEMBERSHIP CERTIFICATE</div>
              </div>
            </div>

            {/* Main text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-stone-600">यह प्रमाणित किया जाता है कि</p>

              {/* Member photo */}
              {member.photoUrl && (
                <div className="mx-auto mt-3 h-24 w-24 overflow-hidden rounded-full border-4 border-saffron-300 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                </div>
              )}

              <p className="mt-4 text-3xl font-extrabold text-saffron-800">{member.fullName}</p>
              {member.guardianName && (
                <p className="mt-1 text-sm text-stone-500">पुत्र/पुत्री: {member.guardianName}</p>
              )}
              <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-stone-600">
                {member.village ? `${member.village}, ` : ""}नारायणपुरी यूथ सोसाइटी, गुदियाल नगर के{" "}
                <span className="font-semibold text-maroon-700">{member.plan?.name ?? "सदस्य"}</span>{" "}
                के रूप में विधिवत पंजीकृत सदस्य हैं।
              </p>
            </div>

            {/* Details grid */}
            <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4 text-center text-xs">
              <div className="rounded-lg border border-saffron-100 bg-saffron-50 p-3">
                <div className="font-extrabold text-saffron-800">{certNumber}</div>
                <div className="mt-0.5 font-medium text-stone-500">सदस्य ID / प्रमाणपत्र सं.</div>
              </div>
              <div className="rounded-lg border border-saffron-100 bg-saffron-50 p-3">
                <div className="font-extrabold text-saffron-800">{formatDateHi(member.joiningDate)}</div>
                <div className="mt-0.5 font-medium text-stone-500">सदस्यता तिथि</div>
              </div>
            </div>

            {/* Signatures row */}
            <div className="mt-10 flex items-end justify-between gap-4">
              {/* QR code */}
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR" className="h-16 w-16" />
                <div className="mt-1 text-[9px] text-stone-400">सत्यापन हेतु स्कैन करें</div>
              </div>

              {/* Signatures */}
              <div className="flex flex-1 items-end justify-around gap-6 text-center text-xs text-stone-500">
                <div>
                  {s.branding.presidentSignUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.presidentSignUrl} alt="अध्यक्ष हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                  ) : (
                    <div className="mb-1 h-8 w-28 border-b-2 border-stone-400" />
                  )}
                  {s.branding.presidentSealUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.presidentSealUrl} alt="अध्यक्ष सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                  )}
                  <div className="font-medium">अध्यक्ष</div>
                </div>
                <div>
                  {s.branding.secretarySignUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.secretarySignUrl} alt="सचिव हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                  ) : (
                    <div className="mb-1 h-8 w-28 border-b-2 border-stone-400" />
                  )}
                  {s.branding.secretarySealUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.secretarySealUrl} alt="सचिव सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                  )}
                  <div className="font-medium">सचिव</div>
                </div>
              </div>
            </div>

            {/* Legal */}
            {s.legal.registrationNo && (
              <div className="mt-6 text-center text-[10px] text-stone-400">
                पंजीकरण सं.: {s.legal.registrationNo}
                {s.legal.pan ? ` · PAN: ${s.legal.pan}` : ""}
              </div>
            )}
          </div>

          {/* Bottom gradient bar */}
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }} />
        </div>
      </div>
    </div>
  );
}
