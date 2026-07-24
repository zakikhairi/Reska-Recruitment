"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Filter,
  ChevronDown,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useJobsStore, Job } from "@/stores/jobs";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "ACTIVE": return { bg: "#dcfce7", text: "#16a34a", label: "Aktif" };
    case "DRAFT": return { bg: "#fef3c7", text: "#d97706", label: "Draft" };
    case "CLOSED": return { bg: "#f1f5f9", text: "#64748b", label: "Ditutup" };
    case "FILLED": return { bg: "#dbeafe", text: "#2563eb", label: "Terisi" };
    default: return { bg: "#f1f5f9", text: "#64748b", label: status };
  }
};

const divisionLabels: Record<string, string> = {
  "ON_TRAIN_SERVICE": "On-Train Service",
  "RES_CLEAN": "ResClean",
  "IT_STAFF": "IT Staff",
  "LOGISTICS": "Logistics",
  "ADMIN": "Admin",
  "RES_PARKING": "ResParking",
};

export default function JobsPage() {
  const router = useRouter();
  const { jobs, deleteJob, _hasHydrated } = useJobsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: Job | null }>({ show: false, job: null });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = (job: Job) => {
    setDeleteModal({ show: true, job });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.job) {
      deleteJob(deleteModal.job.id);
      setDeleteModal({ show: false, job: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, job: null });
  };

  // Wait for hydration
  if (!mounted || !_hasHydrated) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || job.status === statusFilter;
    const matchDivision = divisionFilter === "all" || job.division === divisionFilter;
    return matchSearch && matchStatus && matchDivision;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Lowongan Kerja</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola lowongan kerja yang tersedia</p>
          </div>
          <Link href="/admin/jobs/create">
            <Button size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0">
              <Plus className="w-4 h-4 mr-2" />
              Buat Lowongan
            </Button>
          </Link>
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
                placeholder="Cari lowongan..."
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
              <option value="ACTIVE">Aktif</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Ditutup</option>
              <option value="FILLED">Terisi</option>
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

        {/* Jobs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
          {filteredJobs.map((job) => {
            const status = getStatusConfig(job.status);
            return (
              <div key={job.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                    {status.label}
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <button style={{ padding: "6px", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer", color: "#888888" }}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(job)}
                      style={{ padding: "6px", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer", color: "#EF4444" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Division */}
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>{job.title}</h3>
                <span style={{ display: "inline-block", padding: "4px 10px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600, marginBottom: "16px" }}>
                  {divisionLabels[job.division] || job.division}
                </span>

                {/* Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666666" }}>
                    <MapPin className="w-4 h-4" style={{ color: "#888888" }} />
                    {job.location}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666666" }}>
                    <Users className="w-4 h-4" style={{ color: "#888888" }} />
                    {job.applicants || 0} pelamar
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666666" }}>
                    <Calendar className="w-4 h-4" style={{ color: "#888888" }} />
                    Batas: {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666666" }}>
                    <Briefcase className="w-4 h-4" style={{ color: "#888888" }} />
                    Min. {job.minEducation}
                  </div>
                </div>

                {/* Salary */}
                <div style={{ padding: "12px 16px", background: "#fff7f0", borderRadius: "12px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Kisaran Gaji</p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#FF5E00" }}>
                    {job.salaryMin && job.salaryMax
                      ? `Rp ${job.salaryMin} - Rp ${job.salaryMax}`
                      : job.salaryMin
                      ? `Rp ${job.salaryMin}+`
                      : "-"}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/admin/jobs/${job.id}`} style={{ flex: 1 }}>
                    <button style={{ width: "100%", padding: "12px", background: "#f0f4ff", color: "#00205B", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                      Lihat Detail
                    </button>
                  </Link>
                  <Link href={`/admin/jobs/${job.id}/applicants`}>
                    <button style={{ padding: "12px 16px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                      Pelamar
                    </button>
                  </Link>
                </div>
                {/* Edit Link */}
                <div style={{ marginTop: "12px", textAlign: "center" }}>
                  <Link href={`/admin/jobs/${job.id}/edit`} style={{ fontSize: "13px", color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>
                    Edit Lowongan
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#ffffff", borderRadius: "16px" }}>
            <Briefcase className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada lowongan ditemukan</h3>
            <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Coba ubah filter atau buat lowongan baru</p>
            <Link href="/admin/jobs/create">
              <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Buat Lowongan Baru
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
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
              <button onClick={handleDeleteCancel} style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: "15px", color: "#666666", marginBottom: "8px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus lowongan ini?
              </p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", marginBottom: "24px" }}>
                "{deleteModal.job?.title}"
              </p>
              <p style={{ fontSize: "13px", color: "#EF4444", marginBottom: "24px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait lowongan ini akan dihapus permanen.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleDeleteCancel}
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
