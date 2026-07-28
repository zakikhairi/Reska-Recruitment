"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  Clock,
  BookOpen,
  UserCheck,
  XCircle,
  TrendingDown,
  Target,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Clock3,
  CheckCheck,
  Plus,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
} from "lucide-react";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/export-utils";

const stats = [
  { label: "Total Pelamar", value: "1,247", change: "+12%", icon: Users, color: "#00205B", trend: "up" },
  { label: "Passing Rate", value: "72%", change: "-3%", icon: Award, color: "#10B981", trend: "down" },
  { label: "Avg. Score", value: "68", change: "+5%", icon: TrendingUp, color: "#FF5E00", trend: "up" },
  { label: "Completion Rate", value: "85%", change: "+8%", icon: BarChart3, color: "#8B5CF6", trend: "up" },
];

const quickStats = [
  { label: "Tes Aktif", value: "8", icon: BookOpen, color: "#00205B" },
  { label: "Menunggu Review", value: "24", icon: Clock, color: "#FF5E00" },
  { label: "Diterima", value: "156", icon: UserCheck, color: "#10B981" },
  { label: "Ditolak", value: "89", icon: XCircle, color: "#EF4444" },
];

const divisionStats = [
  { division: "On-Train Service", total: 412, passed: 298, rate: 72 },
  { division: "ResClean", total: 285, passed: 210, rate: 74 },
  { division: "IT Staff", total: 156, passed: 98, rate: 63 },
  { division: "Logistics", total: 198, passed: 145, rate: 73 },
  { division: "Admin", total: 196, passed: 141, rate: 72 },
];

const monthlyData = [
  { month: "Jan", applicants: 120, passed: 85, avgScore: 65 },
  { month: "Feb", applicants: 145, passed: 102, avgScore: 68 },
  { month: "Mar", applicants: 168, passed: 120, avgScore: 70 },
  { month: "Apr", applicants: 195, passed: 142, avgScore: 72 },
  { month: "Mei", applicants: 210, passed: 155, avgScore: 71 },
  { month: "Jun", applicants: 225, passed: 168, avgScore: 74 },
  { month: "Jul", applicants: 184, passed: 120, avgScore: 68 },
];

const categoryAnalysis = [
  { category: "AKHLAK", avgScore: 72, passRate: 78 },
  { category: "Hospitality", avgScore: 68, passRate: 71 },
  { category: "Technical", avgScore: 62, passRate: 65 },
  { category: "Aptitude", avgScore: 70, passRate: 74 },
];

const recentReports = [
  { id: "1", title: "Laporan Bulanan Juli 2026", date: "2026-07-22", type: "MONTHLY", size: "2.4 MB" },
  { id: "2", title: "Analisis Passing Rate per Divisi", date: "2026-07-20", type: "ANALYSIS", size: "1.8 MB" },
  { id: "3", title: "Rekap Tes Kompetensi Q2 2026", date: "2026-07-15", type: "QUARTERLY", size: "4.2 MB" },
  { id: "4", title: "Laporan Pelamar Baru", date: "2026-07-10", type: "WEEKLY", size: "890 KB" },
];

const testTypeStats = [
  { name: "AKHLAK", participants: 1247, avgScore: 72, color: "#00205B" },
  { name: "Hospitality", participants: 986, avgScore: 68, color: "#FF5E00" },
  { name: "Technical", participants: 654, avgScore: 62, color: "#10B981" },
  { name: "Aptitude", participants: 1102, avgScore: 70, color: "#8B5CF6" },
];

const candidateFunnel = [
  { stage: "Pendaftaran", count: 1247, color: "#00205B" },
  { stage: "Lulus Tes", count: 898, color: "#3B82F6" },
  { stage: "Interview", count: 456, color: "#FF5E00" },
  { stage: "Medical", count: 234, color: "#10B981" },
  { stage: "Offering", count: 156, color: "#8B5CF6" },
];

