import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { qrDataUrl, siteUrl } from "@/lib/qr";
import { formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/PrintButton";

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
    <div className="min-h-screen bg-stone-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-4 flex justify-between">
          <a href="/" className="text-sm text-stone-500">← होम</a>
          <PrintButton label="ID कार्ड प्रिंट / PDF" />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {/* FRONT */}
          <div className="print-page h-[220px] w-[350px] overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="nys-accent-bar flex items-center gap-2 px-4 py-2 text-white">
              <LogoMark className="h-8 w-8" />
              <div className="leading-tight">
                <div className="text-sm font-bold">नारायणपुरी यूथ सोसाइटी</div>
                <div className="text-[10px]">गुदियाल नगर · NYS</div>
              </div>
            </div>
            <div className="flex gap-3 p-3">
              <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-saffron-100 text-3xl">
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                ) : "🙂"}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="text-sm font-bold text-ink">{member.fullName}</div>
                <div className="text-saffron-800">{member.memberCode}</div>
                <div className="mt-1 text-stone-600">प्रकार: {member.plan?.name ?? "सदस्य"}</div>
                <div className="text-stone-600">सदस्यता: {formatDateHi(member.joiningDate)}</div>
                <div className="text-stone-600">मान्य: {member.validUntil ? formatDateHi(member.validUntil) : "—"}</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR" className="h-16 w-16 self-end" />
            </div>
          </div>

          {/* BACK */}
          <div className="print-page flex h-[220px] w-[350px] flex-col justify-between rounded-2xl bg-white p-4 shadow-lg">
            <div>
              <div className="text-xs font-bold text-ink">{s.name}</div>
              <div className="mt-1 text-[11px] text-stone-600">{s.address}</div>
              <div className="text-[11px] text-stone-600">{s.mobile} · {s.email}</div>
            </div>
            <ul className="text-[10px] text-stone-500">
              <li>• यह कार्ड केवल NYS सदस्यता की पहचान हेतु है।</li>
              <li>• खो जाने पर संस्था को सूचित करें।</li>
              <li>• QR स्कैन कर सदस्यता सत्यापित करें।</li>
            </ul>
            <div className="flex items-end justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR verify" className="h-14 w-14" />
              <div className="text-center text-[10px] text-stone-500">
                <div className="mb-0.5 h-6 w-24 border-b border-stone-400" />
                अधिकृत हस्ताक्षर
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
