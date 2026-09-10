"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import {
  MobileCard,
  MobileEmpty,
  MobileSection,
  MobileBadge,
  MobileLoading,
  MobileButton,
} from "@/components/layout";
import {
  Briefcase,
  User,
  FileText,
  Plus,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Calendar,
  PlayCircle,
  Award,
  Phone,
  ExternalLink,
  Check,
  Building2,
  MapPin,
  Compass,
} from "lucide-react";

const formatDivision = (division: string | undefined): string => {
  const labels: Record<string, string> = {
    ON_TRAIN_SERVICE: "On-Train Service",
    RES_CLEAN: "ResClean",
    RES_PARKING: "ResParking",
    LOGISTICS: "Logistics",
    IT_STAFF: "IT Staff",
    ADMIN: "Administrasi",
  };
  return division ? (labels[division] || division) : "Umum";
};

const getMobileStatus = (status: string): "success" | "warning" | "error" | "info" | "pending" => {
  const map: Record<string, "success" | "warning" | "error" | "info" | "pending"> = {
    ADMIN_CHECK: "warning",
    TEST_SCHEDULED: "info",
    IN_TEST: "info",
    TEST_COMPLETED: "success",
    INTERVIEW: "warning",
    MCU: "success",
    OFFERING: "warning",
    OFFERED: "warning",
    ACCEPTED: "success",
    REJECTED: "error",
    PENDING: "pending",
  };
  return map[status] || "pending";
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ADMIN_CHECK: "Verifikasi Berkas",
    TEST_SCHEDULED: "Ujian Terjadwal",
    IN_TEST: "Sedang Ujian",
    TEST_COMPLETED: "Ujian Selesai",
    INTERVIEW: "Tahap Wawancara",
    MCU: "Medical Check-Up",
    OFFERING: "Offering Letter",
    OFFERED: "Offering Letter",
    ACCEPTED: "Diterima (Lolos)",
    REJECTED: "Belum Lolos",
    PENDING: "Berkas Terkirim",
  };
  return labels[status] || status;
};

const FILTER_TABS = [
  { key: "all", label: "Semua" },
  { key: "PENDING", label: "Menunggu" },
  { key: "ADMIN_CHECK", label: "Verifikasi" },
  { key: "TEST_SCHEDULED", label: "Menunggu Tes" },
  { key: "IN_TEST", label: "Sedang Tes" },
  { key: "TEST_COMPLETED", label: "Tes Selesai" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "MCU", label: "Medical Check-Up" },
  { key: "OFFERING", label: "Offering" },
  { key: "ACCEPTED", label: "Diterima" },
  { key: "REJECTED", label: "Ditolak" },
];

const statusPillConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#fef3c7", text: "#d97706", label: "Menunggu" },
  ADMIN_CHECK: { bg: "#fef3c7", text: "#d97706", label: "Verifikasi" },
  TEST_SCHEDULED: { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" },
  IN_TEST: { bg: "#e0e7ff", text: "#4f46e5", label: "Sedang Tes" },
  TEST_COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" },
  INTERVIEW: { bg: "#fce7f3", text: "#be185d", label: "Interview" },
  MCU: { bg: "#d1fae5", text: "#059669", label: "Medical Check-Up" },
  OFFERING: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
  OFFERED: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
  ACCEPTED: { bg: "#dcfce7", text: "#16a34a", label: "Diterima" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626", label: "Ditolak" },
};

interface TestSessionData {
  id: string;
  status: string;
  scheduledAt?: string;
  endTime?: string;
  submittedAt?: string;
  adminMessage?: string;
  totalScore?: number | null;
  passed?: boolean | null;
}

interface InterviewData {
  id: string;
  scheduledAt: string;
  location: string;
  interviewer: string;
  type: string;
  zoomLink?: string;
  score?: number | null;
  result?: string | null;
  notes?: string | null;
}

interface OfferingData {
  id: string;
  salary: number;
  salaryPeriod: string;
  startDate: string;
  employmentType: string;
  contractDuration?: number | null;
  contractEndDate?: string | null;
  probationMonths?: number | null;
  workLocation?: string | null;
  positionTitle?: string | null;
  benefits?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

interface ApplicationData {
  id: string;
  status: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    division: string;
    location: string;
  };
  testSession?: TestSessionData;
  interview?: InterviewData;
  medicalCheckup?: {
    id?: string;
    scheduledAt?: string;
    location?: string;
    result?: string | null;
    notes?: string | null;
  };
  offering?: OfferingData;
}

// 5-Stage Recruitment Timeline Configuration
const RECRUITMENT_STAGES = [
  { id: 1, key: "SUBMITTED", title: "Berkas Masuk", desc: "Pendaftaran awal" },
  { id: 2, key: "VERIFICATION", title: "Verifikasi Berkas", desc: "Seleksi administrasi" },
  { id: 3, key: "ONLINE_TEST", title: "Ujian CAT Online", desc: "Tes kompetensi BUMN" },
  { id: 4, key: "INTERVIEW_MCU", title: "Wawancara & MCU", desc: "Interview & kesehatan" },
  { id: 5, key: "FINAL_RESULT", title: "Hasil Akhir", desc: "Offering / Pengumuman" },
];

const getStageNumberFromStatus = (status: string): number => {
  switch (status) {
    case "PENDING":
      return 1;
    case "ADMIN_CHECK":
      return 2;
    case "TEST_SCHEDULED":
    case "IN_TEST":
    case "TEST_COMPLETED":
      return 3;
    case "INTERVIEW":
    case "MCU":
      return 4;
    case "OFFERING":
    case "OFFERED":
    case "ACCEPTED":
    case "REJECTED":
      return 5;
    default:
      return 1;
  }
};

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return { bg: "#dcfce7", text: "#16a34a", border: "#86efac", label: "Diterima / Lolos" };
    case "REJECTED":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5", label: "Belum Lolos" };
    case "OFFERING":
    case "OFFERED":
      return { bg: "#fef3c7", text: "#d97706", border: "#fde68a", label: "Offering Letter" };
    case "MCU":
      return { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe", label: "Medical Check-Up" };
    case "INTERVIEW":
      return { bg: "#e0e7ff", text: "#4338ca", border: "#c7d2fe", label: "Wawancara" };
    case "TEST_COMPLETED":
      return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0", label: "Ujian Selesai" };
    case "IN_TEST":
      return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", label: "Sedang Ujian CAT" };
    case "TEST_SCHEDULED":
      return { bg: "#fff7ed", text: "#ea580c", border: "#ffedd5", label: "Ujian CAT Terjadwal" };
    case "ADMIN_CHECK":
      return { bg: "#fef9c3", text: "#ca8a04", border: "#fef08a", label: "Verifikasi Dokumen" };
    default:
      return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0", label: "Berkas Terkirim" };
  }
};

