import { CheckCircle2, Clock, IdCard, Award } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const WA_GROUP_LINK = "https://chat.whatsapp.com/KkfyZsnkpAoFFr66LfYlI5";

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; status?: string; mode?: string }>;
}) {
  const { code, status, mode } = await searchParams;
  const member = code ? await prisma.member.findUnique({ where: { memberCode: code } }) : null;
  const approved = status === "ACTIVE";
  const viaReceipt = mode === "receipt";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${approved ? "bg-green-100" : "bg-amber-100"}`}>
        {approved ? <CheckCircle2 className="h-12 w-12 text-green-600" /> : <Clock className="h-12 w-12 text-amber-600" />}
      </div>
      <h1 className="text-3xl font-extrabold text-ink">
        {approved ? "स्वागत है! आप NYS सदस्य बन गए 🎉" : "आवेदन प्राप्त हुआ"}
      </h1>
      <p className="mt-2 text-stone-600">
        {approved
          ? "आपका भुगतान सफल रहा और सदस्यता सक्रिय हो गई है।"
          : viaReceipt
            ? "आपकी भुगतान रसीद मिल गई है। एडमिन जाँच कर सदस्यता सक्रिय करेगा — उसके बाद ID कार्ड व प्रमाणपत्र उपलब्ध होंगे।"
            : "आपका भुगतान सफल रहा। आपकी सदस्यता एडमिन द्वारा स्वीकृति की प्रतीक्षा में है। स्वीकृति के बाद ID कार्ड व प्रमाणपत्र उपलब्ध होंगे।"}
      </p>

      {/* ── WhatsApp Group — सबको दिखे ── */}
      <a
        href={WA_GROUP_LINK}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center justify-center gap-3 rounded-2xl border-2 border-green-400 bg-green-50 px-6 py-4 shadow-sm transition hover:bg-green-100 active:scale-95"
      >
        {/* WhatsApp icon (inline SVG) */}
        <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#25D366"/>
          <path d="M23.5 8.5A10.46 10.46 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.49 3.65 1.42 5.24L5.5 26.5l5.38-1.41A10.46 10.46 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.43-3-7.5ZM16 24.7c-1.65 0-3.27-.44-4.68-1.27l-.34-.2-3.2.84.85-3.1-.22-.35A8.64 8.64 0 0 1 7.3 16c0-4.8 3.9-8.7 8.7-8.7 2.33 0 4.51.91 6.16 2.55A8.65 8.65 0 0 1 24.7 16c0 4.8-3.9 8.7-8.7 8.7Zm4.77-6.52c-.26-.13-1.54-.76-1.78-.85-.24-.08-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.4-2.1-1.29-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.11.27-.3.4-.44.13-.15.17-.26.26-.43.08-.17.04-.32-.02-.45-.07-.13-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.81 2.77 4.39 3.88.61.27 1.09.42 1.46.54.61.19 1.17.17 1.61.1.49-.07 1.54-.63 1.75-1.23.22-.6.22-1.12.15-1.23-.06-.11-.23-.17-.5-.3Z" fill="white"/>
        </svg>
        <div className="text-left">
          <div className="text-base font-extrabold text-green-800">NYS WhatsApp Group से जुड़ें</div>
          <div className="text-xs text-green-600">Click करें → सीधे Group में जाएँ</div>
        </div>
        <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {member && (
        <Card className="mt-6 p-6">
          <div className="text-sm text-stone-500">आपकी सदस्य ID</div>
          <div className="text-2xl font-extrabold text-saffron-800">{member.memberCode}</div>

          {approved && (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <ButtonLink href={`/id-card/${member.memberCode}`} target="_blank">
                <IdCard className="h-4 w-4" /> डिजिटल ID कार्ड
              </ButtonLink>
              <ButtonLink href={`/certificate/${member.memberCode}`} target="_blank" variant="secondary">
                <Award className="h-4 w-4" /> प्रमाणपत्र
              </ButtonLink>
            </div>
          )}
        </Card>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {/* WhatsApp button again (smaller) */}
        <a
          href={WA_GROUP_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-green-700"
        >
          <svg viewBox="0 0 32 32" className="h-4 w-4" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 8.5A10.46 10.46 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.49 3.65 1.42 5.24L5.5 26.5l5.38-1.41A10.46 10.46 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.43-3-7.5Z"/>
          </svg>
          WhatsApp Group Join करें
        </a>
        <ButtonLink href="/" variant="ghost">होम पर जाएँ</ButtonLink>
      </div>
    </div>
  );
}
