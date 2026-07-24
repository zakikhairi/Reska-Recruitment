"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const jobs = [
  { id: 1, title: "Pramugara / Pramugari Kereta", location: "Jakarta, Bandung, Surabaya", applicants: 245, isNew: true, deadline: "15 Agu 2026", type: "Layanan Kereta" },
  { id: 2, title: "Steward Kereta Api", location: "Bandung", applicants: 128, isNew: true, deadline: "20 Agu 2026", type: "Layanan Kereta" },
  { id: 3, title: "Staff IT Support", location: "Jakarta", applicants: 89, isNew: false, deadline: "10 Agu 2026", type: "IT Staff" },
  { id: 4, title: "Teknisi Maintenance Kereta", location: "Madiun", applicants: 67, isNew: false, deadline: "25 Agu 2026", type: "Logistik" },
  { id: 5, title: "Cleaning Service - ResClean", location: "Bandung, Jakarta", applicants: 312, isNew: false, deadline: "1 Sep 2026", type: "ResClean" },
  { id: 6, title: "Staff Administrasi", location: "Jakarta", applicants: 156, isNew: false, deadline: "18 Agu 2026", type: "Admin" },
];

const filters = ["Semua", "Layanan Kereta", "IT Staff", "Logistik", "ResClean", "Admin"];

// Intersection Observer Hook
function useScrollAnimation(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return { ref, isVisible };
}

