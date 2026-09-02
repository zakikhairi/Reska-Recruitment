"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  division: string;
  location: string | null;
  description: string;
  requirements: string;
  minEducation: string;
  startDate: string;
  deadline: string;
  status: string;
  applicantCount: number;
  createdAt: string;
}

const divisionLabels: Record<string, string> = {
  "ON_TRAIN_SERVICE": "Layanan Kereta",
  "IT_STAFF": "IT Staff",
  "LOGISTICS": "Logistik",
  "RES_CLEAN": "ResClean",
  "RES_PARKING": "ResParking",
  "ADMIN": "Admin",
};

const filters = ["Semua", "Layanan Kereta", "IT Staff", "Logistik", "ResClean", "Admin"];

const heroSlides = [
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2F1ecd505471cf2240985edcde02ee2f7c3bc2a9adb9efd42131f915173ca939aa..png?Expires=1788405702&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=KBjA35kV0ebhl%2BFxid%2FdDo5lqEE%3D",
    badge: "PT Reska Multi Usaha - Anak Perusahaan KAI",
    titleLine1: "Bergabung dengan",
    titleHighlight: "Keluarga Besar",
    titleLine2: "KAI Services",
    description: "Jadilah bagian dari perusahaan railway terbesar di Indonesia. Kami mencari talenta terbaik untuk memberikan layanan kereta api terbaik.",
  },
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2Fa65df92393b0235ca19459c7aaf2da12d99b19a13d93cd80e4a1ffd0c9fdc191..jpeg?Expires=1788417434&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=GLG%2FrnX2u2tx9QTy6kh%2B6bvJ7qc%3D",
    badge: "Layanan Kebersihan & Fasilitas - RESClean",
    titleLine1: "Wujudkan Standar",
    titleHighlight: "Kebersihan & Kenyamanan",
    titleLine2: "Armada Kereta Api",
    description: "Bergabunglah bersama tim profesional RESClean dalam menjaga standar kebersihan, higienitas, dan kenyamanan seluruh armada serta stasiun kereta api di Indonesia.",
  },
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2F3d10e71c3bdf15a8e462af0b213ce3d3ea840a81179089d926a2619f98f5d803..jpeg?Expires=1788417651&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=T2JTBX35oQMIX72z6BK21rL9LpE%3D",
    badge: "Kuliner & Restorasi Kereta Api - On Train Culinary",
    titleLine1: "Sajikan Cita Rasa",
    titleHighlight: "Kuliner Nusantara",
    titleLine2: "Di Atas Rel Kereta",
    description: "Kembangkan keahlian kuliner Anda bersama tim Chef dan Katering KAI Services untuk menghadirkan pengalaman hidangan lezat berstandar tinggi bagi jutaan penumpang.",
  },
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2F43a42117a8e14751936ba094bca1166b76464a7f28d87a344f35431071d967b4..jpeg?Expires=1788417888&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=aYyzDaLPuLIHQSh36aumVWlk9Bk%3D",
    badge: "Manajemen Kawasan Stasiun - ResParking",
    titleLine1: "Kelola Layanan Parkir",
    titleHighlight: "Modern & Terintegrasi",
    titleLine2: "Di Seluruh Stasiun",
    description: "Tingkatkan efisiensi mobilitas masyarakat dengan bergabung di divisi manajemen parkir dan pelayanan terdepan kawasan stasiun kereta api modern.",
  },
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2F9cc5e689ea6479808284ecec29179f56190ff9f19e3a7485ce570884d1baa46d..jpeg?Expires=1788417894&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=Mo%2B5omAx5HOhgyPBjM5M%2BnQALzU%3D",
    badge: "Hospitality & Barista - Loko Coffee Shop",
    titleLine1: "Karier Kreatif di",
    titleHighlight: "Loko Coffee Shop",
    titleLine2: "Kafe Ikonik Kereta Api",
    description: "Salurkan passion barista dan hospitality Anda di jaringan coffee shop ternama KAI Services yang selalu menemani momen perjalanan dan kehangatan pelanggan.",
  },
  {
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-02%2FMiniMax-M2.7%2F2044203945915593601%2F4a74bc40598186edb9d3085a65c28f75c06c036e2dff47581585cef9739afafe..jpeg?Expires=1788417897&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=okmexeL8kmtm%2B%2BWy21t8egPCAR8%3D",
    badge: "Keamanan & Pelayanan - Security & Customer Care",
    titleLine1: "Berikan Rasa Aman &",
    titleHighlight: "Pelayanan Sepenuh Hati",
    titleLine2: "Untuk Pelanggan KAI",
    description: "Jadilah garda terdepan keamanan dan kenyamanan stasiun, melayani jutaan penumpang kereta api setiap hari dengan integritas dan dedikasi prima.",
  },
];

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

