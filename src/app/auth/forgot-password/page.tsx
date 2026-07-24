"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate sending reset email (demo only)
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "#f8f9fa" }}>
        <div style={{ width: "100%", maxWidth: "480px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", textAlign: "center" }}>
          {/* Success Icon */}
          <div style={{ width: "80px", height: "80px", background: "#10B98115", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>
            Email Terkirim!
          </h1>
          <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.7, marginBottom: "32px" }}>
            Kami telah mengirim tautan reset password ke email <strong>{email}</strong>. Silakan cek inbox Anda dan klik tautan tersebut untuk mereset password.
          </p>

          {/* Info Box */}
          <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "16px", marginBottom: "32px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#666666", lineHeight: 1.8 }}>
              <strong>Tips:</strong>
              <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                <li>Cek folder Spam jika tidak menemukan email</li>
                <li>Tautan berlaku selama 24 jam</li>
                <li>Password default: <code style={{ background: "#e5e5e5", padding: "2px 6px", borderRadius: "4px" }}>demo123</code></li>
              </ul>
            </div>
          </div>

          <Link href="/auth/login">
            <button style={{
              width: "100%",
              height: "54px",
              background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,94,0,0.35)"
            }}>
              Kembali ke Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "#f8f9fa" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>

        {/* Back Button */}
        <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#666666", textDecoration: "none", marginBottom: "32px", fontSize: "14px", fontWeight: 500 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Kembali
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", background: "#FF5E0015", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "8px", letterSpacing: "-0.02em" }}>
            Lupa Password?
          </h1>
          <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.6 }}>
            Tidak perlu khawatir. Masukkan email Anda dan kami akan membantu mereset password Anda.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "14px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            marginBottom: "24px",
            color: "#dc2626",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                height: "54px",
                padding: "0 18px",
                border: "2px solid #e5e5e5",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                transition: "border-color 0.2s",
                background: "#ffffff"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "54px",
              background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 20px rgba(255,94,0,0.35)"
            }}
          >
            {isLoading ? (
              <>
                <div style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Mengirim...
              </>
            ) : "Kirim Tautan Reset"}
          </button>
        </form>

        {/* Info */}
        <div style={{ marginTop: "32px", padding: "16px", background: "#f0f4ff", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div style={{ fontSize: "13px", color: "#666666", lineHeight: 1.6 }}>
              <strong style={{ color: "#00205B" }}>Demo Mode:</strong> Password default untuk semua akun adalah <code style={{ background: "#e5e5e5", padding: "2px 6px", borderRadius: "4px" }}>demo123</code>. Hubungi admin jika tidak bisa login.
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#666666" }}>
          Ingat password Anda?{" "}
          <Link href="/auth/login" style={{ color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>
            Masuk di sini
          </Link>
        </p>
      </div>

      <style>{`
        input:focus {
          border-color: #FF5E00 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
