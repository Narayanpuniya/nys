import { prisma } from "@/lib/db";
import { PartnersManager } from "./PartnersManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "सहयोगी संस्थान — NYS Admin" };

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    include: { programs: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">सहयोगी संस्थान</h1>
      <PartnersManager initialPartners={partners} />
    </div>
  );
}
