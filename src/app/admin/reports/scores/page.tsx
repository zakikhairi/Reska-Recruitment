"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Award,
  BarChart3,
  ChevronDown,
  RefreshCw,
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
  ADMIN: "Administrasi",
};

const categoryLabels: Record<string, string> = {
  AKHLAK: "Nilai AKHLAK",
  HOSPITALITY: "Hospitality",
  TECHNICAL: "Technical",
  FACILITY: "Facility",
  APTITUDE: "Tes Bakat",
};

export default function TestScoresPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/test-results");
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Failed to fetch test results:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision = !filterDivision || result.division === filterDivision;
    const matchesStatus = !filterStatus || result.status === filterStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  // Calculate stats
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed === true).length;
  const failedTests = results.filter((r) => r.passed === false).length;
  const avgScore =
    results.filter((r) => r.totalScore !== null).length > 0
      ? Math.round(
          results
            .filter((r) => r.totalScore !== null)
            .reduce((sum, r) => sum + (r.totalScore || 0), 0) /
            results.filter((r) => r.totalScore !== null).length
        )
      : 0;

  const handleViewDetail = (result: TestResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Nilai Tes Pelamar</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>Lihat hasil dan nilai tes kompetensi pelamar</p>
            </div>
            <button
              onClick={fetchResults}
              disabled={loading}
              style={{ padding: "10px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#00205B15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users className="w-6 h-6" style={{ color: "#00205B" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111", margin: 0 }}>{totalTests}</p>
                <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>Total Tes</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#16a34a15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle className="w-6 h-6" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", margin: 0 }}>{passedTests}</p>
                <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>Lulus</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#dc262615", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle className="w-6 h-6" style={{ color: "#dc2626" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#dc2626", margin: 0 }}>{failedTests}</p>
                <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>Tidak Lulus</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#FF5E0015", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp className="w-6 h-6" style={{ color: "#FF5E00" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111111", margin: 0 }}>{avgScore}%</p>
                <p style={{ fontSize: "13px", color: "#888888", margin: 0 }}>Rata-rata Nilai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="Cari nama pelamar atau posisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 40px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              style={{ padding: "10px 16px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", cursor: "pointer" }}
            >
              <option value="">Semua Divisi</option>
              <option value="ON_TRAIN_SERVICE">On-Train Service</option>
              <option value="RES_CLEAN">ResClean</option>
              <option value="RES_PARKING">ResParking</option>
              <option value="LOGISTICS">Logistics</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "10px 16px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", cursor: "pointer" }}
            >
              <option value="">Semua Status</option>
              <option value="TEST_COMPLETED">Selesai</option>
              <option value="SCORED">Sudah Dinilai</option>
              <option value="INTERVIEW">Interview</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#666" }}>Memuat hasil tes...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Trophy className="w-12 h-12" style={{ color: "#e5e5e5", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Belum Ada Data</h3>
              <p style={{ fontSize: "14px", color: "#888" }}>Belum ada pelamar yang menyelesaikan tes</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eeeeee" }}>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Pelamar</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Posisi</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Divisi</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Nilai Total</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Waktu Tes</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr key={result.sessionId} style={{ borderBottom: index < filteredResults.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", background: "#00205B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700 }}>{result.applicantName.charAt(0).toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{result.applicantName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#666" }}>{result.jobTitle}</td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#666" }}>{divisionLabels[result.division] || result.division}</td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        {result.totalScore !== null ? (
                          <span style={{ fontSize: "18px", fontWeight: 800, color: result.totalScore >= 70 ? "#16a34a" : result.totalScore >= 50 ? "#d97706" : "#dc2626" }}>
                            {result.totalScore}%
                          </span>
                        ) : (
                          <span style={{ fontSize: "14px", color: "#888" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        {result.passed === true ? (
                          <span style={{ padding: "6px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Lulus</span>
                        ) : result.passed === false ? (
                          <span style={{ padding: "6px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Tidak Lulus</span>
                        ) : (
                          <span style={{ padding: "6px 12px", background: "#fef3c7", color: "#d97706", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Belum Dinilai</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "13px", color: "#888" }}>
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => handleViewDetail(result)}
                          style={{ padding: "8px 16px", background: "#f8f9fa", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#00205B", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{ background: "#ffffff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#00205B", margin: 0 }}>Detail Nilai Tes</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <XCircle className="w-5 h-5" style={{ color: "#666" }} />
              </button>
            </div>

            {/* Applicant Info */}
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "56px", height: "56px", background: "#00205B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>{selectedResult.applicantName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: 0 }}>{selectedResult.applicantName}</h3>
                  <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 0" }}>{selectedResult.jobTitle} - {divisionLabels[selectedResult.division] || selectedResult.division}</p>
                </div>
              </div>
            </div>

            {/* Total Score */}
            <div style={{ background: selectedResult.passed ? "#dcfce7" : selectedResult.passed === false ? "#fee2e2" : "#fef3c7", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#888", margin: "0 0 8px" }}>Nilai Total</p>
              <p style={{ fontSize: "48px", fontWeight: 800, color: selectedResult.passed ? "#16a34a" : selectedResult.passed === false ? "#dc2626" : "#d97706", margin: 0 }}>
                {selectedResult.totalScore !== null ? `${selectedResult.totalScore}%` : "-"}
              </p>
              {selectedResult.passed === true ? (
                <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#16a34a", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>LULUS</span>
              ) : selectedResult.passed === false ? (
                <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#dc2626", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>TIDAK LULUS</span>
              ) : (
                <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#d97706", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>BELUM DINILAI</span>
              )}
            </div>

            {/* Category Breakdown */}
            {selectedResult.categoryScores.length > 0 && (
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#888", marginBottom: "12px", textTransform: "uppercase" }}>Detail per Kategori</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedResult.categoryScores.map((cat) => (
                    <div key={cat.category} style={{ background: "#f8f9fa", borderRadius: "10px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{categoryLabels[cat.category] || cat.category}</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: cat.passed ? "#16a34a" : "#dc2626" }}>{cat.percentage}%</span>
                      </div>
                      <div style={{ height: "8px", background: "#e5e5e5", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${cat.percentage}%`, background: cat.passed ? "#16a34a" : "#dc2626", borderRadius: "4px" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#888" }}>{cat.score}/{cat.total} benar</span>
                        <span style={{ fontSize: "12px", color: cat.passed ? "#16a34a" : "#dc2626" }}>Min: {cat.passingGrade}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Info */}
            <div style={{ marginTop: "20px", padding: "16px", background: "#f8f9fa", borderRadius: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#888", margin: "0 0 4px" }}>Waktu Jadwal</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: 0 }}>{selectedResult.scheduledAt ? new Date(selectedResult.scheduledAt).toLocaleString("id-ID") : "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#888", margin: "0 0 4px" }}>Waktu Mulai</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: 0 }}>{selectedResult.startedAt ? new Date(selectedResult.startedAt).toLocaleString("id-ID") : "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#888", margin: "0 0 4px" }}>Waktu Selesai</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: 0 }}>{selectedResult.submittedAt ? new Date(selectedResult.submittedAt).toLocaleString("id-ID") : "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#888", margin: "0 0 4px" }}>Status Seleksi</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: 0 }}>{selectedResult.status}</p>
                </div>
              </div>
            </div>
          </div>
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
