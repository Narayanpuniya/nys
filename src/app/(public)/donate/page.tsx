import type { Metadata } from "next";
import { DonateForm } from "@/components/public/DonateForm";
import { Card } from "@/components/ui/primitives";
import { DONATION_PURPOSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { getTransparencyStats } from "@/lib/stats";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.donate_title };
}

export const revalidate = 60;

export default async function DonatePage() {
  const [stats, recent, s, { dict }] = await Promise.all([
    getTransparencyStats(),
    prisma.donation.findMany({
      where: { status: "SUCCESS" },
      orderBy: { paidAt: "desc" },
      take: 6,
    }),
    getSettings(),
    getI18n(),
  ]);

  const hasBank = !!(s.bank.accountNumber || s.bank.upiId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-ink">{dict.donate_title}</h1>
        <p className="mt-2 text-stone-600">{dict.donate_sub}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <DonateForm purposes={DONATION_PURPOSES.map((p) => ({ key: p.key, label: p.label }))} />
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-ink">{dict.donate_impact}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone-500">{dict.donate_total}</dt><dd className="font-semibold">{formatINR(stats.totalDonations)}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">{dict.donate_donors}</dt><dd className="font-semibold">{stats.donorCount}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">{dict.donate_beneficiaries}</dt><dd className="font-semibold">{stats.beneficiaries}+</dd></div>
            </dl>
          </Card>

          {hasBank && (
            <Card className="p-6">
              <h3 className="font-semibold text-ink">{dict.donate_bank}</h3>
              <dl className="mt-3 space-y-1.5 text-sm text-stone-600">
                {s.bank.accountName && <div><span className="text-stone-400">Account: </span>{s.bank.accountName}</div>}
                {s.bank.bankName && <div><span className="text-stone-400">Bank: </span>{s.bank.bankName}{s.bank.branch ? ` (${s.bank.branch})` : ""}</div>}
                {s.bank.accountNumber && <div><span className="text-stone-400">A/C: </span>{s.bank.accountNumber}</div>}
                {s.bank.ifsc && <div><span className="text-stone-400">IFSC: </span>{s.bank.ifsc}</div>}
                {s.bank.upiId && <div><span className="text-stone-400">UPI: </span><span className="font-medium text-saffron-800">{s.bank.upiId}</span></div>}
              </dl>
              {s.bank.upiQrUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.bank.upiQrUrl} alt="UPI QR" className="mt-3 mx-auto h-36 w-36 object-contain" />
              )}
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold text-ink">{dict.donate_recent}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {recent.map((d) => (
                <li key={d.id} className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-stone-600">{d.donorName}</span>
                  <span className="font-medium text-saffron-800">{formatINR(d.amount)}</span>
                </li>
              ))}
              {recent.length === 0 && <li className="text-stone-400">{dict.donate_none}</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
