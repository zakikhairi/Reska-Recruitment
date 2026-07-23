"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Users,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  ChevronDown,
  UserCheck,
  X,
} from "lucide-react";
import { useJobsStore } from "@/stores/jobs";

// Mock applicants data
const applicantsData: Record<string, any[]> = {
  "1": [
    { id: "a1", name: "Ahmad Rizki Pratama", email: "ahmad.rizki@email.com", phone: "081234567890", appliedDate: "2026-07-15", status: "TEST_COMPLETED", score: 94, education: "SMA", location: "Jakarta", age: 25, gender: "Laki-laki" },
    { id: "a2", name: "Siti Nurhaliza", email: "siti.nurhaliza@email.com", phone: "081234567891", appliedDate: "2026-07-14", status: "INTERVIEW", score: 92, education: "SMA", location: "Bandung", age: 23, gender: "Perempuan" },
    { id: "a3", name: "Budi Santoso", email: "budi.santoso@email.com", phone: "081234567892", appliedDate: "2026-07-13", status: "TEST_COMPLETED", score: 89, education: "SMA", location: "Surabaya", age: 27, gender: "Laki-laki" },
    { id: "a4", name: "Dewi Lestari", email: "dewi.lestari@email.com", phone: "081234567893", appliedDate: "2026-07-12", status: "PENDING", score: null, education: "SMA", location: "Jakarta", age: 24, gender: "Perempuan" },
    { id: "a5", name: "Rizky Ramadhan", email: "rizky.ramadhan@email.com", phone: "081234567894", appliedDate: "2026-07-11", status: "TEST_COMPLETED", score: 87, education: "D3", location: "Bandung", age: 26, gender: "Laki-laki" },
    { id: "a6", name: "Putri Ayu Wulandari", email: "putri.ayu@email.com", phone: "081234567895", appliedDate: "2026-07-10", status: "ADMIN_CHECK", score: null, education: "SMA", location: "Jakarta", age: 22, gender: "Perempuan" },
    { id: "a7", name: "Deni Hermawan", email: "deni.hermawan@email.com", phone: "081234567896", appliedDate: "2026-07-09", status: "REJECTED", score: 45, education: "SMA", location: "Surabaya", age: 28, gender: "Laki-laki" },
    { id: "a8", name: "Maya Putri", email: "maya.putri@email.com", phone: "081234567897", appliedDate: "2026-07-08", status: "MEDICAL", score: 88, education: "SMA", location: "Bandung", age: 24, gender: "Perempuan" },
  ],
  "2": [
    { id: "b1", name: "Fajar Nugroho", email: "fajar.nugroho@email.com", phone: "081234568001", appliedDate: "2026-07-12", status: "TEST_COMPLETED", score: 86, education: "SMA", location: "Bandung", age: 26, gender: "Laki-laki" },
    { id: "b2", name: "Rina Marlina", email: "rina.marlina@email.com", phone: "081234568002", appliedDate: "2026-07-11", status: "PENDING", score: null, education: "SMA", location: "Bandung", age: 23, gender: "Perempuan" },
    { id: "b3", name: "Wahyu Setiawan", email: "wahyu.setiawan@email.com", phone: "081234568003", appliedDate: "2026-07-10", status: "INTERVIEW", score: 85, education: "SMA", location: "Jakarta", age: 25, gender: "Laki-laki" },
  ],
  "3": [
    { id: "c1", name: "Bagus Prasetyo", email: "bagus.prasetyo@email.com", phone: "081234569001", appliedDate: "2026-07-10", status: "TEST_COMPLETED", score: 95, education: "S1", location: "Jakarta", age: 28, gender: "Laki-laki" },
    { id: "c2", name: "Andi Wijaya", email: "andi.wijaya@email.com", phone: "081234569002", appliedDate: "2026-07-09", status: "TEST_COMPLETED", score: 88, education: "S1", location: "Surabaya", age: 27, gender: "Laki-laki" },
    { id: "c3", name: "Chandra Kusuma", email: "chandra.kusuma@email.com", phone: "081234569003", appliedDate: "2026-07-08", status: "INTERVIEW", score: 82, education: "S1", location: "Jakarta", age: 29, gender: "Laki-laki" },
  ],
};

