"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertTriangle } from "lucide-react";

const INACTIVE_MS  = 30 * 60 * 1000; // 30 मिनट → logout
const WARNING_MS   = 28 * 60 * 1000; // 28 मिनट → warning दिखाएँ

interface Props {
  /** logout redirect URL, e.g. "/admin/logout" or "/member/logout" */
  logoutUrl: string;
}

export function InactivityWatcher({ logoutUrl }: Props) {
  const router = useRouter();
  const [warn, setWarn] = useState(false);
  const [secs, setSecs] = useState(120); // warning से logout तक के सेकंड

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown   = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearAll() {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warnTimer.current)   clearTimeout(warnTimer.current);
    if (countdown.current)   clearInterval(countdown.current);
  }

  function reset() {
    clearAll();
    setWarn(false);
    setSecs(120);

    // 28 मिनट बाद warning
    warnTimer.current = setTimeout(() => {
      setWarn(true);
      setSecs(120);
      countdown.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) { clearInterval(countdown.current!); return 0; }
          return s - 1;
        });
      }, 1000);
    }, WARNING_MS);

    // 30 मिनट बाद logout
    logoutTimer.current = setTimeout(() => {
      router.push(logoutUrl);
    }, INACTIVE_MS);
  }

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    const handle = () => reset();
    events.forEach((e) => document.addEventListener(e, handle, { passive: true }));
    reset(); // पहली बार timer शुरू
    return () => {
      events.forEach((e) => document.removeEventListener(e, handle));
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoutUrl]);

  if (!warn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-xs items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-900">निष्क्रियता — लॉगआउट होने वाला है</p>
        <p className="mt-0.5 text-amber-800">
          {secs} सेकंड में अपने आप लॉगआउट होगा।
        </p>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          <LogOut className="h-3 w-3" />
          सक्रिय रहें
        </button>
      </div>
    </div>
  );
}
