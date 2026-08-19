"use client";
import { useState } from "react";

export default function EmergencyResetPage() {
  const [secretKey, setSecretKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; email?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/emergency-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, newPassword, confirmPassword }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || data.error, email: data.email });
    } catch {
      setResult({ ok: false, message: "❌ Server से connection नहीं हो पाया।" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>
            Emergency Reset
          </h1>
          <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Super Admin पासवर्ड बदलें
          </p>
        </div>

        {/* Warning */}
        <div style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.8rem",
          color: "#856404",
        }}>
          ⚠️ Secret Key Hostinger → Environment Variables → <strong>RESET_SECRET</strong> में मिलेगी
        </div>

        {result && (
          <div style={{
            background: result.ok ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${result.ok ? "#34d399" : "#f87171"}`,
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            color: result.ok ? "#065f46" : "#991b1b",
          }}>
            {result.message}
            {result.ok && result.email && (
              <div style={{ marginTop: "0.5rem", fontWeight: "600" }}>
                अब <a href="/login" style={{ color: "#065f46", textDecoration: "underline" }}>nys.org.in/login</a> पर login करें
                <br />Email: {result.email}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Secret Key */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "0.4rem" }}>
              🗝️ Secret Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Hostinger से Secret Key डालें"
              required
              style={{
                width: "100%",
                padding: "0.7rem 0.9rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* New Password */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "0.4rem" }}>
              🔒 नया पासवर्ड
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="कम से कम 6 अक्षर"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.7rem 2.8rem 0.7rem 0.9rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: "0.75rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "1.1rem", color: "#6b7280",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "0.4rem" }}>
              🔒 पासवर्ड दोबारा डालें
            </label>
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="ऊपर वाला पासवर्ड दोबारा"
              required
              style={{
                width: "100%",
                padding: "0.7rem 0.9rem",
                border: `2px solid ${confirmPassword && confirmPassword !== newPassword ? "#f87171" : "#e5e7eb"}`,
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                दोनों पासवर्ड एक जैसे नहीं हैं
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: loading ? "#9ca3af" : "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "⏳ Reset हो रहा है..." : "🔄 पासवर्ड Reset करें"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
          यह page सिर्फ emergency में use करें
        </p>
      </div>
    </div>
  );
}
