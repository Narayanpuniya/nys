import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getMemberSession } from "@/lib/member-auth";
import { LoginTabs } from "./LoginTabs";

export const metadata: Metadata = { title: "लॉगिन — NYS" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // पहले से logged in? सीधे redirect
  const [adminUser, memberUser] = await Promise.all([
    getSessionUser(),
    getMemberSession(),
  ]);
  if (adminUser) redirect("/admin");
  if (memberUser) redirect("/member");

  const sp = await searchParams;
  const defaultTab = sp.tab === "admin" ? "admin" : "member";

  return <LoginTabs defaultTab={defaultTab} />;
}
