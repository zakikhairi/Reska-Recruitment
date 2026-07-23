"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Download,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ChevronDown,
  Filter,
  Layers,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import { exportToPDF, exportToExcel, exportToCSV, ReportConfig } from "@/lib/export-utils";

const reportTypes = [
  { id: "monthly", name: "Laporan Bulanan", icon: Calendar, description: "Ringkasan bulanan pelamar dan hasil tes" },
  { id: "quarterly", name: "Laporan Kuartalan", icon: BarChart3, description: "Analisis mendalam per kuartal" },
  { id: "annual", name: "Laporan Tahunan", icon: TrendingUp, description: "Rekapitulasi tahunan seluruh rekrutmen" },
  { id: "analysis", name: "Analisis Passing Rate", icon: Award, description: "Analisis kelulusan per divisi/jabatan" },
  { id: "candidate", name: "Profil Kandidat", icon: Users, description: "Detail kandidat individual" },
  { id: "test", name: "Statistik Tes", icon: PieChart, description: "Performa tes kompetensi" },
];

const divisions = ["Semua Divisi", "On-Train Service", "ResClean", "IT Staff", "Logistics", "Admin"];
const positions = ["Semua Posisi", "Pramugara/Kereta", "Steward", "IT Support", "Teknisi", "Cleaning Service", "Administrasi"];
const periods = [
  { value: "jan", label: "Januari" },
  { value: "feb", label: "Februari" },
  { value: "mar", label: "Maret" },
  { value: "apr", label: "April" },
  { value: "mei", label: "Mei" },
  { value: "jun", label: "Juni" },
  { value: "jul", label: "Juli" },
  { value: "aug", label: "Agustus" },
  { value: "sep", label: "September" },
  { value: "oct", label: "Oktober" },
  { value: "nov", label: "November" },
  { value: "dec", label: "Desember" },
];

