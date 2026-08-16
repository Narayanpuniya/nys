import Link from "next/link";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { formatINR, formatDateHi } from "@/lib/utils";
import { ShareButtons } from "@/components/public/ShareButtons";

export const dynamic = "force-dynamic";

export default async function DonationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ receipt?: string }>;
}) {
  const { receipt } = await searchParams;
  const donation = receipt
    ? await prisma.donation.findUnique({ where: { receiptNumber: receipt } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-ink">धन्यवाद! 🙏</h1>
      <p className="mt-2 text-stone-600">
        आपने NYS के सामाजिक कार्य में सहयोग किया। आपका योगदान समाज के लिए अमूल्य है।
      </p>

      {donation && donation.status === "SUCCESS" ? (
        <Card className="mt-8 p-6 text-left">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-stone-500">रसीद संख्या</span><div className="font-semibold">{donation.receiptNumber}</div></div>
            <div><span className="text-stone-500">राशि</span><div className="font-semibold">{formatINR(donation.amount)}</div></div>
            <div><span className="text-stone-500">दानदाता</span><div className="font-semibold">{donation.donorName}</div></div>
            <div><span className="text-stone-500">दिनांक</span><div className="font-semibold">{formatDateHi(donation.paidAt)}</div></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={`/receipt/${donation.receiptNumber}`} target="_blank">
              <Download className="h-4 w-4" /> रसीद डाउनलोड करें
            </ButtonLink>
            <ShareButtons
              url={`/receipt/${donation.receiptNumber}`}
              text="मैंने NYS के सामाजिक कार्य में सहयोग किया।"
            />
          </div>
        </Card>
      ) : (
        <p className="mt-6 text-sm text-stone-500">रसीद विवरण उपलब्ध नहीं है।</p>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/campaigns" variant="outline">अभियान देखें</ButtonLink>
        <ButtonLink href="/" variant="ghost">होम पर जाएँ</ButtonLink>
      </div>
    </div>
  );
}
