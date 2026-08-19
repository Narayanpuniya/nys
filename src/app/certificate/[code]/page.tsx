import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { qrDataUrl, siteUrl } from "@/lib/qr";
import { formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";

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

  const memberCert = member.certificates[0];
  const certNumber = memberCert?.certNumber ?? `${s.certPrefix}-${new Date().getFullYear()}-PENDING`;
  const qr = await qrDataUrl(siteUrl(`/verify?code=${member.memberCode}`));

  return (
    <div className="min-h-screen bg-stone-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-4 flex justify-between">
          <a href="/" className="text-sm text-stone-500">← होम</a>
          <PrintButton label="प्रमाणपत्र प्रिंट / PDF" />
        </div>

        <div className="print-page relative overflow-hidden rounded-2xl bg-white p-10 shadow-lg">
          {/* decorative border */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border-4 border-double border-saffron-300" />
          <div className="relative text-center">
            <div className="mx-auto flex justify-center"><LogoMark className="h-16 w-16" imageUrl={s.logoUrl} /></div>
            <h1 className="mt-2 text-2xl font-extrabold text-ink">{s.name}</h1>
            <p className="text-xs text-stone-500">{s.address}</p>

            <div className="mx-auto mt-6 h-1 w-24 rounded-full nys-accent-bar" />
            <h2 className="mt-4 text-xl font-bold tracking-wide text-maroon-800">सदस्यता प्रमाणपत्र</h2>

            <p className="mt-6 text-stone-700">यह प्रमाणित किया जाता है कि</p>
            <p className="mt-2 text-2xl font-extrabold text-saffron-800">{member.fullName}</p>
            <p className="mt-2 text-stone-700">
              {member.village ? `${member.village}, ` : ""}नारायणपुरी यूथ सोसाइटी, गुदियाल नगर के
              <span className="font-semibold"> {member.plan?.name ?? "सदस्य"} </span>
              के रूप में विधिवत पंजीकृत सदस्य हैं।
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-stone-600">
              <div><div className="font-semibold text-ink">{member.memberCode}</div>सदस्य ID</div>
              <div><div className="font-semibold text-ink">{formatDateHi(member.joiningDate)}</div>सदस्यता तिथि</div>
              <div><div className="font-semibold text-ink">{certNumber}</div>प्रमाणपत्र सं.</div>
            </div>

            <div className="mt-10 flex items-end justify-between gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR" className="h-16 w-16" />
              <div className="flex flex-1 items-end justify-around gap-4 text-center text-xs text-stone-500">
                <div>
                  {s.branding.presidentSignUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.presidentSignUrl} alt="अध्यक्ष हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                  ) : (
                    <div className="mb-1 h-8 w-28 border-b border-stone-400" />
                  )}
                  {s.branding.presidentSealUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.presidentSealUrl} alt="अध्यक्ष सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                  )}
                  अध्यक्ष
                </div>
                <div>
                  {s.branding.secretarySignUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.secretarySignUrl} alt="सचिव हस्ताक्षर" className="mx-auto mb-1 h-10 object-contain" />
                  ) : (
                    <div className="mb-1 h-8 w-28 border-b border-stone-400" />
                  )}
                  {s.branding.secretarySealUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.branding.secretarySealUrl} alt="सचिव सील" className="mx-auto mb-1 h-12 object-contain opacity-80" />
                  )}
                  सचिव
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
