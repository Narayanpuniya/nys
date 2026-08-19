import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "एडमिन उपयोगकर्ता — NYS" };

export default async function UsersPage() {
  const me = await getSessionUser();
  if (!me || me.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">एडमिन उपयोगकर्ता</h1>
      <UsersManager users={users} currentUserId={me.id} />
    </div>
  );
}
