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
    image: "https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/ccv2%2F2026-09-03%2FMiniMax-M2.7%2F2044203945915593601%2Fdff023d67b5e2324fe49a16f4ef8cde9de85382c081cf6b514bf67b66abf1049..png?Expires=1788504959&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=hCR1%2BUhJEbvFuqTrsVTZsfod%2FNk%3D",
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

  // For non-numeric characters (letters, spaces, symbols), just display them without animation
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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload all hero images before showing slideshow
  useEffect(() => {
    const imagePromises = heroSlides.map((slide) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if one fails
        img.src = slide.image;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  // Trigger stats rolling wheel animation on initial mount / page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStatsRolling(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance background slideshow - only start when images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imagesLoaded]);

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

          <nav style={{ display: "flex", gap: "32px" }} className="desktop-nav">
            <a href="#mengapa" style={{ fontSize: "14px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Mengapa Bergabung?</a>
            <a href="#cara-melamar" style={{ fontSize: "14px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Cara Melamar</a>
            <a href="#lowongan" style={{ fontSize: "14px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Lowongan</a>
            <a href="#tentang" style={{ fontSize: "14px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Tentang</a>
            <a href="#kontak" style={{ fontSize: "14px", color: "#555555", textDecoration: "none", fontWeight: 500 }}>Kontak</a>
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
      <section style={{ paddingTop: "72px", position: "relative", color: "#ffffff", height: "calc(100vh - 72px)", minHeight: "600px", maxHeight: "900px", overflow: "hidden" }}>
        {/* Background Image Slideshow with fixed height */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
          {/* Placeholder background while loading */}
          {!imagesLoaded && (
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", zIndex: 0 }} />
          )}

          {heroSlides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: currentSlide === index ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
              }}
            />
          ))}
        </div>

        {/* Light Overlay for better image visibility */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(0,32,91,0.45) 0%, rgba(12,35,64,0.35) 100%)", zIndex: 1 }} />

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
            <div
              key={currentSlide}
              style={{
                animation: `heroSlideFadeIn-${currentSlide} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`
              }}
            >
              <style>{`
                @keyframes heroSlideFadeIn-${currentSlide} {
                  from {
                    opacity: 0;
                    transform: translateY(16px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
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
                  { v: "12,000+", l: "Total Pelamar" },
                  { v: "24", l: "Posisi Terbuka" },
                  { v: "1,200", l: "Terserap 2025" },
                  { v: "18", l: "Kota" }
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
      <section id="mengapa" style={{ minHeight: "100vh", padding: "80px 32px", background: "#f8f9fa", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#00205B", marginBottom: "14px", letterSpacing: "-0.02em" }}>Mengapa Bergabung?</h2>
              <p style={{ fontSize: "16px", color: "#666666", maxWidth: "500px", margin: "0 auto" }}>Kesempatan karier stabil di lingkungan perusahaan BUMN terpercaya</p>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", alignItems: "stretch" }} className="benefits-grid">
            {[
              { title: "Asuransi Kesehatan", desc: "BPJS & Asuransi Tambahan", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { title: "Cuti & Tunjangan", desc: "THR, cuti tahunan & hari besar", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { title: "Jenjang Karier", desc: "Pelatihan & pengembangan skill", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
              { title: "Lingkungan Kerja", desc: "Profesional & suportif", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
            ].map((b, i) => (
              <AnimatedCard key={i} delay={i * 100}>
                <div style={{ background: "#ffffff", padding: "32px", borderRadius: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.3s, box-shadow 0.3s", display: "flex", flexDirection: "column", height: "100%", minHeight: "280px", justifyContent: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                  <div style={{ width: "64px", height: "64px", background: "#f0f4ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", flexShrink: 0 }}>{b.icon}</div>
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
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
              gap: "20px",
              position: "relative"
            }} className="how-to-apply-cards">

              {/* Card 01 - Registrasi */}
              <AnimatedCard delay={100}>
                <div style={{
                  background: "linear-gradient(135deg, #00205B 0%, #003380 100%)",
                  borderRadius: "20px",
                  padding: "32px 24px 24px 24px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 12px 28px rgba(0,32,91,0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,32,91,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,32,91,0.2)";
                }}>
                  {/* Step Number Badge at top right */}
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}>
                    01
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3, color: "#FFFFFF", paddingRight: "40px" }}>
                    Registrasikan<br />Akun Anda
                  </h3>

                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.85)", margin: 0 }}>
                    Daftarkan diri Anda untuk membuat akun pribadi di platform rekrutmen kami.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 02 - Lengkapi Data Diri */}
              <AnimatedCard delay={200}>
                <div style={{
                  background: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
                  borderRadius: "20px",
                  padding: "28px 20px 20px 24px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 12px 28px rgba(2,132,199,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(2,132,199,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(2,132,199,0.25)";
                }}>
                  {/* Step Number Badge at top right */}
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}>
                    02
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3, color: "#FFFFFF", paddingRight: "40px" }}>
                    Lengkapi Data<br />Diri Anda
                  </h3>

                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Sampaikan informasi tentang diri Anda dengan mengunggah CV atau Resume Anda ke dalam akun Anda.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 03 - Cari Lowongan */}
              <AnimatedCard delay={300}>
                <div style={{
                  background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
                  borderRadius: "20px",
                  padding: "32px 24px 24px 24px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 12px 28px rgba(29,78,216,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(29,78,216,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(29,78,216,0.25)";
                }}>
                  {/* Step Number Badge at top right */}
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}>
                    03
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3, color: "#FFFFFF", paddingRight: "40px" }}>
                    Pilih Karir<br />Impian Anda
                  </h3>

                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Telusuri beragam lowongan pekerjaan yang sesuai dengan minat dan keterampilan Anda.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 04 - Tes & Interview */}
              <AnimatedCard delay={400}>
                <div style={{
                  background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
                  borderRadius: "20px",
                  padding: "28px 20px 20px 24px",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 12px 28px rgba(30,41,59,0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(30,41,59,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(30,41,59,0.25)";
                }}>
                  {/* Step Number Badge at top right */}
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}>
                    04
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3, color: "#FFFFFF", paddingRight: "40px" }}>
                    Tes Online &<br />Interview
                  </h3>

                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    Ikuti tes kompetensi online dan tahapan wawancara bersama tim rekrutmen profesional.
                  </p>
                </div>
              </AnimatedCard>

              {/* Card 05 - Offering & Bergabung (Full Width Span) */}
              <div style={{ gridColumn: "1 / -1" }} className="card-5-wrapper">
                <AnimatedCard delay={500}>
                  <div style={{
                    background: "linear-gradient(135deg, #FF5E00 0%, #FF8A3D 100%)",
                    borderRadius: "20px",
                    padding: "32px 24px 28px 24px",
                    color: "#FFFFFF",
                    position: "relative",
                    boxShadow: "0 16px 36px rgba(255,94,0,0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "24px",
                    flexWrap: "wrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 24px 48px rgba(255,94,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 16px 36px rgba(255,94,0,0.3)";
                  }}>
                    {/* Step Number Badge */}
                    <div style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      flexShrink: 0
                    }}>
                      05
                    </div>

                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "inline-block", background: "rgba(255,255,255,0.25)", padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tahap Akhir
                      </div>
                      <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px 0", color: "#FFFFFF", lineHeight: 1.3 }}>
                        Offering & Onboarding KAI Services
                      </h3>
                      <p style={{ fontSize: "14px", lineHeight: 1.5, color: "rgba(255,255,255,0.95)", margin: 0 }}>
                        Terima surat penawaran resmi (offering letter), penandatanganan kontrak, dan selamat bergabung bersama keluarga besar KAI Services!
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="lowongan" style={{ padding: "100px 32px", background: "#f8f9fa" }}>
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
                  <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.3s, box-shadow 0.3s", minHeight: "280px", display: "flex", flexDirection: "column" }}
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
                        <button style={{ width: "100%", padding: "14px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "auto" }}>Lamar Posisi Ini</button>
                      </Link>
                    ) : isUpcoming ? (
                      <div style={{ width: "100%", padding: "14px", background: "#f1f5f9", color: "#666666", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textAlign: "center", marginTop: "auto" }}>
                        Pendaftaran akan dibuka {new Date(job.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    ) : (
                      <div style={{ width: "100%", padding: "14px", background: "#f1f5f9", color: "#999999", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textAlign: "center", marginTop: "auto" }}>
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
      <section id="tentang" style={{ padding: "100px 32px", background: "#ffffff", color: "#111111" }}>
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
      <section style={{ padding: "100px 32px", background: "#FF5E00", textAlign: "center", color: "#ffffff" }}>
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
      <footer style={{ padding: "60px 32px 40px", background: "#00205B", color: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }} className="footer-grid">

            {/* Company Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "18px" }}>KAI Services</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>PT Reska Multi Usaha</div>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "20px" }}>
                Anak perusahaan PT Kereta Api Indonesia (KAI) yang bergerak di bidang jasa pendukung operasional kereta api sejak 2003.
              </p>
              {/* Social Links */}
              <div style={{ display: "flex", gap: "12px" }}>
                <a href="#" style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FF5E00"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FF5E00"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FF5E00"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#ffffff" }}>Menu</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="#mengapa" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Mengapa Bergabung?</a>
                <a href="#cara-melamar" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Cara Melamar</a>
                <a href="#lowongan" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Lowongan</a>
                <a href="#tentang" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Tentang Kami</a>
                <a href="#kontak" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Hubungi Kami</a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#ffffff" }}>Kontak</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <svg width="18" height="18" fill="none" stroke="#FF5E00" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "2px" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Jl. Perintis Kemerdekaan No. 1, Jakarta 10310</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" fill="none" stroke="#FF5E00" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>(021) 1234-5678</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" fill="none" stroke="#FF5E00" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>hrd@kai-services.co.id</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#ffffff" }}>Jam Operasional</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>Senin - Jumat</span><br/>
                  08.00 - 16.00 WIB
                </div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>Sabtu - Minggu</span><br/>
                  Tutup
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
              © 2026 PT Reska Multi Usaha. Bagian dari PT Kereta Api Indonesia.
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>Kebijakan Privasi</a>
              <a href="#" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #FF5E00 0%, #FF8A3D 100%)',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255, 94, 0, 0.4)',
            zIndex: 99,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 94, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 94, 0, 0.4)';
          }}
          aria-label="Scroll to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}

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

        /* Mengapa section full height responsive */
        @media (max-width: 768px) {
          #mengapa {
            min-height: auto !important;
            padding: 60px 20px !important;
          }
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
        }

        /* About section mobile */
        @media (max-width: 768px) {
          .about-grid-container {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }

        /* Footer mobile */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          footer > div > div:first-child {
            flex-direction: column !important;
            text-align: center !important;
          }
          footer > div > div:last-child {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
