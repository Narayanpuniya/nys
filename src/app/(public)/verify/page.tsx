import type { Metadata } from "next";
import { ShieldCheck, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "सत्यापन (Verify)" };
export const dynamic = "force-dynamic";

// QR/मैन्युअल सत्यापन — केवल safe public जानकारी दिखाई जाती है।
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; cert?: string; receipt?: string }>;
}) {
  const { code, cert, receipt } = await searchParams;

  let result: React.ReactNode = null;

  if (code || cert) {
    const member = code
      ? await prisma.member.findUnique({ where: { memberCode: code }, include: { plan: true } })
      : await prisma.certificate
          .findUnique({ where: { certNumber: cert! }, include: { member: { include: { plan: true } } } })
          .then((c) => c?.member ?? null);

    result = member && member.status === "ACTIVE" && !member.deletedAt ? (
      <Valid title="सत्यापित NYS सदस्य">
        <Row label="नाम" value={member.fullName} />
        <Row label="सदस्य ID" value={member.memberCode} />
        <Row label="सदस्यता प्रकार" value={member.plan?.name ?? "सदस्य"} />
        <Row label="स्थिति" value="सक्रिय" />
        <Row label="मान्य तिथि तक" value={member.validUntil ? formatDateHi(member.validUntil) : "—"} />
      </Valid>
    ) : (
      <Invalid message="यह सदस्य ID सत्यापित नहीं हो सकी या सदस्यता सक्रिय नहीं है।" />
    );
  } else if (receipt) {
    const d = await prisma.donation.findUnique({ where: { receiptNumber: receipt } });
    result = d && d.status === "SUCCESS" ? (
      <Valid title="सत्यापित दान रसीद">
        <Row label="रसीद संख्या" value={d.receiptNumber} />
        <Row label="दानदाता" value={d.donorName} />
        <Row label="दिनांक" value={formatDateHi(d.paidAt)} />
        <Row label="स्थिति" value="सफल" />
      </Valid>
    ) : (
      <Invalid message="यह रसीद सत्यापित नहीं हो सकी।" />
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <div className="mx-auto flex justify-center"><LogoMark className="h-14 w-14" /></div>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">NYS सत्यापन</h1>
        <p className="text-sm text-stone-500">सदस्यता, प्रमाणपत्र एवं रसीद सत्यापन</p>
      </div>

      {result ?? (
        <Card className="p-6">
          <form className="space-y-3">
            <label className="block text-sm font-medium text-ink">सदस्य ID या रसीद संख्या दर्ज करें</label>
            <input name="code" placeholder="NYS-M-2026-00001" className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-saffron-500" />
            <button className="w-full rounded-xl bg-saffron-600 py-2.5 text-sm font-medium text-white hover:bg-saffron-700">सत्यापित करें</button>
          </form>
          <p className="mt-3 text-center text-xs text-stone-400">रसीद हेतु: /verify?receipt=DON-2026-00001</p>
        </Card>
      )}
    </div>
  );
}

function Valid({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 bg-green-600 px-4 py-3 text-white">
        <ShieldCheck className="h-5 w-5" /> <span className="font-semibold">{title}</span>
      </div>
      <dl className="divide-y divide-stone-100 p-4">{children}</dl>
    </Card>
  );
}

function Invalid({ message }: { message: string }) {
  return (
    <Card className="p-6 text-center">
      <XCircle className="mx-auto h-12 w-12 text-red-500" />
      <p className="mt-2 text-stone-600">{message}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
