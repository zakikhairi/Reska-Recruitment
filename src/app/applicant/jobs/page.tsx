"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useJobsStore, Job } from "@/stores/jobs";
import JobQuickViewModal, { JobDetail } from "@/components/recruitment/JobQuickViewModal";
import { Bookmark, Eye } from "lucide-react";

const filters = ["Semua", "ON_TRAIN_SERVICE", "IT_STAFF", "LOGISTICS", "RES_CLEAN", "ADMIN", "RES_PARKING"];

const divisionNames: Record<string, string> = {
  "ON_TRAIN_SERVICE": "Layanan Kereta",
  "IT_STAFF": "IT Staff",
  "LOGISTICS": "Logistik",
  "RES_CLEAN": "ResClean",
  "RES_PARKING": "ResParking",
  "ADMIN": "Admin"
};

export default function JobsPage() {
  const { jobs, _hasHydrated, fetchJobs, isLoading } = useJobsStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [mounted, setMounted] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchJobs(); // Fetch jobs from API
    try {
      const stored = localStorage.getItem("kai_saved_jobs");
      if (stored) setSavedJobIds(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const toggleBookmark = (jobId: string) => {
    setSavedJobIds((prev) => {
      let updated: string[];
      if (prev.includes(jobId)) {
        updated = prev.filter((id) => id !== jobId);
      } else {
        updated = [...prev, jobId];
      }
      try {
        localStorage.setItem("kai_saved_jobs", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Wait for hydration
  if (!mounted || !_hasHydrated) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat lowongan...</p>
        </div>
      </div>
    );
  }

  // Filter only ACTIVE jobs and check registration period
  const now = new Date();
  const activeJobs = jobs.filter(job => {
    if (job.status !== "ACTIVE") return false;
    const startDate = new Date(job.startDate);
    const deadline = new Date(job.deadline);
    return now >= startDate && now <= deadline;
  });

  const filteredJobs = activeJobs.filter(job => {
    if (!job) return false;
    if (activeFilter === "Tersimpan") {
      return savedJobIds.includes(job.id);
    }
    const matchFilter = activeFilter === "Semua" || job.division === activeFilter;
    const matchSearch = (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
                       (job.location || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Lowongan Kerja</h1>
          <p style={{ fontSize: "15px", color: "#666666" }}>{filteredJobs.length} posisi tersedia untuk Anda</p>
        </div>
      </header>

      <div className="kai-portal-jobs-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Search & Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Cari posisi atau deskripsi..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", height: "52px", padding: "0 20px 0 48px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", background: "#ffffff" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "10px 20px", borderRadius: "24px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                background: activeFilter === f ? "#00205B" : "#f1f5f9", color: activeFilter === f ? "#ffffff" : "#666666", transition: "all 0.2s"
              }}>{divisionNames[f] || f}</button>
            ))}
            <button
              onClick={() => setActiveFilter(activeFilter === "Tersimpan" ? "Semua" : "Tersimpan")}
              style={{
                padding: "10px 20px",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 700,
                border: activeFilter === "Tersimpan" ? "2px solid #FF5E00" : "1px solid #e2e8f0",
                cursor: "pointer",
                background: activeFilter === "Tersimpan" ? "#fff7ed" : "#ffffff",
                color: activeFilter === "Tersimpan" ? "#FF5E00" : "#4b5563",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.2s",
              }}
            >
              <Bookmark size={15} fill={activeFilter === "Tersimpan" ? "#FF5E00" : "none"} />
              Tersimpan ({savedJobIds.length})
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#666666" }}>Memuat lowongan...</p>
          </div>
        )}

        {/* Job List */}
        {!isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredJobs.map((job) => {
              const isBookmarked = savedJobIds.includes(job.id);
              const isOpen = now >= new Date(job.startDate) && now <= new Date(job.deadline);
              const isUpcoming = now < new Date(job.startDate);

              return (
              <div
                key={job.id}
                className="card-hover-lift applicant-job-card"
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "28px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                {/* Icon */}
                <div style={{ width: "64px", height: "64px", background: "#f0f4ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                  </svg>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                        {isOpen && (
                          <span style={{ padding: "4px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Pendaftaran Terbuka</span>
                        )}
                        {isUpcoming && (
                          <span style={{ padding: "4px 12px", background: "#fef3c7", color: "#d97706", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Segera Hadir</span>
                        )}
                        {!isOpen && !isUpcoming && (
                          <span style={{ padding: "4px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Pendaftaran Ditutup</span>
                        )}
                        <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{divisionNames[job.division] || job.division}</span>
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "0" }}>{job.title}</h3>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          setSelectedJob(job as any);
                          setIsQuickViewOpen(true);
                        }}
                        style={{
                          padding: "12px 18px",
                          background: "#eff6ff",
                          color: "#00205B",
                          border: "1px solid #dbeafe",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Eye size={15} />
                        Detail
                      </button>

                      {isOpen && (
                        <Link href={`/applicant/apply/${job.id}`}>
                          <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)", whiteSpace: "nowrap" }}>
                            Lamar Sekarang
                          </button>
                        </Link>
                      )}

                      <button
                        onClick={() => toggleBookmark(job.id)}
                        title={isBookmarked ? "Hapus dari tersimpan" : "Simpan lowongan"}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: isBookmarked ? "#fff7ed" : "#f1f5f9",
                          border: isBookmarked ? "1.5px solid #FF5E00" : "1px solid #e2e8f0",
                          color: isBookmarked ? "#FF5E00" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <Bookmark size={17} fill={isBookmarked ? "#FF5E00" : "none"} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.6, marginBottom: "16px" }}>{job.description}</p>

                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#666666" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location || "-"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#666666" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {new Date(job.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#666666" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      {job.applicantCount || 0} pelamar
                    </span>
                  </div>

                  <div style={{ paddingTop: "16px", borderTop: "1px solid #eeeeee" }}>
                    <p style={{ fontSize: "13px", color: "#888888" }}>
                      <strong style={{ color: "#555555" }}>Persyaratan:</strong> {job.requirements}
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {filteredJobs.length === 0 && !isLoading && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada lowongan ditemukan</h3>
            <p style={{ fontSize: "15px", color: "#888888" }}>
              {activeFilter === "Tersimpan" ? "Anda belum menandai lowongan favorit." : "Coba ubah kriteria pencarian Anda"}
            </p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <JobQuickViewModal
        job={selectedJob}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedJob(null);
        }}
        isBookmarked={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleBookmark={toggleBookmark}
        divisionLabel={selectedJob ? divisionNames[selectedJob.division] || selectedJob.division : ""}
      />

      <style>{`
        input:focus { border-color: #FF5E00 !important; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
