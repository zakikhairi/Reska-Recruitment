"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return { bg: "#fef3c7", text: "#d97706", label: "Menunggu", icon: <Clock className="w-4 h-4" /> };
    case "ADMIN_CHECK":
      return { bg: "#dbeafe", text: "#2563eb", label: "Verifikasi", icon: <AlertCircle className="w-4 h-4" /> };
    case "TEST":
    case "IN_TEST":
    case "TEST_SCHEDULED":
      return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes", icon: <Clock className="w-4 h-4" /> };
    case "TEST_COMPLETED":
      return { bg: "#d1fae5", text: "#059669", label: "Tes Selesai", icon: <CheckCircle className="w-4 h-4" /> };
    case "INTERVIEW":
      return { bg: "#fae8ff", text: "#c026d3", label: "Interview", icon: <User className="w-4 h-4" /> };
    case "MCU":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "MCU", icon: <User className="w-4 h-4" /> };
    case "OFFERING":
    case "OFFERED":
      return { bg: "#d1fae5", text: "#059669", label: "Offering", icon: <CheckCircle className="w-4 h-4" /> };
    case "ACCEPTED":
      return { bg: "#d1fae5", text: "#059669", label: "Diterima", icon: <CheckCircle className="w-4 h-4" /> };
    case "REJECTED":
      return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: <XCircle className="w-4 h-4" /> };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: status, icon: <Clock className="w-4 h-4" /> };
  }
};

interface ApplicantData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  nik: string;
  phone: string;
  education: string;
  createdAt: string;
  applications: Array<{
    id: string;
    status: string;
    jobTitle: string;
    division: string;
    appliedAt: string;
  }>;
  hasApplied: boolean;
}

export default function ApplicantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [applicants, setApplicants] = useState<ApplicantData[]>([]);

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/pelamar');
      const result = await response.json();

      if (result.success) {
        setApplicants(result.applicants || []);
      }
    } catch (err) {
      console.error("Error loading applicants:", err);
    }
    setIsLoading(false);
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nik.includes(searchQuery);
    const matchDivision = divisionFilter === "all" ||
      app.applications.some(a => a.division === divisionFilter);
    const matchStatus = statusFilter === "all" ||
      statusFilter === "BELUM_MELAMAR" && !app.hasApplied ||
      app.applications.some(a => a.status === statusFilter);

    if (statusFilter === "BELUM_MELAR") return !app.hasApplied && matchSearch && matchDivision;
    return matchSearch && matchStatus && matchDivision;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Manajemen Pelamar</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>{filteredApplicants.length} pelamar terdaftar</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="outline" size="sm" onClick={loadApplicants}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "280px" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="Cari nama, email, atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 48px", border: "2px solid #eeeeee", borderRadius: "12px", fontSize: "14px", outline: "none" }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "12px 40px 12px 16px", border: "2px solid #eeeeee", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
            >
              <option value="all">Semua Status</option>
              <option value="BELUM_MELAR">Belum Lamar</option>
              <option value="PENDING">Menunggu</option>
              <option value="ADMIN_CHECK">Verifikasi Dokumen</option>
              <option value="TEST_SCHEDULED">Menunggu Tes</option>
              <option value="TEST_COMPLETED">Tes Selesai</option>
              <option value="INTERVIEW">Interview</option>
              <option value="MCU">MCU</option>
              <option value="OFFERING">Offering</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Ditolak</option>
            </select>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              style={{ padding: "12px 40px 12px 16px", border: "2px solid #eeeeee", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
            >
              <option value="all">Semua Divisi</option>
              <option value="ON_TRAIN_SERVICE">On-Train Service</option>
              <option value="RES_CLEAN">ResClean</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="LOGISTICS">Logistics</option>
              <option value="ADMIN">Admin</option>
              <option value="RES_PARKING">ResParking</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px", textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#666666" }}>Memuat...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "80px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <UserPlus style={{ width: "80px", height: "80px", margin: "0 auto 24px", color: "#e5e5e5" }} />
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Belum Ada Pelamar</h2>
            <p style={{ fontSize: "15px", color: "#666" }}>Belum ada pelamar yang terdaftar dalam sistem.</p>
          </div>
        ) : (
          /* Applicants Table */
          <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eeeeee" }}>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>NIK</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pendidikan</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lowongan</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal Daftar</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => {
                    const latestApp = app.applications[0];
                    const status = latestApp ? getStatusConfig(latestApp.status) : { bg: "#f1f5f9", text: "#64748b", label: "Belum Lamar", icon: <Clock className="w-4 h-4" /> };
                    const divisionLabel = latestApp?.division?.replace(/_/g, " ") || "-";

                    return (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "14px", fontWeight: 700 }}>
                              {app.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "2px" }}>{app.fullName}</p>
                              <p style={{ fontSize: "12px", color: "#888888" }}>{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: "14px", color: "#666666" }}>{app.nik}</span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                            <GraduationCap className="w-3 h-3" />
                            {app.education}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          {app.hasApplied ? (
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{latestApp?.jobTitle || "-"}</p>
                              <p style={{ fontSize: "12px", color: "#888888" }}>{divisionLabel}</p>
                            </div>
                          ) : (
                            <span style={{ fontSize: "14px", color: "#888888" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: "14px", color: "#666666" }}>
                            {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            {app.hasApplied ? (
                              <Link href={`/admin/applicants/${latestApp.id}`}>
                                <button style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                            ) : (
                              <button style={{ padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "not-allowed", color: "#888888", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderTop: "1px solid #eeeeee" }}>
              <p style={{ fontSize: "14px", color: "#888888" }}>
                Menampilkan {filteredApplicants.length} dari {applicants.length} pelamar
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }} disabled>Sebelumnya</button>
                <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }}>Selanjutnya</button>
              </div>
            </div>
          </div>
        )}
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
