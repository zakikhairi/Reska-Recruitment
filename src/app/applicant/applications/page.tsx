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
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
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

      if (result.success) {
        setApplications(result.applications || []);
        if (result.applications?.length > 0 && !selectedApp) {
          setSelectedApp(result.applications[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
    setIsLoading(false);
  };

  const filteredApps = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  if (isLoading) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#666" }}>Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Lamaran Saya</h1>
            <p style={{ fontSize: "14px", color: "#666666" }}>0 lamaran</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "80px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="1.5" style={{ margin: "0 auto 24px" }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Belum Ada Lamaran</h2>
            <p style={{ fontSize: "15px", color: "#666", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
              Anda belum melamar pekerjaan apapun. Mulai lamar pekerjaan yang Anda minati.
            </p>
            <Link href="/applicant/jobs">
              <button style={{ padding: "14px 32px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>
                Lihat Lowongan
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Lamaran Saya</h1>
          <p style={{ fontSize: "14px", color: "#666666" }}>{applications.length} lamaran</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          {/* Left - Application List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["all", "PENDING", "ADMIN_CHECK", "TEST_SCHEDULED", "IN_TEST", "TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED", "REJECTED"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "8px 16px",
                  background: filter === f ? "#00205B" : "#fff",
                  color: filter === f ? "#fff" : "#666",
                  border: "2px solid",
                  borderColor: filter === f ? "#00205B" : "#e5e5e5",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  {f === "all" ? "Semua" : statusConfig[f]?.label || f}
                </button>
              ))}
            </div>

            {filteredApps.map((app) => {
              const status = statusConfig[app.status] || statusConfig.PENDING;
              const isSelected = selectedApp?.id === app.id;
              return (
                <div key={app.id} onClick={() => setSelectedApp(app)} style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  border: `2px solid ${isSelected ? "#FF5E00" : "transparent"}`,
                  backgroundColor: isSelected ? "#fff7f0" : "#fff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{app.job?.title || "Lowongan"}</h3>
                      <p style={{ fontSize: "13px", color: "#666" }}>
                        {app.job?.location || "Lokasi tidak disebutkan"} • {formatDivision(app.job?.division)}
                      </p>
                    </div>
                    <span style={{ padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{status.label}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    Dilamar: {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right - Detail */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: "24px" }}>
            {selectedApp ? (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>{selectedApp.job?.title || "Lowongan"}</h2>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>{selectedApp.job?.location || "Lokasi tidak disebutkan"}</p>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>{formatDivision(selectedApp.job?.division)}</p>
                <span style={{ display: "inline-block", padding: "8px 16px", background: statusConfig[selectedApp.status]?.bg, color: statusConfig[selectedApp.status]?.text, borderRadius: "20px", fontSize: "14px", fontWeight: 700, marginBottom: "24px" }}>
                  {statusConfig[selectedApp.status]?.label}
                </span>

                {/* Test Section - Removed per user request */}

                {selectedApp.status === "IN_TEST" && (
                  <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#fff", marginBottom: "12px", lineHeight: 1.5 }}>
                      ⏳ Tes sedang berlangsung. Segera selesaikan sebelum waktu habis!
                    </p>
                    <Link href={`/applicant/test/${selectedApp.id}`} style={{ textDecoration: "none" }}>
                      <button style={{
                        width: "100%",
                        padding: "14px",
                        background: "#fff",
                        color: "#f59e0b",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}>
                        Lanjutkan Tes
                      </button>
                    </Link>
                  </div>
                )}

                {selectedApp.status === "TEST_COMPLETED" && (
                  <div style={{ background: "#dcfce7", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600, margin: 0 }}>
                      ✅ Tes telah selesai. Menunggu hasil dari tim HR.
                    </p>
                  </div>
                )}

                {selectedApp.status === "REJECTED" && (
                  <div style={{ background: "#fee2e2", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#dc2626", fontWeight: 600, margin: "0 0 8px 0" }}>
                      ❌ Maaf, lamaran Anda tidak diterima.
                    </p>
                    {selectedApp.notes && (
                      <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", marginTop: "12px", textAlign: "left" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#666", margin: "0 0 4px 0" }}>Alasan Penolakan:</p>
                        <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: 1.5 }}>{selectedApp.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedApp.status === "ACCEPTED" && (
                  <div style={{ background: "#dcfce7", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600, margin: 0 }}>
                      🎉 Selamat! Anda diterima加入PT KAI Services!
                    </p>
                  </div>
                )}

                <div style={{ marginTop: "24px" }}>
                  <Link href="/applicant/jobs">
                    <button style={{ width: "100%", padding: "12px", background: "#f0f4ff", color: "#00205B", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                      Lihat Lowongan Lain
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                <p>Pilih lamaran untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