export default function ApplicantDashboardPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Pelamar");
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<"akhlak" | "cat" | "interview">("akhlak");
  const [showReminder, setShowReminder] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      // 1. Fetch Applications
      const response = await fetch(`/api/apply?userId=${user.id}`);
      const result = await response.json();
      if (result.success && result.applications) {
        const appsWithData = await Promise.all(
          result.applications.map(async (app: any) => {
            try {
              const [testRes, interviewRes] = await Promise.all([
                fetch(`/api/applicant/test-session?applicationId=${app.id}`),
                fetch(`/api/applicant/interview?applicationId=${app.id}`),
              ]);
              const testData = await testRes.json();
              const interviewData = await interviewRes.json();

              return {
                ...app,
                testSession: testData.success ? {
                  id: testData.session?.id,
                  status: testData.session?.status,
                  scheduledAt: testData.session?.scheduledAt,
                  endTime: testData.session?.endTime,
                  submittedAt: testData.session?.submittedAt,
                  adminMessage: testData.session?.adminMessage,
                } : undefined,
                interview: interviewData.success ? {
                  id: interviewData.interview?.id,
                  scheduledAt: interviewData.interview?.scheduledAt,
                  location: interviewData.interview?.location,
                  interviewer: interviewData.interview?.interviewer,
                  type: interviewData.interview?.type,
                  zoomLink: interviewData.interview?.zoomLink,
                } : undefined,
              };
            } catch {
              return app;
            }
          })
        );
        setApplications(appsWithData);
      }

      // 2. Fetch Profile to compute completeness
      const profileRes = await fetch(`/api/applicant/profile?userId=${user.id}`);
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.profile) {
        const p = profileJson.profile;
        setProfileDetails(p);
        if (p.fullName) {
          setUserName(p.fullName);
        }

        const checks = [
          Boolean(p.fullName),
          Boolean(p.nik),
          Boolean(p.phone),
          Boolean(p.placeOfBirth),
          Boolean(p.dateOfBirth),
          Boolean(p.gender),
          Boolean(p.address),
          Boolean(p.city),
          Boolean(p.postalCode),
          Boolean(p.education),
          Boolean(p.cvUrl),
        ];
        const filled = checks.filter(Boolean).length;
        const percent = Math.round((filled / checks.length) * 100);
        setProfileCompletion(percent);
      } else if (user?.fullName) {
        setUserName(user.fullName);
      }
    } catch (err) {
      console.error("Failed to fetch applicant data:", err);
    }
    setIsLoading(false);
  };

  const totalApps = applications.length;
  const adminCheckApps = applications.filter((a) => ["ADMIN_CHECK", "PENDING"].includes(a.status)).length;
  const testApps = applications.filter((a) => ["TEST_SCHEDULED", "IN_TEST", "TEST_COMPLETED"].includes(a.status)).length;
  const interviewApps = applications.filter((a) => ["INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(a.status)).length;
  const filteredApps = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const userInitials = (userName || "Pelamar")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ==========================================
  // MOBILE VIEW
  // ==========================================
  if (isMobile) {
    return (
      <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", paddingBottom: "24px" }}>
        {/* Hero Welcome Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #00205B 0%, #003380 60%, #001740 100%)",
            borderRadius: "16px",
            padding: "20px 16px",
            marginBottom: "16px",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(0,32,91,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Glow */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "120px",
              height: "120px",
              background: "radial-gradient(circle, rgba(255,94,0,0.3) 0%, rgba(255,94,0,0) 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF5E00 0%, #FF8800 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(255,94,0,0.3)",
              }}
            >
              {userInitials}
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 500 }}>
                Selamat Datang,
              </p>
              <h1 style={{ fontSize: "17px", fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.01em" }}>
                {userName}
              </h1>
            </div>
          </div>

          {/* Profile Completion Meter (Mobile) */}
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.15)",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                Kelengkapan Profil
              </span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#FF8800" }}>
                {profileCompletion}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" }}>
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #FF5E00, #FFA048)",
                  borderRadius: "6px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            {profileCompletion < 100 && (
              <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF8800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Lengkapi Data Sekarang <ArrowRight size={11} />
                </span>
              </Link>
            )}
          </div>

          {/* Stats 4 Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{totalApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Total</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{adminCheckApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Verifikasi</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{testApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Ujian CAT</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{interviewApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Tahap Lanjut</div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Mobile) */}
        <MobileSection title="Aksi Cepat">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
              <MobileCard style={{ textAlign: "center", padding: "12px 6px" }}>
                <Briefcase size={20} color="#FF5E00" style={{ margin: "0 auto" }} />
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#111", marginTop: "6px" }}>Lowongan</div>
              </MobileCard>
            </Link>
            <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
              <MobileCard style={{ textAlign: "center", padding: "12px 6px" }}>
                <User size={20} color="#00205B" style={{ margin: "0 auto" }} />
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#111", marginTop: "6px" }}>Profil CV</div>
              </MobileCard>
            </Link>
            <Link href="/applicant/schedule" style={{ textDecoration: "none" }}>
              <MobileCard style={{ textAlign: "center", padding: "12px 6px" }}>
                <Calendar size={20} color="#2563eb" style={{ margin: "0 auto" }} />
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#111", marginTop: "6px" }}>Jadwal</div>
              </MobileCard>
            </Link>
          </div>
        </MobileSection>

        {/* Applications List (Mobile matching SS) */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#00205B", borderBottom: "2px solid #FF5E00", paddingBottom: "4px", margin: 0 }}>
              Lamaran Saya
            </h2>
            <Link href="/applicant/applications" style={{ textDecoration: "none", fontSize: "11px", color: "#FF5E00", fontWeight: 700 }}>
              Lihat Semua ({applications.length})
            </Link>
          </div>
          {/* Filter Tabs Scrollable */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "12px", WebkitOverflowScrolling: "touch" }}>
            {FILTER_TABS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 12px",
                    background: isActive ? "#00205B" : "#ffffff",
                    color: isActive ? "#ffffff" : "#666666",
                    border: "1.5px solid",
                    borderColor: isActive ? "#00205B" : "#e5e5e5",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <MobileLoading />
          ) : applications.length === 0 ? (
            <MobileEmpty
              icon={<FileText size={28} color="#94A3B8" />}
              title="Belum Ada Lamaran"
              description="Mulai langkah karir Anda bersama KAI Services"
              action={
                <Link href="/applicant/jobs" style={{ textDecoration: "none", width: "100%" }}>
                  <MobileButton><Plus size={14} /> Jelajahi Lowongan</MobileButton>
                </Link>
              }
            />
          ) : filteredApps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #e2e8f0" }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px" }}>
                Tidak ada lamaran berstatus <strong>{FILTER_TABS.find(t => t.key === filter)?.label}</strong>
              </p>
              <button
                onClick={() => setFilter("all")}
                style={{ padding: "4px 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", color: "#00205B", fontWeight: 600 }}
              >
                Tampilkan Semua
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredApps.map((app) => {
                const status = statusPillConfig[app.status] || {
                  bg: "#f1f5f9",
                  text: "#475569",
                  label: app.status,
                };
                return (
                  <Link
                    key={app.id}
                    href={`/applicant/applications#app-${app.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "14px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        border: "1.5px solid #e5e5e5",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                          <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#111111", margin: "0 0 2px" }}>
                            {app.job?.title || "Lowongan Posisi"}
                          </h4>
                          <p style={{ fontSize: "11.5px", color: "#666666", margin: 0 }}>
                            {app.job?.location || "Indonesia"} • {formatDivision(app.job?.division)}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: "12px",
                            background: status.bg,
                            color: status.text,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: "10.5px", color: "#888888" }}>
                          Dilamar: {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5E00", display: "flex", alignItems: "center", gap: "2px" }}>
                          Progres <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips & Panduan Seleksi BUMN (Mobile) */}
        <MobileCard style={{ background: "#ffffff", border: "1px solid #e2e8f0", marginTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Sparkles size={16} color="#FF5E00" />
            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#00205B", margin: 0 }}>
              Tips Sukses Seleksi BUMN KAI
            </h3>
          </div>
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>
            <p style={{ margin: "0 0 6px" }}>✓ Pahami Nilai Utama <strong>AKHLAK</strong> (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif).</p>
            <p style={{ margin: "0 0 6px" }}>✓ Siapkan koneksi stabil min. 5 Mbps & webcam aktif saat ujian CAT.</p>
            <p style={{ margin: 0 }}>✓ Kenakan pakaian formal kemeja putih rapi saat sesi wawancara.</p>
          </div>
        </MobileCard>
      </div>
    );
  }

  // ==========================================
  // DESKTOP VIEW
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top Breadcrumb / Page Title */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "20px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Portal Pelamar</span>
              <ChevronRight size={12} color="#94a3b8" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#FF5E00" }}>Dashboard Utama</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", margin: 0, letterSpacing: "-0.02em" }}>
              Dashboard Kandidat
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/applicant/jobs">
              <button
                style={{
                  padding: "10px 18px",
                  background: "#FF5E00",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(255,94,0,0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <Briefcase className="w-4 h-4" />
                Cari Lowongan Baru
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 32px 60px" }}>
        {/* HERO WELCOME BANNER & PROFILE GAUGE */}
        <div
          style={{
            background: "linear-gradient(135deg, #00205B 0%, #003380 50%, #001740 100%)",
            borderRadius: "20px",
            padding: "32px 36px",
            marginBottom: "32px",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,32,91,0.18)",
            position: "relative",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {/* Decorative Glow & Shapes */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "30%",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(255,94,0,0.2) 0%, rgba(255,94,0,0) 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "-40px",
              width: "180px",
              height: "180px",
              background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          {/* Left Column: Greeting & Info */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span
                style={{
                  padding: "4px 12px",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FF8800",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={13} />
                Portal Rekrutmen Resmi
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  background: "rgba(34,197,94,0.2)",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#86efac",
                }}
              >
                Akun Terverifikasi
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #FF5E00 0%, #FF8800 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#ffffff",
                  boxShadow: "0 6px 18px rgba(255,94,0,0.35)",
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </div>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0, letterSpacing: "-0.01em", color: "#ffffff" }}>
                  Selamat Datang, {userName} 👋
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: "4px 0 0", lineHeight: 1.4 }}>
                  Pantau alur seleksi rekrutmen, ikuti ujian CAT online, dan wujudkan karir Anda di PT Reska Multi Usaha (KAI Services).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Completion Meter Card */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              borderRadius: "18px",
              padding: "20px 24px",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  Kelengkapan Profil Anda
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "2px 0 0", color: "#ffffff" }}>
                  {profileCompletion === 100 ? "Profil 100% Siap!" : "Lengkapi Berkas Profil"}
                </h3>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(255,94,0,0.2)",
                  border: "2px solid #FF8800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#FF8800",
                }}
              >
                {profileCompletion}%
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #FF5E00 0%, #FF8800 100%)",
                  borderRadius: "8px",
                  transition: "width 0.6s ease",
                  boxShadow: "0 0 10px rgba(255,94,0,0.5)",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
                {profileCompletion === 100
                  ? "✓ Berkas lengkap untuk seleksi HR"
                  : `Kurang ${100 - profileCompletion}% data untuk proses seleksi`}
              </span>
              <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "6px 14px",
                    background: "#FF5E00",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 8px rgba(255,94,0,0.3)",
                  }}
                >
                  {profileCompletion === 100 ? "Lihat Profil" : "Lengkapi"} <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {[
            {
              icon: <Briefcase size={22} />,
              value: totalApps,
              label: "Total Lamaran",
              sub: "Posisi yang didaftar",
              color: "#00205B",
              bg: "#eef2ff",
            },
            {
              icon: <Clock size={22} />,
              value: adminCheckApps,
              label: "Verifikasi Berkas",
              sub: "Sedang direview tim HR",
              color: "#d97706",
              bg: "#fef3c7",
            },
            {
              icon: <FileText size={22} />,
              value: testApps,
              label: "Ujian Online CAT",
              sub: "Jadwal & tes aktif",
              color: "#FF5E00",
              bg: "#fff7ed",
            },
            {
              icon: <Award size={22} />,
              value: interviewApps,
              label: "Wawancara & Lolos",
              sub: "Tahap evaluasi lanjut",
              color: "#16a34a",
              bg: "#dcfce7",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "22px 24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                border: "1px solid #edf2f7",
                display: "flex",
                alignItems: "flex-start",
                gap: "18px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: stat.bg,
                  color: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#111111", lineHeight: 1.1, marginBottom: "4px" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>{stat.label}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN 2-COLUMN GRID (Applications on left, Guidance & Actions on right) */}
        <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: "32px" }}>
          {/* LEFT: APPLICATIONS & STEPPER TIMELINE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* LAMARAN SAYA (Replaced from SS as requested) */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid #eef2f6",
              }}
            >
              {/* Header matching the screenshot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
                    Lamaran Saya
                  </h2>
                  <p style={{ fontSize: "14px", color: "#666666", margin: 0 }}>
                    {applications.length} lamaran
                  </p>
                </div>
                <Link
                  href="/applicant/applications"
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#FF5E00",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "8px 14px",
                    background: "#fff7f0",
                    borderRadius: "10px",
                    border: "1px solid #ffedd5",
                  }}
                >
                  Lihat Progres Lengkap <ChevronRight size={16} />
                </Link>
              </div>

              {/* Filter Tabs matching the screenshot */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                {FILTER_TABS.map((f) => {
                  const isActive = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      style={{
                        padding: "8px 18px",
                        background: isActive ? "#00205B" : "#ffffff",
                        color: isActive ? "#ffffff" : "#666666",
                        border: "2px solid",
                        borderColor: isActive ? "#00205B" : "#e5e5e5",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {isLoading ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "4px solid #f1f5f9",
                      borderTopColor: "#FF5E00",
                      borderRadius: "50%",
                      animation: "spin 0.9s linear infinite",
                      margin: "0 auto 16px",
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Memuat status lamaran...</p>
                </div>
              ) : applications.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 24px",
                    background: "#f8fafc",
                    borderRadius: "16px",
                    border: "2px dashed #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <FileText size={32} color="#64748b" />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#00205B", marginBottom: "6px" }}>
                    Belum Ada Lamaran
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 auto 20px" }}>
                    Temukan posisi yang sesuai dengan keahlian dan minat Anda di PT Reska Multi Usaha (KAI Services).
                  </p>
                  <Link href="/applicant/jobs">
                    <button
                      style={{
                        padding: "12px 24px",
                        background: "#FF5E00",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(255,94,0,0.3)",
                      }}
                    >
                      Jelajahi Lowongan Kerja →
                    </button>
                  </Link>
                </div>
              ) : filteredApps.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 12px" }}>
                    Tidak ada lamaran dengan status <strong>{FILTER_TABS.find(t => t.key === filter)?.label}</strong>
                  </p>
                  <button
                    onClick={() => setFilter("all")}
                    style={{
                      padding: "6px 14px",
                      background: "#00205B",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Tampilkan Semua ({applications.length})
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filteredApps.map((app, index) => {
                    const status = statusPillConfig[app.status] || {
                      bg: "#f1f5f9",
                      text: "#475569",
                      label: app.status,
                    };
                    const isFirstOrHighlight = index === 0 && app.status === "OFFERING";

                    return (
                      <Link
                        key={app.id}
                        href={`/applicant/applications#app-${app.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div
                          style={{
                            background: isFirstOrHighlight ? "#fffcf9" : "#ffffff",
                            borderRadius: "14px",
                            padding: "20px 24px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            cursor: "pointer",
                            border: `2px solid ${isFirstOrHighlight ? "#FF5E00" : "#e5e5e5"}`,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#FF5E00";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,94,0,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isFirstOrHighlight ? "#FF5E00" : "#e5e5e5";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div>
                              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", margin: "0 0 4px" }}>
                                {app.job?.title || "Lowongan Pekerjaan"}
                              </h3>
                              <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>
                                {app.job?.location || "Lokasi tidak disebutkan"} • {formatDivision(app.job?.division)}
                              </p>
                            </div>
                            <span
                              style={{
                                padding: "6px 14px",
                                background: status.bg,
                                color: status.text,
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>
                              Dilamar: {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <span
                              style={{
                                fontSize: "12.5px",
                                fontWeight: 700,
                                color: "#FF5E00",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Lihat Alur Seleksi <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: QUICK ACTIONS & GUIDES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Quick Actions Card */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid #eef2f6",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#00205B", margin: "0 0 16px" }}>
                Pusat Navigasi Cepat
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff7ed", color: "#FF5E00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111" }}>Lowongan Kerja</div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>Lihat posisi terbuka saat ini</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </Link>

                <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", color: "#00205B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111" }}>Kelola Berkas & Profil</div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>Update data diri dan dokumen CV</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </Link>

                <Link href="/applicant/schedule" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111" }}>Jadwal Ujian & Wawancara</div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>Agenda seleksi terjadwal</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </Link>
              </div>
            </div>

            {/* BUMN CAREER GUIDES & TIPS WIDGET */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid #eef2f6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Compass size={18} color="#FF5E00" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#00205B", margin: 0 }}>
                  Tips Sukses Seleksi BUMN
                </h3>
              </div>

              {/* Guide Tabs */}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "10px", padding: "3px", marginBottom: "16px" }}>
                <button
                  onClick={() => setActiveGuideTab("akhlak")}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    border: "none",
                    borderRadius: "8px",
                    background: activeGuideTab === "akhlak" ? "#ffffff" : "transparent",
                    color: activeGuideTab === "akhlak" ? "#00205B" : "#64748b",
                    fontSize: "12px",
                    fontWeight: activeGuideTab === "akhlak" ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: activeGuideTab === "akhlak" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  AKHLAK
                </button>
                <button
                  onClick={() => setActiveGuideTab("cat")}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    border: "none",
                    borderRadius: "8px",
                    background: activeGuideTab === "cat" ? "#ffffff" : "transparent",
                    color: activeGuideTab === "cat" ? "#00205B" : "#64748b",
                    fontSize: "12px",
                    fontWeight: activeGuideTab === "cat" ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: activeGuideTab === "cat" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Tes CAT
                </button>
                <button
                  onClick={() => setActiveGuideTab("interview")}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    border: "none",
                    borderRadius: "8px",
                    background: activeGuideTab === "interview" ? "#ffffff" : "transparent",
                    color: activeGuideTab === "interview" ? "#00205B" : "#64748b",
                    fontSize: "12px",
                    fontWeight: activeGuideTab === "interview" ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: activeGuideTab === "interview" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Wawancara
                </button>
              </div>

              {/* Guide Content */}
              {activeGuideTab === "akhlak" && (
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 10px" }}>
                    BUMN memegang teguh nilai <strong>AKHLAK</strong> sebagai pedoman utama perilaku insan BUMN:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li><strong>Amanah:</strong> Memegang teguh kepercayaan.</li>
                    <li><strong>Kompeten:</strong> Terus belajar & mengembangkan kapabilitas.</li>
                    <li><strong>Harmonis:</strong> Saling peduli & menghargai perbedaan.</li>
                    <li><strong>Loyal:</strong> Berdedikasi & mengutamakan kepentingan bangsa.</li>
                    <li><strong>Adaptif:</strong> Cepat berinovasi menghadapi perubahan.</li>
                    <li><strong>Kolaboratif:</strong> Membangun kerja sama yang sinergis.</li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "cat" && (
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 10px" }}>
                    Persiapan penting saat mengikuti <strong>Ujian Online CAT</strong>:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>Pastikan koneksi internet stabil (minimal 5 Mbps).</li>
                    <li>Kamera / webcam wajib aktif selama durasi ujian.</li>
                    <li>Sistem mendeteksi perpindahan tab browser sebagai pelanggaran.</li>
                    <li>Selesaikan semua soal sebelum timer habis.</li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "interview" && (
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 10px" }}>
                    Etika & Tata Tertib <strong>Wawancara & MCU</strong>:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>Pakaian formal: Kemeja putih lengan panjang rapi.</li>
                    <li>Hadir di ruang tes / link video minimal 15 menit sebelum waktu.</li>
                    <li>Siapkan dokumen asli (KTP, Ijazah, Transkrip) untuk verifikasi visual.</li>
                    <li>Istirahat cukup dan puasa jika dijadwalkan tes darah MCU.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* HELPDESK & SUPPORT CARD */}
            <div
              style={{
                background: "linear-gradient(135deg, #00205B 0%, #003380 100%)",
                borderRadius: "20px",
                padding: "24px",
                color: "#ffffff",
                boxShadow: "0 4px 16px rgba(0,32,91,0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <HelpCircle size={20} color="#FF8800" />
                <h4 style={{ fontSize: "15px", fontWeight: 800, margin: 0 }}>Butuh Bantuan Kendala?</h4>
              </div>
              <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.8)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Hubungi Tim Helpdesk Rekrutmen KAI Services jika mengalami kendala akun atau pelaksanaan ujian CAT.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Email:</span>
                  <span style={{ fontWeight: 600 }}>rekrutmen@reska.id</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Jam Layanan:</span>
                  <span style={{ fontWeight: 600 }}>Senin - Jumat (08:00 - 17:00)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
