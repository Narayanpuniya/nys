import { CheckCircle2, Clock, IdCard, Award } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

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

      {member && (
        <Card className="mt-8 p-6">
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

      <div className="mt-8">
        <ButtonLink href="/" variant="ghost">होम पर जाएँ</ButtonLink>
      </div>
    </div>
  );
}
