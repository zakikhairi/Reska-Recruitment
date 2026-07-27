"use client";

import { useState } from "react";
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
} from "lucide-react";

const stats = [
  { label: "Total Pelamar", value: "0", change: "+0%", trend: "up", icon: Users, color: "#00205B" },
  { label: "Tes Diselesaikan", value: "0", change: "+0%", trend: "up", icon: ClipboardCheck, color: "#16a34a" },
  { label: "Passing Rate", value: "0%", change: "+0%", trend: "up", icon: TrendingUp, color: "#f59e0b" },
  { label: "Lowongan Aktif", value: "3", change: "+0", trend: "up", icon: Briefcase, color: "#8b5cf6" },
];

const monthlyTrend = [
  { month: "Jan", pelamar: 0, lulus: 0 },
  { month: "Feb", pelamar: 0, lulus: 0 },
  { month: "Mar", pelamar: 0, lulus: 0 },
  { month: "Apr", pelamar: 0, lulus: 0 },
  { month: "Mei", pelamar: 0, lulus: 0 },
  { month: "Jun", pelamar: 0, lulus: 0 },
  { month: "Jul", pelamar: 0, lulus: 0 },
];

const statusDistribution = [
  { name: "Pending", value: 0, color: "#F59E0B" },
  { name: "Dalam Tes", value: 0, color: "#8B5CF6" },
  { name: "Interview", value: 0, color: "#3B82F6" },
  { name: "Ditolak", value: 0, color: "#EF4444" },
  { name: "Diterima", value: 0, color: "#10B981" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter and sort applications based on search query
  const filteredApplications = recentApplications
    .filter((app) => {
      // Filter by status if not "all"
      if (statusFilter !== "all" && app.status !== statusFilter) return false;

      // If no search query, show all
      if (!searchQuery.trim()) return true;

      // Search by name (case insensitive)
      const query = searchQuery.toLowerCase();
      return app.name.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      // If there's a search query, prioritize names that start with the query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);

        // Names starting with query come first
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then sort alphabetically
        return a.name.localeCompare(b.name);
      }
      // Default sort by date (newest first)
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });

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
          {stats.map((stat, i) => (
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
                    {filteredApplications.map((app) => {
                      const status = getStatusConfig(app.status);
                      return (
                        <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>
                                {app.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{app.name}</p>
                                <p style={{ fontSize: "12px", color: "#888888" }}>ID: #{app.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{app.job}</p>
                            <p style={{ fontSize: "12px", color: "#888888" }}>{app.division.replace("_", " ")}</p>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ fontSize: "14px", color: "#666666" }}>
                              {new Date(app.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            {app.score !== null ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "60px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${app.score}%`, background: app.score >= 80 ? "#16a34a" : app.score >= 70 ? "#f59e0b" : "#ef4444", borderRadius: "4px" }} />
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: app.score >= 80 ? "#16a34a" : app.score >= 70 ? "#f59e0b" : "#ef4444" }}>{app.score}%</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "14px", color: "#888888" }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <Link href={`/admin/applicants/${app.id}`}>
                              <button style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#888888" }}>
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eeeeee" }}>
                <p style={{ fontSize: "14px", color: "#888888" }}>Menampilkan {filteredApplications.length} dari {recentApplications.length} data</p>
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
                <div style={{ width: "140px", height: "140px", borderRadius: "50%", background: `conic-gradient(#F59E0B 0deg ${(145/892)*360}deg, #8B5CF6 0deg ${(145/892)*360}deg ${((145+89)/892)*360}deg, #3B82F6 0deg ${((145+89+56)/892)*360}deg ${((145+89+56+198)/892)*360}deg, #EF4444 0deg ${((145+89+56+198)/892)*360}deg ${((145+89+56+198+404)/892)*360}deg, #10B981 0deg)`, position: "relative" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80px", height: "80px", background: "#ffffff", borderRadius: "50%" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>892</div>
                      <div style={{ fontSize: "11px", color: "#888888" }}>Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {statusDistribution.map((item, i) => (
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
                {[
                  { name: "Pramugara Kereta Api", pelamar: 1, color: "#00205B" },
                  { name: "Staff IT Support", pelamar: 1, color: "#FF5E00" },
                  { name: "Staff Administrasi", pelamar: 1, color: "#8B5cf6" },
                ].map((div: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{div.name}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: div.color }}>{div.pelamar}</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(div.pelamar / 500) * 100}%`, background: div.color, borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
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
