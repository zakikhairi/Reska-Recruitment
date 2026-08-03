"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { setUser, setHasHydrated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Minimum loading display time for better UX
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));

    // Always use API authentication
    try {
      const result = await login(email, password);

      // Wait for minimum time
      await minLoadingTime;

      if (!result.success) {
        setError(result.error || "Login gagal");
        setIsLoading(false);
        return;
      }

      // Get current user from store
      const currentUser = useAuthStore.getState().user;

      await minLoadingTime;

      if (currentUser?.role === "APPLICANT") {
        router.push("/applicant/dashboard");
      } else if (currentUser?.role === "HR_ADMIN" || currentUser?.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      setIsLoading(false);
    } catch (err) {
      await minLoadingTime;
      setError("Terjadi kesalahan koneksi");
      setIsLoading(false);
    }
  };

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
          <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
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
              Temukan Karir<br />
              <span style={{ color: "#FF5E00" }}>Impian</span> Anda
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "380px" }}>
              Bergabung dengan keluarga besar PT Kereta Api Indonesia dan mulai perjalanan karier Anda bersama kami.
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

      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Mobile Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }} className="mobile-logo">
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "52px", height: "52px", objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
              <div style={{ fontSize: "13px", color: "#888888" }}>Smart Recruitment</div>
            </div>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#111111", marginBottom: "8px", letterSpacing: "-0.02em" }}>Masuk</h2>
            <p style={{ fontSize: "15px", color: "#666666" }}>Gunakan akun Anda untuk melanjutkan</p>
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
                Email
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

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/auth/forgot-password" style={{ fontSize: "14px", color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>
                Lupa password?
              </Link>
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
                  Memuat...
                </>
              ) : "Masuk"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ marginTop: "32px", padding: "20px", background: "#f8f9fa", borderRadius: "14px", border: "1px solid #eeeeee" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: "12px", color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Akun Demo (Database)</span>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={() => { setEmail("admin@kai.co.id"); setPassword("demo123"); }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#00205B",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👤 Login Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail("pelamar@kai.co.id"); setPassword("demo123"); }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#FF5E00",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👤 Login Pelamar
              </button>
            </div>
            <div style={{ fontSize: "14px", color: "#555555", lineHeight: 2 }}>
              <div><span style={{ fontWeight: 600, color: "#333333", display: "inline-block", width: "70px" }}>Admin HR</span> admin@kai.co.id / demo123</div>
              <div><span style={{ fontWeight: 600, color: "#333333", display: "inline-block", width: "70px" }}>Pelamar</span> (Daftar baru)</div>
            </div>
          </div>

          {/* Register Link */}
          <p style={{ marginTop: "28px", textAlign: "center", fontSize: "15px", color: "#666666" }}>
            Belum punya akun?{" "}
            <Link href="/auth/register" style={{ color: "#FF5E00", textDecoration: "none", fontWeight: 700 }}>
              Daftar sekarang
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
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}>
            <div style={styles.outerSpinner} />
            <div style={styles.innerSpinner} />
          </div>
          <p style={styles.loadingText}>Memuat...</p>
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

const styles: Record<string, React.CSSProperties> = {
  loadingOverlay: {
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
  loadingSpinner: {
    position: "relative",
    width: "60px",
    height: "60px",
    marginBottom: "20px",
  },
  outerSpinner: {
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
  innerSpinner: {
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
  loadingText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#666666",
  },
};
