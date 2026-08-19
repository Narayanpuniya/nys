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
  mobile: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "मान्य मोबाइल नंबर दर्ज करें (10 अंक)"),
  memberCode: z.string().trim().min(3, "सदस्य कोड आवश्यक है"),
});

export type MemberLoginState = { error?: string };

export async function memberLoginAction(
  _prev: MemberLoginState,
  formData: FormData
): Promise<MemberLoginState> {
  const parsed = memberLoginSchema.safeParse({
    mobile: formData.get("mobile"),
    memberCode: formData.get("memberCode"),
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "कृपया सही जानकारी दर्ज करें।" };
  }

  try {
    const result = await loginMember(parsed.data.mobile, parsed.data.memberCode);
    if (!result) {
      return { error: "मोबाइल नंबर या सदस्य कोड गलत है। कृपया जाँचें।" };
    }

    redirect("/member");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[memberLoginAction]", err);
    return { error: "सर्वर से जुड़ने में समस्या आई। कृपया पुनः प्रयास करें।" };
  }
}
