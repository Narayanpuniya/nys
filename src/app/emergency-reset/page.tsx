"use client";
import { useState } from "react";

type Method = "choose" | "otp" | "secret";
type OtpStep = "request" | "verify";

export default function EmergencyResetPage() {
  const [method, setMethod] = useState<Method>("choose");

  // OTP method state
  const [otpStep, setOtpStep] = useState<OtpStep>("request");
  const [otp, setOtp] = useState("");

  // Secret method state
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Common
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; email: string } | null>(null);

  function resetState() {
    setError(""); setOtp(""); setNewPassword(""); setConfirmPassword("");
    setSecretKey(""); setOtpStep("request");
  }

  // ── OTP: Step 1 — OTP भेजो ───────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOtpStep("verify");
    } catch { setError("❌ Server से connection नहीं हो पाया।"); }
    finally { setLoading(false); }
  }

  // ── OTP: Step 2 — OTP + Password reset ──────────────────────────────────
  async function handleOtpReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-with-otp", otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone({ name: data.name, email: data.email });
    } catch { setError("❌ Server से connection नहीं हो पाया।"); }
    finally { setLoading(false); }
  }

  // ── Secret Key reset ─────────────────────────────────────────────────────
  async function handleSecretReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-with-secret", secretKey, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone({ name: data.name, email: data.email });
    } catch { setError("❌ Server से connection नहीं हो पाया।"); }
    finally { setLoading(false); }
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: "100%", padding: "0.72rem 0.9rem",
    border: "2px solid #e5e7eb", borderRadius: "8px",
    fontSize: "0.95rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.82rem",
    fontWeight: "600", color: "#374151", marginBottom: "5px",
  };
  const btn = (dis: boolean, color = "#1a1a2e"): React.CSSProperties => ({
    width: "100%", padding: "0.85rem",
    background: dis ? "#9ca3af" : color,
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "1rem", fontWeight: "700",
    cursor: dis ? "not-allowed" : "pointer",
  });
  const eye: React.CSSProperties = {
    position: "absolute", right: "0.75rem", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", fontSize: "1.1rem", color: "#6b7280",
  };

  // ── Password fields (shared) ──────────────────────────────────────────────
  const PasswordFields = () => (
    <>
      <div style={{ marginBottom: "1.1rem" }}>
        <label style={lbl}>🔒 नया पासवर्ड</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPass ? "text" : "password"}
            value={newPassword} onChange={e => setNewPassword(e.target.value)}
            placeholder="कम से कम 6 अक्षर" required minLength={6}
            style={{ ...inp, paddingRight: "2.8rem" }}
          />
          <button type="button" style={eye} onClick={() => setShowPass(p => !p)}>
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={lbl}>🔒 पासवर्ड दोबारा</label>
        <input
          type={showPass ? "text" : "password"}
          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          placeholder="ऊपर वाला पासवर्ड दोबारा" required
          style={{ ...inp, borderColor: confirmPassword && confirmPassword !== newPassword ? "#f87171" : "#e5e7eb" }}
        />
        {confirmPassword && confirmPassword !== newPassword && (
          <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "3px 0 0" }}>दोनों पासवर्ड एक जैसे नहीं हैं</p>
        )}
      </div>
    </>
  );

  const BackLink = ({ onClick }: { onClick: () => void }) => (
    <p
      onClick={onClick}
      style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.82rem", color: "#6b7280", cursor: "pointer" }}
    >
      ← वापस जाएं
    </p>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1a1a2e", margin: "4px 0 0" }}>Emergency Reset</h1>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "4px 0 0" }}>Super Admin पासवर्ड बदलें</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #f87171", borderRadius: "8px",
            padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.88rem", color: "#991b1b",
          }}>
            {error}
          </div>
        )}

        {/* ── DONE ── */}
        {done && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>✅</div>
            <h2 style={{ color: "#065f46", fontSize: "1.3rem", margin: "0 0 8px" }}>पासवर्ड Reset हो गया!</h2>
            <p style={{ color: "#374151", fontSize: "0.9rem", margin: "0 0 20px" }}>
              Admin: <strong>{done.name}</strong><br />Email: <strong>{done.email}</strong>
            </p>
            <a href="/login" style={{
              display: "inline-block", background: "#1a1a2e", color: "white",
              padding: "0.8rem 2rem", borderRadius: "8px",
              textDecoration: "none", fontWeight: "700", fontSize: "0.95rem",
            }}>
              🔑 Login करें
            </a>
          </div>
        )}

        {/* ── CHOOSE METHOD ── */}
        {!done && method === "choose" && (
          <>
            <p style={{ textAlign: "center", color: "#374151", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              कोई भी एक तरीका चुनें:
            </p>

            {/* Option A — Email OTP */}
            <button
              onClick={() => { setMethod("otp"); resetState(); }}
              style={{
                width: "100%", padding: "1.1rem 1rem",
                background: "#f0fdf4", border: "2px solid #86efac",
                borderRadius: "10px", cursor: "pointer",
                textAlign: "left", marginBottom: "1rem",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "1rem", color: "#166534" }}>📧 Email OTP से</div>
              <div style={{ fontSize: "0.8rem", color: "#4b7c5e", marginTop: "3px" }}>
                Gmail पर 6-digit code आएगा — Gmail access चाहिए
              </div>
            </button>

            {/* Option B — Secret Key */}
            <button
              onClick={() => { setMethod("secret"); resetState(); }}
              style={{
                width: "100%", padding: "1.1rem 1rem",
                background: "#eff6ff", border: "2px solid #bfdbfe",
                borderRadius: "10px", cursor: "pointer",
                textAlign: "left", marginBottom: "0.5rem",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "1rem", color: "#1e40af" }}>🗝️ Secret Key से</div>
              <div style={{ fontSize: "0.8rem", color: "#4b6cb7", marginTop: "3px" }}>
                Hostinger में set Secret Key डालें — Email की ज़रूरत नहीं
              </div>
            </button>
          </>
        )}

        {/* ── METHOD A: EMAIL OTP ── */}
        {!done && method === "otp" && (
          <>
            {/* Step 1: OTP माँगो */}
            {otpStep === "request" && (
              <form onSubmit={handleSendOtp}>
                <div style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.5rem",
                  fontSize: "0.82rem", color: "#166534",
                }}>
                  📧 आपकी Gmail पर 6-digit OTP भेजा जाएगा।<br />
                  Gmail open रखें।
                </div>
                <button type="submit" disabled={loading} style={btn(loading, "#166534")}>
                  {loading ? "⏳ भेज रहे हैं..." : "📧 Gmail पर OTP भेजें"}
                </button>
                <BackLink onClick={() => { setMethod("choose"); setError(""); }} />
              </form>
            )}

            {/* Step 2: OTP + Password */}
            {otpStep === "verify" && (
              <form onSubmit={handleOtpReset}>
                <div style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
                  fontSize: "0.8rem", color: "#166534",
                }}>
                  ✅ OTP भेज दिया गया। Gmail खोलें और 6-digit code enter करें।
                  <span
                    onClick={() => { setOtpStep("request"); setError(""); setOtp(""); }}
                    style={{ marginLeft: "8px", textDecoration: "underline", cursor: "pointer" }}
                  >
                    दोबारा भेजें
                  </span>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={lbl}>🔢 6-digit OTP</label>
                  <input
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="_ _ _ _ _ _"
                    required maxLength={6} autoFocus
                    style={{ ...inp, textAlign: "center", fontSize: "1.8rem", letterSpacing: "12px", fontWeight: "700", fontFamily: "monospace" }}
                  />
                </div>

                <PasswordFields />

                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword}
                  style={btn(loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword, "#166534")}
                >
                  {loading ? "⏳ Reset हो रहा है..." : "🔄 पासवर्ड Reset करें"}
                </button>
                <BackLink onClick={() => { setMethod("choose"); resetState(); }} />
              </form>
            )}
          </>
        )}

        {/* ── METHOD B: SECRET KEY ── */}
        {!done && method === "secret" && (
          <form onSubmit={handleSecretReset}>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.5rem",
              fontSize: "0.82rem", color: "#1e40af",
            }}>
              🗝️ Hostinger → Node.js → Environment Variables → <strong>RESET_SECRET</strong>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>🗝️ Secret Key</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showSecret ? "text" : "password"}
                  value={secretKey} onChange={e => setSecretKey(e.target.value)}
                  placeholder="Hostinger से Secret Key डालें"
                  required autoFocus
                  style={{ ...inp, paddingRight: "2.8rem" }}
                />
                <button type="button" style={eye} onClick={() => setShowSecret(p => !p)}>
                  {showSecret ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <PasswordFields />

            <button
              type="submit"
              disabled={loading || !secretKey || !newPassword || newPassword !== confirmPassword}
              style={btn(loading || !secretKey || !newPassword || newPassword !== confirmPassword, "#1e40af")}
            >
              {loading ? "⏳ Reset हो रहा है..." : "🔄 पासवर्ड Reset करें"}
            </button>
            <BackLink onClick={() => { setMethod("choose"); resetState(); }} />
          </form>
        )}

        {!done && (
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.72rem", color: "#9ca3af" }}>
            यह page सिर्फ emergency में use करें
          </p>
        )}
      </div>
    </div>
  );
}
