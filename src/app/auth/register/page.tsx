"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrasi gagal");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>

          <h1 style={styles.title}>Registrasi Berhasil!</h1>
          <p style={styles.subtitle}>
            Akun Anda telah berhasil dibuat. Silakan login dengan email dan password yang sudah didaftarkan.
          </p>

          <div style={styles.emailBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>{formData.email}</span>
          </div>

          <Link href="/auth/login">
            <button style={styles.primaryButton}>
              Masuk Sekarang
            </button>
          </Link>
        </div>
      </div>
    );
  }

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
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>

        <h1 style={styles.title}>Daftar Akun Baru</h1>
        <p style={styles.subtitle}>
          Lengkapi form di bawah untuk membuat akun baru
        </p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Alamat Email</label>
            <input
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Masukkan ulang password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} style={styles.primaryButton}>
            {isLoading ? (
              <>
                <div style={styles.spinner} />
                Mendaftar...
              </>
            ) : "Daftar Sekarang"}
          </button>
        </form>

        <p style={styles.footerText}>
          Sudah punya akun?{" "}
          <Link href="/auth/login" style={styles.link}>Masuk di sini</Link>
        </p>
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
    boxSizing: "border-box",
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
    marginTop: "8px",
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
    marginBottom: "16px",
  },
  footerText: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666666",
  },
  link: {
    color: "#FF5E00",
    textDecoration: "none",
    fontWeight: 600,
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
  emailBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "16px 20px",
    background: "#f0f4ff",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "15px",
    color: "#00205B",
    fontWeight: 500,
  },
};
