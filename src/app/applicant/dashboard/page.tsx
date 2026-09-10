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

        {/* Applications with Stepper (Mobile) */}
        <MobileSection title="Lamaran Saya" action="Lihat Semua">
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {applications.slice(0, 3).map((app) => {
                const currentStage = getStageNumberFromStatus(app.status);
                const badge = getStatusBadgeConfig(app.status);
                const isTestActive = ["TEST_SCHEDULED", "IN_TEST"].includes(app.status);

                return (
                  <div
                    key={app.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "14px",
                      padding: "16px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                        <h3
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#00205B",
                            margin: "0 0 4px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {app.job?.title || "Lowongan Posisi"}
                        </h3>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f0f4ff", color: "#00205B", borderRadius: "10px", fontWeight: 600 }}>
                            {formatDivision(app.job?.division)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                            {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "12px",
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Progress Stepper (Mobile Condensed) */}
                    <div style={{ margin: "14px 0 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "6px" }}>
                        {/* Connecting Line */}
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "14px",
                            right: "14px",
                            height: "2px",
                            background: "#e2e8f0",
                            zIndex: 1,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "14px",
                            width: `${Math.max(0, Math.min(100, ((currentStage - 1) / 4) * 100))}%`,
                            height: "2px",
                            background: "#16a34a",
                            zIndex: 2,
                            transition: "width 0.4s ease",
                          }}
                        />

                        {RECRUITMENT_STAGES.map((st) => {
                          const isCompleted = st.id < currentStage || (st.id === 5 && app.status === "ACCEPTED");
                          const isCurrent = st.id === currentStage && app.status !== "ACCEPTED" && app.status !== "REJECTED";
                          const isFailed = st.id === 5 && app.status === "REJECTED";

                          let dotBg = "#f1f5f9";
                          let dotColor = "#94a3b8";
                          let border = "2px solid #e2e8f0";

                          if (isCompleted) {
                            dotBg = "#16a34a";
                            dotColor = "#ffffff";
                            border = "2px solid #16a34a";
                          } else if (isCurrent) {
                            dotBg = "#FF5E00";
                            dotColor = "#ffffff";
                            border = "2px solid #FF5E00";
                          } else if (isFailed) {
                            dotBg = "#dc2626";
                            dotColor = "#ffffff";
                            border = "2px solid #dc2626";
                          }

                          return (
                            <div key={st.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, position: "relative" }}>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: dotBg,
                                  color: dotColor,
                                  border,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "9px",
                                  fontWeight: 800,
                                }}
                              >
                                {isCompleted ? <Check size={10} strokeWidth={3} /> : st.id}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#64748b", fontWeight: 600 }}>
                        <span>Berkas</span>
                        <span>Verifikasi</span>
                        <span>Ujian CAT</span>
                        <span>Interview</span>
                        <span>Hasil</span>
                      </div>
                    </div>

                    {/* Active Test Callout (Mobile) */}
                    {isTestActive && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          marginTop: "12px",
                          border: "1px solid #fed7aa",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                          <PlayCircle size={15} color="#ea580c" />
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#9a3412" }}>
                            Sesi Ujian CAT Siap Dikerjakan
                          </span>
                        </div>
                        <Link
                          href={app.testSession?.id ? `/applicant/test/${app.testSession.id}` : "/applicant/schedule"}
                          style={{ textDecoration: "none" }}
                        >
                          <button
                            style={{
                              width: "100%",
                              padding: "8px",
                              background: "#FF5E00",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <PlayCircle size={13} /> Mulai Ujian Sekarang
                          </button>
                        </Link>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={11} color="#94a3b8" /> {app.job?.location || "Indonesia"}
                      </span>
                      <Link href="/applicant/applications" style={{ fontSize: "10px", fontWeight: 700, color: "#FF5E00", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
                        Detail <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </MobileSection>

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
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid #eef2f6",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#00205B", margin: 0, letterSpacing: "-0.01em" }}>
                      Progres Lamaran Kerja
                    </h2>
                    <span
                      style={{
                        padding: "3px 10px",
                        background: "#f0f4ff",
                        color: "#00205B",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "20px",
                      }}
                    >
                      {applications.length} Lamaran
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    Pantau timeline alur seleksi transparan dari tahap berkas hingga offering
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
                  }}
                >
                  Lihat Riwayat Lengkap <ChevronRight size={16} />
                </Link>
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
                  <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Memuat status lamaran Anda...</p>
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
                    Belum Ada Lamaran Aktif
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
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {applications.map((app) => {
                    const currentStage = getStageNumberFromStatus(app.status);
                    const badge = getStatusBadgeConfig(app.status);
                    const isTestActive = ["TEST_SCHEDULED", "IN_TEST"].includes(app.status);
                    const isInterviewActive = app.status === "INTERVIEW";
                    const isAccepted = app.status === "ACCEPTED";
                    const isRejected = app.status === "REJECTED";

                    return (
                      <div
                        key={app.id}
                        style={{
                          background: "#ffffff",
                          borderRadius: "16px",
                          border: "1.5px solid #e2e8f0",
                          padding: "24px",
                          transition: "box-shadow 0.2s ease",
                        }}
                      >
                        {/* Job Card Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            paddingBottom: "18px",
                            borderBottom: "1px solid #f1f5f9",
                            marginBottom: "20px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#00205B", margin: 0 }}>
                                {app.job?.title || "Posisi Pekerjaan"}
                              </h3>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  background: "#f0f4ff",
                                  color: "#00205B",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                {formatDivision(app.job?.division)}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "#64748b" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Building2 size={14} color="#94a3b8" /> PT Reska Multi Usaha
                              </span>
                              <span>•</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <MapPin size={14} color="#94a3b8" /> {app.job?.location || "Indonesia"}
                              </span>
                              <span>•</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={14} color="#94a3b8" /> Dilamar: {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 800,
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: badge.text }} />
                            {badge.label}
                          </span>
                        </div>

                        {/* RECRUITMENT PIPELINE STEPPER TRACKER */}
                        <div style={{ marginBottom: "22px" }}>
                          <div style={{ position: "relative", marginBottom: "8px" }}>
                            {/* Inactive Track Line */}
                            <div
                              style={{
                                position: "absolute",
                                top: "18px",
                                left: "40px",
                                right: "40px",
                                height: "3px",
                                background: "#e2e8f0",
                                zIndex: 1,
                              }}
                            />
                            {/* Active Progress Track Line */}
                            <div
                              style={{
                                position: "absolute",
                                top: "18px",
                                left: "40px",
                                width: isRejected
                                  ? `${Math.max(0, Math.min(100, ((currentStage - 1) / 4) * 100))}%`
                                  : `${Math.max(0, Math.min(100, ((currentStage - 1) / 4) * 100))}%`,
                                height: "3px",
                                background: isRejected ? "#ef4444" : "#16a34a",
                                zIndex: 2,
                                transition: "width 0.5s ease",
                              }}
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", position: "relative", zIndex: 3 }}>
                              {RECRUITMENT_STAGES.map((st) => {
                                const isCompleted = st.id < currentStage || (st.id === 5 && isAccepted);
                                const isCurrent = st.id === currentStage && !isAccepted && !isRejected;
                                const isFailed = st.id === 5 && isRejected;

                                let circleBg = "#f8fafc";
                                let circleColor = "#94a3b8";
                                let circleBorder = "3px solid #cbd5e1";
                                let pulse = false;

                                if (isCompleted) {
                                  circleBg = "#16a34a";
                                  circleColor = "#ffffff";
                                  circleBorder = "3px solid #16a34a";
                                } else if (isCurrent) {
                                  circleBg = "#FF5E00";
                                  circleColor = "#ffffff";
                                  circleBorder = "3px solid #FF8800";
                                  pulse = true;
                                } else if (isFailed) {
                                  circleBg = "#ef4444";
                                  circleColor = "#ffffff";
                                  circleBorder = "3px solid #ef4444";
                                }

                                return (
                                  <div key={st.id} style={{ textAlign: "center", padding: "0 4px" }}>
                                    <div
                                      style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: circleBg,
                                        color: circleColor,
                                        border: circleBorder,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 8px",
                                        fontSize: "13px",
                                        fontWeight: 800,
                                        boxShadow: pulse ? "0 0 0 5px rgba(255,94,0,0.2)" : "none",
                                        transition: "all 0.3s ease",
                                      }}
                                    >
                                      {isCompleted ? <Check size={18} strokeWidth={3} /> : isFailed ? "✕" : st.id}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "12.5px",
                                        fontWeight: isCurrent || isCompleted ? 700 : 500,
                                        color: isCurrent ? "#FF5E00" : isCompleted ? "#16a34a" : isFailed ? "#ef4444" : "#64748b",
                                        marginBottom: "2px",
                                      }}
                                    >
                                      {st.title}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{st.desc}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* CONTEXTUAL ACTION CALLOUT / BANNER */}
                        {isTestActive && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                              borderRadius: "14px",
                              padding: "18px 20px",
                              border: "1.5px solid #fed7aa",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <div
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "12px",
                                  background: "#FF5E00",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0,
                                  boxShadow: "0 4px 12px rgba(255,94,0,0.3)",
                                }}
                              >
                                <PlayCircle size={24} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#9a3412", margin: "0 0 2px" }}>
                                  Sesi Ujian CAT Online Telah Siap!
                                </h4>
                                <p style={{ fontSize: "12.5px", color: "#7c2d12", margin: 0 }}>
                                  {app.testSession?.adminMessage || "Silakan persiapkan diri, pastikan koneksi lancar, dan kerjakan tepat waktu."}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={app.testSession?.id ? `/applicant/test/${app.testSession.id}` : "/applicant/schedule"}
                              style={{ textDecoration: "none", flexShrink: 0 }}
                            >
                              <button
                                style={{
                                  padding: "10px 20px",
                                  background: "#FF5E00",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "13.5px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  boxShadow: "0 4px 12px rgba(255,94,0,0.3)",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <PlayCircle size={16} /> Mulai Ujian Sekarang
                              </button>
                            </Link>
                          </div>
                        )}

                        {isInterviewActive && (
                          <div
                            style={{
                              background: "#e0e7ff",
                              borderRadius: "14px",
                              padding: "16px 20px",
                              border: "1.5px solid #c7d2fe",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <Calendar size={22} color="#4338ca" />
                              <div>
                                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#312e81", margin: 0 }}>
                                  Jadwal Wawancara Anda Telah Ditentukan
                                </h4>
                                <p style={{ fontSize: "12.5px", color: "#4338ca", margin: "2px 0 0" }}>
                                  {app.interview?.scheduledAt
                                    ? `Jadwal: ${new Date(app.interview.scheduledAt).toLocaleString("id-ID")} • Lokasi: ${app.interview.location}`
                                    : "Informasi jadwal wawancara resmi akan dikirim via email dan notifikasi."}
                                </p>
                              </div>
                            </div>
                            <Link href="/applicant/schedule" style={{ textDecoration: "none" }}>
                              <button
                                style={{
                                  padding: "8px 16px",
                                  background: "#4338ca",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "12.5px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Detail Jadwal
                              </button>
                            </Link>
                          </div>
                        )}

                        {app.status === "MCU" && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                              borderRadius: "14px",
                              padding: "18px 20px",
                              border: "1.5px solid #bae6fd",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "16px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                              <div
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "12px",
                                  background: "#0284c7",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0,
                                  boxShadow: "0 4px 12px rgba(2,132,199,0.3)",
                                }}
                              >
                                <Calendar size={22} />
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", background: "#0284c7", color: "#ffffff", padding: "2px 8px", borderRadius: "6px" }}>
                                    Tahap MCU Offline
                                  </span>
                                  <span style={{ fontSize: "12px", color: "#0369a1", fontWeight: 700 }}>Kantor Balai Yasa</span>
                                </div>
                                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0c4a6e", margin: "0 0 4px" }}>
                                  {app.medicalCheckup?.scheduledAt
                                    ? `Jadwal MCU: ${new Date(app.medicalCheckup.scheduledAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • ${new Date(app.medicalCheckup.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                                    : "Selamat! Anda Lolos Wawancara dan Lanjut ke MCU Offline di Balai Yasa"}
                                </h4>
                                <p style={{ fontSize: "12.5px", color: "#0369a1", margin: 0, lineHeight: 1.5 }}>
                                  {app.medicalCheckup?.scheduledAt
                                    ? `Lokasi: ${app.medicalCheckup.location || "Kantor Balai Yasa PT KAI"}. Wajib berpuasa 10-12 jam sebelum pemeriksaan laboratorium.`
                                    : "Jadwal dan petunjuk persiapan pemeriksaan kesehatan di Kantor Balai Yasa sedang disiapkan oleh tim rekrutmen."}
                                </p>
                              </div>
                            </div>
                            <Link href="/applicant/schedule" style={{ textDecoration: "none", flexShrink: 0 }}>
                              <button
                                style={{
                                  padding: "10px 18px",
                                  background: "#0284c7",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  boxShadow: "0 4px 12px rgba(2,132,199,0.25)",
                                }}
                              >
                                Detail Jadwal MCU <ChevronRight size={15} />
                              </button>
                            </Link>
                          </div>
                        )}

                        {/* Offering Banner */}
                        {(app.status === "OFFERING" || app.offering) && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                              borderRadius: "14px",
                              padding: "18px 20px",
                              border: "1.5px solid #fde68a",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "16px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                              <div
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "12px",
                                  background: "#d97706",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  flexShrink: 0,
                                  boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                                }}
                              >
                                <Briefcase size={22} />
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", background: "#d97706", color: "#ffffff", padding: "2px 8px", borderRadius: "6px" }}>
                                    Offering Letter Resmi
                                  </span>
                                  <span style={{ fontSize: "12px", color: "#92400e", fontWeight: 700 }}>
                                    {app.offering?.employmentType === "PERMANENT" ? "PKWTT (Karyawan Tetap)" : `PKWT (Kontrak ${app.offering?.contractDuration || 12} Bulan)`}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#78350f", margin: "0 0 4px" }}>
                                  {app.offering?.salary
                                    ? `Gaji Pokok: Rp ${Number(app.offering.salary).toLocaleString("id-ID")} / bulan`
                                    : "Penawaran Kerja Resmi Telah Diterbitkan"}
                                </h4>
                                <p style={{ fontSize: "12.5px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                                  {app.offering?.startDate
                                    ? `Mulai Kerja: ${new Date(app.offering.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • Penempatan: ${app.offering.workLocation || "KAI Services"}`
                                    : "Silakan periksa detail penawaran kerja resmi dan rincian fasilitas di halaman Jadwal."}
                                </p>
                              </div>
                            </div>
                            <Link href="/applicant/schedule" style={{ textDecoration: "none", flexShrink: 0 }}>
                              <button
                                style={{
                                  padding: "10px 18px",
                                  background: "#d97706",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  boxShadow: "0 4px 12px rgba(217,119,6,0.25)",
                                }}
                              >
                                Lihat Offering Letter <ChevronRight size={15} />
                              </button>
                            </Link>
                          </div>
                        )}

                        {/* Rekapitulasi Hasil & Nilai Seleksi yang telah diinput Admin */}
                        {(app.testSession?.totalScore !== undefined || app.interview?.score !== undefined || app.medicalCheckup?.result) && (
                          <div
                            style={{
                              background: "#f8fafc",
                              borderRadius: "14px",
                              padding: "16px 18px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Award size={18} color="#00205B" />
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "#00205B" }}>
                                Rekapitulasi Nilai & Hasil Evaluasi Seleksi:
                              </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                              {app.testSession?.totalScore !== undefined && app.testSession?.totalScore !== null && (
                                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>1. Tes CAT Online</span>
                                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#16a34a" }}>
                                    {app.testSession.totalScore} / 100
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#15803d", marginLeft: "6px", fontWeight: 600 }}>✓ Lolos</span>
                                </div>
                              )}

                              {app.interview?.score !== undefined && app.interview?.score !== null && (
                                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>2. Wawancara Kompetensi</span>
                                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#be185d" }}>
                                    {app.interview.score} / 100
                                  </span>
                                  <span style={{ fontSize: "11px", color: app.interview.result === "PASSED" ? "#16a34a" : "#dc2626", marginLeft: "6px", fontWeight: 600 }}>
                                    {app.interview.result === "PASSED" ? "✓ Lolos" : app.interview.result || "Selesai"}
                                  </span>
                                </div>
                              )}

                              {app.medicalCheckup?.result && (
                                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>3. MCU Balai Yasa</span>
                                  <span style={{ fontSize: "14px", fontWeight: 800, color: app.medicalCheckup.result === "FIT" ? "#16a34a" : "#dc2626" }}>
                                    {app.medicalCheckup.result === "FIT" ? "✓ FIT (Lolos Medis)" : app.medicalCheckup.result}
                                  </span>
                                </div>
                              )}
                            </div>

                            {app.interview?.notes && (
                              <div style={{ fontSize: "12px", color: "#475569", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                                <strong>Catatan Interview:</strong> {app.interview.notes}
                              </div>
                            )}
                          </div>
                        )}

                        {app.status === "ADMIN_CHECK" && (
                          <div
                            style={{
                              background: "#fef9c3",
                              borderRadius: "12px",
                              padding: "12px 18px",
                              border: "1px solid #fef08a",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontSize: "13px",
                              color: "#854d0e",
                            }}
                          >
                            <Clock size={16} color="#ca8a04" style={{ flexShrink: 0 }} />
                            <span>
                              Dokumen lamaran Anda sedang dalam tahap verifikasi oleh Tim HR KAI Services. Mohon periksa berkala portal ini.
                            </span>
                          </div>
                        )}

                        {isAccepted && (
                          <div
                            style={{
                              background: "#dcfce7",
                              borderRadius: "12px",
                              padding: "14px 18px",
                              border: "1px solid #86efac",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              fontSize: "13.5px",
                              color: "#15803d",
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                            <span>
                              Selamat! Anda dinyatakan lolos seleksi. Silakan cek menu Penawaran / Riwayat Lamaran untuk konfirmasi Offering Letter.
                            </span>
                          </div>
                        )}

                        {isRejected && (
                          <div
                            style={{
                              background: "#fef2f2",
                              borderRadius: "12px",
                              padding: "12px 18px",
                              border: "1px solid #fecaca",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontSize: "13px",
                              color: "#991b1b",
                            }}
                          >
                            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span>
                              Terima kasih telah berpartisipasi. Kualifikasi Anda belum memenuhi posisi ini saat ini. Anda dapat melamar lowongan lain yang tersedia.
                            </span>
                          </div>
                        )}
                      </div>
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
