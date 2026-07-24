"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  // Form fields
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [resetToken, setResetToken] = useState("");

  // Timer
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal mengirim kode");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Kode verifikasi sudah dikirim!");
      setStep("verify");
      setTimeLeft(900); // Reset timer
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Kode tidak valid");
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
        setIsLoading(false);
        return;
      }

      setResetToken(data.resetToken);
      setSuccessMessage("Kode terverifikasi!");
      setStep("reset");
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, resetToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal reset password");
        setIsLoading(false);
        return;
      }

      setStep("success");
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setCode("");
    setStep("email");
    setSuccessMessage("");
    setError("");
  };

  // Step 1: Email Input
  if (step === "email") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <Link href="/auth/login" style={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Kembali
          </Link>

          <div style={styles.iconContainer}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h1 style={styles.title}>Lupa Password?</h1>
          <p style={styles.subtitle}>
            Tidak perlu khawatir. Masukkan email Anda dan kami akan mengirimkan kode verifikasi.
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {successMessage && <div style={styles.successBox}>{successMessage}</div>}

          <form onSubmit={handleSendCode} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Alamat Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.primaryButton}>
              {isLoading ? (
                <>
                  <div style={styles.spinner} />
                  Mengirim...
                </>
              ) : "Kirim Kode Verifikasi"}
            </button>
          </form>

          <p style={styles.footerText}>
            Ingat password Anda?{" "}
            <Link href="/auth/login" style={styles.link}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Verify Code
  if (step === "verify") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <button onClick={handleResendCode} style={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Kembali
          </button>

          <div style={styles.iconContainer}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <h1 style={styles.title}>Masukkan Kode</h1>
          <p style={styles.subtitle}>
            Kami telah mengirimkan kode verifikasi ke<br />
            <strong>{email}</strong>
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {successMessage && <div style={styles.successBox}>{successMessage}</div>}

          <div style={styles.timerBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Kode berlaku: {formatTime(timeLeft)}</span>
          </div>

          <form onSubmit={handleVerifyCode} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Kode Verifikasi</label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                style={{...styles.input, ...styles.codeInput}}
              />
              <p style={styles.hint}>Masukkan 6 digit kode dari email Anda</p>
            </div>

            <button type="submit" disabled={isLoading || code.length !== 6} style={styles.primaryButton}>
              {isLoading ? (
                <>
                  <div style={styles.spinner} />
                  Memverifikasi...
                </>
              ) : "Verifikasi Kode"}
            </button>
          </form>

          <div style={styles.resendBox}>
            Tidak menerima kode?{" "}
            <button onClick={handleResendCode} style={styles.linkButton}>
              Kirim Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Reset Password
  if (step === "reset") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <Link href="/auth/login" style={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Batal
          </Link>

          <div style={styles.iconContainer}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>

          <h1 style={styles.title}>Buat Password Baru</h1>
          <p style={styles.subtitle}>
            Buat password baru untuk akun Anda
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password Baru</label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Konfirmasi Password</label>
              <input
                type="password"
                placeholder="Masukkan ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.primaryButton}>
              {isLoading ? (
                <>
                  <div style={styles.spinner} />
                  Menyimpan...
                </>
              ) : "Simpan Password Baru"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>

        <h1 style={styles.title}>Password Berhasil Diubah!</h1>
        <p style={styles.subtitle}>
          Password Anda telah berhasil direset. Sekarang Anda bisa login dengan password baru.
        </p>

        <Link href="/auth/login">
          <button style={styles.primaryButton}>
            Masuk Sekarang
          </button>
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#f8f9fa",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#666666",
    textDecoration: "none",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: 500,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  iconContainer: {
    width: "64px",
    height: "64px",
    background: "#FF5E0015",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#111111",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666666",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#222222",
  },
  input: {
    width: "100%",
    height: "54px",
    padding: "0 18px",
    border: "2px solid #e5e5e5",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  codeInput: {
    textAlign: "center" as const,
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "8px",
    fontFamily: "monospace",
  },
  hint: {
    fontSize: "12px",
    color: "#888888",
    marginTop: "4px",
  },
  primaryButton: {
    width: "100%",
    height: "54px",
    background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 20px rgba(255,94,0,0.35)",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorBox: {
    padding: "14px 16px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    color: "#dc2626",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  successBox: {
    padding: "14px 16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
    color: "#16a34a",
    fontSize: "14px",
    marginBottom: "16px",
  },
  timerBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "#f0f4ff",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#00205B",
    fontWeight: 500,
  },
  resendBox: {
    marginTop: "24px",
    textAlign: "center" as const,
    fontSize: "14px",
    color: "#666666",
  },
  linkButton: {
    color: "#FF5E00",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  link: {
    color: "#FF5E00",
    textDecoration: "none",
    fontWeight: 600,
  },
  footerText: {
    marginTop: "24px",
    textAlign: "center" as const,
    fontSize: "14px",
    color: "#666666",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    background: "#10B98115",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
};
