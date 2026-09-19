import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { HisabClient, type CashEntry } from "./HisabClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "खुला हिसाब — NYS का पूरा आय-व्यय",
  description:
    "श्री नारायणपुरी यूथ सोसायटी का पूरा सार्वजनिक हिसाब — कब, किससे, कितना दान मिला और "
    + "कहाँ, किस काम पर कितना खर्च हुआ, काम की तस्वीरों सहित।",
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default async function HisabPage() {
  const [rows, settings] = await Promise.all([
    prisma.cashBookEntry.findMany({
      where: { isPublished: true },
      orderBy: [{ date: "asc" }, { seq: "asc" }],
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    }),
    getSettings(),
  ]);

  const entries: CashEntry[] = rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    side: r.side === "RECEIPT" ? "RECEIPT" : "PAYMENT",
    particulars: r.particulars,
    voucher: r.voucher,
    amount: r.amount,
    balance: r.balance,
    bookPage: r.bookPage,
    category: r.category,
    note: r.note,
    photos: r.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption })),
  }));

  const income = entries.filter((e) => e.side === "RECEIPT").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.side === "PAYMENT").reduce((s, e) => s + e.amount, 0);
  const first = entries[0]?.date;
  const last = entries[entries.length - 1]?.date;
  const yr = (d?: string) => (d ? new Date(d).getUTCFullYear() : "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:py-10">
      {/* ── शीर्ष ── */}
      <header className="mb-6 overflow-hidden rounded-2xl border border-maroon-200">
        <div className="px-5 py-6 text-white sm:px-7"
          style={{ background: "linear-gradient(135deg,#7f1d1d 0%,#991b1b 55%,#b45309 100%)" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">जन सूचना</p>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">खुला हिसाब</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
            संस्था को मिला हर रुपया और किया गया हर खर्च यहाँ दर्ज है — दानदाता का नाम, काम का विवरण,
            और किए गए काम की तस्वीरों सहित। हर प्रविष्टि संस्था की रोकड़ बही से ली गई है और
            बही के पृष्ठ संख्या के साथ दर्ज है।
          </p>
          {settings.legal?.registrationNo && (
            <p className="mt-3 inline-block rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
              पंजीकरण संख्या: {settings.legal.registrationNo}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 divide-x divide-stone-200 border-t border-stone-200 bg-white sm:grid-cols-4">
          {[
            { l: "कुल आय", v: inr(income), c: "text-green-700" },
            { l: "कुल खर्च", v: inr(expense), c: "text-maroon-800" },
            { l: "शेष राशि", v: inr(income - expense), c: "text-blue-800" },
            { l: "कुल प्रविष्टियाँ", v: String(entries.length), c: "text-stone-800" },
          ].map((k) => (
            <div key={k.l} className="px-3 py-4 text-center">
              <div className={`text-lg font-extrabold tabular-nums sm:text-xl ${k.c}`}>{k.v}</div>
              <div className="mt-0.5 text-[11px] text-stone-500">{k.l}</div>
            </div>
          ))}
        </div>

        {first && (
          <p className="border-t border-stone-100 bg-stone-50 px-4 py-2 text-center text-[11px] text-stone-500">
            अवधि: {yr(first)} से {yr(last)} · रोकड़ बही के पृष्ठ 1 से 50 तक · हर दिन का जोड़ बही से मिलान किया गया है
          </p>
        )}
      </header>

      <HisabClient entries={entries} />

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-600">
        <h2 className="mb-2 text-base font-bold text-ink">यह जानकारी कहाँ से है?</h2>
        <p>
          यह ब्यौरा संस्था की हाथ से लिखी रोकड़ बही से लिया गया है। हर प्रविष्टि के आगे बही का
          पृष्ठ नंबर भी दिया है। बही के हर दिन का जोड़ और शेष मिलान करके जाँचा गया है, और अंतिम शेष
          बही में लिखे शेष से पूरी तरह मेल खाता है। मूल बही कार्यालय में देखी जा सकती है।
        </p>
        <p className="mt-2">
          कोई प्रश्न या आपत्ति हो तो{" "}
          <a href="/contact" className="font-semibold text-saffron-700 underline">संपर्क करें</a>{" "}
          — हम रिकॉर्ड दिखाने को तैयार हैं।
        </p>
      </section>
    </div>
  );
}
