"use client";
import { useState } from "react";

type Step = "secret" | "otp" | "done";

export default function EmergencyResetPage() {
  const [step, setStep] = useState<Step>("secret");

  // Step 1
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Step 2
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ name: string; email: string } | null>(null);

  // ── Step 1: Secret Key → OTP भेजो ───────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", secretKey }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("otp");
    } catch {
      setError("❌ Server से connection नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: OTP + नया Password → Reset ───────────────────────────────────
  async function handleVerifyReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-reset",
          secretKey,
          otp,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccessInfo({ name: data.name, email: data.email });
      setStep("done");
    } catch {
      setError("❌ Server से connection नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.72rem 0.9rem",
    border: "2px solid #e5e7eb", borderRadius: "8px",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: "100%", padding: "0.85rem",
    background: disabled ? "#9ca3af" : "#1a1a2e",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "1rem", fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
  });
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.82rem",
    fontWeight: "600", color: "#374151", marginBottom: "0.4rem",
  };
  const fieldBox: React.CSSProperties = { marginBottom: "1.2rem" };
  const eyeBtn: React.CSSProperties = {
    position: "absolute", right: "0.75rem", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    fontSize: "1.1rem", color: "#6b7280",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
      fontFamily: "'Segoe UI',Arial,sans-serif", padding: "1rem",
    }}>
      <div style={{
        background: "white", borderRadius: "16px",
        padding: "2.5rem 2rem", width: "100%", maxWidth: "420px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2.5rem" }}>🔐</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1a1a2e", margin: "4px 0 0" }}>
            Emergency Reset
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "4px 0 0" }}>
            Super Admin पासवर्ड बदलें
          </p>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
            {[
              { n: 1, label: "Secret Key" },
              { n: 2, label: "OTP + नया Password" },
            ].map(({ n, label }) => {
              const active = (step === "secret" && n === 1) || (step === "otp" && n === 2);
              const done = (step === "otp" && n === 1);
              return (
                <div key={n} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    height: "4px", borderRadius: "2px", marginBottom: "6px",
                    background: done ? "#22c55e" : active ? "#1a1a2e" : "#e5e7eb",
                  }} />
                  <span style={{
                    fontSize: "0.72rem", fontWeight: "600",
                    color: done ? "#22c55e" : active ? "#1a1a2e" : "#9ca3af",
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
            background: "#fee2e2", border: "1px solid #f87171",
            borderRadius: "8px", padding: "0.75rem 1rem",
            marginBottom: "1.25rem", fontSize: "0.88rem", color: "#991b1b",
          }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: Secret Key ── */}
        {step === "secret" && (
          <form onSubmit={handleSendOtp}>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: "8px", padding: "0.75rem 1rem",
              marginBottom: "1.5rem", fontSize: "0.8rem", color: "#1e40af",
            }}>
              📌 Secret Key: Hostinger → Node.js → Environment Variables → <strong>RESET_SECRET</strong>
            </div>

            <div style={fieldBox}>
              <label style={labelStyle}>🗝️ Secret Key</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showSecret ? "text" : "password"}
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder="Hostinger से Secret Key डालें"
                  required autoFocus
                  style={inputStyle}
                />
                <button type="button" style={eyeBtn} onClick={() => setShowSecret(p => !p)}>
                  {showSecret ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !secretKey} style={btnStyle(loading || !secretKey)}>
              {loading ? "⏳ भेज रहे हैं..." : "📧 OTP Email पर भेजें"}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP + New Password ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyReset}>
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: "8px", padding: "0.75rem 1rem",
              marginBottom: "1.5rem", fontSize: "0.8rem", color: "#166534",
            }}>
              ✅ OTP आपकी email पर भेज दिया गया। <strong>10 मिनट</strong> में enter करें।
              <br />
              <span
                style={{ textDecoration: "underline", cursor: "pointer", marginTop: "4px", display: "inline-block" }}
                onClick={() => { setStep("secret"); setError(""); setOtp(""); }}
              >
                ← वापस जाएं
              </span>
            </div>

            {/* OTP input */}
            <div style={fieldBox}>
              <label style={labelStyle}>🔢 6-digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="______"
                required maxLength={6} autoFocus
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  fontSize: "1.6rem",
                  letterSpacing: "10px",
                  fontWeight: "700",
                  fontFamily: "monospace",
                }}
              />
            </div>

            {/* New Password */}
            <div style={fieldBox}>
              <label style={labelStyle}>🔒 नया पासवर्ड</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  required minLength={6}
                  style={{ ...inputStyle, paddingRight: "2.8rem" }}
                />
                <button type="button" style={eyeBtn} onClick={() => setShowPass(p => !p)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={labelStyle}>🔒 पासवर्ड दोबारा डालें</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="ऊपर वाला पासवर्ड दोबारा"
                required
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== newPassword ? "#f87171" : "#e5e7eb",
                }}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>
                  दोनों पासवर्ड एक जैसे नहीं हैं
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword}
              style={btnStyle(loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword)}
            >
              {loading ? "⏳ Reset हो रहा है..." : "🔄 पासवर्ड Reset करें"}
            </button>
          </form>
        )}

        {/* ── DONE ── */}
        {step === "done" && successInfo && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>✅</div>
            <h2 style={{ color: "#065f46", fontSize: "1.3rem", margin: "0 0 8px" }}>
              पासवर्ड Reset हो गया!
            </h2>
            <p style={{ color: "#374151", fontSize: "0.9rem", margin: "0 0 20px" }}>
              Admin: <strong>{successInfo.name}</strong><br />
              Email: <strong>{successInfo.email}</strong>
            </p>
            <a
              href="/login"
              style={{
                display: "inline-block",
                background: "#1a1a2e", color: "white",
                padding: "0.8rem 2rem", borderRadius: "8px",
                textDecoration: "none", fontWeight: "700",
                fontSize: "0.95rem",
              }}
            >
              🔑 Login करें
            </a>
          </div>
        )}

        {step !== "done" && (
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.72rem", color: "#9ca3af" }}>
            यह page सिर्फ emergency में use करें
          </p>
        )}
      </div>
    </div>
  );
}
