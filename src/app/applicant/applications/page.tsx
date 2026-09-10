"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import {
  Briefcase,
  Clock,
  FileText,
  Award,
  Building2,
  MapPin,
  Calendar,
  PlayCircle,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";

// Format division name for display
const formatDivision = (division: string | undefined): string => {
  const divisionLabels: Record<string, string> = {
    ON_TRAIN_SERVICE: "On-Train Service",
    RES_CLEAN: "ResClean",
    RES_PARKING: "ResParking",
    LOGISTICS: "Logistics",
    IT_STAFF: "IT Staff",
    ADMIN: "Administrasi",
  };
  return division ? (divisionLabels[division] || division.replace(/_/g, " ")) : "Umum";
};

// 5-Stage Recruitment Timeline Configuration
const RECRUITMENT_STAGES = [
  { id: 1, key: "SUBMITTED", title: "Berkas Masuk", desc: "Pendaftaran awal" },
  { id: 2, key: "VERIFICATION", title: "Verifikasi Berkas", desc: "Seleksi administrasi" },
  { id: 3, key: "ONLINE_TEST", title: "Ujian CAT Online", desc: "Tes kompetensi BUMN" },
  { id: 4, key: "INTERVIEW_MCU", title: "Wawancara & MCU", desc: "Interview & Balai Yasa" },
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
      return { bg: "#e0e7ff", text: "#4338ca", border: "#c7d2fe", label: "Tahap Wawancara" };
    case "TEST_COMPLETED":
      return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0", label: "Ujian Selesai" };
    case "IN_TEST":
      return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", label: "Sedang Ujian CAT" };
    case "TEST_SCHEDULED":
      return { bg: "#fff7ed", text: "#ea580c", border: "#ffedd5", label: "Ujian Terjadwal" };
    case "ADMIN_CHECK":
      return { bg: "#fef9c3", text: "#ca8a04", border: "#fef08a", label: "Verifikasi Dokumen" };
    default:
      return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0", label: "Berkas Terkirim" };
  }
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
  notes?: string;
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
    document?: {
      id?: string;
      fileName?: string;
      fileUrl?: string;
      fileSize?: number;
    } | null;
  };
  offering?: OfferingData;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppToDelete, setSelectedAppToDelete] = useState<ApplicationData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
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
                  totalScore: testData.session?.totalScore ?? app.testSession?.totalScore,
                  passed: testData.session?.passed ?? app.testSession?.passed,
                } : app.testSession,
                interview: interviewData.success ? {
                  id: interviewData.interview?.id,
                  scheduledAt: interviewData.interview?.scheduledAt,
                  location: interviewData.interview?.location,
                  interviewer: interviewData.interview?.interviewer,
                  type: interviewData.interview?.type,
                  zoomLink: interviewData.interview?.zoomLink,
                  score: interviewData.interview?.score ?? app.interview?.score,
                  result: interviewData.interview?.result ?? app.interview?.result,
                  notes: interviewData.interview?.notes ?? app.interview?.notes,
                } : app.interview,
              };
            } catch {
              return app;
            }
          })
        );
        setApplications(appsWithData);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedAppToDelete || !user?.id) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/apply?id=${selectedAppToDelete.id}&userId=${user.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setSelectedAppToDelete(null);
        fetchApplications();
      } else {
        setDeleteError(result.error || "Gagal membatalkan lamaran");
      }
    } catch (err) {
      setDeleteError("Terjadi kesalahan saat membatalkan lamaran");
    }
    setIsDeleting(false);
  };

  const filteredApps = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  if (isLoading) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", padding: "80px 20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #f1f5f9",
              borderTopColor: "#FF5E00",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Memuat data progres lamaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top Header */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "24px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Portal Pelamar</span>
              <ChevronRight size={12} color="#94a3b8" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#FF5E00" }}>Lamaran Saya</span>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#00205B", margin: 0, letterSpacing: "-0.02em" }}>
              Progres Lamaran Kerja
            </h1>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "4px 0 0" }}>
              Pantau alur seleksi transparan dari tahap seleksi administrasi hingga offering letter resmi PT KAI Services.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
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
                }}
              >
                <Briefcase size={16} />
                Cari Lowongan Baru
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
          {FILTER_TABS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 18px",
                background: filter === f.key ? "#00205B" : "#ffffff",
                color: filter === f.key ? "#ffffff" : "#64748b",
                border: "2px solid",
                borderColor: filter === f.key ? "#00205B" : "#e2e8f0",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {f.label}
              {f.key === "all" ? ` (${applications.length})` : ""}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "80px 40px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Briefcase size={36} color="#94a3b8" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>
              Belum Ada Lamaran
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px", maxWidth: "420px", margin: "0 auto 28px", lineHeight: 1.5 }}>
              Anda belum melamar posisi apapun. Temukan lowongan karir menarik di PT Reska Multi Usaha dan kirim lamaran Anda sekarang.
            </p>
            <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "13px 28px",
                  background: "#FF5E00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(255,94,0,0.3)",
                }}
              >
                Lihat Lowongan Kerja
              </button>
            </Link>
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "50px 24px",
              textAlign: "center",
              border: "1px dashed #cbd5e1",
            }}
          >
            <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
              Tidak ada lamaran dengan status <strong>{FILTER_TABS.find(t => t.key === filter)?.label}</strong>.
            </p>
            <button
              onClick={() => setFilter("all")}
              style={{
                marginTop: "14px",
                padding: "8px 18px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#00205B",
                cursor: "pointer",
              }}
            >
              Tampilkan Semua Lamaran
            </button>
          </div>
        ) : (
          /* List of Applications with Full Stepper & Details */
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {filteredApps.map((app) => {
              const currentStage = getStageNumberFromStatus(app.status);
              const badge = getStatusBadgeConfig(app.status);
              const isTestActive = ["TEST_SCHEDULED", "IN_TEST"].includes(app.status);
              const isInterviewActive = app.status === "INTERVIEW";
              const isAccepted = app.status === "ACCEPTED";
              const isRejected = app.status === "REJECTED";

              const now = new Date();
              const isTestDone = app.testSession?.status === "SCORED" || app.testSession?.status === "SUBMITTED" || app.testSession?.status === "COMPLETED" || !!app.testSession?.submittedAt;
              const isTestExpired = app.testSession?.endTime ? now > new Date(app.testSession.endTime) : false;
              const canStartCatTest = app.testSession?.scheduledAt ? (now >= new Date(app.testSession.scheduledAt) && !isTestExpired && !isTestDone) : false;
              const isTestUpcoming = app.testSession?.scheduledAt ? now < new Date(app.testSession.scheduledAt) : false;

              return (
                <div
                  key={app.id}
                  id={`app-${app.id}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1.5px solid #e2e8f0",
                    padding: "26px 30px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Job Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      paddingBottom: "18px",
                      borderBottom: "1px solid #f1f5f9",
                      marginBottom: "22px",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#00205B", margin: 0 }}>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Building2 size={14} color="#94a3b8" /> PT Reska Multi Usaha
                        </span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={14} color="#94a3b8" /> {app.job?.location || "Indonesia"}
                        </span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={14} color="#94a3b8" /> Dilamar: {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                  </div>

                  {/* RECRUITMENT PIPELINE STEPPER TRACKER */}
                  <div style={{ marginBottom: "26px" }}>
                    <div style={{ position: "relative", marginBottom: "8px" }}>
                      {/* Inactive Track Line */}
                      <div
                        style={{
                          position: "absolute",
                          top: "18px",
                          left: "10%",
                          width: "80%",
                          transform: "translateY(-50%)",
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
                          left: "10%",
                          width: `${Math.max(0, Math.min(80, ((currentStage - 1) / 4) * 80))}%`,
                          transform: "translateY(-50%)",
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Test CAT Online Banner */}
                    {isTestActive && (
                      <div
                        style={{
                          background: isTestDone
                            ? "#f0fdf4"
                            : isTestExpired
                            ? "#fee2e2"
                            : canStartCatTest
                            ? "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
                            : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                          borderRadius: "14px",
                          padding: "18px 20px",
                          border: `1.5px solid ${
                            isTestDone
                              ? "#bbf7d0"
                              : isTestExpired
                              ? "#fca5a5"
                              : canStartCatTest
                              ? "#fed7aa"
                              : "#fde68a"
                          }`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background: isTestDone
                                ? "#16a34a"
                                : isTestExpired
                                ? "#dc2626"
                                : canStartCatTest
                                ? "#FF5E00"
                                : "#d97706",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              flexShrink: 0,
                              boxShadow: `0 4px 12px ${
                                isTestDone
                                  ? "rgba(22,163,74,0.3)"
                                  : isTestExpired
                                  ? "rgba(220,38,38,0.3)"
                                  : canStartCatTest
                                  ? "rgba(255,94,0,0.3)"
                                  : "rgba(217,119,6,0.3)"
                              }`,
                            }}
                          >
                            {isTestDone ? (
                              <CheckCircle2 size={24} />
                            ) : isTestExpired ? (
                              <AlertCircle size={24} />
                            ) : canStartCatTest ? (
                              <PlayCircle size={24} />
                            ) : (
                              <Clock size={24} />
                            )}
                          </div>
                          <div>
                            <h4
                              style={{
                                fontSize: "15px",
                                fontWeight: 800,
                                color: isTestDone
                                  ? "#166534"
                                  : isTestExpired
                                  ? "#991b1b"
                                  : canStartCatTest
                                  ? "#9a3412"
                                  : "#92400e",
                                margin: "0 0 2px",
                              }}
                            >
                              {isTestDone
                                ? "Ujian CAT Online Telah Selesai Dikerjakan"
                                : isTestExpired
                                ? "Waktu Ujian CAT Online Telah Berakhir"
                                : canStartCatTest
                                ? "Sesi Ujian CAT Online Telah Dimulai!"
                                : "Jadwal Ujian CAT Online"}
                            </h4>
                            <p
                              style={{
                                fontSize: "12.5px",
                                color: isTestDone
                                  ? "#14532d"
                                  : isTestExpired
                                  ? "#7f1d1d"
                                  : canStartCatTest
                                  ? "#7c2d12"
                                  : "#78350f",
                                margin: 0,
                              }}
                            >
                              {isTestDone
                                ? app.testSession?.totalScore !== null && app.testSession?.totalScore !== undefined
                                  ? `Skor Anda: ${app.testSession.totalScore} / 100. Jawaban Anda telah tersimpan.`
                                  : "Jawaban Anda telah tersimpan. Silakan pantau pengumuman tahap berikutnya."
                                : isTestExpired
                                ? "Batas waktu pengerjaan ujian telah habis. Anda tidak dapat mengerjakan tes ini lagi."
                                : canStartCatTest
                                ? app.testSession?.adminMessage || "Silakan persiapkan diri, pastikan koneksi lancar, dan kerjakan tepat waktu."
                                : app.testSession?.scheduledAt
                                ? `Waktu Ujian: ${new Date(app.testSession.scheduledAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} WIB. Ujian hanya dapat diakses saat jadwal tiba.`
                                : "Jadwal ujian akan segera diumumkan oleh HR."}
                            </p>
                          </div>
                        </div>

                        {canStartCatTest ? (
                          <Link
                            href={app.testSession?.id ? `/applicant/test/${app.testSession.id}` : `/applicant/test/${app.id}`}
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
                        ) : (
                          <Link href="/applicant/schedule" style={{ textDecoration: "none", flexShrink: 0 }}>
                            <button
                              style={{
                                padding: "10px 20px",
                                background: isTestDone ? "#16a34a" : isTestExpired ? "#dc2626" : "#d97706",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "13.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                boxShadow: `0 4px 12px ${
                                  isTestDone
                                    ? "rgba(22,163,74,0.3)"
                                    : isTestExpired
                                    ? "rgba(220,38,38,0.3)"
                                    : "rgba(217,119,6,0.3)"
                                }`,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Calendar size={16} /> Lihat Jadwal Seleksi
                            </button>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Interview Banner */}
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
                          flexWrap: "wrap",
                          gap: "14px",
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
                            Detail Jadwal Wawancara
                          </button>
                        </Link>
                      </div>
                    )}

                    {/* MCU Balai Yasa Banner */}
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
                              <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", background: app.medicalCheckup?.result === "FIT" ? "#16a34a" : "#0284c7", color: "#ffffff", padding: "2px 8px", borderRadius: "6px" }}>
                                {app.medicalCheckup?.result ? `Hasil MCU: ${app.medicalCheckup.result}` : "Tahap MCU Offline"}
                              </span>
                              <span style={{ fontSize: "12px", color: "#0369a1", fontWeight: 700 }}>Kantor Balai Yasa</span>
                            </div>
                            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0c4a6e", margin: "0 0 4px" }}>
                              {app.medicalCheckup?.result
                                ? `Hasil MCU: ${app.medicalCheckup.result === "FIT" ? "Memenuhi Syarat Kesehatan (FIT)" : app.medicalCheckup.result}`
                                : app.medicalCheckup?.scheduledAt
                                ? `Jadwal MCU: ${new Date(app.medicalCheckup.scheduledAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • ${new Date(app.medicalCheckup.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                                : "Selamat! Anda Lolos Wawancara dan Lanjut ke MCU Offline di Balai Yasa"}
                            </h4>
                            <p style={{ fontSize: "12.5px", color: "#0369a1", margin: 0, lineHeight: 1.5 }}>
                              {app.medicalCheckup?.result
                                ? "Hasil rekam medis pemeriksaan kesehatan di Balai Yasa telah selesai dievaluasi oleh dokter. Silakan periksa detail dan berkas di Jadwal Seleksi."
                                : app.medicalCheckup?.scheduledAt
                                ? `Lokasi: ${app.medicalCheckup.location || "Kantor Balai Yasa PT KAI"}. Wajib berpuasa 10-12 jam sebelum pemeriksaan laboratorium.`
                                : "Jadwal dan petunjuk persiapan pemeriksaan kesehatan di Kantor Balai Yasa sedang disiapkan oleh tim rekrutmen."}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                          {app.medicalCheckup?.document?.fileUrl && (
                            <a
                              href={app.medicalCheckup.document.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: "none" }}
                            >
                              <button
                                style={{
                                  padding: "10px 16px",
                                  background: "#ffffff",
                                  color: "#0284c7",
                                  border: "1.5px solid #0284c7",
                                  borderRadius: "10px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <FileText size={15} /> Berkas MCU
                              </button>
                            </a>
                          )}
                          <Link href="/applicant/schedule" style={{ textDecoration: "none" }}>
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
                              Detail Jadwal & Hasil MCU <ChevronRight size={15} />
                            </button>
                          </Link>
                        </div>
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
                                ? `Mulai Kerja: ${new Date(app.offering.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • Penempatan: ${(app.offering.workLocation || "KAI Services").replace(/JakartaKantor/g, "Jakarta, Kantor")}`
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

                    {/* Rekapitulasi Nilai & Evaluasi */}
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
                              <span style={{ fontSize: "11px", color: "#15803d", marginLeft: "6px", fontWeight: 600 }}>✓ Selesai</span>
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

                    {/* Admin Check Note */}
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

                    {/* Accepted Banner */}
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
                          Selamat! Anda dinyatakan lolos seleksi. Silakan cek menu Penawaran / Jadwal untuk konfirmasi Offering Letter.
                        </span>
                      </div>
                    )}

                    {/* Rejected Banner */}
                    {isRejected && (
                      <div
                        style={{
                          background: "#fef2f2",
                          borderRadius: "12px",
                          padding: "14px 18px",
                          border: "1px solid #fecaca",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          fontSize: "13px",
                          color: "#991b1b",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 700 }}>
                            Kualifikasi Belum Sesuai
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", color: "#7f1d1d" }}>
                          Terima kasih atas antusiasme Anda. Saat ini kualifikasi Anda belum memenuhi kriteria posisi ini. Tetap semangat dan coba posisi lain yang dibuka.
                        </p>
                        {app.notes && (
                          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fee2e2", marginTop: "4px" }}>
                            <strong>Alasan / Catatan HR:</strong> {app.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar (Edit / Cancel Lamaran for PENDING) */}
                    {app.status === "PENDING" && (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <Link href={`/applicant/apply/${app.job?.id}?edit=true`} style={{ textDecoration: "none" }}>
                          <button
                            style={{
                              padding: "8px 16px",
                              background: "#00205B",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Edit size={14} /> Edit Berkas
                          </button>
                        </Link>
                        <button
                          onClick={() => setSelectedAppToDelete(app)}
                          style={{
                            padding: "8px 16px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Trash2 size={14} /> Batalkan Lamaran
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Application Confirmation Modal */}
      {selectedAppToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <Trash2 size={26} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#111", margin: "0 0 8px" }}>
              Batalkan Lamaran?
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
              Apakah Anda yakin ingin membatalkan lamaran untuk posisi <strong>{selectedAppToDelete.job?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setSelectedAppToDelete(null); setDeleteError(""); }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Kembali
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
