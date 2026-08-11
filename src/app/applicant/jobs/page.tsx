"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useJobsStore, Job } from "@/stores/jobs";

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

  useEffect(() => {
    setMounted(true);
    fetchJobs(); // Fetch jobs from API
  }, []);

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

  // Filter only ACTIVE jobs for applicants
  const activeJobs = jobs.filter(job => job.status === "ACTIVE");

  const filteredJobs = activeJobs.filter(job => {
    if (!job) return false;
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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
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

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "10px 20px", borderRadius: "24px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                background: activeFilter === f ? "#00205B" : "#f1f5f9", color: activeFilter === f ? "#ffffff" : "#666666", transition: "all 0.2s"
              }}>{divisionNames[f] || f}</button>
            ))}
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
            {filteredJobs.map((job) => (
              <div key={job.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "24px", alignItems: "flex-start" }}>
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
                        {new Date(job.deadline).getTime() > Date.now() && (
                          <span style={{ padding: "4px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Aktif</span>
                        )}
                        <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{divisionNames[job.division] || job.division}</span>
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "0" }}>{job.title}</h3>
                    </div>
                    <Link href={`/applicant/apply/${job.id}`}>
                      <button style={{ padding: "14px 28px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)", whiteSpace: "nowrap" }}>
                        Lamar Sekarang
                      </button>
                    </Link>
                  </div>

                  <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.6, marginBottom: "16px" }}>{job.description}</p>

                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#666666" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location || "-"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#666666" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Batas: {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
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
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !isLoading && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada lowongan ditemukan</h3>
            <p style={{ fontSize: "15px", color: "#888888" }}>Coba ubah kriteria pencarian Anda</p>
          </div>
        )}
      </div>

      <style>{`
        input:focus { border-color: #FF5E00 !important; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
