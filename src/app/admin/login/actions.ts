"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "कृपया मान्य ईमेल व पासवर्ड दर्ज करें।" };

  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) return { error: "ईमेल या पासवर्ड गलत है।" };

  await logAudit({ user, action: "LOGIN", entity: "User", entityId: user.id, summary: `${user.name} ने लॉगिन किया` });

  const next = (formData.get("next") as string) || "/admin";
  redirect(next.startsWith("/admin") ? next : "/admin");
}
