import Link from "next/link";
import { notFound } from "next/navigation";
import { IdCard, Award, Check, X, ExternalLink, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatINR, formatDateHi } from "@/lib/utils";
import { approveMember, rejectMember } from "../actions";

export const dynamic = "force-dynamic";

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      plan: true,
      payments: { orderBy: { paidAt: "desc" } },
      certificates: true,
      suggestions: { orderBy: { createdAt: "desc" } },
      volunteers: true,
      eventRegs: { include: { event: true } },
    },
  });
  if (!member) notFound();

  const totalPaid = member.payments.filter((p) => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/members" className="text-sm text-saffron-700">← सभी सदस्य</Link>
        <Link
          href={`/admin/members/${member.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-700"
        >
          <Pencil className="h-4 w-4" /> संपादित करें
        </Link>
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-saffron-100 text-5xl">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
              ) : "🙂"}
            </div>
            <h1 className="mt-3 text-xl font-extrabold text-ink">{member.fullName}</h1>
            <div className="text-saffron-800">{member.memberCode}</div>
            <Badge tone={member.status === "ACTIVE" ? "green" : member.status === "PENDING" ? "amber" : "red"} className="mt-2">{member.status}</Badge>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <Row label="मोबाइल" value={member.mobile} />
            <Row label="WhatsApp" value={member.whatsapp ?? "—"} />
            <Row label="ईमेल" value={member.email ?? "—"} />
            <Row label="गाँव/शहर" value={member.village ?? "—"} />
            <Row label="जिला" value={member.district ?? "—"} />
            <Row label="योजना" value={member.plan?.name ?? "—"} />
            <Row label="सदस्यता तिथि" value={formatDateHi(member.joiningDate)} />
            <Row label="मान्य तक" value={member.validUntil ? formatDateHi(member.validUntil) : "—"} />
          </dl>

          {member.status === "PENDING" && (
            <div className="mt-4 flex gap-2">
              <form action={approveMember.bind(null, member.id)} className="flex-1">
                <button className="flex w-full items-center justify-center gap-1 rounded-xl bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
                  <Check className="h-4 w-4" /> स्वीकृत करें
                </button>
              </form>
              <form action={rejectMember.bind(null, member.id)}>
                <button className="flex items-center justify-center gap-1 rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {member.status === "ACTIVE" && (
            <div className="mt-4 flex gap-2">
              <Link href={`/id-card/${member.memberCode}`} target="_blank" className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-saffron-600 py-2 text-sm font-medium text-white">
                <IdCard className="h-4 w-4" /> ID कार्ड
              </Link>
              <Link href={`/certificate/${member.memberCode}`} target="_blank" className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-maroon-700 py-2 text-sm font-medium text-white">
                <Award className="h-4 w-4" /> प्रमाणपत्र
              </Link>
            </div>
          )}
        </Card>

        {/* Right details */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-ink">भुगतान इतिहास</h3>
              <span className="text-sm text-stone-500">कुल: {formatINR(totalPaid)}</span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-stone-500">
                <tr><th className="py-2">रसीद</th><th>राशि</th><th>मोड</th><th>स्थिति</th><th>दिनांक</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {member.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2">{p.receiptNumber}</td>
                    <td>{formatINR(p.amount)}</td>
                    <td>{p.mode}</td>
                    <td><Badge tone={p.status === "SUCCESS" ? "green" : "amber"}>{p.status}</Badge></td>
                    <td className="text-stone-500">{formatDateHi(p.paidAt)}</td>
                  </tr>
                ))}
                {member.payments.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-stone-400">कोई भुगतान नहीं</td></tr>}
              </tbody>
            </table>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-2 font-bold text-ink">प्रमाणपत्र / रसीद</h3>
              <ul className="space-y-1 text-sm">
                {member.certificates.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span className="text-stone-600">{c.certNumber}</span>
                    <Link href={`/certificate/${member.memberCode}`} target="_blank" className="text-saffron-700"><ExternalLink className="h-4 w-4" /></Link>
                  </li>
                ))}
                {member.certificates.length === 0 && <li className="text-stone-400">कोई नहीं</li>}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="mb-2 font-bold text-ink">कार्यक्रम / सुझाव / स्वयंसेवा</h3>
              <p className="text-sm text-stone-600">कार्यक्रम पंजीकरण: {member.eventRegs.length}</p>
              <p className="text-sm text-stone-600">सुझाव: {member.suggestions.length}</p>
              <p className="text-sm text-stone-600">स्वयंसेवा: {member.volunteers.length}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
