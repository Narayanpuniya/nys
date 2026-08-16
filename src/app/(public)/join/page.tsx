import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { JoinForm } from "@/components/public/JoinForm";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "NYS से जुड़ें (सदस्यता)" };
export const revalidate = 300;

export default async function JoinPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-ink">NYS के सदस्य बनें</h1>
        <p className="mt-2 text-stone-600">
          सदस्य बनकर आप संस्था के कार्यक्रमों, निर्णयों और सामाजिक पहलों का हिस्सा बनते हैं।
          भुगतान सफल होते ही आपको डिजिटल सदस्य ID और प्रमाणपत्र मिलेगा।
        </p>
      </div>
      <Card className="p-6">
        {plans.length ? (
          <JoinForm plans={plans.map((p) => ({ id: p.id, name: p.name, amount: p.amount, description: p.description }))} />
        ) : (
          <p className="text-center text-sm text-stone-500">फिलहाल कोई सदस्यता योजना उपलब्ध नहीं है।</p>
        )}
      </Card>
    </div>
  );
}
