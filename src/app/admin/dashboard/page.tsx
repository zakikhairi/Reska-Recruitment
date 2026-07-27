"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  Filter,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useJobsStore } from "@/stores/jobs";
import { getAllApplications, getJobById, getAllUsers, updateApplicationStatus } from "@/lib/local-db";

const stats: { label: string; value: string; change: string; trend: "up" | "down"; icon: any; color: string }[] = [];
const statusDistribution: { name: string; value: number; color: string }[] = [];
const monthlyTrend = [
  { month: "Jan", pelamar: 0, lulus: 0 },
  { month: "Feb", pelamar: 0, lulus: 0 },
  { month: "Mar", pelamar: 0, lulus: 0 },
  { month: "Apr", pelamar: 0, lulus: 0 },
  { month: "Mei", pelamar: 0, lulus: 0 },
  { month: "Jun", pelamar: 0, lulus: 0 },
  { month: "Jul", pelamar: 0, lulus: 0 },
];
const recentApplications: any[] = [];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "INTERVIEW": return { bg: "#dbeafe", text: "#2563eb", label: "Interview", icon: <Clock className="w-3 h-3" /> };
    case "TEST_COMPLETED": return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "ADMIN_CHECK": return { bg: "#fef3c7", text: "#d97706", label: "Verifikasi", icon: <AlertCircle className="w-3 h-3" /> };
    case "REJECTED": return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: <XCircle className="w-3 h-3" /> };
    default: return { bg: "#f1f5f9", text: "#64748b", label: "Pending", icon: <Clock className="w-3 h-3" /> };
  }
};

