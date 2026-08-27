"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

function RegisterForm({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "",
    nik: "",
    phone: ""
  });

  // Update parent when loading changes
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!form.email || !form.password || form.password !== form.confirm) {
        setError(form.password !== form.confirm ? "Password tidak cocok" : "Lengkapi semua field");
        return;
      }
      if (form.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
    }
    if (step === 2) {
      if (!form.name || !form.nik || !form.phone) {
        setError("Lengkapi semua field");
        return;
      }
      if (form.nik.length !== 16) {
        setError("NIK harus 16 digit");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmitRegistration = async () => {
    setIsLoading(true);
    setError("");

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirmPassword: form.password,
          fullName: form.name,
          nik: form.nik,
          phone: form.phone,
        }),
      });

      const result = await response.json();

      await minLoadingTime;

      if (!result.success) {
        setError(result.error || "Registrasi gagal");
        setIsLoading(false);
        return;
      }

      // Move to verification step
      setVerificationEmail(form.email);
      setDevCode(result.devCode || null);
      setCountdown(15 * 60);
      setStep(3);
      setSuccessMessage(result.message);
      setIsLoading(false);

    } catch (err) {
      await minLoadingTime;
      setError("Terjadi kesalahan koneksi");
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Masukkan kode 6 digit");
      return;
    }

    setIsLoading(true);
    setError("");

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      await minLoadingTime;

      if (!result.success) {
        setError(result.error || "Verifikasi gagal");
        if (result.attemptsLeft !== undefined) {
          setError(`${result.error} (Sisa percobaan: ${result.attemptsLeft})`);
        }
        setIsLoading(false);
        return;
      }

      // Verification success - auto login
      const loginResult = await login(form.email, form.password);

      if (loginResult.success) {
        router.push("/applicant/dashboard");
      } else {
        router.push("/auth/login?registered=1");
      }

    } catch (err) {
      await minLoadingTime;
      setError("Terjadi kesalahan koneksi");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setDevCode(result.devCode || null);
        setCountdown(15 * 60);
        setSuccessMessage("Kode baru sudah dikirim!");
        setVerificationCode("");
      } else {
        setError(result.error || "Gagal mengirim kode");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }

    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div style={{ width: "100%", maxWidth: "440px" }}>
      {/* Progress */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#222222" }}>Langkah {step} dari 3</span>
          <span style={{ fontSize: "14px", color: "#888888" }}>{progress}%</span>
        </div>
        <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", borderRadius: "4px", transition: "width 0.5s", width: `${progress}%` }} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: "14px 16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          marginBottom: "20px",
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

      {/* Step 1 - Account */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "6px", letterSpacing: "-0.02em" }}>Buat Akun</h2>
            <p style={{ fontSize: "15px", color: "#666666" }}>Informasi akun Anda</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Email</label>
            <input type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Password</label>
            <input type="password" placeholder="Min. 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Konfirmasi Password</label>
            <input type="password" placeholder="Ulangi password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <button onClick={handleNext} style={{ width: "100%", height: "54px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,94,0,0.35)" }}>
            Lanjut
          </button>
        </div>
      )}

      {/* Step 2 - Personal Info */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "6px", letterSpacing: "-0.02em" }}>Data Diri</h2>
            <p style={{ fontSize: "15px", color: "#666666" }}>Informasi pribadi Anda</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Nama Lengkap</label>
            <input type="text" placeholder="Sesuai KTP" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>NIK</label>
            <input type="text" placeholder="16 digit nomor KTP" value={form.nik} onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                setForm({ ...form, nik: value });
              }}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Nomor HP</label>
            <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                setForm({ ...form, phone: value });
              }}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, height: "54px", border: "2px solid #e5e5e5", color: "#444444", background: "#ffffff", fontSize: "15px", fontWeight: 600, borderRadius: "12px", cursor: "pointer" }}>
              Kembali
            </button>
            <button onClick={handleSubmitRegistration} disabled={isLoading} style={{ flex: 1, height: "54px", background: isLoading ? "#ccc" : "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, boxShadow: isLoading ? "none" : "0 4px 20px rgba(255,94,0,0.35)" }}>
              {isLoading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Email Verification */}
      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>Verifikasi Email</h2>
          <p style={{ fontSize: "15px", color: "#666666", marginBottom: "24px" }}>
            Kode verifikasi dikirim ke:<br />
            <strong style={{ color: "#00205B" }}>{verificationEmail}</strong>
          </p>

          {successMessage && (
            <div style={{ padding: "12px 16px", background: "#dcfce7", border: "1px solid #86efac", borderRadius: "10px", marginBottom: "20px", color: "#16a34a", fontSize: "14px" }}>
              ✓ {successMessage}
            </div>
          )}

          {/* Dev Mode Code Display */}
          {devCode && (
            <div style={{ padding: "16px", background: "#fef9c3", border: "2px dashed #ca8a04", borderRadius: "12px", marginBottom: "24px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#854d0e", fontWeight: 600 }}>🔧 MODE PENGEMBANGAN</p>
              <p style={{ margin: "0", fontSize: "32px", fontWeight: 800, color: "#FF5E00", fontFamily: "monospace", letterSpacing: "8px" }}>{devCode}</p>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px", textAlign: "left" }}>Kode Verifikasi</label>
            <input
              type="text"
              placeholder="Masukkan 6 digit kode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              style={{
                width: "100%",
                height: "60px",
                padding: "0 18px",
                border: "2px solid #e5e5e5",
                borderRadius: "12px",
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "8px",
                fontFamily: "monospace",
                outline: "none",
                transition: "border-color 0.2s",
                background: "#ffffff"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: "14px", color: "#888888" }}>
              Kode berlaku: <strong style={{ color: countdown < 60 ? "#dc2626" : "#333" }}>{formatTime(countdown)}</strong>
            </span>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", marginBottom: "20px", color: "#dc2626", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            style={{
              width: "100%",
              height: "54px",
              background: verificationCode.length === 6 ? "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)" : "#ccc",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: verificationCode.length === 6 ? "pointer" : "not-allowed",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: verificationCode.length === 6 ? "0 4px 20px rgba(255,94,0,0.35)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "16px"
            }}
          >
            {isLoading ? "Memverifikasi..." : "Verifikasi"}
          </button>

          <button
            onClick={handleResendCode}
            disabled={isLoading || countdown > 0}
            style={{
              width: "100%",
              height: "48px",
              background: "transparent",
              color: countdown > 0 ? "#888" : "#FF5E00",
              border: "2px solid",
              borderColor: countdown > 0 ? "#e5e5e5" : "#FF5E00",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: countdown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {countdown > 0 ? `Kirim ulang (${formatTime(countdown)})` : "Kirim Ulang Kode"}
          </button>

          <p style={{ marginTop: "24px", fontSize: "13px", color: "#888888" }}>
            <Link href="/auth/register" style={{ color: "#666", textDecoration: "none" }}>
              ← Daftar dengan email lain
            </Link>
          </p>
        </div>
      )}

      <p style={{ marginTop: "28px", textAlign: "center", fontSize: "15px", color: "#666666" }}>
        Sudah punya akun?{" "}
        <Link href="/auth/login" style={{ color: "#FF5E00", textDecoration: "none", fontWeight: 700 }}>
          Masuk
        </Link>
      </p>

      {/* Back to Home */}
      <p style={{ marginTop: "16px", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: "14px", color: "#888888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Kembali ke Beranda
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [isFormLoading, setIsFormLoading] = useState(false);

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel - Branding */}
      <div style={{ display: "none", flex: "1", background: "linear-gradient(160deg, #00205B 0%, #001a3d 50%, #0C2340 100%)", padding: "60px", flexDirection: "column", position: "relative", overflow: "hidden" }} className="left-panel">

        {/* Decorative Elements */}
        <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,94,0,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(255,94,0,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "50%" }} />

        {/* Logo & Brand */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(255,94,0,0.4)" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em" }}>KAI Services</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.2, marginTop: "2px" }}>Smart Recruitment System</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>

          {/* Headline */}
          <div style={{ textAlign: "left", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "16px", letterSpacing: "-0.03em" }}>
              Mulai<br />
              <span style={{ color: "#FF5E00" }}>Perjalanan</span><br />
              Karier Anda
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "380px" }}>
              Daftar sekarang dan temukan peluang karier terbaik di transportasi kereta api Indonesia.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.08)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Registrasi Gratis</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Tidak ada biaya pendaftaran</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.08)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Tes Kompetensi</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Sesuai bidang pekerjaan</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.08)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Proses Transparan</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Seleksi jelas dan terbuka</div>
              </div>
            </div>

          </div>

          {/* Stats */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FF5E00", marginBottom: "4px" }}>12K+</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FF5E00", marginBottom: "4px" }}>24</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Posisi</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FF5E00", marginBottom: "4px" }}>72%</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lulus</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            2026 PT Reska Multi Usaha. Bagian dari PT Kereta Api Indonesia.
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Mobile Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }} className="mobile-logo">
            <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
              <div style={{ fontSize: "13px", color: "#888888" }}>Registrasi</div>
            </div>
          </div>

          <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#888888" }}>
              <div style={{ width: "24px", height: "24px", border: "3px solid #e5e5e5", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Memuat...
            </div>
          }>
            <RegisterForm onLoadingChange={setIsFormLoading} />
          </Suspense>

        </div>
      </div>

      {/* Loading Overlay */}
      {isFormLoading && (
        <div style={loadingStyles.overlay}>
          <div style={loadingStyles.spinner}>
            <div style={loadingStyles.outer} />
            <div style={loadingStyles.inner} />
          </div>
          <p style={loadingStyles.text}>Memuat...</p>
        </div>
      )}

      <style>{`
        @keyframes spinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinCounterClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @media (min-width: 1024px) {
          .left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #FF5E00 !important;
        }
      `}</style>
    </div>
  );
}

const loadingStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.95)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  spinner: {
    position: "relative",
    width: "60px",
    height: "60px",
    marginBottom: "20px",
  },
  outer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "4px solid transparent",
    borderTopColor: "#FF5E00",
    borderRadius: "50%",
    animation: "spinClockwise 1s linear infinite",
  },
  inner: {
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "calc(100% - 20px)",
    height: "calc(100% - 20px)",
    border: "4px solid transparent",
    borderTopColor: "#00205B",
    borderRadius: "50%",
    animation: "spinCounterClockwise 1.2s linear infinite",
  },
  text: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#666666",
  },
};
