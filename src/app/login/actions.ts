"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";
import { loginMember } from "@/lib/member-auth";
import { loginSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

// ── Admin Login ──────────────────────────────────────────────────────────────
export type LoginState = { error?: string };

export async function adminLoginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "कृपया मान्य ईमेल व पासवर्ड दर्ज करें।" };

  try {
    const user = await login(parsed.data.email, parsed.data.password);
    if (!user) return { error: "ईमेल या पासवर्ड गलत है।" };

    await logAudit({
      user,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      summary: `${user.name} ने Admin लॉगिन किया`,
    });

    redirect("/admin");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[adminLoginAction]", err);
    return { error: "सर्वर/डेटाबेस तैयार नहीं है।" };
  }
}

// ── Member Login ─────────────────────────────────────────────────────────────
const memberLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "मोबाइल नंबर या ईमेल दर्ज करें")
    .refine(
      (v) =>
        /^(\+91[- ]?)?[6-9]\d{9}$/.test(v) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "मान्य मोबाइल नंबर या ईमेल दर्ज करें"
    ),
  password: z.string().min(1, "पासवर्ड दर्ज करें"),
});

export type MemberLoginState = { error?: string };

export async function memberLoginAction(
  _prev: MemberLoginState,
  formData: FormData
): Promise<MemberLoginState> {
  const parsed = memberLoginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "कृपया सही जानकारी दर्ज करें।" };
  }

  try {
    const result = await loginMember(parsed.data.identifier, parsed.data.password);

    if (!result.ok) {
      if (result.reason === "not_found")
        return { error: "यह मोबाइल/ईमेल पंजीकृत नहीं है।" };
      if (result.reason === "no_password")
        return { error: "आपका पासवर्ड सेट नहीं है। Admin से संपर्क करें।" };
      return { error: "पासवर्ड गलत है। कृपया जाँचें।" };
    }

    redirect("/member");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[memberLoginAction]", err);
    return { error: "सर्वर से जुड़ने में समस्या आई। कृपया पुनः प्रयास करें।" };
  }
}
