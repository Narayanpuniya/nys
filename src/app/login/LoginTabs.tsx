"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn, Shield, UserCheck, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { adminLoginAction, memberLoginAction, type LoginState, type MemberLoginState } from "./actions";
import { LogoMark } from "@/components/ui/Logo";

// ── Tab switcher ──────────────────────────────────────────────────────────────
type Tab = "member" | "admin";

export function LoginTabs({ defaultTab }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab ?? "member");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-saffron-50 via-cream to-maroon-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo + Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-16 w-16" />
          <h1 className="mt-3 text-2xl font-extrabold text-ink">नारायणपुरी यूथ सोसाइटी</h1>
          <p className="text-sm text-stone-500">गुदियाल नगर · NYS पोर्टल</p>
        </div>

        {/* Tab buttons */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-saffron-100 bg-white/80 p-1.5 shadow-sm">
          <button
            onClick={() => setTab("member")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              tab === "member"
                ? "bg-saffron-600 text-white shadow-md"
                : "text-stone-600 hover:text-saffron-700"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            सदस्य लॉगिन
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              tab === "admin"
                ? "bg-ink text-white shadow-md"
                : "text-stone-600 hover:text-ink"
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin लॉगिन
          </button>
        </div>

        {/* Forms */}
        {tab === "member" ? <MemberForm /> : <AdminForm />}

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-stone-400">
          NYS में शामिल नहीं हैं?{" "}
          <Link href="/join" className="font-medium text-saffron-700 hover:underline">
            सदस्यता लें
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Member Form ───────────────────────────────────────────────────────────────
function MemberForm() {
  const [state, action, pending] = useActionState<MemberLoginState, FormData>(memberLoginAction, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="rounded-2xl border border-saffron-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-100 text-saffron-700">
          <UserCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-bold text-ink">सदस्य लॉगिन</h2>
          <p className="text-xs text-stone-500">मोबाइल नंबर या ईमेल व पासवर्ड दर्ज करें</p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        {/* Identifier: mobile or email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            मोबाइल नंबर या ईमेल <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="identifier"
              type="text"
              required
              inputMode="email"
              placeholder="9876543210 या name@email.com"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-ink placeholder-stone-400 outline-none transition focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100"
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">सदस्यता के समय दिया गया मोबाइल या ईमेल</p>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            पासवर्ड <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="password"
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-10 text-sm text-ink placeholder-stone-400 outline-none transition focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-400">सदस्यता फॉर्म भरते समय बनाया पासवर्ड</p>
        </div>

        {state.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ {state.error}
          </div>
        )}

        <button
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-600 py-3 font-semibold text-white transition hover:bg-saffron-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
          {pending ? "जाँच रहे हैं…" : "लॉगिन करें"}
        </button>
      </form>

      <div className="mt-5 rounded-xl bg-saffron-50 p-4">
        <p className="text-xs font-semibold text-saffron-800">💡 पासवर्ड भूल गए?</p>
        <ul className="mt-1.5 space-y-0.5 text-xs text-stone-600">
          <li>• Admin से संपर्क करें — वे पासवर्ड रीसेट कर सकते हैं</li>
          <li>• पुराने सदस्य: Admin से नया पासवर्ड सेट करवाएँ</li>
        </ul>
      </div>
    </div>
  );
}

// ── Admin Form ────────────────────────────────────────────────────────────────
function AdminForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(adminLoginAction, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-bold text-ink">Admin लॉगिन</h2>
          <p className="text-xs text-stone-500">NYS प्रशासन पैनल में प्रवेश</p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            ईमेल <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="email"
              type="email"
              required
              placeholder="admin@nys.org"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-ink placeholder-stone-400 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            पासवर्ड <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="password"
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-10 text-sm text-ink placeholder-stone-400 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {state.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ {state.error}
          </div>
        )}

        <button
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
          {pending ? "जाँच रहे हैं…" : "Admin पैनल में प्रवेश करें"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-stone-400">केवल अधिकृत NYS प्रशासन सदस्यों के लिए</p>
        <Link
          href="/emergency-reset"
          className="text-xs text-stone-400 hover:text-red-600 hover:underline transition-colors"
        >
          पासवर्ड भूल गए?
        </Link>
      </div>
    </div>
  );
}
