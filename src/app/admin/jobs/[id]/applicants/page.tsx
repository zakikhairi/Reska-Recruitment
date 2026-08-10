"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING": return { bg: "#fef3c7", text: "#d97706", label: "Menunggu", icon: Clock };
    case "ADMIN_CHECK": return { bg: "#dbeafe", text: "#2563eb", label: "Verifikasi", icon: AlertCircle };
    case "TEST_SCHEDULED": return { bg: "#e0e7ff", text: "#4f46e5", label: "Tes Terjadwal", icon: Clock };
    case "IN_TEST": return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes", icon: Clock };
    case "TEST_COMPLETED": return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai", icon: CheckCircle };
    case "INTERVIEW": return { bg: "#fce7f3", text: "#be185d", label: "Interview", icon: UserCheck };
    case "MCU": return { bg: "#d1fae5", text: "#059669", label: "MCU", icon: CheckCircle };
    case "OFFERING": return { bg: "#fef3c7", text: "#d97706", label: "Offering", icon: CheckCircle };
    case "ACCEPTED": return { bg: "#dcfce7", text: "#16a34a", label: "Diterima", icon: CheckCircle };
    case "REJECTED": return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: XCircle };
    default: return { bg: "#f1f5f9", text: "#64748b", label: status, icon: Clock };
  }
};

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobRes = await fetch(`/api/admin/jobs/${id}`);
      const jobData = await jobRes.json();
      if (jobData.job) {
        setJob(jobData.job);
      }

      // Fetch applications for this job
      const appsRes = await fetch(`/api/admin/applications?jobId=${id}`);
      const appsData = await appsRes.json();
      if (appsData.success) {
        const formatted = appsData.applications.map((app: any) => ({
          id: app.id,
          applicantId: app.applicantId,
          name: app.applicant?.fullName || app.applicant?.email || "Pelamar",
          email: app.applicant?.email || "-",
          phone: app.applicant?.phone || "-",
          education: app.applicant?.education || "-",
          appliedDate: app.createdAt,
          status: app.status,
          score: app.testSession?.totalScore || null,
        }));
        setApplicants(formatted);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (applicantId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${applicantId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Status berhasil diubah`, "success");
        fetchData();
      } else {
        showToast(result.error || "Gagal mengubah status", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === "PENDING" || a.status === "ADMIN_CHECK").length,
    testCompleted: applicants.filter(a => a.status === "TEST_COMPLETED").length,
    interview: applicants.filter(a => a.status === "INTERVIEW").length,
    accepted: applicants.filter(a => ["OFFERING", "ACCEPTED"].includes(a.status)).length,
    rejected: applicants.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin/jobs">
              <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer" }}>
                <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Pelamar</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>{job?.title || "Lowongan"}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Pelamar", value: stats.total, color: "#00205B" },
            { label: "Menunggu", value: stats.pending, color: "#d97706" },
            { label: "Tes Selesai", value: stats.testCompleted, color: "#16a34a" },
            { label: "Interview", value: stats.interview, color: "#be185d" },
            { label: "Diterima", value: stats.accepted, color: "#10B981" },
            { label: "Ditolak", value: stats.rejected, color: "#EF4444" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: stat.color, marginBottom: "4px" }}>{stat.value}</p>
              <p style={{ fontSize: "12px", color: "#888888" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 12px 12px 44px", border: "2px solid #eeeeee", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "12px 40px 12px 16px", border: "2px solid #eeeeee", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="ADMIN_CHECK">Verifikasi</option>
              <option value="TEST_COMPLETED">Tes Selesai</option>
              <option value="INTERVIEW">Interview</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#666666" }}>Memuat...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Users className="w-16 h-16" style={{ margin: "0 auto 16px", color: "#cccccc" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111", marginBottom: "8px" }}>Tidak ada pelamar</h3>
              <p style={{ fontSize: "14px", color: "#888" }}>Belum ada pelamar untuk lowongan ini</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eeeeee" }}>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Pelamar</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Kontak</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Tanggal</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Skor</th>
                    <th style={{ textAlign: "center", padding: "14px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => {
                    const status = getStatusConfig(app.status);
                    return (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #00205B, #003380)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>
                              {app.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{app.name}</p>
                              <p style={{ fontSize: "12px", color: "#888" }}>{app.education}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <p style={{ fontSize: "14px", color: "#666" }}>{app.email}</p>
                          <p style={{ fontSize: "12px", color: "#888" }}>{app.phone}</p>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: "14px", color: "#666" }}>
                            {new Date(app.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                            <status.icon className="w-4 h-4" />
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          {app.score !== null ? (
                            <span style={{ padding: "4px 12px", background: app.score >= 70 ? "#dcfce7" : app.score >= 60 ? "#fef3c7" : "#fee2e2", color: app.score >= 70 ? "#16a34a" : app.score >= 60 ? "#d97706" : "#dc2626", borderRadius: "20px", fontSize: "14px", fontWeight: 700 }}>
                              {app.score}
                            </span>
                          ) : "-"}
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => setSelectedApplicant(app)}
                              style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {app.status !== "REJECTED" && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApplicant && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "500px", width: "100%", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Detail Pelamar</h2>
              <button onClick={() => setSelectedApplicant(null)} style={{ padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #00205B, #003380)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>
                  {selectedApplicant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{selectedApplicant.name}</h3>
                  {(() => { const s = getStatusConfig(selectedApplicant.status); return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: s.bg, color: s.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                      <s.icon className="w-3 h-3" />
                      {s.label}
                    </span>
                  )})()}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#888" }} />
                  <span style={{ fontSize: "14px", color: "#111" }}>{selectedApplicant.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Phone className="w-4 h-4" style={{ color: "#888" }} />
                  <span style={{ fontSize: "14px", color: "#111" }}>{selectedApplicant.phone}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Calendar className="w-4 h-4" style={{ color: "#888" }} />
                  <span style={{ fontSize: "14px", color: "#111" }}>
                    {new Date(selectedApplicant.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "14px 24px",
          background: toast.type === "success" ? "#10B981" : "#EF4444",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 600,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