export default function CreateReportPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [division, setDivision] = useState("Semua Divisi");
  const [position, setPosition] = useState("Semua Posisi");
  const [period, setPeriod] = useState({ month: "", year: "2026", quarter: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [includeCandidateList, setIncludeCandidateList] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [reportTitle, setReportTitle] = useState("");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    if (!selectedType) return;

    setIsGenerating(true);

    // Build report config
    const config: ReportConfig = {
      title: reportTitle,
      type: selectedType,
      division,
      position,
      period,
      dateRange,
      includeCharts,
      includeStatistics,
      includeCandidateList,
      includeAnalysis,
    };

    // Generate report based on selected format
    setTimeout(() => {
      switch (reportFormat) {
        case "pdf":
          exportToPDF(config);
          break;
        case "xlsx":
          exportToExcel(config);
          break;
        case "csv":
          exportToCSV(config);
          break;
      }
      setIsGenerating(false);
      router.push("/admin/reports");
    }, 1000);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => router.push("/admin/reports")}
              style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
            </button>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Buat Laporan</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>Generate laporan rekrutmen sesuai kebutuhan</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
          {/* Left Column - Report Type Selection */}
          <div>
            {/* Step 1: Select Report Type */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>1. Pilih Jenis Laporan</h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Pilih jenis laporan yang ingin Anda buat</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => { setSelectedType(type.id); setReportTitle(type.name); }}
                    style={{
                      padding: "20px",
                      background: selectedType === type.id ? "#f0f4ff" : "#f8f9fa",
                      border: `2px solid ${selectedType === type.id ? "#00205B" : "transparent"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedType !== type.id) {
                        e.currentTarget.style.background = "#f0f4ff";
                        e.currentTarget.style.borderColor = "#00205B50";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedType !== type.id) {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    <div style={{ width: "48px", height: "48px", background: selectedType === type.id ? "#00205B" : "#ffffff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                      <type.icon className="w-6 h-6" style={{ color: selectedType === type.id ? "#ffffff" : "#00205B" }} />
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "4px" }}>{type.name}</p>
                    <p style={{ fontSize: "12px", color: "#888888", lineHeight: 1.4 }}>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Configure Report */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>2. Konfigurasi Laporan</h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Tentukan parameter dan periode laporan</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Divisi */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Divisi</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      {divisions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Posisi */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Posisi/Jabatan</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      {positions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bulan */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Bulan</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={period.month}
                      onChange={(e) => setPeriod({ ...period, month: e.target.value })}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      <option value="">Pilih Bulan</option>
                      {periods.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tahun */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Tahun</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={period.year}
                      onChange={(e) => setPeriod({ ...period, year: e.target.value })}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                {/* Date Range Start */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Tanggal Mulai</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Tanggal Akhir</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Report Contents */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>3. Konten Laporan</h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Pilih data yang ingin dimasukkan ke dalam laporan</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { id: "charts", label: "Grafik & Visualisasi", desc: "Tambahkan chart dan grafik statistik", state: includeCharts, setState: setIncludeCharts },
                  { id: "stats", label: "Statistik Utama", desc: "Total pelamar, passing rate, rata-rata skor", state: includeStatistics, setState: setIncludeStatistics },
                  { id: "candidates", label: "Daftar Kandidat", desc: "List kandidat dengan detail dan status", state: includeCandidateList, setState: setIncludeCandidateList },
                  { id: "analysis", label: "Analisis & Insights", desc: "Analisis mendalam dan rekomendasi", state: includeAnalysis, setState: setIncludeAnalysis },
                ].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "20px",
                      background: item.state ? "#f0f9ff" : "#f8f9fa",
                      border: `2px solid ${item.state ? "#00205B" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => item.setState(!item.state)}
                    onMouseEnter={(e) => {
                      if (!item.state) e.currentTarget.style.borderColor = "#00205B50";
                    }}
                    onMouseLeave={(e) => {
                      if (!item.state) e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    <div style={{
                      width: "48px",
                      height: "48px",
                      background: item.state ? "#00205B" : "#ffffff",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: `2px solid ${item.state ? "#00205B" : "#e5e7eb"}`,
                    }}>
                      {item.state ? (
                        <CheckCircle className="w-6 h-6" style={{ color: "#ffffff" }} />
                      ) : (
                        <div className="w-6 h-6" style={{ width: "24px", height: "24px", border: "2px solid #d1d5db", borderRadius: "6px" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111", marginBottom: "4px" }}>{item.label}</p>
                      <p style={{ fontSize: "13px", color: "#888888" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Generate */}
          <div>
            {/* Report Preview */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px", position: "sticky", top: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Preview Laporan</h2>

              {/* Title Input */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Judul Laporan</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Masukkan judul laporan..."
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                />
              </div>

              {/* Format Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "12px", display: "block" }}>Format Export</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { id: "pdf", label: "PDF", icon: FileText },
                    { id: "xlsx", label: "Excel", icon: Layers },
                    { id: "csv", label: "CSV", icon: Download },
                  ].map((format) => (
                    <div
                      key={format.id}
                      onClick={() => setReportFormat(format.id)}
                      style={{
                        flex: 1,
                        padding: "16px",
                        background: reportFormat === format.id ? "#00205B" : "#f8f9fa",
                        borderRadius: "12px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <format.icon className="w-6 h-6" style={{ color: reportFormat === format.id ? "#ffffff" : "#666666", margin: "0 auto 8px" }} />
                      <p style={{ fontSize: "13px", fontWeight: 600, color: reportFormat === format.id ? "#ffffff" : "#666666" }}>{format.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "16px" }}>Ringkasan</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Jenis</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {selectedType ? reportTypes.find(t => t.id === selectedType)?.name : "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Periode</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {period.month ? `${period.month} ${period.year}` : period.year}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Divisi</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{division}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Konten</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {[includeCharts, includeStatistics, includeCandidateList, includeAnalysis].filter(Boolean).length} item
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedType || isGenerating}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: selectedType ? "#FF5E00" : "#d1d5db",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: selectedType ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.2s",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{ width: "20px", height: "20px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      Generating {reportFormat.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate {reportFormat.toUpperCase()}
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push("/admin/reports")}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ffffff",
                    color: "#00205B",
                    border: "2px solid #00205B",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Batal
                </button>
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
