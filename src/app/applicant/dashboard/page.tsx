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
  MobileGrid
} from "@/components/layout";
import { Briefcase, User, FileText, Plus, AlertCircle, ChevronRight } from "lucide-react";

const formatDivision = (division: string | undefined): string => {
  const labels: Record<string, string> = {
    ON_TRAIN_SERVICE: "On-Train",
    RES_CLEAN: "ResClean",
    RES_PARKING: "ResParking",
    LOGISTICS: "Logistics",
    IT_STAFF: "IT Staff",
    ADMIN: "Admin",
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
    ACCEPTED: "success",
    REJECTED: "error",
    PENDING: "pending",
  };
  return map[status] || "pending";
};

interface TestSessionData {
  id: string;
  status: string;
  scheduledAt?: string;
  endTime?: string;
  submittedAt?: string;
}

interface InterviewData {
  id: string;
  scheduledAt: string;
  location: string;
  interviewer: string;
  type: string;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ADMIN_CHECK: "Verifikasi",
    TEST_SCHEDULED: "Tunggu Tes",
    IN_TEST: "Sedang Tes",
    TEST_COMPLETED: "Selesai",
    INTERVIEW: "Interview",
    MCU: "MCU",
    OFFERING: "Offering",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
    PENDING: "Menunggu",
  };
  return labels[status] || status;
};

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
}

type Application = ApplicationData;

// Status config yang lebih detail
const getStatusDisplay = (app: ApplicationData): { bg: string; text: string; label: string } => {
  const now = new Date();

  // Gunakan status dari database - ini adalah source of truth
  const dbStatus = app.status;

  // Mapping status database ke tampilan
  switch (dbStatus) {
    case "MCU":
      return { bg: "#d1fae5", text: "#059669", label: "Medical Check-Up" };
    case "OFFERING":
    case "OFFERED":
      return { bg: "#fef3c7", text: "#d97706", label: "Offering" };
    case "ACCEPTED":
      return { bg: "#dcfce7", text: "#16a34a", label: "Diterima" };
    case "REJECTED":
      return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak" };
    case "INTERVIEW":
      // Jika ada data interview, tampilkan info interview
      if (app.interview?.scheduledAt) {
        return { bg: "#fce7f3", text: "#be185d", label: "Interview" };
      }
      return { bg: "#fce7f3", text: "#be185d", label: "Interview" };
    case "TEST_COMPLETED":
      return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" };
    case "IN_TEST":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "Sedang Tes" };
    case "TEST_SCHEDULED":
      return { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" };
    case "ADMIN_CHECK":
      return { bg: "#fef3c7", text: "#d97706", label: "Menunggu Review HR" };
    case "PENDING":
      return { bg: "#f1f5f9", text: "#64748b", label: "Menunggu" };
    default:
      return statusConfig[dbStatus] || { bg: "#f1f5f9", text: "#64748b", label: dbStatus || "Menunggu" };
  }
};

