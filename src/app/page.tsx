"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import JobQuickViewModal, { JobDetail } from "@/components/recruitment/JobQuickViewModal";
import CareerMatcherModal from "@/components/recruitment/CareerMatcherModal";
import InteractiveRoadmap from "@/components/recruitment/InteractiveRoadmap";
import FAQSection from "@/components/recruitment/FAQSection";
import BenefitsShowcase from "@/components/recruitment/BenefitsShowcase";
import FloatingChat from "@/components/FloatingChat";
import { useAuthStore } from "@/stores/auth";
import { Bookmark, Sparkles, Eye, Share2, Compass, CheckCircle2, Menu, X, ShieldCheck, Info, ChevronRight, UserCheck } from "lucide-react";

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
    image: "/images/hero-1.png",
    badge: "PT Reska Multi Usaha - Anak Perusahaan KAI",
    titleLine1: "Bergabung dengan",
    titleHighlight: "Keluarga Besar",
    titleLine2: "KAI Services",
    description: "Jadilah bagian dari perusahaan railway terbesar di Indonesia. Kami mencari talenta terbaik untuk memberikan layanan kereta api terbaik.",
    tag: "KAI Services",
  },
  {
    image: "/images/hero-2.jpg",
    badge: "Layanan Kebersihan & Fasilitas - RESClean",
    titleLine1: "Wujudkan Standar",
    titleHighlight: "Kebersihan & Kenyamanan",
    titleLine2: "Armada Kereta Api",
    description: "Bergabunglah bersama tim profesional RESClean dalam menjaga standar kebersihan, higienitas, dan kenyamanan seluruh armada serta stasiun kereta api di Indonesia.",
    tag: "RESClean",
  },
  {
    image: "/images/hero-3.jpg",
    badge: "Kuliner & Restorasi Kereta Api - On Train Culinary",
    titleLine1: "Sajikan Cita Rasa",
    titleHighlight: "Kuliner Nusantara",
    titleLine2: "Di Atas Rel Kereta",
    description: "Kembangkan keahlian kuliner Anda bersama tim Chef dan Katering KAI Services untuk menghadirkan pengalaman hidangan lezat berstandar tinggi bagi jutaan penumpang.",
    tag: "Culinary",
  },
  {
    image: "/images/hero-4.png",
    badge: "Manajemen Kawasan Stasiun - ResParking",
    titleLine1: "Kelola Layanan Parkir",
    titleHighlight: "Modern & Terintegrasi",
    titleLine2: "Di Seluruh Stasiun",
    description: "Tingkatkan efisiensi mobilitas masyarakat dengan bergabung di divisi manajemen parkir dan pelayanan terdepan kawasan stasiun kereta api modern.",
    tag: "ResParking",
  },
  {
    image: "/images/hero-5.png",
    badge: "Hospitality & Barista - Loko Coffee Shop",
    titleLine1: "Karier Kreatif di",
    titleHighlight: "Loko Coffee Shop",
    titleLine2: "Kafe Ikonik Kereta Api",
    description: "Salurkan passion barista dan hospitality Anda di jaringan coffee shop ternama KAI Services yang selalu menemani momen perjalanan dan kehangatan pelanggan.",
    tag: "Loko Coffee",
  },
  {
    image: "/images/hero-6.png",
    badge: "Keamanan & Pelayanan - Security & Customer Care",
    titleLine1: "Berikan Rasa Aman &",
    titleHighlight: "Pelayanan Sepenuh Hati",
    titleLine2: "Untuk Pelanggan KAI",
    description: "Jadilah garda terdepan keamanan dan kenyamanan stasiun, melayani jutaan penumpang kereta api setiap hari dengan integritas dan dedikasi prima.",
    tag: "Security Care",
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
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [isStatsRolling, setIsStatsRolling] = useState(false);
  // Popup Pemberitahuan Penting muncul setiap membuka web dan me-refresh web
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New states: Bookmark, Quick View Modal, Career Matcher
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isCareerMatcherOpen, setIsCareerMatcherOpen] = useState(false);

  // Announcement modal - only opens when user clicks "Info Resmi" button
  const handleDismissAnnouncement = () => {
    setShowAnnouncement(false);
  };

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kai_saved_jobs");
      if (stored) {
        setSavedJobIds(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleBookmark = (jobId: string) => {
    setSavedJobIds((prev) => {
      let updated: string[];
      if (prev.includes(jobId)) {
        updated = prev.filter((id) => id !== jobId);
      } else {
        updated = [...prev, jobId];
      }
      try {
        localStorage.setItem("kai_saved_jobs", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Track scroll position for header glassmorphism and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Auto-advance background slideshow - pauses on user hover
  useEffect(() => {
    if (!imagesLoaded || isSlidePaused) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imagesLoaded, isSlidePaused]);

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
    if (activeFilter === "Tersimpan") {
      return savedJobIds.includes(job.id);
    }
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
            if (e.target === e.currentTarget) handleDismissAnnouncement();
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              maxWidth: "520px",
              maxHeight: "90vh",
              width: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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
                onClick={handleDismissAnnouncement}
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
                aria-label="Tutup Pengumuman"
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
            <div style={{ padding: "28px 28px 24px", overflowY: "auto", flex: 1 }}>
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
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  onClick={handleDismissAnnouncement}
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

      {/* Floating Glass Island Navbar (Model 1) */}
      <header
        className="glass-navbar-wrapper"
        style={{
          position: "fixed",
          top: isScrolled ? "10px" : "16px",
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          padding: "0 16px",
          transition: "top 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="glass-navbar-island"
          style={{
            pointerEvents: "auto",
            maxWidth: "1220px",
            width: "100%",
            height: "64px",
            background: isScrolled
              ? "rgba(255, 255, 255, 0.94)"
              : "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.65)",
            borderRadius: "9999px",
            boxShadow: isScrolled
              ? "0 14px 36px rgba(0, 32, 91, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04)"
              : "0 10px 30px rgba(0, 32, 91, 0.10), 0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px 0 20px",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Brand Identity */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img
              src="/_logo_kais.png"
              alt="KAI Services"
              style={{ width: "38px", height: "38px", objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#00205B", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                KAI Services
              </div>
              <div style={{ fontSize: "10px", color: "#64748B", lineHeight: 1.1, fontWeight: 600 }}>
                PT Reska Multi Usaha
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="glass-nav-links" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[
              { label: "Mengapa Bergabung?", href: "#mengapa" },
              { label: "Alur Seleksi", href: "#roadmap" },
              { label: "Lowongan", href: "#lowongan" },
              { label: "FAQ", href: "#faq" },
              { label: "Tentang", href: "#tentang" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="glass-nav-link"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Info Bebas Biaya Badge Button */}
            <button
              onClick={() => setShowAnnouncement(true)}
              className="glass-nav-info-btn"
              title="Informasi Resmi Rekrutmen Bebas Biaya"
            >
              <ShieldCheck size={14} color="#c2410c" />
              <span>Info Resmi</span>
            </button>

            {/* Auth / Profile Area */}
            {isAuthenticated && user ? (
              <Link
                href={user.role === "APPLICANT" ? "/applicant/dashboard" : "/admin/dashboard"}
                style={{ textDecoration: "none" }}
              >
                <div className="glass-user-badge">
                  <div className="glass-user-avatar">
                    {user.fullName
                      ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "U"}
                  </div>
                  <div className="glass-user-text">
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#00205B", display: "block", lineHeight: 1.1 }}>
                      Dashboard
                    </span>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block", lineHeight: 1 }}>
                      {user.role === "APPLICANT" ? "Pelamar" : "Admin"}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass-auth-group">
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <button className="glass-btn-login">
                    Masuk
                  </button>
                </Link>
                <Link href="/auth/register" style={{ textDecoration: "none" }}>
                  <button className="glass-btn-register">
                    Daftar
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-mobile-toggle"
              aria-label="Menu Navigasi"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Floating Glass Mobile Drawer */}
        {isMobileMenuOpen && (
          <div
            className="glass-mobile-drawer"
            style={{
              pointerEvents: "auto",
              position: "fixed",
              top: isScrolled ? "72px" : "78px",
              left: "16px",
              right: "16px",
              maxWidth: "500px",
              margin: "0 auto",
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              borderRadius: "24px",
              boxShadow: "0 20px 50px rgba(0, 32, 91, 0.22)",
              zIndex: 999,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              animation: "glassDrawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {[
              { label: "Mengapa Bergabung?", href: "#mengapa" },
              { label: "Alur Seleksi", href: "#roadmap" },
              { label: "Lowongan Tersedia", href: "#lowongan" },
              { label: "Tentang KAI Services", href: "#tentang" },
              { label: "FAQ", href: "#faq" },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1e293b",
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "rgba(241, 245, 249, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background 0.2s",
                }}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} color="#94a3b8" />
              </a>
            ))}

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCareerMatcherOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#00205B",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <Sparkles size={15} color="#FF5E00" />
                <span>Career Matcher</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowAnnouncement(true);
                }}
                style={{
                  padding: "12px 14px",
                  background: "#fff7ed",
                  color: "#c2410c",
                  border: "1px solid #fed7aa",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <ShieldCheck size={16} />
                <span>Info</span>
              </button>
            </div>
          </div>
        )}
      </header>


      {/* Hero Section */}
      <section
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        className="hero-section"
        style={{
          position: "relative",
          color: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Background Image Slideshow with smooth crossfade & Ken Burns zoom */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
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
                transform: currentSlide === index ? "scale(1.05)" : "scale(1)",
                transition: "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 6s cubic-bezier(0.25, 1, 0.5, 1)",
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
              }}
            />
          ))}
        </div>

        {/* Dual-Gradient Overlay - ensures readability across all devices */}
        <div className="hero-gradient-overlay" />

        {/* Floating Side Navigation Arrows (Model A - Glassmorphic, non-colliding) */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="hero-side-arrow hero-side-arrow-left"
          aria-label="Slide sebelumnya"
          title="Slide sebelumnya"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "-2px" }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="hero-side-arrow hero-side-arrow-right"
          aria-label="Slide berikutnya"
          title="Slide berikutnya"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "-2px" }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Hero Main Content Container */}
        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Column: Slide Text & Persistent Buttons */}
            <div className="hero-left">
              {/* Dynamic Slide Content (Stable container to prevent button jumping) */}
              <div className="hero-text-wrapper">
                <div key={currentSlide} className="hero-slide-anim">
                  {/* Badge */}
                  <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    <span>{heroSlides[currentSlide]?.badge}</span>
                  </div>

                  {/* Headline with natural wrap and accent highlight */}
                  <h1 className="hero-title">
                    <span>{heroSlides[currentSlide]?.titleLine1} </span>
                    <span style={{ color: "#FF5E00" }}>{heroSlides[currentSlide]?.titleHighlight} </span>
                    <span>{heroSlides[currentSlide]?.titleLine2}</span>
                  </h1>

                  {/* Description */}
                  <p className="hero-desc">
                    {heroSlides[currentSlide]?.description}
                  </p>
                </div>
              </div>

              {/* Persistent Action Buttons (Firmly anchored - never jumps or re-renders) */}
              <div className="hero-cta-group">
                <Link href="/auth/register">
                  <button className="hero-btn-primary">
                    <span>Daftar Sekarang</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </Link>
                <Link href="#lowongan">
                  <button className="hero-btn-secondary">
                    Lihat Lowongan
                  </button>
                </Link>
                <button
                  onClick={() => setIsCareerMatcherOpen(true)}
                  className="hero-btn-ai"
                >
                  <Sparkles size={17} color="#FF5E00" />
                  <span>Career Matcher AI</span>
                </button>
              </div>

              {/* Tablet & Mobile Compact Social Proof Ribbon */}
              <div className="hero-mobile-stats">
                {[
                  { v: "12,000+", l: "Total Pelamar" },
                  { v: activeJobs.length > 0 ? String(activeJobs.length) : "24", l: "Lowongan" },
                  { v: "1,200+", l: "Terserap 2025" },
                  { v: "18+", l: "Kota Operasional" },
                ].map((s, i) => (
                  <div key={i} className="hero-mobile-stat-item">
                    <span className="hero-mobile-stat-val">{s.v}</span>
                    <span className="hero-mobile-stat-lbl">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Desktop Stats Card with refined Glassmorphism */}
            <div className="hero-stats-desktop">
              <AnimatedSection delay={200}>
                <div className="hero-stats-card">
                  <div className="hero-stats-header">
                    <div className="hero-stats-indicator">
                      <span className="hero-stats-pulse" />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Perekrutan Aktif 2025/2026
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)", padding: "4px 9px", borderRadius: "6px", fontWeight: 600 }}>
                      Resmi KAI
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "28px" }}>
                    {[
                      { v: "12,000+", l: "Total Pelamar" },
                      { v: activeJobs.length > 0 ? String(activeJobs.length) : "24", l: "Posisi Terbuka" },
                      { v: "1,200+", l: "Terserap 2025" },
                      { v: "18+", l: "Kota Operasional" }
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: "left", borderLeft: "2px solid rgba(255,94,0,0.5)", paddingLeft: "14px" }}>
                        <div style={{ fontSize: "34px", fontWeight: 800, color: "#FF5E00", lineHeight: 1.1, marginBottom: "4px" }}>
                          <RollingText text={s.v} delay={i * 0.15} isRolling={isStatsRolling} />
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Bottom Slide Indicators (Dots Centered) */}
          <div className="hero-indicators-bar">
            {heroSlides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`hero-pill-btn ${currentSlide === index ? "active" : ""}`}
                aria-label={`Pindah ke slide ${index + 1}: ${slide.tag}`}
                title={slide.tag}
              >
                {currentSlide === index && (
                  <span
                    key={`progress-${currentSlide}`}
                    className="hero-pill-progress"
                    style={{
                      animationPlayState: isSlidePaused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Showcase (Mengapa Bergabung) */}
      <BenefitsShowcase />




      {/* Interactive Selection Roadmap */}
      <div id="roadmap">
        <InteractiveRoadmap />
      </div>

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

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px", alignItems: "center" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "10px 20px", borderRadius: "24px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                  background: activeFilter === f ? "#00205B" : "#ffffff", color: activeFilter === f ? "#ffffff" : "#666666", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.2s"
                }}>{f}</button>
              ))}
              <button
                onClick={() => setActiveFilter(activeFilter === "Tersimpan" ? "Semua" : "Tersimpan")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: activeFilter === "Tersimpan" ? "2px solid #FF5E00" : "1px solid #e2e8f0",
                  cursor: "pointer",
                  background: activeFilter === "Tersimpan" ? "#fff7ed" : "#ffffff",
                  color: activeFilter === "Tersimpan" ? "#FF5E00" : "#4b5563",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <Bookmark size={15} fill={activeFilter === "Tersimpan" ? "#FF5E00" : "none"} />
                Tersimpan ({savedJobIds.length})
              </button>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }} className="jobs-grid">
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px" }}>
                <p style={{ color: "#666666" }}>Memuat lowongan...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px" }}>
                <p style={{ color: "#666666" }}>
                  {activeFilter === "Tersimpan" ? "Belum ada lowongan yang Anda simpan." : "Tidak ada lowongan tersedia"}
                </p>
              </div>
            ) : (
              filteredJobs.map((job, i) => {
                const startDate = new Date(job.startDate);
                const deadline = new Date(job.deadline);
                const isOpen = now >= startDate && now <= deadline;
                const isUpcoming = now < startDate;
                const isClosed = now > deadline;
                const isBookmarked = savedJobIds.includes(job.id);

                return (
                <AnimatedCard key={job.id} delay={i * 100}>
                  <div
                    className="card-hover-lift"
                    style={{
                      background: "#ffffff",
                      padding: "28px",
                      borderRadius: "18px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      border: "1px solid #f1f5f9",
                      minHeight: "300px",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", color: "#999999", fontWeight: 500 }}>{job.applicantCount || 0} pelamar</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(job.id);
                          }}
                          title={isBookmarked ? "Hapus bookmark" : "Simpan lowongan"}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: isBookmarked ? "#fff7ed" : "#f1f5f9",
                            border: isBookmarked ? "1.5px solid #FF5E00" : "1px solid #e2e8f0",
                            color: isBookmarked ? "#FF5E00" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <Bookmark size={15} fill={isBookmarked ? "#FF5E00" : "none"} />
                        </button>
                      </div>
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

                    <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px" }}>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsQuickViewOpen(true);
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          background: "#eff6ff",
                          color: "#00205B",
                          border: "1px solid #dbeafe",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          transition: "all 0.2s",
                        }}
                      >
                        <Eye size={15} />
                        Detail
                      </button>
                      {isOpen ? (
                        <Link
                          href={isAuthenticated && user?.role === "APPLICANT" ? "/applicant/jobs" : `/auth/register?job=${job.id}`}
                          style={{ flex: 1.4, textDecoration: "none" }}
                        >
                          <button
                            style={{
                              width: "100%",
                              padding: "12px",
                              background: "#FF5E00",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "10px",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 4px 12px rgba(255,94,0,0.3)",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,94,0,0.45)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,94,0,0.3)";
                            }}
                          >
                            Lamar Posisi
                          </button>
                        </Link>
                      ) : isUpcoming ? (
                        <div style={{ flex: 1.4, padding: "12px", background: "#f1f5f9", color: "#666666", borderRadius: "10px", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
                          Segera Hadir
                        </div>
                      ) : (
                        <div style={{ flex: 1.4, padding: "12px", background: "#f1f5f9", color: "#999999", borderRadius: "10px", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
                          Ditutup
                        </div>
                      )}
                    </div>
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

      {/* FAQ Section */}
      <FAQSection />

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
                <a href="#roadmap" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF5E00"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>Alur Seleksi</a>
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

      {/* Scroll to Top Button (Positioned above FloatingChat) */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '46px',
            height: '46px',
            background: 'linear-gradient(135deg, #00205B 0%, #0C2340 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 32, 91, 0.35)',
            zIndex: 90,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 94, 0, 0.45)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #FF5E00 0%, #FF8A3D 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 32, 91, 0.35)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #00205B 0%, #0C2340 100%)';
          }}
          aria-label="Scroll to top"
          title="Kembali ke Atas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        section, div[id] {
          scroll-margin-top: 80px;
        }

        @keyframes mobileMenuSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        /* Floating Glass Island Navbar Styles */
        .glass-nav-link {
          font-size: 13.5px;
          color: #334155;
          text-decoration: none;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 9999px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
        }
        .glass-nav-link:hover {
          background: rgba(0, 32, 91, 0.06);
          color: #FF5E00;
        }

        .glass-nav-info-btn {
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
          border-radius: 9999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }
        .glass-nav-info-btn:hover {
          background: #ffedd5;
          border-color: #fdba74;
        }

        .glass-user-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 6px;
          background: rgba(0, 32, 91, 0.05);
          border: 1px solid rgba(0, 32, 91, 0.1);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .glass-user-badge:hover {
          background: rgba(0, 32, 91, 0.1);
        }
        .glass-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00205B 0%, #FF5E00 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .glass-auth-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .glass-btn-login {
          padding: 8px 16px;
          font-size: 13.5px;
          font-weight: 600;
          color: #00205B;
          background: transparent;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .glass-btn-login:hover {
          background: rgba(0, 32, 91, 0.06);
          color: #FF5E00;
        }

        .glass-btn-register {
          padding: 8px 20px;
          font-size: 13.5px;
          font-weight: 700;
          background: #FF5E00;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 94, 0, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .glass-btn-register:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 94, 0, 0.5);
        }

        .glass-mobile-toggle {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 32, 91, 0.05);
          border: none;
          color: #00205B;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 0.2s;
        }
        .glass-mobile-toggle:hover {
          background: rgba(0, 32, 91, 0.1);
        }

        @keyframes glassDrawerSlide {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Breakpoint for Mobile / Tablet Navbar */
        @media (max-width: 1024px) {
          .glass-nav-links {
            display: none !important;
          }
          .glass-nav-info-btn {
            display: none !important;
          }
          .glass-btn-register {
            display: none !important;
          }
          .glass-mobile-toggle {
            display: flex !important;
          }
          .glass-navbar-island {
            height: 56px !important;
            padding: 0 10px 0 16px !important;
          }
        }

        @media (max-width: 480px) {
          .glass-navbar-wrapper {
            top: 10px !important;
            padding: 0 10px !important;
          }
          .glass-btn-login {
            padding: 6px 12px !important;
            font-size: 12.5px !important;
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

        /* Hero Section Base & Responsive Styles */
        .hero-section {
          padding-top: 96px;
          min-height: 640px;
          max-height: 860px;
          height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(0,18,52,0.92) 0%, rgba(0,32,91,0.76) 50%, rgba(12,35,64,0.42) 100%);
          z-index: 1;
        }

        .hero-container {
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          padding: 36px 32px 24px;
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.16fr 0.84fr;
          gap: 60px;
          align-items: center;
          margin: auto 0;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
        }

        .hero-text-wrapper {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-slide-anim {
          animation: heroSlideCrossFade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes heroSlideCrossFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 24px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          align-self: flex-start;
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FF5E00;
          box-shadow: 0 0 8px rgba(255, 94, 0, 0.8);
        }

        .hero-title {
          font-size: clamp(32px, 4.2vw, 48px);
          font-weight: 800;
          line-height: 1.18;
          margin-bottom: 18px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .hero-desc {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.65;
          margin-bottom: 28px;
          max-width: 540px;
        }

        .hero-cta-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .hero-btn-primary {
          padding: 15px 28px;
          font-size: 15px;
          font-weight: 700;
          background: #FF5E00;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(255, 94, 0, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 94, 0, 0.55);
        }

        .hero-btn-secondary {
          padding: 15px 24px;
          font-size: 15px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.2s, border-color 0.2s;
        }
        .hero-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .hero-btn-ai {
          padding: 14px 22px;
          font-size: 14px;
          font-weight: 700;
          background: rgba(0, 32, 91, 0.75);
          color: #ffffff;
          border: 1.5px solid rgba(255, 94, 0, 0.85);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .hero-btn-ai:hover {
          transform: translateY(-2px);
          background: #00205B;
          box-shadow: 0 6px 20px rgba(255, 94, 0, 0.3);
        }

        /* Mobile / Tablet Stats Ribbon */
        .hero-mobile-stats {
          display: none;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 24px;
          padding: 14px 12px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
        }
        .hero-mobile-stat-item {
          text-align: center;
        }
        .hero-mobile-stat-val {
          display: block;
          font-size: 16px;
          font-weight: 800;
          color: #FF5E00;
          line-height: 1.1;
        }
        .hero-mobile-stat-lbl {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 2px;
          font-weight: 500;
        }

        /* Desktop Stats Card */
        .hero-stats-desktop {
          display: block;
        }
        .hero-stats-card {
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 24px;
          padding: 32px 36px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        .hero-stats-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .hero-stats-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-stats-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: statsPulse 2s infinite;
        }
        @keyframes statsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }

        /* Floating Side Navigation Arrows (Model A - Glassmorphic, non-colliding) */
        .hero-side-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }
        .hero-side-arrow:hover {
          background: #FF5E00;
          border-color: #FF5E00;
          color: #ffffff;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 10px 28px rgba(255, 94, 0, 0.55);
        }
        .hero-side-arrow-left {
          left: 28px;
        }
        .hero-side-arrow-right {
          right: 28px;
        }

        /* Bottom Slide Indicators (Dots Centered) */
        .hero-indicators-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        .hero-pill-btn {
          width: 12px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.35);
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          padding: 0;
          transition: all 0.3s ease;
        }
        .hero-pill-btn:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .hero-pill-btn.active {
          width: 44px;
          background: rgba(255, 255, 255, 0.2);
        }
        .hero-pill-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0%;
          background: #FF5E00;
          border-radius: 4px;
          animation: heroPillFill 5s linear forwards;
        }

        @keyframes heroPillFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Hero Tablet Breakpoint */
        @media (max-width: 1024px) {
          .hero-section {
            height: auto !important;
            min-height: calc(100vh - 72px) !important;
            max-height: none !important;
            padding-top: 80px !important;
          }
          .hero-container {
            padding: 30px 72px 24px !important;
          }
          .hero-side-arrow {
            width: 44px !important;
            height: 44px !important;
          }
          .hero-side-arrow-left {
            left: 14px !important;
          }
          .hero-side-arrow-right {
            right: 14px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .hero-stats-desktop {
            display: none !important;
          }
          .hero-mobile-stats {
            display: grid !important;
          }
          .hero-text-wrapper {
            min-height: auto !important;
          }
        }

        /* Hero Mobile Breakpoint */
        @media (max-width: 768px) {
          .hero-section {
            padding-top: 76px !important;
          }
          .hero-container {
            padding: 24px 54px 20px !important;
          }
          .hero-side-arrow {
            width: 38px !important;
            height: 38px !important;
          }
          .hero-side-arrow-left {
            left: 8px !important;
          }
          .hero-side-arrow-right {
            right: 8px !important;
          }
          .hero-gradient-overlay {
            background: linear-gradient(180deg, rgba(0,18,52,0.92) 0%, rgba(0,32,91,0.85) 60%, rgba(0,18,52,0.95) 100%) !important;
          }
          .hero-title {
            font-size: clamp(24px, 6.2vw, 34px) !important;
            line-height: 1.22 !important;
            margin-bottom: 14px !important;
          }
          .hero-desc {
            font-size: 13.5px !important;
            line-height: 1.6 !important;
            margin-bottom: 20px !important;
          }
          .hero-cta-group {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .hero-btn-primary, .hero-btn-secondary, .hero-btn-ai {
            justify-content: center !important;
            width: 100% !important;
            padding: 13px 18px !important;
          }
          .hero-indicators-bar {
            margin-top: 16px !important;
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

      {/* Job Quick View Modal */}
      <JobQuickViewModal
        job={selectedJob}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedJob(null);
        }}
        isBookmarked={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleBookmark={toggleBookmark}
        divisionLabel={selectedJob ? divisionLabels[selectedJob.division] || selectedJob.division : ""}
      />

      {/* Career Matcher AI Modal */}
      <CareerMatcherModal
        isOpen={isCareerMatcherOpen}
        onClose={() => setIsCareerMatcherOpen(false)}
        jobs={activeJobs as any}
        onSelectJob={(job) => {
          setSelectedJob(job);
          setIsQuickViewOpen(true);
        }}
      />

      {/* Interactive Support Floating Chat */}
      <FloatingChat />
    </div>
  );
}
