"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "./actions";
import { LogoMark } from "@/components/ui/Logo";
import { Field, inputClass } from "@/components/ui/primitives";

export function AdminLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-saffron-50 via-cream to-maroon-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-saffron-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-3 text-xl font-extrabold text-ink">NYS एडमिन पैनल</h1>
          <p className="text-sm text-stone-500">कृपया लॉगिन करें</p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <Field label="ईमेल" required>
            <input name="email" type="email" required className={inputClass} placeholder="admin@nys.org" />
          </Field>
          <Field label="पासवर्ड" required>
            <input name="password" type="password" required className={inputClass} placeholder="••••••••" />
          </Field>

          {state.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}

          <button
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-600 py-2.5 font-medium text-white hover:bg-saffron-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />} लॉगिन
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-stone-400">
          डेमो: admin@nys.org / Admin@123
        </p>
      </div>
    </div>
  );
}
