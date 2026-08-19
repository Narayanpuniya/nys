"use client";
import { useState } from "react";
import Link from "next/link";

type Step = "identify" | "otp" | "done";

export default function MemberResetPage() {
  const [step, setStep]           = useState<Step>("identify");
  const [identifier, setIdentifier] = useState("");
  const [memberId, setMemberId]   = useState("");
  const [otpMsg, setOtpMsg]       = useState("");
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [doneName, setDoneName]   = useState("");

  // ── Step 1: mobile/email → OTP ─────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/member-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", identifier }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setMemberId(data.memberId);
      setOtpMsg(data.message);
      setStep("otp");
    } catch { setError("❌ Server से connection नहीं हो पाया।"); }
    finally { setLoading(false); }
  }

  // ── Step 2: OTP + new password ─────────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/member-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", memberId, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDoneName(data.name);
      setStep("done");
    } catch { setError("❌ Server से connection नहीं हो पाया।"); }
    finally { setLoading(false); }
  }

  // ── Shared styles ─────────────────────────────────────────────────────
  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", padding: "0.72rem 0.9rem",
    border: "2px solid #e5e7eb", borderRadius: "10px",
    fontSize: "0.95rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    ...extra,
  });
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.82rem",
    fontWeight: "600", color: "#374151", marginBottom: "5px",
  };
  const submitBtn = (dis: boolean): React.CSSProperties => ({
    width: "100%", padding: "0.85rem",
    background: dis ? "#9ca3af" : "#c2410c",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "1rem", fontWeight: "700",
    cursor: dis ? "not-allowed" : "pointer",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fff7ed 0%,#fef3c7 100%)",
      fontFamily: "'Segoe UI',Arial,sans-serif", padding: "1rem",
    }}>
      <div style={{
        background: "white", borderRadius: "20px",
        padding: "2.5rem 2rem", width: "100%", maxWidth: "420px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2.5rem" }}>🔑</div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#1c1917", margin: "6px 0 0" }}>
            पासवर्ड Reset करें
          </h1>
          <p style={{ color: "#78716c", fontSize: "0.82rem", margin: "4px 0 0" }}>
            NYS सदस्य पोर्टल
          </p>
        </div>

        {/* Step bar */}
        {step !== "done" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem" }}>
            {["मोबाइल / ईमेल", "OTP + नया Password"].map((label, i) => {
              const n = i + 1;
              const active = (step === "identify" && n === 1) || (step === "otp" && n === 2);
              const done   = step === "otp" && n === 1;
              return (
                <div key={n} style={{ flex: 1 }}>
                  <div style={{
                    height: "4px", borderRadius: "2px", marginBottom: "5px",
                    background: done ? "#22c55e" : active ? "#c2410c" : "#e7e5e4",
                  }} />
                  <span style={{
                    fontSize: "0.7rem", fontWeight: "600",
                    color: done ? "#22c55e" : active ? "#c2410c" : "#a8a29e",
                  }}>
                    {done ? "✓ " : `${n}. `}{label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "0.75rem 1rem",
            marginBottom: "1.25rem", fontSize: "0.88rem", color: "#991b1b",
          }}>
            {error}
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>✅</div>
            <h2 style={{ color: "#166534", fontSize: "1.2rem", margin: "0 0 8px" }}>
              पासवर्ड बदल गया!
            </h2>
            <p style={{ color: "#374151", fontSize: "0.9rem", margin: "0 0 20px" }}>
              नमस्ते <strong>{doneName}</strong>, अब नए पासवर्ड से login करें।
            </p>
            <Link href="/login" style={{
              display: "inline-block", background: "#c2410c", color: "white",
              padding: "0.8rem 2rem", borderRadius: "10px",
              textDecoration: "none", fontWeight: "700", fontSize: "0.95rem",
            }}>
              🔑 Login करें
            </Link>
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === "identify" && (
          <form onSubmit={handleSendOtp}>
            <div style={{
              background: "#fff7ed", border: "1px solid #fed7aa",
              borderRadius: "10px", padding: "0.85rem 1rem", marginBottom: "1.5rem",
              fontSize: "0.82rem", color: "#92400e",
            }}>
              📧 OTP आपकी registered email पर आएगा।
              <br />अगर email नहीं है तो Admin से संपर्क करें।
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={lbl}>📱 मोबाइल नंबर या ईमेल</label>
              <input
                type="text" value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="9876543210 या name@email.com"
                required autoFocus
                style={inp()}
              />
              <p style={{ color: "#a8a29e", fontSize: "0.75rem", margin: "4px 0 0" }}>
                सदस्यता के समय दिया गया मोबाइल या ईमेल
              </p>
            </div>

            <button type="submit" disabled={loading || !identifier.trim()} style={submitBtn(loading || !identifier.trim())}>
              {loading ? "⏳ ढूँढ रहे हैं..." : "📧 OTP Email पर भेजें"}
            </button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === "otp" && (
          <form onSubmit={handleReset}>
            {/* OTP info */}
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: "10px", padding: "0.85rem 1rem", marginBottom: "1.25rem",
              fontSize: "0.82rem", color: "#166534",
            }}>
              ✅ {otpMsg}
              <br />
              <span
                onClick={() => { setStep("identify"); setError(""); setOtp(""); }}
                style={{ textDecoration: "underline", cursor: "pointer", marginTop: "4px", display: "inline-block" }}
              >
                ← वापस जाएं
              </span>
            </div>

            {/* OTP */}
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={lbl}>🔢 6-digit OTP</label>
              <input
                type="text" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                required maxLength={6} autoFocus
                style={inp({ textAlign: "center", fontSize: "1.8rem", letterSpacing: "12px", fontWeight: "700", fontFamily: "monospace" })}
              />
            </div>

            {/* New password */}
            <div style={{ marginBottom: "1.1rem" }}>
              <label style={lbl}>🔒 नया पासवर्ड</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर" required minLength={6}
                  style={inp({ paddingRight: "2.8rem" })}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: "0.75rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "1.1rem", color: "#6b7280",
                }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={lbl}>🔒 पासवर्ड दोबारा</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="ऊपर वाला पासवर्ड दोबारा" required
                style={inp({ borderColor: confirmPassword && confirmPassword !== newPassword ? "#f87171" : "#e5e7eb" })}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "3px 0 0" }}>
                  दोनों पासवर्ड एक जैसे नहीं हैं
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword}
              style={submitBtn(loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword)}
            >
              {loading ? "⏳ Reset हो रहा है..." : "🔄 पासवर्ड Reset करें"}
            </button>
          </form>
        )}

        {step !== "done" && (
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.78rem", color: "#a8a29e" }}>
            <Link href="/login" style={{ color: "#c2410c", textDecoration: "none" }}>← Login पर वापस जाएं</Link>
          </p>
        )}
      </div>
    </div>
  );
}