const topCandidates = [
  { name: "Ahmad Rizki Pratama", position: "Pramugara Kereta", score: 94, status: "Lulus" },
  { name: "Siti Nurhaliza", position: "Steward Kereta", score: 92, status: "Lulus" },
  { name: "Budi Santoso", position: "IT Support", score: 89, status: "Interview" },
  { name: "Dewi Lestari", position: "Admin", score: 88, status: "Interview" },
  { name: "Rizky Ramadhan", position: "Teknisi", score: 87, status: "Medical" },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "week": return "7 Hari Terakhir";
      case "month": return "Bulan Ini";
      case "quarter": return "3 Bulan Terakhir";
      case "year": return "Tahun Ini";
      default: return "Bulan Ini";
    }
  };

  const reportData = {
    title: "Laporan Rekrutmen KAI Services",
    dateRange: getDateRangeLabel(),
    stats: {
      totalApplicants: 1247,
      passingRate: 72,
      avgScore: 68,
      completionRate: 85,
    },
    divisionStats: divisionStats,
    testTypeStats: testTypeStats,
    monthlyData: monthlyData,
  };

  const handleExportPDF = () => {
    exportToPDF(reportData);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel(reportData);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(reportData);
    setShowExportMenu(false);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Laporan & Analisis</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Data dan statistik rekrutmen KAI Services</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }} ref={exportMenuRef}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ padding: "10px 40px 10px 16px", border: "2px solid #eeeeee", borderRadius: "9999px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"), backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
            >
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">3 Bulan Terakhir</option>
              <option value="year">Tahun Ini</option>
            </select>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{ padding: "10px 20px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>

              {showExportMenu && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #eeeeee", minWidth: "200px", zIndex: 100, overflow: "hidden" }}>
                  <div style={{ padding: "8px 0" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 16px 4px" }}>Export Laporan</p>
                    <button onClick={handleExportPDF} style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", background: "#dc2626", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText className="w-5 h-5" style={{ color: "#ffffff" }} /></div>
                      <div style={{ textAlign: "left" }}><p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0 }}>Export PDF</p><p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>Unduh laporan sebagai PDF</p></div>
                    </button>
                    <button onClick={handleExportExcel} style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", background: "#16a34a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileSpreadsheet className="w-5 h-5" style={{ color: "#ffffff" }} /></div>
                      <div style={{ textAlign: "left" }}><p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0 }}>Export Excel</p><p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>Unduh laporan sebagai XLSX</p></div>
                    </button>
                    <button onClick={handleExportCSV} style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", background: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileCode className="w-5 h-5" style={{ color: "#ffffff" }} /></div>
                      <div style={{ textAlign: "left" }}><p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0 }}>Export CSV</p><p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>Unduh laporan sebagai CSV</p></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {quickStats.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: stat.color + "15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>{stat.value}</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", background: ${stat.color}15, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111" }}>{stat.value}</p>
                  <p style={{ fontSize: "13px", color: "#888888" }}>{stat.label}</p>
                </div>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eeeeee", display: "flex", alignItems: "center", gap: "6px" }}>
                {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" style={{ color: "#10B981" }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: "#EF4444" }} />}
                <span style={{ fontSize: "13px", fontWeight: 600, color: stat.trend === "up" ? "#10B981" : "#EF4444" }}>{stat.change}</span>
                <span style={{ fontSize: "13px", color: "#888888" }}>vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Tren Pelamar Bulanan</h3>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "180px", paddingBottom: "40px", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: "40px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "11px", color: "#888888" }}>
                <span>250</span><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", flex: 1, height: "100%", paddingLeft: "40px" }}>
                {monthlyData.map((data, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: ${(data.applicants / 250) * 140}px }}>
                      <div style={{ width: "20px", background: "linear-gradient(180deg, #00205B 0%, #003380 100%)", borderRadius: "4px 4px 0 0" }} />
                      <div style={{ width: "20px", background: "linear-gradient(180deg, #10B981 0%, #059669 100%)", borderRadius: "4px 4px 0 0" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#888888", marginTop: "8px" }}>{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Distribusi Jenis Tes</h3>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{ position: "relative", width: "140px", height: "140px" }}>
                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#00205B" strokeWidth="20" strokeDasharray="75.4 251.2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#FF5E00" strokeWidth="20" strokeDasharray="59.7 251.2" strokeDashoffset="-75.4" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="41.9 251.2" strokeDashoffset="-135.1" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="74.1 251.2" strokeDashoffset="-177" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>1,247</p>
                  <p style={{ fontSize: "11px", color: "#888888" }}>Total</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {testTypeStats.map((test, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "12px", height: "12px", background: test.color, borderRadius: "3px" }} />
                    <div style={{ flex: 1 }}><p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{test.name}</p></div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{test.participants}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Funnel Kandidat</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0", justifyContent: "space-between" }}>
            {candidateFunnel.map((stage, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ height: "48px", background: stage.color, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>{stage.count}</span>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{stage.stage}</p>
                </div>
                {i < candidateFunnel.length - 1 && (
                  <div style={{ width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Statistik per Divisi</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "2px solid #eeeeee" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Divisi</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Total</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Lulus</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Passing</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Progress</th>
                </tr></thead>
                <tbody>
                  {divisionStats.map((div, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#111111" }}>{div.division}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#666666", textAlign: "center" }}>{div.total}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#666666", textAlign: "center" }}>{div.passed}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}><span style={{ padding: "6px 12px", background: div.rate >= 70 ? "#dcfce7" : "#fef3c7", color: div.rate >= 70 ? "#16a34a" : "#d97706", borderRadius: "9999px", fontSize: "13px", fontWeight: 600 }}>{div.rate}%</span></td>
                      <td style={{ padding: "16px", textAlign: "center" }}><div style={{ width: "100px", height: "8px", background: "#f1f5f9", borderRadius: "4px", margin: "auto", overflow: "hidden" }}><div style={{ height: "100%", width: ${div.rate}%, background: div.rate >= 70 ? "#10B981" : "#F59E0B", borderRadius: "4px" }} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Analisis per Kategori</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {categoryAnalysis.map((cat, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{cat.category}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{cat.avgScore}%</span>
                  </div>
                  <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: ${cat.avgScore}%, background: i === 0 ? "#00205B" : i === 1 ? "#FF5E00" : i === 2 ? "#10B981" : "#8B5CF6", borderRadius: "5px", transition: "width 0.5s ease" }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "#888888", marginTop: "4px" }}>Pass rate: {cat.passRate}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>Kandidat Terbaik</h3>
            <button style={{ padding: "8px 16px", background: "#f8f9fa", color: "#00205B", border: "none", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Lihat Semua</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
            {topCandidates.map((candidate, i) => (
              <div key={i} style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", background: hsl(, 70%, 60%), borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>{candidate.name.charAt(0)}</span>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{candidate.name}</p>
                <p style={{ fontSize: "12px", color: "#888888", marginBottom: "12px" }}>{candidate.position}</p>
                <span style={{ padding: "4px 10px", background: "#00205B", color: "#ffffff", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>{candidate.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>Laporan Tersedia</h3>
            <button onClick={() => router.push("/admin/reports/create")} style={{ padding: "10px 20px", background: "#00205B", color: "#ffffff", border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus className="w-4 h-4" />Buat Laporan
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {recentReports.map((report) => (
              <div key={report.id} style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}>
                <div style={{ width: "48px", height: "48px", background: "#ffffff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText className="w-6 h-6" style={{ color: "#00205B" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "4px" }}>{report.title}</p>
                  <p style={{ fontSize: "12px", color: "#888888" }}>{report.size} - {new Date(report.date).toLocaleDateString("id-ID")}</p>
                </div>
                <button style={{ padding: "10px", background: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}><Eye className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
