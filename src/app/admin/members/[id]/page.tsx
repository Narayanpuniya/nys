import Link from "next/link";
import { notFound } from "next/navigation";
import { IdCard, Award, Check, X, ExternalLink, Pencil, FileImage, Receipt } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatINR, formatDateHi } from "@/lib/utils";
import { approveMember, rejectMember } from "../actions";
import { DeleteMemberButton } from "./DeleteMemberButton";

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
  const latestPayment = member.payments[0] ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/members" className="text-sm text-saffron-700">← सभी सदस्य</Link>
        <div className="flex items-center gap-2">
          <DeleteMemberButton memberId={member.id} memberName={member.fullName} redirectTo="/admin/members" />
          <Link
            href={`/admin/members/${member.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-700"
          >
            <Pencil className="h-4 w-4" /> संपादित करें
          </Link>
        </div>
      </div>

      {/* ── PENDING: approval card — full width, most prominent ── */}
      {member.status === "PENDING" && (
        <Card className="mt-4 border-2 border-amber-300 bg-amber-50 p-5">
          <h2 className="mb-3 text-base font-extrabold text-amber-900">⏳ स्वीकृति प्रतीक्षित — {member.fullName}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Receipt proof */}
            <div>
              <p className="mb-2 text-xs font-bold text-amber-800">📎 भुगतान रसीद (सदस्य द्वारा अपलोड)</p>
              {latestPayment?.proofUrl ? (
                <div className="space-y-2">
                  <a href={latestPayment.proofUrl} target="_blank" rel="noreferrer"
                    className="block overflow-hidden rounded-xl border-2 border-amber-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={latestPayment.proofUrl}
                      alt="भुगतान रसीद"
                      className="max-h-64 w-full object-contain"
                    />
                  </a>
                  <a
                    href={latestPayment.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
                  >
                    <FileImage className="h-4 w-4" /> पूरी रसीद देखें ↗
                  </a>
                  <p className="text-xs text-stone-600">
                    राशि: <strong>₹{latestPayment.amount}</strong> · मोड: {latestPayment.mode}
                    {latestPayment.notes && <> · {latestPayment.notes}</>}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-stone-200 bg-white px-4 py-6 text-center text-sm text-stone-400">
                  रसीद अपलोड नहीं की गई
                </div>
              )}
            </div>

            {/* Member quick info + approve/reject */}
            <div className="flex flex-col justify-between gap-3">
              <div className="space-y-1 rounded-xl bg-white p-4 text-sm">
                <InfoRow label="नाम" value={member.fullName} />
                <InfoRow label="मोबाइल" value={member.mobile} />
                <InfoRow label="गाँव/शहर" value={member.village ?? "—"} />
                <InfoRow label="तहसील" value={(member as Record<string, unknown>).tehsil as string ?? "—"} />
                <InfoRow label="जिला" value={member.district ?? "—"} />
                <InfoRow label="राज्य" value={member.state ?? "—"} />
                <InfoRow label="योजना" value={member.plan?.name ?? "—"} />
                <InfoRow label="राशि" value={latestPayment ? `₹${latestPayment.amount}` : "—"} />
              </div>
              <div className="flex gap-2">
                <form action={approveMember.bind(null, member.id)} className="flex-1">
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700">
                    <Check className="h-4 w-4" /> स्वीकृत करें
                  </button>
                </form>
                <form action={rejectMember.bind(null, member.id)}>
                  <button className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4" /> अस्वीकृत
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
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
            <Row label="लिंग" value={member.gender ?? "—"} />
            <Row label="जन्म तिथि" value={member.dob ? formatDateHi(member.dob) : "—"} />
            <Row label="व्यवसाय" value={member.occupation ?? "—"} />
            <Row label="गाँव/शहर" value={member.village ?? "—"} />
            <Row label="तहसील" value={(member as Record<string, unknown>).tehsil as string ?? "—"} />
            <Row label="जिला" value={member.district ?? "—"} />
            <Row label="राज्य" value={member.state ?? "—"} />
            <Row label="पता" value={member.address ?? "—"} />
            <Row label="ब्लड ग्रुप" value={member.bloodGroup ?? "—"} />
            <Row label="आपातकालीन संपर्क" value={member.emergencyContact ?? "—"} />
            <Row label="योजना" value={member.plan?.name ?? "—"} />
            <Row label="सदस्यता तिथि" value={formatDateHi(member.joiningDate)} />
            <Row label="मान्य तक" value={member.validUntil ? formatDateHi(member.validUntil) : "—"} />
          </dl>

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">रसीद नं.</th>
                    <th className="pr-3">राशि</th>
                    <th className="pr-3">मोड</th>
                    <th className="pr-3">स्थिति</th>
                    <th className="pr-3">भुगतान प्रूफ</th>
                    <th>दिनांक</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {member.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-3">
                        <div className="font-mono text-xs">{p.receiptNumber}</div>
                        {p.notes && <div className="text-xs text-stone-400">{p.notes}</div>}
                      </td>
                      <td className="pr-3">{formatINR(p.amount)}</td>
                      <td className="pr-3">{p.mode}</td>
                      <td className="pr-3"><Badge tone={p.status === "SUCCESS" ? "green" : "amber"}>{p.status}</Badge></td>
                      <td className="pr-3">
                        <div className="flex flex-wrap gap-1">
                          {p.proofUrl && (
                            <a
                              href={p.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                            >
                              <FileImage className="h-3.5 w-3.5" /> प्रूफ
                            </a>
                          )}
                          <a
                            href={`/membership-receipt/${p.receiptNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-saffron-300 bg-saffron-50 px-2 py-1 text-xs font-bold text-saffron-800 hover:bg-saffron-100"
                          >
                            <Receipt className="h-3.5 w-3.5" /> रसीद जारी करें
                          </a>
                        </div>
                      </td>
                      <td className="text-stone-500 text-xs">{formatDateHi(p.paidAt)}</td>
                    </tr>
                  ))}
                  {member.payments.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-center text-stone-400">कोई भुगतान नहीं</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-2 font-bold text-ink">प्रमाणपत्र</h3>
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
              <h3 className="mb-2 font-bold text-ink">गतिविधियाँ</h3>
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
    <div className="flex justify-between gap-2 border-b border-stone-50 pb-1 last:border-0">
      <dt className="shrink-0 text-stone-500">{label}</dt>
      <dd className="text-right font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-ink">{value || "—"}</span>
    </div>
  );
}
