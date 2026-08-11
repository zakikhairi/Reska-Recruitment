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
  Eye,
  Clock,
  BookOpen,
  UserCheck,
  XCircle,
  Plus,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  RefreshCw,
  Trophy,
} from "lucide-react";

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

  // Quick stats
  const quickStats = [
    { label: "Tes Aktif", value: testResults.filter((r: TestResult) => r.testStatus === "IN_PROGRESS" || r.testStatus === "NOT_STARTED").length, icon: BookOpen, color: "#00205B" },
    { label: "Menunggu Review", value: testResults.filter((r: TestResult) => r.testStatus === "SUBMITTED" && r.totalScore === null).length, icon: Clock, color: "#FF5E00" },
    { label: "Lulus Tes", value: testResults.filter((r: TestResult) => r.passed === true).length, icon: UserCheck, color: "#10B981" },
    { label: "Tidak Lulus", value: testResults.filter((r: TestResult) => r.passed === false).length, icon: XCircle, color: "#EF4444" },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Laporan & Analisis</h1>
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
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {quickStats.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: stat.color + "15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Stats */}
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
              <div style={{ width: "48px", height: "48px", background: "#16a34a15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award className="w-6 h-6" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a" }}>{stats.passingRate}%</p>
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

        {/* Statistik per Divisi */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Statistik per Divisi</h3>
          {divisionStats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              <p>Belum ada data</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eeeeee" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Divisi</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Total</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Lulus</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Passing</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Progress</th>
                  </tr>
                </thead>
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
          )}
        </div>

        {/* Kandidat Terbaik */}
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
