"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  GraduationCap,
  FileText,
  CheckCircle,
  Trash2,
  Eye,
  AlertTriangle,
  X,
} from "lucide-react";
import { useJobsStore } from "@/stores/jobs";

const divisionLabels: Record<string, string> = {
  "ON_TRAIN_SERVICE": "On-Train Service",
  "RES_CLEAN": "ResClean",
  "IT_STAFF": "IT Staff",
  "LOGISTICS": "Logistics",
  "ADMIN": "Admin",
  "RES_PARKING": "ResParking",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "ACTIVE": return { bg: "#dcfce7", text: "#16a34a", label: "Aktif" };
    case "DRAFT": return { bg: "#fef3c7", text: "#d97706", label: "Draft" };
    case "CLOSED": return { bg: "#f1f5f9", text: "#64748b", label: "Ditutup" };
    case "FILLED": return { bg: "#dbeafe", text: "#2563eb", label: "Terisi" };
    default: return { bg: "#f1f5f9", text: "#64748b", label: status };
  }
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getJob, deleteJob, _hasHydrated } = useJobsStore();
  const job = getJob(id);
  const [deleteModal, setDeleteModal] = useState(false);

  const status = job ? getStatusConfig(job.status) : null;

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (job) {
      deleteJob(job.id);
      router.push("/admin/jobs");
    }
  };

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

  if (!job) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", color: "#111", marginBottom: "8px" }}>Lowongan tidak ditemukan</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>Lowongan dengan ID ini tidak tersedia</p>
          <Link href="/admin/jobs">
            <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Kembali ke Daftar Lowongan
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin/jobs">
              <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
              </button>
            </Link>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", margin: 0, letterSpacing: "-0.02em" }}>Detail Lowongan</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status?.bg, color: status?.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                  {status?.label}
                </span>
              </div>
              <p style={{ fontSize: "15px", color: "#666666", marginTop: "4px" }}>{job.title}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href={`/admin/jobs/${id}/edit`}>
              <button style={{ padding: "10px 20px", background: "#ffffff", color: "#00205B", border: "2px solid #00205B", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </Link>
            <Link href={`/admin/jobs/${id}/applicants`}>
              <button style={{ padding: "10px 20px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users className="w-4 h-4" />
                {job.applicants || 0} Pelamar
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Job Info Cards */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Informasi Lowongan</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Briefcase className="w-5 h-5" style={{ color: "#00205B" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "2px" }}>Divisi</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{divisionLabels[job.division]}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap className="w-5 h-5" style={{ color: "#00205B" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "2px" }}>Pendidikan Min.</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{job.minEducation}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin className="w-5 h-5" style={{ color: "#00205B" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "2px" }}>Lokasi</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{job.location}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar className="w-5 h-5" style={{ color: "#00205B" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "2px" }}>Batas Waktu</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>
                      {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Deskripsi Pekerjaan
              </h2>
              <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.7 }}>{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Tanggung Jawab</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {job.responsibilities.split("\n").map((item: string, index: number) => (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle className="w-5 h-5" style={{ color: "#10B981", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Persyaratan</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {job.requirements.split("\n").map((item: string, index: number) => (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "6px", height: "6px", background: "#FF5E00", borderRadius: "50%", flexShrink: 0, marginTop: "8px" }} />
                    <p style={{ fontSize: "14px", color: "#444444", lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Benefit & Keuntungan</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {job.benefits.split("\n").map((item: string, index: number) => (
                  <span key={index} style={{ padding: "10px 16px", background: "#f0f4ff", color: "#00205B", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Salary */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Kisaran Gaji</h3>
              <div style={{ padding: "20px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff" }}>{job.salary}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>per bulan</p>
              </div>

              {/* Stats */}
              <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
                <div style={{ flex: 1, padding: "16px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#00205B" }}>{job.applicants}</p>
                  <p style={{ fontSize: "12px", color: "#888888" }}>Pelamar</p>
                </div>
                <div style={{ flex: 1, padding: "16px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#10B981" }}>72%</p>
                  <p style={{ fontSize: "12px", color: "#888888" }}>Passing</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link href={`/admin/jobs/${id}/applicants`}>
                  <button style={{ width: "100%", padding: "14px", background: "#00205B", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Users className="w-4 h-4" />
                    Lihat Semua Pelamar
                  </button>
                </Link>
                <Link href={`/admin/jobs/${id}/edit`}>
                  <button style={{ width: "100%", padding: "14px", background: "#ffffff", color: "#00205B", border: "2px solid #00205B", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Edit className="w-4 h-4" />
                    Edit Lowongan
                  </button>
                </Link>
                <button
                  onClick={handleDeleteClick}
                  style={{ width: "100%", padding: "14px", background: "#ffffff", color: "#EF4444", border: "2px solid #EF4444", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Trash2 className="w-4 h-4" />
                  Hapus Lowongan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "450px", width: "100%", overflow: "hidden" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", background: "#fee2e2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: "#EF4444" }} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: 0 }}>Hapus Lowongan</h2>
              </div>
              <button onClick={() => setDeleteModal(false)} style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: "15px", color: "#666666", marginBottom: "8px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus lowongan ini?
              </p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", marginBottom: "24px" }}>
                "{job?.title}"
              </p>
              <p style={{ fontSize: "13px", color: "#EF4444", marginBottom: "24px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait lowongan ini akan dihapus permanen.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setDeleteModal(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#ffffff",
                    color: "#666666",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#EF4444",
                    color: "#ffffff",
                    border: "none",
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
                  <Trash2 className="w-4 h-4" />
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