// Animated Section Wrapper
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Animated Card Item
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  const filteredJobs = jobs.filter(job => {
    const matchFilter = activeFilter === "Semua" || job.type === activeFilter;
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#ffffff", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#ffffff", borderBottom: "1px solid #eeeeee" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
              <div style={{ fontSize: "12px", color: "#888888", lineHeight: 1.2 }}>PT Reska Multi Usaha</div>
            </div>
          </Link>

          <nav style={{ display: "flex", gap: "40px" }} className="desktop-nav">
            <a href="#lowongan" style={{ fontSize: "15px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Lowongan</a>
            <a href="#tentang" style={{ fontSize: "15px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Tentang</a>
            <a href="#kontak" style={{ fontSize: "15px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Kontak</a>
          </nav>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/auth/login">
              <button style={{ padding: "10px 20px", fontSize: "15px", fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", color: "#00205B" }}>Masuk</button>
            </Link>
            <Link href="/auth/register">
              <button style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 600, background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" }}>Daftar</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: "72px", position: "relative", color: "#ffffff", minHeight: "700px" }}>
        {/* Background Image */}
        <img
          src="/home-photo.jpg"
          alt="KAI Recruitment"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            zIndex: 0
          }}
        />
        {/* Dark Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(0,32,91,0.85) 0%, rgba(12,35,64,0.75) 100%)", zIndex: 1 }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "80px", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <AnimatedSection delay={0}>
              <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(255,255,255,0.1)", borderRadius: "24px", fontSize: "14px", fontWeight: 500, marginBottom: "24px" }}>
                PT Reska Multi Usaha - Anak Perusahaan KAI
              </div>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-0.02em" }}>
                Bergabung dengan<br/>
                <span style={{ color: "#FF5E00" }}>Keluarga Besar</span><br/>
                KAI Services
              </h1>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "520px" }}>
                Jadilah bagian dari perusahaan railway terbesar di Indonesia. Kami mencari talenta terbaik untuk memberikan layanan kereta api terbaik.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/auth/register">
                  <button style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 700, background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 20px rgba(255,94,0,0.4)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,94,0,0.5)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,94,0,0.4)"; }}>
                    Daftar Sekarang
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </Link>
                <Link href="#lowongan">
                  <button style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 600, background: "transparent", color: "#ffffff", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "12px", cursor: "pointer" }}>
                    Lihat Lowongan
                  </button>
                </Link>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={200}>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" }}>
                {[{v: "12,500+", l: "Total Pelamar"}, {v: "24", l: "Posisi Terbuka"}, {v: "1,200+", l: "Terserap 2025"}, {v: "18 Kota", l: "Cabang"}].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", lineHeight: 1.1, marginBottom: "6px" }}>{s.v}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "100px 32px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#00205B", marginBottom: "14px", letterSpacing: "-0.02em" }}>Mengapa Bergabung?</h2>
              <p style={{ fontSize: "16px", color: "#666666", maxWidth: "500px", margin: "0 auto" }}>Kesempatan karier stabil di lingkungan perusahaan BUMN terpercaya</p>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {[
              { title: "Asuransi Kesehatan", desc: "BPJS & Asuransi Tambahan untuk karyawan", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title: "Cuti & Tunjangan", desc: "THR, cuti tahunan & hari besar", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { title: "Jenjang Karier", desc: "Pelatihan & pengembangan skill", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
              { title: "Lingkungan Kerja", desc: "Profesional & suportif", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
            ].map((b, i) => (
              <AnimatedCard key={i} delay={i * 100}>
                <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                  <div style={{ width: "64px", height: "64px", background: "#f0f4ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>{b.icon}</div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "10px", color: "#111111" }}>{b.title}</h3>
                  <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "100px 32px", background: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#00205B", marginBottom: "14px", letterSpacing: "-0.02em" }}>Cara Melamar</h2>
              <p style={{ fontSize: "16px", color: "#666666" }}>Proses sederhana dalam 5 langkah mudah</p>
            </div>
          </AnimatedSection>

          <div style={{ display: "flex", justifyContent: "center", gap: "0", flexWrap: "wrap" }}>
            {[
              {n: "01", t: "Daftar", d: "Buat akun baru", color: "#FF5E00" },
              {n: "02", t: "Pilih", d: "Lowongan sesuai bidang", color: "#00205B" },
              {n: "03", t: "Tes", d: "Tes kompetensi online", color: "#FF5E00" },
              {n: "04", t: "Interview", d: "Seleksi lanjutan", color: "#00205B" },
              {n: "05", t: "Offering", d: "Terima & bergabung", color: "#FF5E00" }
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start"
              }}>
                {/* Connector line - positioned above text, aligned with top of circle */}
                {i > 0 && (
                  <div style={{
                    width: "40px",
                    height: "3px",
                    background: i % 2 === 0 ? "#00205B" : "#FF5E00",
                    flexShrink: 0,
                    marginTop: "32px",
                  }} />
                )}

                <div style={{
                  textAlign: "center",
                  padding: "0 20px",
                  transition: "transform 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>

                  <div style={{
                    width: "64px",
                    height: "64px",
                    background: s.color,
                    color: "#ffffff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    boxShadow: `0 8px 24px ${s.color}40`,
                  }}>{s.n}</div>

                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginTop: "16px", marginBottom: "6px" }}>{s.t}</div>
                  <div style={{ fontSize: "13px", color: "#888888" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="lowongan" style={{ padding: "80px 32px", position: "relative", color: "#ffffff" }}>
        {/* Background Image */}
        <img
          src="/section-bg.jpg"
          alt="KAI Recruitment"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center top",
            zIndex: 0
          }}
        />
        {/* Dark Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,32,91,0.85)", zIndex: 1 }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <AnimatedSection>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em" }}>Lowongan Tersedia</h2>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>{filteredJobs.length} posisi terbuka untuk Anda</p>
              </div>
              <Link href="/auth/register">
                <button style={{ padding: "14px 28px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>Lamar Sekarang</button>
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div style={{ marginBottom: "28px" }}>
              <input type="text" placeholder="Cari posisi atau lokasi..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", maxWidth: "440px", height: "52px", padding: "0 20px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "12px", fontSize: "15px", outline: "none", background: "rgba(255,255,255,0.1)", color: "#ffffff" }} />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "10px 20px", borderRadius: "24px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                  background: activeFilter === f ? "#FF5E00" : "rgba(255,255,255,0.15)", color: activeFilter === f ? "#ffffff" : "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.2s"
                }}>{f}</button>
              ))}
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {filteredJobs.map((job, i) => (
              <AnimatedCard key={job.id} delay={i * 100}>
                <div style={{ background: "rgba(255,255,255,0.95)", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span style={{ padding: "6px 14px", borderRadius: "14px", fontSize: "12px", fontWeight: 700, background: job.isNew ? "#dcfce7" : "#f0f0f0", color: job.isNew ? "#16a34a" : "#666666" }}>{job.isNew ? "Baru" : "Aktif"}</span>
                    <span style={{ fontSize: "13px", color: "#999999", fontWeight: 500 }}>{job.applicants} pelamar</span>
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", marginBottom: "12px", lineHeight: 1.4 }}>{job.title}</h3>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "20px", lineHeight: 1.6 }}>
                    <div style={{ marginBottom: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location}
                    </div>
                    <div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {job.deadline}
                    </div>
                  </div>
                  <Link href={`/auth/register?job=${job.id}`}>
                    <button style={{ width: "100%", padding: "14px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Lamar Posisi Ini</button>
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" style={{ padding: "80px 32px", position: "relative", color: "#ffffff" }}>
        {/* Background Image */}
        <img
          src="/section-bg.jpg"
          alt="KAI Services"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center top",
            zIndex: 0
          }}
        />
        {/* Dark Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,32,91,0.85)", zIndex: 1 }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center", position: "relative", zIndex: 2 }}>
          <AnimatedSection>
            <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.02em" }}>Tentang KAI Services</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "20px", fontSize: "16px" }}>
              PT Reska Multi Usaha (KAI Services) adalah anak perusahaan dari PT Kereta Api Indonesia (Persero) yang didirikan pada tahun 2003. Kami menyediakan jasa pendukung operasional kereta api.
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "40px", fontSize: "16px" }}>
              Dengan pengalaman lebih dari 20 tahun, kami berkomitmen memberikan layanan berkualitas bagi lebih dari 5.000 karyawan di seluruh Indonesia.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>20+</div><div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Tahun Pengalaman</div></div>
              <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>5,000+</div><div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Karyawan</div></div>
              <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>18</div><div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Kota Branch</div></div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { title: "BUMN Terpercaya", desc: "Bagian dari KAI Indonesia", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/></svg> },
                { title: "Pelatihan Berkala", desc: "Pengembangan kompetensi", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
                { title: "Benefit Lengkap", desc: "Kesejahteraan karyawan", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { title: "Inovasi Digital", desc: "Sistem modern", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
              ].map((item, i) => (
                <AnimatedCard key={i} delay={i * 100}>
                  <div style={{ background: "rgba(255,255,255,0.08)", padding: "28px", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
                    <div style={{ marginBottom: "14px" }}>{item.icon}</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{item.desc}</div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 32px", background: "#FF5E00", textAlign: "center", color: "#ffffff" }}>
        <AnimatedSection>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px" }}>Siap Memulai?</h2>
            <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "32px", fontSize: "17px" }}>Jangan lewatkan kesempatan untuk bergabung dengan keluarga besar KAI Services.</p>
            <Link href="/auth/register">
              <button style={{ padding: "18px 40px", background: "#ffffff", color: "#FF5E00", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Contact */}
      <section id="kontak" style={{ padding: "60px 32px", background: "#f8f9fa", textAlign: "center" }}>
        <AnimatedSection>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#00205B", marginBottom: "16px" }}>Hubungi Kami</h2>
          <p style={{ fontSize: "16px", color: "#666666" }}>hrd@kai-services.co.id • (021) 1234-5678</p>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px", background: "#00205B", color: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span style={{ fontWeight: 700, fontSize: "15px" }}>KAI Services</span>
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>2026 PT Reska Multi Usaha. Bagian dari PT Kereta Api Indonesia.</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
        }
        @media (max-width: 900px) {
          section > div:first-child { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </div>
  );
}