export default function AdminDashboardPage() {
  const { jobs, _hasHydrated } = useJobsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applications, setApplications] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<typeof stats>([]);
  const [statusDist, setStatusDist] = useState<typeof statusDistribution>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (_hasHydrated) {
      loadData();
    }
  }, [_hasHydrated, jobs.length]);

  // Reload data periodically or on focus
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = () => {
    try {
      // Load applications from local database
      const allApps = getAllApplications();
      const users = getAllUsers();

      // Enrich applications with job and user data
      const enrichedApps = allApps.map(app => {
        const job = getJobById(app.jobPostingId);
        const user = users.find(u => u.id === app.applicantId);
        return {
          ...app,
          applicationId: app.id,
          jobTitle: job?.title || "Lowongan",
          division: job?.division || "Umum",
          applicantName: user?.fullName || user?.email?.split("@")[0] || "Pelamar",
        };
      });

      setApplications(enrichedApps);

      // Calculate stats
      const totalApplicants = allApps.length;
      const activeJobsCount = jobs.filter(j => j.status === "ACTIVE").length;
      const completedTests = allApps.filter(a => a.status === "TEST_COMPLETED").length;
      const passedTests = allApps.filter(a => ["ACCEPTED", "INTERVIEW", "MCU", "OFFERED"].includes(a.status)).length;
      const passingRate = totalApplicants > 0 ? Math.round((passedTests / totalApplicants) * 100) : 0;

      setStatsData([
        { label: "Total Pelamar", value: totalApplicants.toString(), change: "+0%", trend: totalApplicants > 0 ? "up" : "down", icon: Users, color: "#00205B" },
        { label: "Tes Diselesaikan", value: completedTests.toString(), change: "+0%", trend: completedTests > 0 ? "up" : "down", icon: ClipboardCheck, color: "#16a34a" },
        { label: "Passing Rate", value: `${passingRate}%`, change: "+0%", trend: passingRate > 50 ? "up" : "down", icon: TrendingUp, color: "#f59e0b" },
        { label: "Lowongan Aktif", value: activeJobsCount.toString(), change: "+0%", trend: activeJobsCount > 0 ? "up" : "down", icon: Briefcase, color: "#8b5cf6" },
      ]);

      // Status distribution
      const statusCounts = allApps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStatusDist([
        { name: "Pending", value: statusCounts["PENDING"] || 0, color: "#F59E0B" },
        { name: "Verifikasi", value: statusCounts["ADMIN_CHECK"] || 0, color: "#d97706" },
        { name: "Dalam Tes", value: (statusCounts["TEST_SCHEDULED"] || 0) + (statusCounts["IN_TEST"] || 0), color: "#8B5CF6" },
        { name: "Interview", value: statusCounts["INTERVIEW"] || 0, color: "#3B82F6" },
        { name: "Ditolak", value: statusCounts["REJECTED"] || 0, color: "#EF4444" },
        { name: "Diterima", value: (statusCounts["ACCEPTED"] || 0) + (statusCounts["OFFERED"] || 0) + (statusCounts["MCU"] || 0), color: "#10B981" },
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = (applicationId: string, newStatus: string) => {
    if (!applicationId) return;
    updateApplicationStatus(applicationId, newStatus);
    loadData(); // Refresh data
  };

  // Filter and sort applications based on search query
  const filteredApplications = applications
    .filter((app) => {
      // Filter by status if not "all"
      if (statusFilter !== "all" && app.status !== statusFilter) return false;

      // If no search query, show all
      if (!searchQuery.trim()) return true;

      // Search by name (case insensitive)
      const query = searchQuery.toLowerCase();
      return app.applicantName?.toLowerCase().includes(query) || app.jobTitle?.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Wait for hydration
  if (!_hasHydrated || isLoading) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Dashboard HR</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Ringkasan aktivitas rekrutmen • Juli 2026</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={loadData}
              style={{ padding: "10px", background: "#f1f5f9", border: "none", borderRadius: "12px", cursor: "pointer" }}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" style={{ color: "#64748b" }} />
            </button>
            <button style={{ position: "relative", padding: "10px", background: "#f1f5f9", border: "none", borderRadius: "12px", cursor: "pointer" }}>
              <Bell className="w-5 h-5" style={{ color: "#64748b" }} />
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }} />
            </button>
            <Link href="/admin/jobs/create">
              <button style={{ padding: "12px 20px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>
                <Plus className="w-4 h-4" />
                Buat Lowongan
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {statsData.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", background: `${stat.color}15`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: stat.trend === "up" ? "#16a34a" : "#ef4444" }}>
                  {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "#888888" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Recent Applications Table */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>Lamaran Terbaru</h2>
                  <p style={{ fontSize: "14px", color: "#888888" }}>{filteredApplications.length} pelamar ditemukan</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <Search className="w-4 h-4" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ padding: "10px 14px 10px 42px", border: "2px solid #eeeeee", borderRadius: "10px", fontSize: "14px", outline: "none", width: "200px" }}
                    />
                  </div>
                  <button style={{ padding: "10px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#666666", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eeeeee" }}>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Posisi</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skor</th>
                      <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                          <p style={{ color: "#888888", fontSize: "14px" }}>Belum ada lamaran</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const status = getStatusConfig(app.status);
                        return (
                          <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>
                                  {(app.applicantName || "P").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{app.applicantName || "Pelamar"}</p>
                                  <p style={{ fontSize: "12px", color: "#888888" }}>ID: #{app.id}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{app.jobTitle}</p>
                              <p style={{ fontSize: "12px", color: "#888888" }}>{(app.division || "").replace("_", " ")}</p>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ fontSize: "14px", color: "#666666" }}>
                                {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ fontSize: "14px", color: "#888888" }}>-</span>
                            </td>
                            <td style={{ padding: "16px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                {/* Quick Accept Button */}
                                {app.status === "ADMIN_CHECK" && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "TEST_SCHEDULED")}
                                    style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Terima ke Tahap Tes"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {app.status === "TEST_COMPLETED" && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "INTERVIEW")}
                                    style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Terima ke Tahap Interview"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Quick Reject Button */}
                                {(app.status === "ADMIN_CHECK" || app.status === "TEST_SCHEDULED" || app.status === "TEST_COMPLETED" || app.status === "INTERVIEW") && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "REJECTED")}
                                    style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Tolak"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <Link href={`/admin/applicants/${app.applicationId}`}>
                                  <button style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#888888" }}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eeeeee" }}>
                <p style={{ fontSize: "14px", color: "#888888" }}>Menampilkan {filteredApplications.length} dari {applications.length} data</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }} disabled>Sebelumnya</button>
                  <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }}>Selanjutnya</button>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>Tren Pelamar Bulanan</h2>
                  <p style={{ fontSize: "14px", color: "#888888" }}>Data pelamar dan kelulusan per bulan</p>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#00205B", borderRadius: "50%" }} />
                    <span style={{ color: "#666666" }}>Total Pelamar</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#10B981", borderRadius: "50%" }} />
                    <span style={{ color: "#666666" }}>Lulus</span>
                  </div>
                </div>
              </div>

              {/* Simple bar chart visualization */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "160px", padding: "0 8px" }}>
                {monthlyTrend.map((data, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "120px" }}>
                      <div style={{ width: "20px", background: "linear-gradient(180deg, #00205B 0%, #003380 100%)", borderRadius: "6px 6px 0 0", minHeight: `${(data.pelamar / 250) * 120}px` }} title={`${data.pelamar} pelamar`} />
                      <div style={{ width: "20px", background: "linear-gradient(180deg, #10B981 0%, #059669 100%)", borderRadius: "6px 6px 0 0", minHeight: `${(data.lulus / 250) * 120}px` }} title={`${data.lulus} lulus`} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#888888", fontWeight: 500 }}>{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Status Distribution */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Distribusi Status</h2>

              {/* Simple pie chart visualization */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div style={{ width: "140px", height: "140px", borderRadius: "50%", background: "#f1f5f9", position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80px", height: "80px", background: "#ffffff", borderRadius: "50%" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>{applications.length}</div>
                      <div style={{ fontSize: "11px", color: "#888888" }}>Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {statusDist.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "10px", height: "10px", background: item.color, borderRadius: "50%" }} />
                      <span style={{ fontSize: "14px", color: "#666666" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Aksi Cepat</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/admin/jobs/create" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#fff7f0", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus className="w-5 h-5" style={{ color: "#FF5E00" }} />
                    </div>
                    Buat Lowongan Baru
                  </button>
                </Link>
                <Link href="/admin/questions" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ClipboardCheck className="w-5 h-5" style={{ color: "#00205B" }} />
                    </div>
                    Kelola Bank Soal
                  </button>
                </Link>
                <Link href="/admin/reports" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Download className="w-5 h-5" style={{ color: "#16a34a" }} />
                    </div>
                    Export Laporan
                  </button>
                </Link>
              </div>
            </div>

              {/* Top Divisi */}
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Lowongan Aktif</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {jobs.filter(j => j.status === "ACTIVE").length === 0 ? (
                  <p style={{ color: "#888888", fontSize: "14px", textAlign: "center", padding: "20px" }}>Belum ada lowongan aktif</p>
                ) : (
                  jobs.filter(j => j.status === "ACTIVE").map((div: any, i: number) => (
                    <div key={div.id || i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{div.title}</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#FF5E00" }}>{applications.filter(a => a.jobPostingId === div.id).length}</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "30%", background: "#FF5E00", borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
        }
        button:hover { border-color: #FF5E00 !important; }
        input:focus { border-color: #FF5E00 !important; }
      `}</style>
    </div>
  );
}