// Rolling Wheel / Odometer Digit Counter
function RollingDigit({ digit, delay = 0, isRolling }: { digit: string; delay?: number; isRolling: boolean }) {
  const isNumber = !isNaN(parseInt(digit, 10)) && digit.trim() !== "";
  if (!isNumber) {
    return (
      <span style={{ display: "inline-block", height: "1.15em", lineHeight: "1.15em", verticalAlign: "top" }}>
        {digit}
      </span>
    );
  }

  const num = parseInt(digit, 10);
  const sequence = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ...Array.from({ length: num + 1 }, (_, i) => i)
  ];
  const targetIndex = 20 + num;
  const totalCount = sequence.length;

  return (
    <span
      style={{
        display: "inline-block",
        height: "1.15em",
        lineHeight: "1.15em",
        overflow: "hidden",
        verticalAlign: "top",
        position: "relative",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: isRolling ? `translateY(-${(targetIndex / totalCount) * 100}%)` : "translateY(0%)",
          transition: isRolling
            ? `transform ${1.6 + delay * 0.15}s cubic-bezier(0.12, 0.9, 0.25, 1) ${delay}s`
            : "none",
        }}
      >
        {sequence.map((n, i) => (
          <span
            key={i}
            style={{
              height: "1.15em",
              lineHeight: "1.15em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingText({ text, delay = 0, isRolling }: { text: string; delay?: number; isRolling: boolean }) {
  const chars = text.split("");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {chars.map((char, i) => (
        <RollingDigit
          key={i}
          digit={char}
          delay={delay + i * 0.07}
          isRolling={isRolling}
        />
      ))}
    </span>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStatsRolling, setIsStatsRolling] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Trigger stats rolling wheel animation on initial mount / page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStatsRolling(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, []);

  // Map filter labels to division codes
  const filterToDivision: Record<string, string> = {
    "Layanan Kereta": "ON_TRAIN_SERVICE",
    "IT Staff": "IT_STAFF",
    "Logistik": "LOGISTICS",
    "ResClean": "RES_CLEAN",
    "Admin": "ADMIN",
  };

  // Filter all ACTIVE jobs (show even if not started yet)
  const now = new Date();
  const activeJobs = jobs.filter(job => job.status === "ACTIVE");

  const filteredJobs = activeJobs.filter(job => {
    const divisionLabel = divisionLabels[job.division] || job.division;
    const matchFilter = activeFilter === "Semua" || divisionLabel === activeFilter;
    const matchSearch = (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
                       (job.location || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#ffffff", color: "#111111", margin: 0, padding: 0 }}>
      {/* Important Announcement Popup Modal */}
      {showAnnouncement && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 18, 50, 0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAnnouncement(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              maxWidth: "520px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 60px -12px rgba(0, 32, 91, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15)",
              animation: "modalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              position: "relative",
            }}
          >
            {/* Top Banner Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #00205B 0%, #003399 100%)",
                padding: "32px 24px 24px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle Decorative Background Circles */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: "rgba(255, 94, 0, 0.15)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                  pointerEvents: "none",
                }}
              />

              {/* Close Button */}
              <button
                onClick={() => setShowAnnouncement(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  lineHeight: 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 94, 0, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                aria-label="Tutup"
              >
                ✕
              </button>

              {/* Official KAI Services Logo Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "10px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  marginBottom: "16px",
                }}
              >
                <img
                  src="/_logo_kais.png"
                  alt="Logo KAI Services"
                  style={{ height: "46px", width: "auto", objectFit: "contain" }}
                />
              </div>

              <h3
                style={{
                  color: "#ffffff",
                  fontSize: "22px",
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Pemberitahuan Penting
              </h3>
            </div>

            {/* Body Content */}
            <div style={{ padding: "28px 28px 24px" }}>
              <p
                style={{
                  fontSize: "14.5px",
                  color: "#475569",
                  lineHeight: 1.65,
                  margin: "0 0 20px 0",
                  textAlign: "center",
                }}
              >
                Terima kasih telah mengunjungi situs rekrutmen resmi <strong>KAI Services</strong> (PT Reska Multi Usaha). Dengan melanjutkan mengakses situs ini, Anda dianggap telah membaca dan menyetujui ketentuan penggunaan yang berlaku.
              </p>

              {/* Warning Alert Box */}
              <div
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fef3c7",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  marginBottom: "28px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#92400e",
                      marginBottom: "4px",
                    }}
                  >
                    Perhatian:
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#78350f",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    Seluruh informasi lowongan yang tertera di situs ini adalah resmi dari <strong>PT Reska Multi Usaha (KAI Services)</strong>. KAI Services <strong>tidak memungut biaya apapun</strong> dalam seluruh proses rekrutmen. Waspada terhadap tindakan penipuan yang mengatasnamakan KAI Services.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setShowAnnouncement(false)}
                  style={{
                    background: "linear-gradient(135deg, #FF5E00 0%, #FF7A00 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 44px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(255, 94, 0, 0.35)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(255, 94, 0, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 94, 0, 0.35)";
                  }}
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#00205B" }}>KAI Services</span>
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/auth/login">
            <button style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 600, background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}>Masuk</button>
          </Link>
          <Link href="/auth/register">
            <button style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 600, background: "#FF5E00", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ffffff" }}>Daftar</button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section style={{ paddingTop: "72px", position: "relative", color: "#ffffff", minHeight: "700px" }}>
        {/* Background Image Slideshow */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt={slide.badge}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                opacity: currentSlide === index ? 1 : 0,
                transition: "opacity 1s ease-in-out"
              }}
            />
          ))}
        </div>

        {/* Dark Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(0,32,91,0.85) 0%, rgba(12,35,64,0.75) 100%)", zIndex: 1 }} />

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          style={{
            position: "absolute",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "48px",
            height: "48px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            padding: 0,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,94,0,0.85)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
          aria-label="Previous slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginLeft: "-2px" }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          style={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "48px",
            height: "48px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            padding: 0,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,94,0,0.85)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
          aria-label="Next slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginRight: "-2px" }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Navigation Dots */}
        <div style={{
          position: "absolute",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? "32px" : "12px",
                height: "12px",
                borderRadius: "6px",
                background: currentSlide === index ? "#FF5E00" : "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "80px", alignItems: "center", position: "relative", zIndex: 2 }} className="hero-content">
          <div style={{ minHeight: "360px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div key={currentSlide} style={{ animation: "heroSlideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", fontSize: "14px", fontWeight: 500, marginBottom: "24px" }}>
                {heroSlides[currentSlide]?.badge}
              </div>
              <h1 style={{ fontSize: "clamp(34px, 4.8vw, 54px)", fontWeight: 800, lineHeight: 1.15, marginBottom: "24px", letterSpacing: "-0.02em" }}>
                {heroSlides[currentSlide]?.titleLine1}<br/>
                <span style={{ color: "#FF5E00" }}>{heroSlides[currentSlide]?.titleHighlight}</span><br/>
                {heroSlides[currentSlide]?.titleLine2}
              </h1>
              <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "520px" }}>
                {heroSlides[currentSlide]?.description}
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
            </div>
          </div>

          <AnimatedSection delay={200} className="hero-stats">
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" }}>
                {[
                  { v: "12,500+", l: "Total Pelamar" },
                  { v: "24", l: "Posisi Terbuka" },
                  { v: "1,200+", l: "Terserap 2025" },
                  { v: "18 Kota", l: "Cabang" }
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", lineHeight: 1.1, marginBottom: "6px" }}>
                      <RollingText text={s.v} delay={i * 0.15} isRolling={isStatsRolling} />
                    </div>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", alignItems: "stretch" }} className="benefits-grid">
            {[
              { title: "Asuransi Kesehatan", desc: "BPJS & Asuransi Tambahan", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title: "Cuti & Tunjangan", desc: "THR, cuti tahunan & hari besar", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { title: "Jenjang Karier", desc: "Pelatihan & pengembangan skill", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
              { title: "Lingkungan Kerja", desc: "Profesional & suportif", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
            ].map((b, i) => (
              <AnimatedCard key={i} delay={i * 100}>
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.3s, box-shadow 0.3s", display: "flex", flexDirection: "column", height: "100%", minHeight: "220px", justifyContent: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                  <div style={{ width: "52px", height: "52px", background: "#f0f4ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", flexShrink: 0 }}>{b.icon}</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#111111" }}>{b.title}</h3>
                  <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5, margin: 0 }}>{b.desc}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Steps (Pelni-style 5 Steps adapted for KAI Services) */}
      <section id="cara-melamar" style={{ padding: "100px 32px", background: "#ffffff", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.35fr",
            gap: "60px",
            alignItems: "center"
          }} className="how-to-apply-grid">

            {/* Left Column */}
            <AnimatedSection>
              <div>
                {/* Official KAI Services Logo at Top Left */}
                <div style={{ marginBottom: "24px" }}>
                  <img
                    src="/logo-kai-services.svg"
                    alt="Logo KAI Services"
                    style={{ height: "54px", width: "auto", objectFit: "contain" }}
                  />
                </div>

                <h2 style={{
                  fontSize: "42px",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: "32px",
                  letterSpacing: "-0.02em"
                }}>
                  <span style={{ color: "#00205B", display: "block" }}>Langkah-langkah</span>
                  <span style={{ color: "#111827", display: "block" }}>Cara Melamar</span>
                  <span style={{ color: "#111827" }}>Lowongan di </span>
                  <span style={{ color: "#FF5E00" }}>KAI Services</span>
                </h2>

                {/* 5 Checklist Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
                  {[
                    "Registrasikan Akun Anda",
                    "Lengkapi Data Diri & Dokumen",
                    "Pilih Lowongan Sesuai Kualifikasi",
                    "Ikuti Tes Kompetensi & Interview",
                    "Terima Offering & Bergabung"
                  ].map((text, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: idx === 4 ? "#FF5E00" : "#00205B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: idx === 4 ? "0 4px 10px rgba(255,94,0,0.3)" : "0 4px 10px rgba(0,32,91,0.25)"
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#1E293B" }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Right Column: 5 Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "28px",
              position: "relative"
            }} className="how-to-apply-cards">

              {/* Card 01 - Registrasi */}
              <AnimatedCard delay={100}>
                <div style={{
                  background: "linear-gradient(135deg, #00205B 0%, #003380 100%)",
                  borderRadius: "24px",
                  padding: "40px 24px 28px 28px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 16px 36px rgba(0,32,91,0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,32,91,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,32,91,0.2)";
                }}>
                  {/* Floating Illustrated Badge */}
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-14px",
                    width: "60px",
                    height: "60px",
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                      <rect x="14" y="10" width="36" height="44" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
                      <rect x="22" y="6" width="20" height="8" rx="4" fill="#FF5E00" />
                      <circle cx="28" cy="10" r="2" fill="#FFFFFF" />
                      <circle cx="36" cy="10" r="2" fill="#FFFFFF" />
                      <rect x="20" y="22" width="16" height="3" rx="1.5" fill="#00205B" />
                      <rect x="20" y="30" width="22" height="3" rx="1.5" fill="#94A3B8" />
                      <rect x="20" y="38" width="18" height="3" rx="1.5" fill="#94A3B8" />
                      <circle cx="44" cy="23" r="3" fill="#10B981" />
                      <path d="M46 40L36 50L32 51L33 47L43 37L46 40Z" fill="#38BDF8" />
                      <path d="M43 37L46 40L49 37L46 34L43 37Z" fill="#FF5E00" />
                    </svg>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, paddingRight: "10px", lineHeight: 1.3, color: "#FFFFFF" }}>
                      Registrasikan<br />Akun Anda
                    </h3>
                    <span style={{ fontSize: "44px", fontWeight: 900, lineHeight: 0.9, opacity: 0.95, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                      01
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: 0 }}>
                    Daftarkan diri Anda untuk membuat akun pribadi di platform rekrutmen kami.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 02 - Lengkapi Data Diri */}
              <AnimatedCard delay={200}>
                <div style={{
                  background: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
                  borderRadius: "24px",
                  padding: "40px 24px 28px 28px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 16px 36px rgba(2,132,199,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginTop: "30px"
                }}
                className="staggered-card-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 24px 48px rgba(2,132,199,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 16px 36px rgba(2,132,199,0.25)";
                }}>
                  {/* Floating Illustrated Badge */}
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-14px",
                    width: "60px",
                    height: "60px",
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                      <rect x="14" y="8" width="36" height="48" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                      <path d="M36 22L40 19L44 22V8H36V22Z" fill="#FF5E00" />
                      <rect x="20" y="16" width="12" height="12" rx="3" fill="#0284C7" />
                      <circle cx="26" cy="20" r="3" fill="#FFFFFF" />
                      <path d="M22 27C22 25 24 24 26 24C28 24 30 25 30 27" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                      <rect x="20" y="34" width="24" height="3" rx="1.5" fill="#00205B" />
                      <rect x="20" y="41" width="18" height="3" rx="1.5" fill="#94A3B8" />
                      <rect x="20" y="47" width="22" height="3" rx="1.5" fill="#94A3B8" />
                    </svg>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, paddingRight: "10px", lineHeight: 1.3, color: "#FFFFFF" }}>
                      Lengkapi Data<br />Diri Anda
                    </h3>
                    <span style={{ fontSize: "44px", fontWeight: 900, lineHeight: 0.9, opacity: 0.95, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                      02
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Sampaikan informasi tentang diri Anda dengan mengunggah CV atau Resume Anda ke dalam akun Anda.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 03 - Cari Lowongan */}
              <AnimatedCard delay={300}>
                <div style={{
                  background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
                  borderRadius: "24px",
                  padding: "40px 24px 28px 28px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 16px 36px rgba(29,78,216,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 24px 48px rgba(29,78,216,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 16px 36px rgba(29,78,216,0.25)";
                }}>
                  {/* Floating Illustrated Badge */}
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-14px",
                    width: "60px",
                    height: "60px",
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                      <rect x="12" y="10" width="34" height="44" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                      <rect x="18" y="18" width="16" height="4" rx="2" fill="#00205B" />
                      <rect x="18" y="26" width="22" height="3" rx="1.5" fill="#0284C7" />
                      <rect x="18" y="33" width="18" height="3" rx="1.5" fill="#94A3B8" />
                      <rect x="18" y="40" width="20" height="3" rx="1.5" fill="#94A3B8" />
                      <circle cx="42" cy="38" r="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
                      <path d="M49 45L56 52" stroke="#FF5E00" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="40" cy="36" r="3" fill="#0284C7" opacity="0.4" />
                    </svg>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, paddingRight: "10px", lineHeight: 1.3, color: "#FFFFFF" }}>
                      Pilih Karir<br />Impian Anda
                    </h3>
                    <span style={{ fontSize: "44px", fontWeight: 900, lineHeight: 0.9, opacity: 0.95, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                      03
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Telusuri beragam lowongan pekerjaan yang sesuai dengan minat dan keterampilan Anda.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 04 - Tes & Interview */}
              <AnimatedCard delay={400}>
                <div style={{
                  background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
                  borderRadius: "24px",
                  padding: "40px 24px 28px 28px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 16px 36px rgba(30,41,59,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginTop: "30px"
                }}
                className="staggered-card-4"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 24px 48px rgba(30,41,59,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 16px 36px rgba(30,41,59,0.25)";
                }}>
                  {/* Floating Illustrated Badge */}
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-14px",
                    width: "60px",
                    height: "60px",
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                      <circle cx="24" cy="24" r="8" fill="#FDBA74" />
                      <path d="M14 46C14 38 18 35 24 35C30 35 34 38 34 46" fill="#00205B" />
                      <path d="M22 35L24 40L26 35H22Z" fill="#FF5E00" />
                      <rect x="34" y="14" width="18" height="12" rx="4" fill="#38BDF8" />
                      <path d="M38 26L35 30V26H38Z" fill="#38BDF8" />
                      <circle cx="39" cy="20" r="1.5" fill="#FFFFFF" />
                      <circle cx="43" cy="20" r="1.5" fill="#FFFFFF" />
                      <circle cx="47" cy="20" r="1.5" fill="#FFFFFF" />
                      <circle cx="44" cy="38" r="8" fill="#10B981" />
                      <path d="M40 38L43 41L48 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, paddingRight: "10px", lineHeight: 1.3, color: "#FFFFFF" }}>
                      Tes Online &<br />Interview
                    </h3>
                    <span style={{ fontSize: "44px", fontWeight: 900, lineHeight: 0.9, opacity: 0.95, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                      04
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Ikuti tes kompetensi online dan tahapan wawancara bersama tim rekrutmen profesional.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 05 - Offering & Bergabung (Full Width Span) */}
              <div style={{ gridColumn: "1 / -1", marginTop: "10px" }} className="card-5-wrapper">
                <AnimatedCard delay={500}>
                  <div style={{
                    background: "linear-gradient(135deg, #FF5E00 0%, #FF8A3D 100%)",
                    borderRadius: "24px",
                    padding: "36px 32px 32px 36px",
                    color: "#FFFFFF",
                    position: "relative",
                    boxShadow: "0 20px 44px rgba(255,94,0,0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "20px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 28px 56px rgba(255,94,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 20px 44px rgba(255,94,0,0.3)";
                  }}>
                    {/* Floating Illustrated Badge */}
                    <div style={{
                      position: "absolute",
                      top: "-20px",
                      left: "-14px",
                      width: "60px",
                      height: "60px",
                      background: "#FFFFFF",
                      borderRadius: "18px",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                        <path d="M22 14H42V26C42 32 37 36 32 36C27 36 22 32 22 26V14Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                        <path d="M22 18H16C16 26 22 26 22 26V18Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                        <path d="M42 18H48C48 26 42 26 42 26V18Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                        <rect x="28" y="36" width="8" height="8" fill="#D97706" />
                        <rect x="20" y="44" width="24" height="6" rx="2" fill="#FF5E00" />
                        <path d="M32 20L33.5 23.5L37 24L34.5 26.5L35 30L32 28L29 30L29.5 26.5L27 24L30.5 23.5L32 20Z" fill="#FFFFFF" />
                      </svg>
                    </div>

                    <div style={{ paddingLeft: "40px", flex: 1, minWidth: "220px" }}>
                      <div style={{ display: "inline-block", background: "rgba(255,255,255,0.25)", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tahap Akhir
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#FFFFFF", lineHeight: 1.3 }}>
                        Offering & Onboarding KAI Services
                      </h3>
                      <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.95)", margin: 0 }}>
                        Terima surat penawaran resmi (offering letter), penandatanganan kontrak, dan selamat bergabung bersama keluarga besar KAI Services!
                      </p>
                    </div>

                    <div style={{ fontSize: "56px", fontWeight: 900, lineHeight: 1, opacity: 0.95, color: "#FFFFFF", letterSpacing: "-0.04em", paddingRight: "16px" }}>
                      05
                    </div>
                  </div>
                </AnimatedCard>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="lowongan" style={{ padding: "80px 32px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#00205B", marginBottom: "8px", letterSpacing: "-0.02em" }}>Lowongan Tersedia</h2>
                <p style={{ fontSize: "16px", color: "#666666" }}>{filteredJobs.length} posisi terbuka untuk Anda</p>
              </div>
              <Link href="/auth/register">
                <button style={{ padding: "14px 28px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>Lamar Sekarang</button>
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div style={{ marginBottom: "28px" }}>
              <input type="text" placeholder="Cari posisi atau lokasi..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", maxWidth: "440px", height: "52px", padding: "0 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "15px", outline: "none", background: "#ffffff" }} />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "10px 20px", borderRadius: "24px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                  background: activeFilter === f ? "#00205B" : "#ffffff", color: activeFilter === f ? "#ffffff" : "#666666", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.2s"
                }}>{f}</button>
              ))}
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }} className="jobs-grid">
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px" }}>
                <p style={{ color: "#666666" }}>Memuat lowongan...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px" }}>
                <p style={{ color: "#666666" }}>Tidak ada lowongan tersedia</p>
              </div>
            ) : (
              filteredJobs.map((job, i) => {
                const startDate = new Date(job.startDate);
                const deadline = new Date(job.deadline);
                const isOpen = now >= startDate && now <= deadline;
                const isUpcoming = now < startDate;
                const isClosed = now > deadline;

                return (
                <AnimatedCard key={job.id} delay={i * 100}>
                  <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.3s, box-shadow 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <span style={{
                        padding: "6px 14px",
                        borderRadius: "14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: isOpen ? "#dcfce7" : isUpcoming ? "#fef3c7" : "#fee2e2",
                        color: isOpen ? "#16a34a" : isUpcoming ? "#d97706" : "#dc2626"
                      }}>
                        {isOpen ? "Pendaftaran Terbuka" : isUpcoming ? "Segera Hadir" : "Pendaftaran Ditutup"}
                      </span>
                      <span style={{ fontSize: "13px", color: "#999999", fontWeight: 500 }}>{job.applicantCount || 0} pelamar</span>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111111", marginBottom: "12px", lineHeight: 1.4 }}>{job.title}</h3>
                    <div style={{ fontSize: "14px", color: "#666666", marginBottom: "20px", lineHeight: 1.6 }}>
                      <div style={{ marginBottom: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {job.location || "-"}
                      </div>
                      <div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {new Date(job.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    {isOpen ? (
                      <Link href={`/auth/register?job=${job.id}`}>
                        <button style={{ width: "100%", padding: "14px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Lamar Posisi Ini</button>
                      </Link>
                    ) : isUpcoming ? (
                      <div style={{ width: "100%", padding: "14px", background: "#f1f5f9", color: "#666666", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                        Pendaftaran akan dibuka {new Date(job.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    ) : (
                      <div style={{ width: "100%", padding: "14px", background: "#f1f5f9", color: "#999999", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                        Pendaftaran sudah ditutup
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              );
              })
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" style={{ padding: "80px 32px", background: "#ffffff", color: "#111111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="about-grid-container">
            <AnimatedSection>
              {/* About Image */}
              <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,32,91,0.15)" }}>
                <img
                  src="/kais-about.jpg"
                  alt="Tentang KAI Services"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#00205B", marginBottom: "24px", letterSpacing: "-0.02em" }}>Tentang KAI Services</h2>
              <p style={{ color: "#666666", lineHeight: 1.8, marginBottom: "20px", fontSize: "16px" }}>
                PT Reska Multi Usaha (KAI Services) adalah anak perusahaan dari PT Kereta Api Indonesia (Persero) yang didirikan pada tahun 2003. Kami menyediakan jasa pendukung operasional kereta api.
              </p>
              <p style={{ color: "#666666", lineHeight: 1.8, marginBottom: "40px", fontSize: "16px" }}>
                Dengan pengalaman lebih dari 20 tahun, kami berkomitmen memberikan layanan berkualitas bagi lebih dari 5.000 karyawan di seluruh Indonesia.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
                <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>20+</div><div style={{ fontSize: "14px", color: "#888888", fontWeight: 500 }}>Tahun Pengalaman</div></div>
                <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>5,000+</div><div style={{ fontSize: "14px", color: "#888888", fontWeight: 500 }}>Karyawan</div></div>
                <div><div style={{ fontSize: "36px", fontWeight: 800, color: "#FF5E00", marginBottom: "8px" }}>18</div><div style={{ fontSize: "14px", color: "#888888", fontWeight: 500 }}>Kota Branch</div></div>
              </div>
            </AnimatedSection>
          </div>

          {/* Features Grid */}
          <AnimatedSection>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", alignItems: "stretch", marginTop: "60px" }} className="about-grid">
              {[
                { title: "BUMN Terpercaya", desc: "Bagian dari KAI Indonesia", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/></svg> },
                { title: "Pelatihan Berkala", desc: "Pengembangan kompetensi", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
                { title: "Benefit Lengkap", desc: "Kesejahteraan karyawan", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { title: "Inovasi Digital", desc: "Sistem modern", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
              ].map((item, i) => (
                <AnimatedCard key={i} delay={i * 100}>
                  <div style={{ background: "#f8f9fa", padding: "28px", borderRadius: "16px", border: "1px solid #eeeeee", display: "flex", flexDirection: "column", height: "100%", minHeight: "200px", transition: "transform 0.3s, box-shadow 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ marginBottom: "14px", flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#111111" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: "#666666" }}>{item.desc}</div>
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
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes heroSlideFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Desktop only nav */
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .header-actions { display: none !important; }
        }

        /* Mobile header */
        .mobile-header {
          display: none;
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: #ffffff;
            border-bottom: 1px solid #eeeeee;
            padding: 12px 16px;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* Grid adjustments */
        @media (max-width: 900px) {
          section > div:first-child { grid-template-columns: 1fr !important; gap: 48px !important; }
        }

        /* Benefits grid */
        @media (max-width: 768px) {
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .jobs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .benefits-grid { grid-template-columns: 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; }
          .jobs-grid { grid-template-columns: 1fr !important; }
        }

        /* Jobs grid class */
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        /* Hero mobile */
        @media (max-width: 1024px) {
          .hero-content {
            padding: 120px 16px 60px !important;
          }
          .hero-stats {
            display: none !important;
          }
        }

        /* How to Apply Section (Pelni Style) */
        @media (max-width: 1024px) {
          .how-to-apply-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }

        @media (max-width: 640px) {
          .how-to-apply-cards {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .staggered-card-2, .staggered-card-4 {
            margin-top: 0 !important;
          }
        }

        /* About section mobile */
        @media (max-width: 768px) {
          .about-grid-container {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }

        /* Footer mobile */
        @media (max-width: 480px) {
          footer > div {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
