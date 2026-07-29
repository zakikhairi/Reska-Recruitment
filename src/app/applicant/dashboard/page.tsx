"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN_CHECK: { bg: "#fef3c7", text: "#d97706", label: "Menunggu Review HR" },
  TEST_SCHEDULED: { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" },
  IN_TEST: { bg: "#e0e7ff", text: "#4f46e5", label: "Sedang Tes" },
  TEST_COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" },
  INTERVIEW: { bg: "#fce7f3", text: "#be185d", label: "Interview" },
  MCU: { bg: "#d1fae5", text: "#059669", label: "Medical Check-Up" },
  OFFERING: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
  OFFERED: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
  ACCEPTED: { bg: "#dcfce7", text: "#16a34a", label: "Diterima" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626", label: "Ditolak" },
  PENDING: { bg: "#f1f5f9", text: "#64748b", label: "Menunggu" },
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
}

export default function ApplicantDashboardPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Pelamar");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch applications from API
      const response = await fetch(`/api/apply?userId=${user.id}`);
      const result = await response.json();

      if (result.success && result.applications) {
        setApplications(result.applications);
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

  const pendingApps = applications.filter(a => !["ACCEPTED", "REJECTED"].includes(a.status)).length;
  const testApps = applications.filter(a => ["TEST_SCHEDULED", "IN_TEST"].includes(a.status)).length;
  const interviewApps = applications.filter(a => a.status === "INTERVIEW").length;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Dashboard Pelamar</h1>
          <p style={{ fontSize: "15px", color: "#666" }}>Selamat datang, <strong>{userName}</strong></p>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "48px", height: "48px", background: "#f0f4ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{applications.length}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Total Lamaran</div>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "48px", height: "48px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{pendingApps}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Menunggu Seleksi</div>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "48px", height: "48px", background: "#dbeafe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/><rect x="3" y="4" width="18" height="18" rx="2"/>
              </svg>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{testApps}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Menunggu Tes</div>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "48px", height: "48px", background: "#fce7f3", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{interviewApps}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>Interview</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px" }}>
          {/* Applications List */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Lamaran Saya</h2>
              <Link href="/applicant/applications" style={{ fontSize: "14px", color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>Lihat Semua</Link>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: "#666" }}>Memuat...</p>
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#f8f9fa", borderRadius: "14px" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Belum Ada Lamaran</h3>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Mulai lamar pekerjaan yang Anda minati</p>
                <Link href="/applicant/jobs">
                  <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Lihat Lowongan</button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {applications.slice(0, 5).map((app) => {
                  const status = statusConfig[app.status] || statusConfig.PENDING;
                  return (
                    <div key={app.id} style={{ padding: "20px", borderRadius: "14px", border: "2px solid #eee", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>{app.job?.title || "Lowongan"}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{formatDivision(app.job?.division)}</span>
                            <span style={{ fontSize: "13px", color: "#888" }}>
                              {new Date(app.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                        <span style={{ padding: "6px 14px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Quick Actions */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Aksi Cepat</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eee", background: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                    Lihat Lowongan
                  </button>
                </Link>
                <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eee", background: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Edit Profil
                  </button>
                </Link>
                <Link href="/applicant/applications" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eee", background: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
                    Semua Lamaran
                  </button>
                </Link>
              </div>
            </div>

            {/* Info */}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
