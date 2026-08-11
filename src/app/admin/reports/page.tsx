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
  RefreshCw,
  Trophy,
} from "lucide-react";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/export-utils";

interface TestResult {
  sessionId: string;
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  division: string;
  status: string;
  testStatus: string;
  scheduledAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  totalScore: number | null;
  passed: boolean | null;
  categoryScores: {
    category: string;
    score: number;
    total: number;
    percentage: number;
    passingGrade: number;
    passed: boolean;
  }[];
}

const divisionLabels: Record<string, string> = {
  ON_TRAIN_SERVICE: "On-Train Service",
  RES_CLEAN: "ResClean",
  RES_PARKING: "ResParking",
  LOGISTICS: "Logistics",
  IT_STAFF: "IT Staff",
  ADMIN: "Admin",
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Real data state
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({
    totalPelamar: 0,
    passingRate: 0,
    avgScore: 0,
    completionRate: 0,
  });

  // Fetch test results
  const fetchTestResults = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/test-results");
      const data = await response.json();

      if (data.success) {
        setTestResults(data.results);

        // Calculate stats
        const results = data.results;
        const totalTests = results.length;
        const passedTests = results.filter((r: TestResult) => r.passed === true).length;
        const scoredTests = results.filter((r: TestResult) => r.totalScore !== null).length;
        const avgScore = scoredTests > 0
          ? Math.round(results.filter((r: TestResult) => r.totalScore !== null).reduce((sum: number, r: TestResult) => sum + (r.totalScore || 0), 0) / scoredTests)
          : 0;

        setStats({
          totalPelamar: totalTests,
          passingRate: scoredTests > 0 ? Math.round((passedTests / scoredTests) * 100) : 0,
          avgScore,
          completionRate: totalTests > 0 ? Math.round((scoredTests / totalTests) * 100) : 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch test results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get top 5 candidates (sorted by score)
  const topCandidates = [...testResults]
    .filter(r => r.totalScore !== null)
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 5);

  // Get passing rate by division
  const divisionStats = Object.entries(
    testResults.reduce((acc: Record<string, { total: number; passed: number }>, r) => {
      const div = divisionLabels[r.division] || r.division;
      if (!acc[div]) acc[div] = { total: 0, passed: 0 };
      acc[div].total++;
      if (r.passed) acc[div].passed++;
      return acc;
    }, {})
  ).map(([division, data]) => ({
    division,
    total: data.total,
    passed: data.passed,
    rate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
  }));

  // Get category averages
  const categoryAnalysis = (() => {
    const cats: Record<string, { total: number; count: number }> = {};
    testResults.forEach(r => {
      r.categoryScores.forEach(cat => {
        if (!cats[cat.category]) cats[cat.category] = { total: 0, count: 0 };
        cats[cat.category].total += cat.percentage;
        cats[cat.category].count++;
      });
    });
    return Object.entries(cats).map(([category, data]) => ({
      category,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      passRate: data.count > 0 ? Math.round((r => r.categoryScores.filter(c => c.passed).length / c.categoryScores.length) as any) : 0,
    }));
  })();

  // Quick stats
  const quickStats = [
    { label: "Tes Aktif", value: testResults.filter((r: TestResult) => r.testStatus === "IN_PROGRESS" || r.testStatus === "NOT_STARTED").length, icon: BookOpen, color: "#00205B" },
    { label: "Menunggu Review", value: testResults.filter((r: TestResult) => r.testStatus === "SUBMITTED" && r.totalScore === null).length, icon: Clock, color: "#FF5E00" },
    { label: "Lulus Tes", value: testResults.filter((r: TestResult) => r.passed === true).length, icon: UserCheck, color: "#10B981" },
    { label: "Tidak Lulus", value: testResults.filter((r: TestResult) => r.passed === false).length, icon: XCircle, color: "#EF4444" },
  ];

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
      totalApplicants: stats.totalPelamar,
      passingRate: stats.passingRate,
      avgScore: stats.avgScore,
      completionRate: stats.completionRate,
    },
    divisionStats: divisionStats,
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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={fetchTestResults}
              disabled={loading}
              style={{ padding: "10px 16px", background: "#f8f9fa", color: "#00205B", border: "1px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ padding: "10px 40px 10px 16px", border: "2px solid #eeeeee", borderRadius: "9999px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500 }}
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
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#00205B15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users className="w-6 h-6" style={{ color: "#00205B" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111" }}>{stats.totalPelamar}</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>Total Pelamar</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#10a3415", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award className="w-6 h-6" style={{ color: "#10B981" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#10B981" }}>{stats.passingRate}%</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>Passing Rate</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#FF5E0015", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp className="w-6 h-6" style={{ color: "#FF5E00" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111" }}>{stats.avgScore}%</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>Rata-rata Nilai</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#8B5CF615", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 className="w-6 h-6" style={{ color: "#8B5CF6" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111" }}>{stats.completionRate}%</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>Completion Rate</p>
              </div>
            </div>
          </div>
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
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: (data.applicants / 250) * 140 + "px" }}>
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
                      <td style={{ padding: "16px", textAlign: "center" }}><div style={{ width: "100px", height: "8px", background: "#f1f5f9", borderRadius: "4px", margin: "auto", overflow: "hidden" }}><div style={{ height: "100%", width: div.rate + "%", background: div.rate >= 70 ? "#10B981" : "#F59E0B", borderRadius: "4px" }} /></div></td>
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
                    <div style={{ height: "100%", width: cat.avgScore + "%", background: i === 0 ? "#00205B" : i === 1 ? "#FF5E00" : i === 2 ? "#10B981" : "#8B5CF6", borderRadius: "5px", transition: "width 0.5s ease" }} />
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
            <button
              onClick={() => router.push("/admin/reports/scores")}
              style={{ padding: "8px 16px", background: "#00205B", color: "#ffffff", border: "none", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Eye className="w-4 h-4" />
              Lihat Semua
            </button>
          </div>
          {topCandidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              <Trophy className="w-12 h-12" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: "14px" }}>Belum ada data kandidat dengan nilai</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              {topCandidates.map((candidate, i) => (
                <div key={i} style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center", position: "relative" }}>
                  {i < 3 && (
                    <div style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                      {i + 1}
                    </div>
                  )}
                  <div style={{ width: "56px", height: "56px", background: "#00205B", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>{candidate.applicantName.charAt(0).toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{candidate.applicantName}</p>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "12px" }}>{candidate.jobTitle}</p>
                  <span style={{ padding: "4px 10px", background: candidate.passed ? "#16a34a" : "#dc2626", color: "#ffffff", borderRadius: "9999px", fontSize: "14px", fontWeight: 700 }}>
                    {candidate.totalScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
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
