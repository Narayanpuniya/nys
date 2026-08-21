import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MemberEditForm } from "./MemberEditForm";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, plans] = await Promise.all([
    prisma.member.findUnique({ where: { id } }),
    prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!member || member.deletedAt) notFound();

  return (
    <div>
      <Link href={`/admin/members/${member.id}`} className="text-sm text-saffron-700">← प्रोफ़ाइल पर वापस</Link>
      <h1 className="mt-2 mb-4 text-2xl font-extrabold text-ink">सदस्य संपादित करें</h1>
      <MemberEditForm
        member={{
          id: member.id,
          memberCode: member.memberCode,
          fullName: member.fullName,
          guardianName: member.guardianName,
          dob: member.dob,
          gender: member.gender,
          mobile: member.mobile,
          whatsapp: member.whatsapp,
          email: member.email,
          address: member.address,
          village: member.village,
          tehsil: (member as Record<string, unknown>).tehsil as string | null,
          district: member.district,
          state: member.state,
          occupation: member.occupation,
          bloodGroup: member.bloodGroup,
          emergencyContact: member.emergencyContact,
          photoUrl: member.photoUrl,
          planId: member.planId,
          status: member.status,
          showMobile: member.showMobile,
        }}
        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
