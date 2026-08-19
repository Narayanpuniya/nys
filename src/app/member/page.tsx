import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  IdCard,
  Award,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  QrCode,
  ChevronRight,
  User,
} from "lucide-react";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { formatDateHi, formatINR } from "@/lib/utils";
import { Card, Badge } from "@/components/ui/primitives";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "सदस्य पोर्टल — NYS" };
export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  ACTIVE:   { label: "सक्रिय सदस्य",   icon: CheckCircle2, cls: "text-green-700 bg-green-50 border-green-200" },
  PENDING:  { label: "अनुमोदन लंबित",  icon: Clock,        cls: "text-amber-700 bg-amber-50 border-amber-200" },
  EXPIRED:  { label: "सदस्यता समाप्त", icon: XCircle,      cls: "text-red-700   bg-red-50   border-red-200"   },
  REJECTED: { label: "अस्वीकृत",       icon: XCircle,      cls: "text-stone-700 bg-stone-50 border-stone-200" },
} as const;

export default async function MemberPortal() {
  const session = await getMemberSession();
  if (!session) redirect("/login?tab=member");

  const member = await prisma.member.findUnique({
    where: { id: session.id },
    include: {
      plan: true,
      certificates: { orderBy: { issuedAt: "desc" }, take: 5 },
      payments: { orderBy: { paidAt: "desc" }, take: 3 },
      eventRegs: {
        include: { event: { select: { title: true, date: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!member || member.deletedAt) redirect("/login?tab=member");

  const cfg = STATUS_CONFIG[member.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isActive = member.status === "ACTIVE";
  const validUntilMs = member.validUntil?.getTime() ?? 0;
  const daysLeft = isActive && validUntilMs
    ? Math.max(0, Math.ceil((validUntilMs - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-cream to-maroon-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-saffron-100 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-bold text-ink">NYS</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-600 sm:block">{member.fullName}</span>
            <a
              href="/member/logout"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              <LogOut className="h-3.5 w-3.5" /> लॉगआउट
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 pb-16">

        {/* Status banner */}
        <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 ${cfg.cls}`}>
          <StatusIcon className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold">{cfg.label}</p>
            {member.status === "PENDING" && (
              <p className="text-sm opacity-80">आपकी सदस्यता समीक्षाधीन है। शीघ्र सूचित किया जाएगा।</p>
            )}
            {isActive && daysLeft !== null && (
              <p className="text-sm opacity-80">
                {daysLeft > 0
                  ? `${daysLeft} दिन शेष · ${formatDateHi(member.validUntil!)} तक`
                  : "सदस्यता की समयसीमा आज समाप्त हो रही है।"}
              </p>
            )}
            {member.status === "EXPIRED" && (
              <p className="text-sm opacity-80">
                <Link href="/join" className="underline">नवीनीकरण करें →</Link>
              </p>
            )}
          </div>
        </div>

        {/* Profile + Quick actions grid */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Profile card */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-saffron-100 text-2xl">
                {member.photoUrl
                  ? <img src={member.photoUrl} alt={member.fullName} className="h-16 w-16 rounded-full object-cover" />
                  : <User className="h-8 w-8 text-saffron-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-ink">{member.fullName}</h1>
                <p className="font-mono text-sm text-saffron-700">{member.memberCode}</p>
                {member.plan && (
                  <p className="mt-1 text-xs text-stone-500">{member.plan.name} सदस्यता</p>
                )}
              </div>
            </div>

            <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="h-4 w-4 text-saffron-500 flex-shrink-0" />
                <span>{member.mobile}</span>
              </div>
              {member.whatsapp && member.whatsapp !== member.mobile && (
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>WhatsApp: {member.whatsapp}</span>
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="h-4 w-4 text-saffron-500 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-start gap-2 text-stone-600 sm:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-500" />
                  <span>{member.address}{member.village ? `, ${member.village}` : ""}{member.district ? ` — ${member.district}` : ""}</span>
                </div>
              )}
              {member.joiningDate && (
                <div className="flex items-center gap-2 text-stone-600">
                  <CalendarDays className="h-4 w-4 text-saffron-500 flex-shrink-0" />
                  <span>सदस्यता: {formatDateHi(member.joiningDate)}</span>
                </div>
              )}
              {member.bloodGroup && (
                <div className="flex items-center gap-2 text-stone-600">
                  <span className="text-lg">🩸</span>
                  <span>रक्त समूह: <strong>{member.bloodGroup}</strong></span>
                </div>
              )}
            </dl>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide px-1">त्वरित लिंक</h2>

            {isActive && (
              <Link
                href={`/id-card/${member.memberCode}`}
                className="flex items-center justify-between rounded-2xl border border-saffron-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-100">
                    <IdCard className="h-5 w-5 text-saffron-700" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink text-sm">Digital ID Card</p>
                    <p className="text-xs text-stone-500">देखें व Print करें</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            )}

            {member.certificates.length > 0 && (
              <Link
                href={`/certificate/${member.certificates[0].certNumber}`}
                className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Award className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink text-sm">सदस्यता प्रमाणपत्र</p>
                    <p className="text-xs text-stone-500">Download / Print</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            )}

            <Link
              href="/verify"
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                  <QrCode className="h-5 w-5 text-stone-700" />
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">सदस्य सत्यापन</p>
                  <p className="text-xs text-stone-500">QR से verify करें</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/join"
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">सदस्यता नवीनीकरण</p>
                  <p className="text-xs text-stone-500">Membership renew करें</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Payments history */}
        {member.payments.length > 0 && (
          <Card className="mt-5 p-5">
            <h2 className="mb-4 font-bold text-ink">💳 भुगतान इतिहास</h2>
            <div className="space-y-3">
              {member.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0 text-sm">
                  <div>
                    <p className="font-medium text-ink">{formatINR(p.amount)}</p>
                    <p className="text-xs text-stone-500">{formatDateHi(p.paidAt)} · {p.mode}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={p.status === "SUCCESS" ? "green" : "amber"}>{p.status === "SUCCESS" ? "सफल" : p.status}</Badge>
                    {p.receiptNumber && (
                      <p className="mt-1 font-mono text-xs text-stone-400">{p.receiptNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Event registrations */}
        {member.eventRegs.length > 0 && (
          <Card className="mt-5 p-5">
            <h2 className="mb-4 font-bold text-ink">📅 मेरे कार्यक्रम</h2>
            <div className="space-y-3">
              {member.eventRegs.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0 text-sm">
                  <div>
                    <Link href={`/events/${r.event.slug}`} className="font-medium text-ink hover:text-saffron-700">
                      {r.event.title}
                    </Link>
                    <p className="text-xs text-stone-500">{formatDateHi(r.event.date)}</p>
                  </div>
                  <span className="font-mono text-xs text-stone-400">{r.regNumber}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Certificates list */}
        {member.certificates.length > 1 && (
          <Card className="mt-5 p-5">
            <h2 className="mb-4 font-bold text-ink">🏅 प्रमाणपत्र</h2>
            <div className="space-y-2">
              {member.certificates.map((c) => (
                <Link
                  key={c.id}
                  href={`/certificate/${c.certNumber}`}
                  className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3 text-sm hover:bg-saffron-50"
                >
                  <div>
                    <span className="font-medium text-ink">{c.type}</span>
                    <span className="ml-2 text-xs text-stone-500">{formatDateHi(c.issuedAt)}</span>
                  </div>
                  <span className="font-mono text-xs text-saffron-700">{c.certNumber}</span>
                </Link>
              ))}
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
