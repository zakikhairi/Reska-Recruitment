"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", confirm: "", name: "", nik: "", phone: ""
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.email || !form.password || form.password !== form.confirm) return;
    }
    if (step === 2) {
      if (!form.name || !form.nik || !form.phone) return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/applicant/dashboard");
    }, 1000);
  };

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

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
            <input type="password" placeholder="Min. 8 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <input type="text" placeholder="16 digit nomor KTP" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222222", marginBottom: "8px" }}>Nomor HP</label>
            <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{ width: "100%", height: "54px", padding: "0 18px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: "#ffffff" }} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, height: "54px", border: "2px solid #e5e5e5", color: "#444444", background: "#ffffff", fontSize: "15px", fontWeight: 600, borderRadius: "12px", cursor: "pointer" }}>
              Kembali
            </button>
            <button onClick={handleNext} style={{ flex: 1, height: "54px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,94,0,0.35)" }}>
              Lanjut
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Success */}
      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>Berhasil!</h2>
          <p style={{ fontSize: "15px", color: "#666666", marginBottom: "32px" }}>Akun Anda telah dibuat</p>

          <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#333333", marginBottom: "16px" }}>Langkah selanjutnya:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "24px", height: "24px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span style={{ fontSize: "14px", color: "#555555" }}>Lengkapi profil</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "24px", height: "24px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span style={{ fontSize: "14px", color: "#555555" }}>Upload dokumen</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "24px", height: "24px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span style={{ fontSize: "14px", color: "#555555" }}>Pilih lowongan</span>
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={isLoading} style={{ width: "100%", height: "54px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, boxShadow: "0 4px 20px rgba(255,94,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {isLoading ? (
              <>
                <div style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Memuat...
              </>
            ) : "Mulai Sekarang"}
          </button>
        </div>
      )}

      <p style={{ marginTop: "28px", textAlign: "center", fontSize: "15px", color: "#666666" }}>
        Sudah punya akun?{" "}
        <Link href="/auth/login" style={{ color: "#FF5E00", textDecoration: "none", fontWeight: 700 }}>
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel - Branding */}
      <div style={{ display: "none", flex: "1", position: "relative", overflow: "hidden" }} className="left-panel">
        {/* Background Image */}
        <img
          src="/login-bg.jpg"
          alt="KAI Recruitment"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center"
          }}
        />
        {/* Dark Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(160deg, rgba(0,32,91,0.85) 0%, rgba(0,26,61,0.75) 50%, rgba(12,35,64,0.8) 100%)" }} />

        {/* Content Wrapper */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "60px" }}>

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
            <RegisterForm />
          </Suspense>

        </div>
      </div>

      <style>{`
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