// Mock job data for reference
const jobTitles: Record<string, string> = {
  "1": "Pramugara / Pramugari Kereta Api",
  "2": "Steward Kereta Api",
  "3": "Staff IT Support",
  "4": "Teknisi Maintenance Kereta",
  "5": "Cleaning Service - ResClean",
  "6": "Staff Administrasi",
  "7": "Supervisor ResClean",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING": return { bg: "#fef3c7", text: "#d97706", label: "Menunggu", icon: Clock };
    case "TEST_COMPLETED": return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai", icon: CheckCircle };
    case "INTERVIEW": return { bg: "#dbeafe", text: "#2563eb", label: "Interview", icon: AlertCircle };
    case "ADMIN_CHECK": return { bg: "#fef3c7", text: "#d97706", label: "Verifikasi", icon: UserCheck };
    case "MEDICAL": return { bg: "#e0e7ff", text: "#6366f1", label: "MCU", icon: UserCheck };
    case "OFFERING": return { bg: "#dcfce7", text: "#16a34a", label: "Offering", icon: CheckCircle };
    case "REJECTED": return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: XCircle };
    case "ACCEPTED": return { bg: "#dcfce7", text: "#16a34a", label: "Diterima", icon: CheckCircle };
    default: return { bg: "#f1f5f9", text: "#64748b", label: status, icon: Clock };
  }
};

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getJob, _hasHydrated } = useJobsStore();
  const job = getJob(id);
  const applicants = applicantsData[id] || [];
  const jobTitle = job?.title || jobTitles[id] || "Lowongan";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Show loading while rehydrating
  if (!_hasHydrated) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  const filteredApplicants = applicants.filter((app) => {
    const matchSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === "PENDING").length,
    testCompleted: applicants.filter(a => a.status === "TEST_COMPLETED").length,
    interview: applicants.filter(a => a.status === "INTERVIEW").length,
    accepted: applicants.filter(a => ["OFFERING", "ACCEPTED"].includes(a.status)).length,
    rejected: applicants.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href={`/admin/jobs/${id}`}>
              <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Pelamar</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>{jobTitle}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ padding: "10px 20px", background: "#ffffff", color: "#00205B", border: "2px solid #00205B", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Pelamar", value: stats.total, color: "#00205B" },
            { label: "Menunggu", value: stats.pending, color: "#d97706" },
            { label: "Tes Selesai", value: stats.testCompleted, color: "#16a34a" },
            { label: "Interview", value: stats.interview, color: "#2563eb" },
            { label: "Diterima", value: stats.accepted, color: "#10B981" },
            { label: "Ditolak", value: stats.rejected, color: "#EF4444" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: stat.color, marginBottom: "4px" }}>{stat.value}</p>
              <p style={{ fontSize: "12px", color: "#888888" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "12px 40px 12px 16px", border: "2px solid #eeeeee", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="TEST_COMPLETED">Tes Selesai</option>
              <option value="INTERVIEW">Interview</option>
              <option value="ADMIN_CHECK">Verifikasi</option>
              <option value="MEDICAL">MCU</option>
              <option value="OFFERING">Offering</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eeeeee" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kontak</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skor</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => {
                  const status = getStatusConfig(app.status);
                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "44px", height: "44px", background: `hsl(${(app.id.charCodeAt(1) * 30) % 360}, 60%, 60%)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "15px", fontWeight: 700 }}>
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{app.name}</p>
                            <p style={{ fontSize: "12px", color: "#888888" }}>{app.education} • {app.location}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <p style={{ fontSize: "14px", color: "#666666" }}>{app.email}</p>
                        <p style={{ fontSize: "12px", color: "#888888" }}>{app.phone}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ fontSize: "14px", color: "#666666" }}>
                          {new Date(app.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {app.score !== null ? (
                          <span style={{ padding: "4px 12px", background: app.score >= 80 ? "#dcfce7" : app.score >= 60 ? "#fef3c7" : "#fee2e2", color: app.score >= 80 ? "#16a34a" : app.score >= 60 ? "#d97706" : "#dc2626", borderRadius: "20px", fontSize: "14px", fontWeight: 700 }}>
                            {app.score}
                          </span>
                        ) : (
                          <span style={{ fontSize: "14px", color: "#888888" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => setSelectedApplicant(app)}
                            style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a" }}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}>
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredApplicants.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 40px" }}>
              <Users className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada pelamar ditemukan</h3>
              <p style={{ fontSize: "14px", color: "#888888" }}>Coba ubah filter atau tunggu pelamar baru</p>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#ffffff" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111" }}>Detail Pelamar</h2>
              <button onClick={() => setSelectedApplicant(null)} style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }}>
              {/* Profile Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ width: "64px", height: "64px", background: `hsl(${(selectedApplicant.id.charCodeAt(1) * 30) % 360}, 60%, 60%)`, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "24px", fontWeight: 700 }}>
                  {selectedApplicant.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{selectedApplicant.name}</h3>
                  {(() => { const status = getStatusConfig(selectedApplicant.status); return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  )})()}
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#888888", marginBottom: "12px", textTransform: "uppercase" }}>Informasi Kontak</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Mail className="w-4 h-4" style={{ color: "#888888" }} />
                    <span style={{ fontSize: "14px", color: "#111111" }}>{selectedApplicant.email}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Phone className="w-4 h-4" style={{ color: "#888888" }} />
                    <span style={{ fontSize: "14px", color: "#111111" }}>{selectedApplicant.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Calendar className="w-4 h-4" style={{ color: "#888888" }} />
                    <span style={{ fontSize: "14px", color: "#111111" }}>
                      {new Date(selectedApplicant.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#888888", marginBottom: "12px", textTransform: "uppercase" }}>Detail</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Pendidikan</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{selectedApplicant.education}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Lokasi</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{selectedApplicant.location}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Usia</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{selectedApplicant.age} tahun</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Jenis Kelamin</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{selectedApplicant.gender}</p>
                  </div>
                </div>
              </div>

              {/* Score */}
              {selectedApplicant.score !== null && (
                <div style={{ padding: "20px", background: selectedApplicant.score >= 80 ? "#dcfce7" : selectedApplicant.score >= 60 ? "#fef3c7" : "#fee2e2", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "#666666", marginBottom: "8px" }}>Skor Tes Kompetensi</p>
                  <p style={{ fontSize: "48px", fontWeight: 800, color: selectedApplicant.score >= 80 ? "#16a34a" : selectedApplicant.score >= 60 ? "#d97706" : "#dc2626" }}>
                    {selectedApplicant.score}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
