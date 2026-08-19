import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  IdCard, Award, CalendarDays, Phone, Mail, MapPin,
  CheckCircle2, Clock, XCircle, LogOut, QrCode,
  LayoutDashboard, User, CreditCard, FileText,
  BookOpen, ChevronRight, Wallet,
} from "lucide-react";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { formatDateHi, formatINR } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "मेरा डैशबोर्ड — NYS" };
export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  ACTIVE:   { label: "सदस्यता सक्रिय",   icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
  PENDING:  { label: "अनुमोदन लंबित",    icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200" },
  EXPIRED:  { label: "सदस्यता समाप्त",   icon: XCircle,      cls: "bg-red-50   text-red-700   border-red-200"   },
  REJECTED: { label: "अस्वीकृत",         icon: XCircle,      cls: "bg-stone-50 text-stone-700 border-stone-200" },
} as const;

export default async function MemberPortal() {
  const session = await getMemberSession();
  if (!session) redirect("/login?tab=member");

  const member = await prisma.member.findUnique({
    where: { id: session.id },
    include: {
      plan: true,
      certificates: { orderBy: { issuedAt: "desc" } },
      payments:     { orderBy: { paidAt:   "desc" }, take: 5 },
      eventRegs: {
        include: { event: { select: { title: true, date: true, slug: true } } },
        orderBy:  { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!member || member.deletedAt) redirect("/login?tab=member");

  const cfg = STATUS_CONFIG[member.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isActive = member.status === "ACTIVE";

  // Stats
  const totalPaid  = member.payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  const lastPayment = member.payments.find(p => p.status === "SUCCESS");
  const certCount  = member.certificates.length;

  const navLinks = [
    { icon: LayoutDashboard, label: "डैशबोर्ड",     href: "/member",          active: true },
    { icon: User,            label: "मेरी प्रोफाइल", href: "#profile",         active: false },
    { icon: CreditCard,      label: "भुगतान इतिहास", href: "#payments",        active: false },
    { icon: FileText,        label: "प्रमाण पत्र",   href: "#certificates",   active: false },
    { icon: IdCard,          label: "ID कार्ड",      href: `/id-card/${member.memberCode}`, active: false },
    { icon: BookOpen,        label: "नियम एवं शर्तें", href: "/terms",         active: false },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-col bg-saffron-700 text-white fixed inset-y-0 left-0 z-30 shadow-xl">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-saffron-600">
          <LogoMark className="h-9 w-9 flex-shrink-0" />
          <div>
            <p className="font-extrabold text-sm leading-tight">नारायणपुरी</p>
            <p className="text-xs text-saffron-200">यूथ सोसाइटी</p>
          </div>
        </div>

        {/* Member info */}
        <div className="px-5 py-5 border-b border-saffron-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-saffron-500 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/30">
              {member.photoUrl
                ? <img src={member.photoUrl} alt={member.fullName} className="h-12 w-12 object-cover" />
                : <span className="text-xl font-bold">{member.fullName[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{member.fullName}</p>
              <p className="text-xs text-saffron-200 font-mono">{member.memberCode}</p>
            </div>
          </div>
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
            <StatusIcon className="h-3 w-3" />{cfg.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ icon: Icon, label, href, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-saffron-800 shadow"
                  : "text-saffron-100 hover:bg-saffron-600"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <a
            href="/member/logout"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-saffron-100 hover:bg-saffron-600 transition-all"
          >
            <LogOut className="h-4 w-4" /> लॉगआउट
          </a>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between bg-saffron-700 px-4 py-3 shadow text-white">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="font-bold text-sm">NYS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-saffron-200">{member.fullName}</span>
            <a href="/member/logout" className="rounded-lg border border-saffron-500 px-2.5 py-1 text-xs font-medium hover:bg-saffron-600">
              <LogOut className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto">

          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-ink">
              नमस्ते, {member.fullName.split(" ")[0]} जी 🙏
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {member.plan?.name ?? "NYS"} सदस्य · {formatDateHi(member.joiningDate)} से
            </p>
          </div>

          {/* ── STATS CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon="💳"
              label="कुल भुगतान"
              value={String(member.payments.filter(p => p.status === "SUCCESS").length)}
              sub="किश्तें जमा"
              color="saffron"
            />
            <StatCard
              icon="💰"
              label="जमा राशि"
              value={formatINR(totalPaid)}
              sub="कुल जमा"
              color="green"
            />
            <StatCard
              icon="📅"
              label="अंतिम भुगतान"
              value={lastPayment ? formatDateHi(lastPayment.paidAt) : "—"}
              sub="तारीख"
              color="blue"
            />
            <StatCard
              icon="🏅"
              label="प्रमाण पत्र"
              value={String(certCount)}
              sub="जारी"
              color="amber"
            />
          </div>

          {/* ── QUICK ACTION CARDS ── */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* ID Card */}
            {isActive && (
              <Link
                href={`/id-card/${member.memberCode}`}
                className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-saffron-600 to-saffron-500 p-5 text-white shadow hover:shadow-lg transition-shadow"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <IdCard className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-bold">ID कार्ड</p>
                  <p className="text-xs text-saffron-100">देखें व डाउनलोड करें</p>
                </div>
                <ChevronRight className="h-5 w-5 text-saffron-200" />
              </Link>
            )}

            {/* Certificate */}
            {certCount > 0 && (
              <Link
                href={`/certificate/${member.certificates[0].certNumber}`}
                className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white shadow hover:shadow-lg transition-shadow"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Award className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-bold">सदस्यता प्रमाण पत्र</p>
                  <p className="text-xs text-emerald-100">देखें व Print करें</p>
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-200" />
              </Link>
            )}

            {/* Renew */}
            <Link
              href="/join"
              className="flex items-center gap-4 rounded-2xl bg-white border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-ink">सदस्यता नवीनीकरण</p>
                <p className="text-xs text-stone-500">Membership renew करें</p>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-400" />
            </Link>

            {/* Verify */}
            <Link
              href="/verify"
              className="flex items-center gap-4 rounded-2xl bg-white border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                <QrCode className="h-6 w-6 text-purple-600" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-ink">सदस्य सत्यापन</p>
                <p className="text-xs text-stone-500">QR से verify करें</p>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-400" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-5 gap-5">

            {/* ── PROFILE CARD ── */}
            <div id="profile" className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
              <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-saffron-600" /> मेरी प्रोफाइल
              </h2>

              <div className="flex flex-col items-center mb-4 pb-4 border-b border-stone-100">
                <div className="h-20 w-20 rounded-full bg-saffron-100 flex items-center justify-center overflow-hidden mb-2 border-2 border-saffron-200">
                  {member.photoUrl
                    ? <img src={member.photoUrl} alt={member.fullName} className="h-20 w-20 object-cover" />
                    : <span className="text-3xl font-bold text-saffron-600">{member.fullName[0]}</span>
                  }
                </div>
                <p className="font-extrabold text-ink">{member.fullName}</p>
                <p className="font-mono text-xs text-saffron-700 mt-0.5">{member.memberCode}</p>
                {member.plan && (
                  <p className="text-xs text-stone-400 mt-1">{member.plan.name}</p>
                )}
              </div>

              <dl className="space-y-2.5 text-sm">
                <InfoRow icon={<Phone className="h-3.5 w-3.5 text-saffron-500" />} value={member.mobile} />
                {member.email && <InfoRow icon={<Mail className="h-3.5 w-3.5 text-saffron-500" />} value={member.email} />}
                {member.bloodGroup && (
                  <InfoRow icon={<span className="text-sm">🩸</span>} value={`रक्त समूह: ${member.bloodGroup}`} />
                )}
                {(member.address || member.village) && (
                  <InfoRow
                    icon={<MapPin className="h-3.5 w-3.5 text-saffron-500" />}
                    value={[member.address, member.village, member.district].filter(Boolean).join(", ")}
                  />
                )}
                <InfoRow
                  icon={<CalendarDays className="h-3.5 w-3.5 text-saffron-500" />}
                  value={`सदस्यता: ${formatDateHi(member.joiningDate)}`}
                />
                {member.validUntil && (
                  <InfoRow
                    icon={<Clock className="h-3.5 w-3.5 text-saffron-500" />}
                    value={`Valid: ${formatDateHi(member.validUntil)}`}
                  />
                )}
              </dl>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Recent Payments */}
              <div id="payments" className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
                <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-saffron-600" /> हाल के भुगतान
                </h2>
                {member.payments.length > 0 ? (
                  <div className="space-y-3">
                    {member.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0 last:pb-0 text-sm">
                        <div>
                          <p className="font-semibold text-ink">{formatINR(p.amount)}</p>
                          <p className="text-xs text-stone-400">{formatDateHi(p.paidAt)} · {p.mode}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.status === "SUCCESS" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {p.status === "SUCCESS" ? "✓ सफल" : p.status}
                          </span>
                          <p className="mt-0.5 font-mono text-xs text-stone-400">{p.receiptNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-400 py-4 text-center">अभी तक कोई भुगतान दर्ज नहीं हुआ है।</p>
                )}
              </div>

              {/* Certificates */}
              {certCount > 0 && (
                <div id="certificates" className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
                  <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-saffron-600" /> मेरे प्रमाण पत्र
                  </h2>
                  <div className="space-y-2">
                    {member.certificates.map((c) => (
                      <Link
                        key={c.id}
                        href={`/certificate/${c.certNumber}`}
                        className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3 text-sm hover:bg-saffron-50 transition"
                      >
                        <div>
                          <p className="font-semibold text-ink">{c.type}</p>
                          <p className="text-xs text-stone-400">{formatDateHi(c.issuedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-saffron-700">{c.certNumber}</span>
                          <ChevronRight className="h-4 w-4 text-stone-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {member.eventRegs.length > 0 && (
                <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
                  <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-saffron-600" /> मेरे कार्यक्रम
                  </h2>
                  <div className="space-y-2">
                    {member.eventRegs.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0 text-sm">
                        <div>
                          <Link href={`/events/${r.event.slug}`} className="font-semibold text-ink hover:text-saffron-700">
                            {r.event.title}
                          </Link>
                          <p className="text-xs text-stone-400">{formatDateHi(r.event.date)}</p>
                        </div>
                        <span className="font-mono text-xs text-stone-400">{r.regNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string;
  color: "saffron" | "green" | "blue" | "amber";
}) {
  const colors = {
    saffron: "border-saffron-200 bg-saffron-50",
    green:   "border-emerald-200 bg-emerald-50",
    blue:    "border-blue-200 bg-blue-50",
    amber:   "border-amber-200 bg-amber-50",
  };
  const textColors = {
    saffron: "text-saffron-700",
    green:   "text-emerald-700",
    blue:    "text-blue-700",
    amber:   "text-amber-700",
  };
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-xl font-extrabold ${textColors[color]} leading-tight`}>{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{sub}</p>
    </div>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-start gap-2 text-stone-600">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
