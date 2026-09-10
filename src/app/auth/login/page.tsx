"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [activeDemo, setActiveDemo] = useState<"ADMIN" | "APPLICANT" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const result = await login(email, password);
      await minLoadingTime;

      if (!result.success) {
        setError(result.error || "Email atau kata sandi yang Anda masukkan salah.");
        setIsLoading(false);
        return;
      }

      const currentUser = useAuthStore.getState().user;
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
      setError("Terjadi kesalahan koneksi. Silakan periksa jaringan Anda.");
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (role: "ADMIN" | "APPLICANT") => {
    setError("");
    setActiveDemo(role);
    if (role === "ADMIN") {
      setEmail("admin@kai.co.id");
      setPassword("demo123");
    } else {
      setEmail("renaldipahlepi@gmail.com");
      setPassword("demo123");
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT SIDE: Hero & Branding Showcase (Desktop) */}
      <div className="login-hero-panel">
        {/* Background Image with Ken Burns / Cinematic Depth */}
        <div
          className="login-hero-bg"
          style={{ backgroundImage: `url('/images/hero-1.png')` }}
        />
        {/* Navy to Orange Gradient Overlay */}
        <div className="login-hero-overlay" />

        {/* Ambient Glow Orbs */}
        <div className="glow-orb glow-top-left" />
        <div className="glow-orb glow-bottom-right" />

        {/* Content Container */}
        <div className="login-hero-content">
          {/* Top Brand Bar */}
          <div className="hero-brand-card">
            <div className="hero-logo-container">
              <img
                src="/_logo_kais.png"
                alt="KAI Services"
                className="hero-logo-img"
              />
            </div>
            <div>
              <div className="hero-brand-title">KAI Services</div>
              <div className="hero-brand-sub">PT Reska Multi Usaha • BUMN Group</div>
            </div>
          </div>

          {/* Center Showcase */}
          <div className="hero-center-box">
            <div className="hero-tag-pill">
              <span className="hero-tag-dot" />
              Portal Rekrutmen Resmi KAI Services
            </div>

            <h1 className="hero-heading">
              Awali Langkah Karir <br />
              <span className="hero-heading-highlight">Terbaik & Terpercaya</span>
            </h1>

            <p className="hero-description">
              Bergabung bersama keluarga besar PT Kereta Api Indonesia. Sistem seleksi digital terpadu yang transparan, profesional, dan berorientasi pada masa depan perkeretaapian nasional.
            </p>

            {/* Feature Cards Grid */}
            <div className="hero-features-list">
              <div className="hero-feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="feature-title">100% Bebas Biaya</div>
                  <div className="feature-desc">Seluruh proses seleksi tidak dipungut biaya apapun</div>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Ujian Kompetensi Online</div>
                  <div className="feature-desc">Sistem tes objektif & penilaian langsung terintegrasi</div>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Tracking Seleksi Real-Time</div>
                  <div className="feature-desc">Pantau tahapan berkas, tes, dan hasil langsung di dashboard</div>
                </div>
              </div>
            </div>

            {/* Trust Quote Pill */}
            <div className="hero-trust-badge">
              <div className="trust-stars">★★★★★</div>
              <div className="trust-quote">
                &ldquo;Bergabung dengan KAI Services membuka peluang karir profesional di sektor perkeretaapian nasional.&rdquo;
              </div>
              <div className="trust-author">— Insan KAI Services, Angkatan 2025</div>
            </div>

            {/* Live Stats Dock */}
            <div className="hero-stats-dock">
              <div className="stat-col">
                <div className="stat-num">12.500+</div>
                <div className="stat-label">Pelamar Terdaftar</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-col">
                <div className="stat-num">24</div>
                <div className="stat-label">Posisi Terbuka</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-col">
                <div className="stat-num">18+</div>
                <div className="stat-label">Kota Penempatan</div>
              </div>
            </div>
          </div>

          {/* Left Panel Footer */}
          <div className="hero-panel-footer">
            <div>© 2026 PT Reska Multi Usaha. Seluruh Hak Cipta Dilindungi.</div>
            <div className="hero-footer-trust">
              <span>Keamanan Data Terenkripsi</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form Panel */}
      <div className="login-form-panel">
        {/* Top Floating Navigation */}
        <div className="form-panel-topbar">
          <Link href="/" className="back-to-home-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="topbar-help">
            Butuh bantuan?{" "}
            <a href="mailto:rekrutmen@reska.id" className="help-link">
              Hubungi HR
            </a>
          </div>
        </div>

        {/* Center Card Container */}
        <div className="form-card-container">
          {/* Mobile Header Logo */}
          <div className="mobile-brand-header">
            <div className="mobile-brand-container">
              <img src="/_logo_kais.png" alt="KAI Services" className="mobile-brand-img" />
            </div>
            <div>
              <div className="mobile-brand-title">KAI Services</div>
              <div className="mobile-brand-subtitle">Smart Recruitment System</div>
            </div>
          </div>

          {/* Title & Greeting */}
          <div className="form-header-text">
            <div className="welcome-badge">
              <span>👋 Selamat Datang Kembali</span>
            </div>
            <h2 className="form-main-title">Masuk ke Akun Anda</h2>
            <p className="form-subtitle">
              Akses akun pelamar atau manajemen HR Anda untuk melanjutkan seleksi.
            </p>
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="error-alert-banner">
              <div className="error-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="error-text">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-fields">
            {/* Email Field */}
            <div className="input-group-wrapper">
              <label className="input-label" htmlFor="email-input">
                Email Terdaftar <span className="label-req">*</span>
              </label>
              <div className="input-field-relative">
                <div className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email-input"
                  type="email"
                  placeholder="contoh: nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (activeDemo) setActiveDemo(null);
                  }}
                  required
                  className="custom-text-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group-wrapper">
              <div className="label-with-action">
                <label className="input-label" htmlFor="password-input">
                  Kata Sandi <span className="label-req">*</span>
                </label>
                <Link href="/auth/forgot-password" className="forgot-pass-link">
                  Lupa password?
                </Link>
              </div>
              <div className="input-field-relative">
                <div className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeDemo) setActiveDemo(null);
                  }}
                  required
                  className="custom-text-input custom-input-with-suffix"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="remember-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="remember-text">Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`login-submit-btn ${isLoading ? "is-loading" : ""}`}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 5" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access (Akses Cepat Pengujian) */}
          <div className="demo-accounts-card">
            <div className="demo-header">
              <div className="demo-header-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Akses Cepat Pengujian (Demo)</span>
              </div>
              <span className="demo-note">1-Klik Otomatis Isi</span>
            </div>

            <div className="demo-buttons-grid">
              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => handleSelectDemo("ADMIN")}
                className={`demo-pill-btn demo-pill-admin ${activeDemo === "ADMIN" ? "active-pill" : ""}`}
              >
                <div className="demo-pill-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="demo-pill-info">
                  <div className="demo-pill-title">
                    <span>Admin HR</span>
                    {activeDemo === "ADMIN" && <span className="selected-tag">Dipilih</span>}
                  </div>
                  <div className="demo-pill-sub">admin@kai.co.id</div>
                </div>
              </button>

              {/* Demo Applicant */}
              <button
                type="button"
                onClick={() => handleSelectDemo("APPLICANT")}
                className={`demo-pill-btn demo-pill-applicant ${activeDemo === "APPLICANT" ? "active-pill" : ""}`}
              >
                <div className="demo-pill-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="demo-pill-info">
                  <div className="demo-pill-title">
                    <span>Pelamar</span>
                    {activeDemo === "APPLICANT" && <span className="selected-tag">Dipilih</span>}
                  </div>
                  <div className="demo-pill-sub">renaldipahlepi@gmail.com</div>
                </div>
              </button>
            </div>
          </div>

          {/* Registration Prompt */}
          <div className="form-footer-register">
            <span>Belum memiliki akun rekrutmen?</span>{" "}
            <Link href="/auth/register" className="register-action-link">
              Daftar Sekarang →
            </Link>
          </div>

          {/* Trust & Security Tag */}
          <div className="security-tag-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Koneksi aman terenkripsi SSL 256-bit • Standar KAI Services</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Loading Overlay (when logging in) */}
      {isLoading && (
        <div className="login-loading-overlay">
          <div className="loading-card-modal">
            <div className="spinner-dual-ring">
              <div className="spin-ring-outer" />
              <div className="spin-ring-inner" />
            </div>
            <div className="loading-title">Memproses Autentikasi...</div>
            <div className="loading-sub">Menghubungkan ke server KAI Services</div>
          </div>
        </div>
      )}

      {/* Enhanced Scoped Styles */}
      <style jsx global>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          background: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0f172a;
          overflow-x: hidden;
        }

        /* LEFT HERO PANEL */
        .login-hero-panel {
          display: none;
          flex: 1.1;
          position: relative;
          overflow: hidden;
          background: #00173d;
          padding: 48px 56px;
          flex-direction: column;
        }

        @media (min-width: 1024px) {
          .login-hero-panel {
            display: flex;
          }
        }

        .login-hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center center;
          filter: brightness(0.9) saturate(1.1);
          transform: scale(1.03);
          transition: transform 10s ease;
          animation: slowZoom 20s infinite alternate ease-in-out;
        }

        @keyframes slowZoom {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.08); }
        }

        .login-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            155deg,
            rgba(0, 32, 91, 0.94) 0%,
            rgba(6, 21, 56, 0.90) 55%,
            rgba(255, 94, 0, 0.35) 100%
          );
          backdrop-filter: blur(2px);
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          z-index: 1;
        }
        .glow-top-left {
          top: -120px;
          left: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(255, 94, 0, 0.22) 0%, transparent 70%);
        }
        .glow-bottom-right {
          bottom: -150px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 80, 200, 0.28) 0%, transparent 70%);
        }

        .login-hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-brand-card {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 10px 20px;
          border-radius: 50px;
          align-self: flex-start;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .hero-logo-container {
          width: 42px;
          height: 42px;
          background: #ffffff;
          border-radius: 12px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .hero-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .hero-brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .hero-brand-sub {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.02em;
        }

        .hero-center-box {
          margin: 36px 0;
          max-width: 560px;
        }

        .hero-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 94, 0, 0.16);
          border: 1px solid rgba(255, 94, 0, 0.35);
          color: #ff9858;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .hero-tag-dot {
          width: 7px;
          height: 7px;
          background: #FF5E00;
          border-radius: 50%;
          box-shadow: 0 0 10px #FF5E00;
        }

        .hero-heading {
          font-size: clamp(32px, 3.2vw, 44px);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }

        .hero-heading-highlight {
          background: linear-gradient(135deg, #FF5E00 0%, #ff9858 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.78);
          margin-bottom: 32px;
        }

        .hero-features-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 18px;
          border-radius: 14px;
          transition: transform 0.2s, background 0.2s;
        }

        .hero-feature-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }

        .feature-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255, 94, 0, 0.25) 0%, rgba(255, 94, 0, 0.1) 100%);
          border: 1px solid rgba(255, 94, 0, 0.3);
          color: #FF5E00;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-title {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .feature-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .hero-trust-badge {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px 18px;
          border-radius: 14px;
          margin-bottom: 24px;
        }

        .trust-stars {
          color: #ffb703;
          font-size: 13px;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }

        .trust-quote {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.88);
          font-style: italic;
          margin-bottom: 4px;
        }

        .trust-author {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .hero-stats-dock {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 16px 24px;
          gap: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .stat-col {
          flex: 1;
          text-align: center;
        }

        .stat-num {
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.65);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.15);
        }

        .hero-panel-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .hero-footer-trust {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        /* RIGHT FORM PANEL */
        .login-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
          position: relative;
          padding: 32px 32px 48px;
          overflow-y: auto;
        }

        .form-panel-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 480px;
          margin: 0 auto 28px;
        }

        .back-to-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f1f5f9;
          color: #334155;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
        }

        .back-to-home-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: translateX(-2px);
        }

        .topbar-help {
          font-size: 13px;
          color: #64748b;
        }

        .help-link {
          color: #FF5E00;
          font-weight: 700;
          text-decoration: none;
        }

        .help-link:hover {
          text-decoration: underline;
        }

        .form-card-container {
          width: 100%;
          max-width: 440px;
          margin: auto;
          display: flex;
          flex-direction: column;
          animation: formFadeIn 0.4s ease-out;
        }

        @keyframes formFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Logo */
        .mobile-brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        @media (min-width: 1024px) {
          .mobile-brand-header {
            display: none;
          }
        }

        .mobile-brand-container {
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 12px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 32, 91, 0.08);
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .mobile-brand-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .mobile-brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #00205B;
          line-height: 1.1;
        }

        .mobile-brand-subtitle {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        /* Form Header */
        .form-header-text {
          margin-bottom: 28px;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #00205B;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .form-main-title {
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        /* Error alert */
        .error-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          margin-bottom: 22px;
          animation: shakeAlert 0.3s ease;
        }

        @keyframes shakeAlert {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .error-icon-circle {
          color: #ef4444;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-text {
          font-size: 13.5px;
          color: #b91c1c;
          font-weight: 500;
          line-height: 1.4;
        }

        /* Form Controls */
        .auth-form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #1e293b;
        }

        .label-req {
          color: #ef4444;
        }

        .label-with-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forgot-pass-link {
          font-size: 13px;
          color: #FF5E00;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s;
        }

        .forgot-pass-link:hover {
          text-decoration: underline;
          color: #e05200;
        }

        .input-field-relative {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon-prefix {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-field-relative:focus-within .input-icon-prefix {
          color: #FF5E00;
        }

        .custom-text-input {
          width: 100%;
          height: 52px;
          padding: 0 16px 0 46px;
          font-size: 14.5px;
          color: #0f172a;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .custom-input-with-suffix {
          padding-right: 48px;
        }

        .custom-text-input::placeholder {
          color: #94a3b8;
        }

        .custom-text-input:focus {
          border-color: #FF5E00;
          box-shadow: 0 0 0 4px rgba(255, 94, 0, 0.12);
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          padding: 8px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .password-toggle-btn:hover {
          color: #334155;
          background: #f1f5f9;
        }

        /* Remember Checkbox */
        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .remember-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .custom-checkbox {
          width: 17px;
          height: 17px;
          accent-color: #FF5E00;
          cursor: pointer;
          border-radius: 4px;
        }

        .remember-text {
          font-size: 13.5px;
          color: #475569;
          font-weight: 500;
        }

        /* Submit Button */
        .login-submit-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #FF5E00 0%, #ff7728 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15.5px;
          font-weight: 750;
          letter-spacing: 0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(255, 94, 0, 0.3);
          transition: all 0.2s ease;
          margin-top: 4px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #f05400 0%, #ff6c17 100%);
          box-shadow: 0 8px 25px rgba(255, 94, 0, 0.4);
          transform: translateY(-1.5px);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn.is-loading {
          opacity: 0.85;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* QUICK DEMO ACCESS */
        .demo-accounts-card {
          margin-top: 28px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
        }

        .demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .demo-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #00205B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .demo-note {
          font-size: 11.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        .demo-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .demo-pill-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid transparent;
          text-align: left;
          background: #ffffff;
        }

        .demo-pill-admin {
          border-color: #cbd5e1;
          color: #00205B;
        }

        .demo-pill-admin:hover,
        .demo-pill-admin.active-pill {
          background: #00205B;
          color: #ffffff;
          border-color: #00205B;
          box-shadow: 0 4px 14px rgba(0, 32, 91, 0.25);
        }

        .demo-pill-applicant {
          border-color: #fed7aa;
          color: #c2410c;
        }

        .demo-pill-applicant:hover,
        .demo-pill-applicant.active-pill {
          background: #FF5E00;
          color: #ffffff;
          border-color: #FF5E00;
          box-shadow: 0 4px 14px rgba(255, 94, 0, 0.25);
        }

        .demo-pill-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .demo-pill-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .demo-pill-title {
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .selected-tag {
          font-size: 9.5px;
          background: rgba(255, 255, 255, 0.25);
          padding: 1px 5px;
          border-radius: 6px;
          font-weight: 600;
        }

        .demo-pill-sub {
          font-size: 11px;
          opacity: 0.8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* REGISTER PROMPT */
        .form-footer-register {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }

        .register-action-link {
          color: #FF5E00;
          font-weight: 800;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.15s;
        }

        .register-action-link:hover {
          text-decoration: underline;
          color: #d94e00;
        }

        /* SECURITY TAG */
        .security-tag-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }

        /* FULLSCREEN MODAL OVERLAY */
        .login-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 32, 91, 0.4);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .loading-card-modal {
          background: #ffffff;
          padding: 32px 40px;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 320px;
          width: 90%;
        }

        .spinner-dual-ring {
          position: relative;
          width: 54px;
          height: 54px;
          margin-bottom: 18px;
        }

        .spin-ring-outer {
          position: absolute;
          inset: 0;
          border: 3.5px solid transparent;
          border-top-color: #FF5E00;
          border-right-color: #FF5E00;
          border-radius: 50%;
          animation: spin 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        .spin-ring-inner {
          position: absolute;
          inset: 8px;
          border: 3.5px solid transparent;
          border-top-color: #00205B;
          border-left-color: #00205B;
          border-radius: 50%;
          animation: spinRev 1.1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        @keyframes spinRev {
          to { transform: rotate(-360deg); }
        }

        .loading-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .loading-sub {
          font-size: 12.5px;
          color: #64748b;
        }

        @media (max-width: 640px) {
          .login-form-panel {
            padding: 24px 18px 64px;
          }
          .form-panel-topbar {
            margin-bottom: 20px;
            gap: 10px;
          }
          .back-to-home-btn {
            padding: 6px 12px;
            font-size: 12px;
            white-space: nowrap;
          }
          .topbar-help {
            font-size: 12px;
            text-align: right;
            line-height: 1.3;
          }
          .form-main-title {
            font-size: 26px;
          }
          .demo-buttons-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
