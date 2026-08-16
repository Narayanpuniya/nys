import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/admin") ? sp.next : "/admin";

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-stone-500">
          लोड हो रहा है…
        </div>
      }
    >
      <AdminLoginForm next={next} />
    </Suspense>
  );
}
