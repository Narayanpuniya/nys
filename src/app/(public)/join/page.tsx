import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { JoinForm } from "@/components/public/JoinForm";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "NYS से जुड़ें (सदस्यता)" };
export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const [plans, settings] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-ink">NYS के सदस्य बनें</h1>
        <p className="mt-2 text-stone-600">
          ऑनलाइन भुगतान या UPI/बैंक ट्रांसफर की रसीद अपलोड करके जुड़ सकते हैं।
          स्वीकृति के बाद डिजिटल सदस्य ID और प्रमाणपत्र मिलेंगे।
        </p>
      </div>
      <Card className="p-6">
        {plans.length ? (
          <JoinForm
            plans={plans.map((p) => ({ id: p.id, name: p.name, amount: p.amount, description: p.description }))}
            bank={{
              accountName: settings.bank.accountName,
              bankName: settings.bank.bankName,
              accountNumber: settings.bank.accountNumber,
              ifsc: settings.bank.ifsc,
              branch: settings.bank.branch,
              upiId: settings.bank.upiId,
              upiQrUrl: settings.bank.upiQrUrl,
            }}
          />
        ) : (
          <p className="text-center text-sm text-stone-500">फिलहाल कोई सदस्यता योजना उपलब्ध नहीं है।</p>
        )}
      </Card>
    </div>
  );
}