export default function ApplicantDashboardPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Pelamar");
  const [showReminder, setShowReminder] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => { fetchData(); }, [user]);

  // Recalculate stats when applications change
  useEffect(() => {
    // Stats are now calculated inline in render
  }, [applications]);

  useEffect(() => {
    const checkReminder = async () => {
      if (!user?.id) return;
      try {
        const profileRes = await fetch(`/api/applicant/profile?userId=${user.id}`);
        const profileData = await profileRes.json();
        if (!profileData.profile) return;
        const p = profileData.profile;
        const isComplete = !!(p.fullName && p.nik && p.phone && p.address && p.city);
        if (isComplete) return;
        const dismissed = localStorage.getItem(`profile_reminder_dismissed_${user.id}`);
        if (dismissed) return;
        const appRes = await fetch(`/api/apply?userId=${user.id}`);
        const appData = await appRes.json();
        if (!appData.applications || appData.applications.length === 0) setShowReminder(true);
      } catch (err) { console.error("Failed:", err); }
    };
    checkReminder();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) { setIsLoading(false); return; }
    try {
      const response = await fetch(`/api/apply?userId=${user.id}`);
      const result = await response.json();
      if (result.success && result.applications) {
        // Fetch test session AND interview data for each application
        const appsWithData = await Promise.all(
          result.applications.map(async (app: any) => {
            try {
              // Fetch test session
              const testRes = await fetch(`/api/applicant/test-session?applicationId=${app.id}`);
              const testData = await testRes.json();

              // Fetch interview data
              const interviewRes = await fetch(`/api/applicant/interview?applicationId=${app.id}`);
              const interviewData = await interviewRes.json();

              return {
                ...app,
                testSession: testData.success ? {
                  id: testData.session?.id,
                  status: testData.session?.status,
                  scheduledAt: testData.session?.scheduledAt,
                  endTime: testData.session?.endTime,
                  submittedAt: testData.session?.submittedAt,
                } : undefined,
                interview: interviewData.success ? {
                  id: interviewData.interview?.id,
                  scheduledAt: interviewData.interview?.scheduledAt,
                  location: interviewData.interview?.location,
                  interviewer: interviewData.interview?.interviewer,
                  type: interviewData.interview?.type,
                } : undefined,
              };
            } catch {
              return app;
            }
          })
        );
        setApplications(appsWithData);
      }

      // Set user name from auth store
      if (user?.fullName) {
        setUserName(user.fullName);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setIsLoading(false);
  };

  const totalApps = applications.length;
  const pendingApps = applications.filter(a => !["ACCEPTED", "REJECTED"].includes(a.status)).length;
  const testApps = applications.filter(a => ["TEST_SCHEDULED", "IN_TEST"].includes(a.status)).length;
  const interviewApps = applications.filter(a => ["INTERVIEW", "MCU"].includes(a.status)).length;

  // ========== MOBILE VIEW ==========
  if (isMobile) {
    return (
      <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #00205B, #003380)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "12px",
          color: "#ffffff"
        }}>
          <p style={{ fontSize: "11px", opacity: 0.85, margin: "0 0 2px 0" }}>Selamat Datang,</p>
          <h1 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 10px 0" }}>{userName}</h1>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{totalApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Total</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{pendingApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Diproses</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{testApps + interviewApps}</div>
              <div style={{ fontSize: "8px", opacity: 0.85 }}>Tes/Iris</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <MobileSection title="Aksi Cepat">
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/applicant/jobs" style={{ flex: 1, textDecoration: "none" }}>
              <MobileCard style={{ textAlign: "center", padding: "12px" }}>
                <Briefcase size={20} color="#FF5E00" />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#111", marginTop: "4px" }}>Lowongan</div>
              </MobileCard>
            </Link>
            <Link href="/applicant/profile" style={{ flex: 1, textDecoration: "none" }}>
              <MobileCard style={{ textAlign: "center", padding: "12px" }}>
                <User size={20} color="#00205B" />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#111", marginTop: "4px" }}>Profil</div>
              </MobileCard>
            </Link>
          </div>
        </MobileSection>

        {/* Applications */}
        <MobileSection title="Lamaran Saya" action="Lihat Semua">
          {isLoading ? (
            <MobileLoading />
          ) : applications.length === 0 ? (
            <MobileEmpty
              icon={<FileText size={24} color="#94A3B8" />}
              title="Belum Ada Lamaran"
              description="Mulai lamar pekerjaan yang Anda minati"
              action={
                <Link href="/applicant/jobs" style={{ textDecoration: "none", width: "100%" }}>
                  <MobileButton><Plus size={14} /> Lihat Lowongan</MobileButton>
                </Link>
              }
            />
          ) : (
            <>
              {applications.slice(0, 5).map((app) => (
                <Link key={app.id} href="/applicant/applications" style={{ textDecoration: "none", display: "block", marginBottom: "10px" }}>
                  <MobileCard>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {app.job?.title || "Lowongan"}
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            padding: "2px 6px",
                            background: "#F0F4FF",
                            color: "#00205B",
                            borderRadius: "6px",
                            fontSize: "9px",
                            fontWeight: 600
                          }}>
                            {formatDivision(app.job?.division)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#888" }}>
                            {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <MobileBadge type={getMobileStatus(app.status)} label={getStatusLabel(app.status)} />
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #F1F5F9"
                    }}>
                      <span style={{ fontSize: "10px", color: "#888" }}>{app.job?.location || "-"}</span>
                      <ChevronRight size={12} color="#94A3B8" />
                    </div>
                  </MobileCard>
                </Link>
              ))}
            </>
          )}
        </MobileSection>

        {/* Info */}
        <MobileCard style={{ background: "#FFF5F0", border: "1px solid #FFE4D6" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <AlertCircle size={18} color="#FF5E00" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#00205B", marginBottom: "6px" }}>Alur Seleksi</div>
              <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 4px 0" }}>✓ Daftar & lengkapi profil</p>
                <p style={{ margin: "0 0 4px 0" }}>✓ Lamar posisi yang diinginkan</p>
                <p style={{ margin: "0 0 4px 0" }}>✓ Tunggu review HR</p>
                <p style={{ margin: "0 0 4px 0" }}>✓ Ikuti tes kompetensi</p>
                <p style={{ margin: 0 }}>✓ Interview & MCU</p>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Reminder Modal */}
        {showReminder && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "280px",
              width: "100%",
              textAlign: "center"
            }}>
              <div style={{
                width: "56px", height: "56px",
                background: "#FEF3C7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }}>
                <AlertCircle size={28} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: "0 0 6px 0" }}>Lengkapi Profil</h2>
              <p style={{ fontSize: "12px", color: "#666", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                Untuk melamar lowongan, silakan lengkapi data profil Anda terlebih dahulu.
              </p>
              <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                <MobileButton>Lengkapi Profil</MobileButton>
              </Link>
              <button
                onClick={() => {
                  setShowReminder(false);
                  if (user?.id) localStorage.setItem(`profile_reminder_dismissed_${user.id}`, "true");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "10px",
                  cursor: "pointer"
                }}
              >
                Nanti Saja
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== DESKTOP VIEW ==========
  return (
    <div>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Dashboard Pelamar</h1>
          <p style={{ fontSize: "15px", color: "#666" }}>Selamat datang, <strong>{userName}</strong></p>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
          {[
            { icon: <Briefcase size={22} />, value: totalApps, label: "Total Lamaran", color: "#00205B", bg: "#f0f4ff" },
            { icon: <AlertCircle size={22} />, value: pendingApps, label: "Menunggu Seleksi", color: "#d97706", bg: "#fef3c7" },
            { icon: <FileText size={22} />, value: testApps, label: "Menunggu Tes", color: "#2563eb", bg: "#dbeafe" },
            { icon: <User size={22} />, value: interviewApps, label: "Interview", color: "#be185d", bg: "#fce7f3" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ width: "48px", height: "48px", background: stat.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: stat.color }}>{stat.icon}</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "#888" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px" }}>
          {/* Applications */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Lamaran Saya</h2>
              <Link href="/applicant/applications" style={{ fontSize: "14px", color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>Lihat Semua</Link>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "#666" }}>Memuat...</p>
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#f8f9fa", borderRadius: "14px" }}>
                <FileText size={56} color="#e5e5e5" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Belum Ada Lamaran</h3>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Mulai lamar pekerjaan yang Anda minati</p>
                <Link href="/applicant/jobs"><button style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Lihat Lowongan</button></Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} style={{ padding: "20px", borderRadius: "14px", border: "2px solid #eee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>{app.job?.title || "Lowongan"}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{formatDivision(app.job?.division)}</span>
                          <span style={{ fontSize: "13px", color: "#888" }}>{new Date(app.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>
                      <span style={{ padding: "6px 14px", background: getMobileStatus(app.status) === "success" ? "#dcfce7" : getMobileStatus(app.status) === "warning" ? "#fef3c7" : getMobileStatus(app.status) === "error" ? "#fee2e2" : "#f1f5f9", color: getMobileStatus(app.status) === "success" ? "#16a34a" : getMobileStatus(app.status) === "warning" ? "#d97706" : getMobileStatus(app.status) === "error" ? "#dc2626" : "#64748b", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Aksi Cepat</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eee", background: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Briefcase size={20} color="#00205B" /> Lihat Lowongan
                  </button>
                </Link>
                <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eee", background: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <User size={20} color="#00205B" /> Edit Profil
                  </button>
                </Link>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Informasi</h2>
              <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.7 }}>
                <p style={{ marginBottom: "12px" }}>1. Daftar lowongan yang tersedia</p>
                <p style={{ marginBottom: "12px" }}>2. Lamar posisi yang diinginkan</p>
                <p style={{ marginBottom: "12px" }}>3. Tunggu hasil review HR</p>
                <p style={{ marginBottom: "12px" }}>4. Ikuti tes kompetensi</p>
                <p style={{ marginBottom: "12px" }}>5. Interview dengan tim HR</p>
                <p>6. Medical check-up & offering</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
