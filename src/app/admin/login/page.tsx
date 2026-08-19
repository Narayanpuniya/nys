import { redirect } from "next/navigation";

// /admin/login → unified /login?tab=admin पर permanent redirect
export const dynamic = "force-dynamic";

export default async function AdminLoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ? `&next=${encodeURIComponent(sp.next)}` : "";
  redirect(`/login?tab=admin${next}`);
}
