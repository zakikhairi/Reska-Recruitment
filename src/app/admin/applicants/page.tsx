"use client";

import { useState, useMemo, useEffect } from "react";
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
  ChevronDown,
  X,
  Check,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui";
import { getAllUsers, getAllApplications, getJobById, updateApplicationStatus, type User as UserType, type Application } from "@/lib/local-db";
import { useJobsStore } from "@/stores/jobs";

const statusOptions = [
  { value: "PENDING", label: "Menunggu", bg: "#fef3c7", text: "#d97706" },
  { value: "ADMIN_CHECK", label: "Verifikasi Admin", bg: "#dbeafe", text: "#2563eb" },
  { value: "TEST_SCHEDULED", label: "Jadwal Tes", bg: "#e0e7ff", text: "#4f46e5" },
  { value: "INTERVIEW", label: "Interview", bg: "#fae8ff", text: "#c026d3" },
  { value: "MCU", label: "Medical Check-Up", bg: "#d1fae5", text: "#059669" },
  { value: "OFFERED", label: "Offering", bg: "#fef3c7", text: "#d97706" },
  { value: "ACCEPTED", label: "Diterima", bg: "#dcfce7", text: "#16a34a" },
  { value: "REJECTED", label: "Ditolak", bg: "#fee2e2", text: "#dc2626" },
];

const getStatusConfig = (status: string) => {
  const found = statusOptions.find(s => s.value === status);
  if (found) return found;
  return { value: status, label: status, bg: "#f1f5f9", text: "#64748b" };
};

export default function ApplicantsPage() {
  const { jobs } = useJobsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load applicants
  useEffect(() => {
    if (!mounted) return;

    const users = getAllUsers();
    const applications = getAllApplications();

    // Filter only APPLICANT users
    const applicantUsers = users.filter(u => u.role === "APPLICANT");

    // Combine user data with application data
    const apps = applicantUsers.map((user: UserType) => {
      const userApps = applications.filter(a => a.applicantId === user.id);
      const latestApp = userApps[0];
      let jobTitle = "-";
      let division = "-";
      let jobId = "";

      if (latestApp) {
        const job = getJobById(latestApp.jobPostingId);
        if (job) {
          jobTitle = job.title;
          division = job.division;
          jobId = job.id;
        }
      }

      return {
        id: user.id,
        name: user.fullName || user.email.split("@")[0],
        email: user.email,
        nik: user.nik || "-",
        phone: user.phone || "-",
        education: user.education || "-",
        position: jobTitle,
        division: division,
        jobId: jobId,
        applicationId: latestApp?.id,
        status: latestApp?.status || "PENDING",
        appliedDate: latestApp?.createdAt || user.createdAt,
        score: null,
      };
    });

    setApplicants(apps);
  }, [mounted, jobs]);

  const handleUpdateStatus = (appId: string, newStatus: string) => {
    if (appId) {
      updateApplicationStatus(appId, newStatus);

      // Refresh the list
      const users = getAllUsers();
      const applications = getAllApplications();
      const applicantUsers = users.filter(u => u.role === "APPLICANT");

      const apps = applicantUsers.map((user: UserType) => {
        const userApps = applications.filter(a => a.applicantId === user.id);
        const latestApp = userApps[0];
        let jobTitle = "-";
        let division = "-";
        let jobId = "";

        if (latestApp) {
          const job = getJobById(latestApp.jobPostingId);
          if (job) {
            jobTitle = job.title;
            division = job.division;
            jobId = job.id;
          }
        }

        return {
          id: user.id,
          name: user.fullName || user.email.split("@")[0],
          email: user.email,
          nik: user.nik || "-",
          phone: user.phone || "-",
          education: user.education || "-",
          position: jobTitle,
          division: division,
          jobId: jobId,
          applicationId: latestApp?.id,
          status: latestApp?.status || "PENDING",
          appliedDate: latestApp?.createdAt || user.createdAt,
          score: null,
        };
      });

      setApplicants(apps);
      setShowStatusModal(false);
      setSelectedApplicant(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchDivision = divisionFilter === "all" || app.division === divisionFilter;
    return matchSearch && matchStatus && matchDivision;
  });

  if (!mounted) {
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
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Manajemen Pelamar</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola dan pantau seluruh pelamar</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
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
                placeholder="Cari nama atau email..."
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
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
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
            </select>
          </div>
        </div>

        {filteredApplicants.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "80px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="1.5" style={{ margin: "0 auto 24px" }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Belum Ada Pelamar</h2>
            <p style={{ fontSize: "15px", color: "#666" }}>Belum ada pelamar yang sesuai dengan filter.</p>
          </div>
        ) : (
          /* Applicants Table */
          <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eeeeee" }}>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Posisi</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pendidikan</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => {
                    const status = getStatusConfig(app.status);
                    return (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "14px", fontWeight: 700 }}>
                              {app.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "2px" }}>{app.name}</p>
                              <p style={{ fontSize: "12px", color: "#888888" }}>{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{app.position}</p>
                          <p style={{ fontSize: "12px", color: "#888888" }}>{app.division?.replace(/_/g, " ")}</p>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                            <GraduationCap className="w-3 h-3" />
                            {app.education}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: "14px", color: "#666666" }}>
                            {new Date(app.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            {/* Quick Accept Button */}
                            {app.status === "ADMIN_CHECK" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, "TEST_SCHEDULED")}
                                style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="Terima ke Tahap Tes"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {app.status === "TEST_COMPLETED" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, "INTERVIEW")}
                                style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="Terima ke Tahap Interview"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {app.status === "INTERVIEW" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, "OFFERED")}
                                style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="Offering"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {/* Quick Reject Button */}
                            {(app.status === "ADMIN_CHECK" || app.status === "TEST_SCHEDULED" || app.status === "INTERVIEW") && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, "REJECTED")}
                                style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="Tolak"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            {/* View Details */}
                            <Link href={`/admin/applicants/${app.applicationId}`}>
                              <button style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            {/* Change Status Button */}
                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setSelectedStatus(app.status);
                                setShowStatusModal(true);
                              }}
                              style={{ padding: "8px", background: "#fef3c7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="Ubah Status"
                            >
                              <ChevronDown className="w-4 h-4" />
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

      {/* Status Update Modal */}
      {showStatusModal && selectedApplicant && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "500px", width: "100%", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: 0 }}>Ubah Status Pelamar</h2>
                <p style={{ fontSize: "14px", color: "#666666", margin: "4px 0 0" }}>{selectedApplicant.name}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: "14px", color: "#666666", marginBottom: "16px" }}>Pilih status baru untuk pelamar:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleUpdateStatus(selectedApplicant.applicationId, status.value)}
                    style={{
                      padding: "16px 20px",
                      border: selectedStatus === status.value ? `2px solid ${status.text}` : "2px solid #e5e5e5",
                      borderRadius: "12px",
                      background: selectedStatus === status.value ? status.bg : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: status.text }} />
                    <span style={{ flex: 1, textAlign: "left", fontSize: "14px", fontWeight: 600, color: "#111111" }}>{status.label}</span>
                    {selectedStatus === status.value && <Check className="w-5 h-5" style={{ color: status.text }} />}
                  </button>
                ))}
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
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
