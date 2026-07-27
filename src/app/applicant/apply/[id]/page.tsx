"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { getJobById, createApplication } from "@/lib/local-db";

export default function ApplyJobPage({ params }: { params: { id: string } }) {
  const jobId = params.id;
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get job from local database
  const job = useMemo(() => getJobById(jobId), [jobId]);

  const handleApply = async () => {
    if (!user?.id) {
      setError("Silakan login terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      createApplication({
        applicantId: user.id,
        jobPostingId: jobId
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal melamar");
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>

          <h1 style={styles.successTitle}>Lamaran Terkirim!</h1>
          <p style={styles.successText}>
            Selamat! Lamaran Anda untuk posisi <strong>{job?.title}</strong> telah berhasil diajukan.
          </p>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Tim HR akan meninjau lamaran Anda dalam 1-3 hari kerja.
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <Link href="/applicant/dashboard">
              <button style={styles.primaryButton}>Kembali ke Dashboard</button>
            </Link>
            <Link href="/applicant/jobs">
              <button style={styles.secondaryButton}>Lihat Lowongan Lain</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2 style={styles.errorTitle}>Lowongan Tidak Ditemukan</h2>
          <p style={styles.errorText}>Lowongan yang Anda cari tidak tersedia.</p>
          <Link href="/applicant/jobs">
            <button style={styles.primaryButton}>Kembali ke Lowongan</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link href="/applicant/jobs" style={styles.backLink}>
            ← Kembali ke Lowongan
          </Link>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.jobHeader}>
            <div style={styles.badge}>{job.division.replace(/_/g, " ")}</div>
            <h1 style={styles.jobTitle}>{job.title}</h1>
            <div style={styles.jobMeta}>
              <span style={styles.metaItem}>📍 {job.location}</span>
              <span style={styles.metaItem}>📅 Batas: {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Deskripsi</h3>
            <p style={styles.sectionText}>{job.description}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Persyaratan</h3>
            <ul style={styles.requirementsList}>
              <li>Pendidikan: {job.minEducation}</li>
              {job.minHeight && <li>Tinggi Badan: {job.minHeight} cm</li>}
              {job.minAge && <li>Usia: {job.minAge} - {job.maxAge} tahun</li>}
            </ul>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.action}>
            <button
              onClick={handleApply}
              disabled={isSubmitting}
              style={{
                ...styles.applyButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Mengirim..." : "Lamar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa" },
  header: { background: "#fff", borderBottom: "1px solid #eee", padding: "20px 32px" },
  headerContent: { maxWidth: "800px", margin: "0 auto" },
  backLink: { color: "#666", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  content: { maxWidth: "800px", margin: "0 auto", padding: "32px" },
  card: { background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  errorCard: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px", background: "#fff", borderRadius: "20px", margin: "80px auto", maxWidth: "500px" },
  errorTitle: { fontSize: "20px", fontWeight: 700, marginTop: "16px", marginBottom: "8px", color: "#111" },
  errorText: { fontSize: "14px", color: "#666", marginBottom: "24px" },
  successIcon: { width: "80px", height: "80px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  successTitle: { fontSize: "24px", fontWeight: 800, textAlign: "center", marginBottom: "8px", color: "#111" },
  successText: { fontSize: "15px", color: "#666", textAlign: "center", marginBottom: "24px" },
  infoBox: { background: "#f0f4ff", borderRadius: "12px", padding: "16px", marginBottom: "24px" },
  infoText: { fontSize: "14px", color: "#00205B", margin: 0, textAlign: "center" },
  buttonGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  primaryButton: { width: "100%", height: "54px", background: "linear-gradient(135deg, #FF5E00, #ff7a2f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { width: "100%", height: "54px", background: "#fff", color: "#00205B", border: "2px solid #00205B", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer" },
  jobHeader: { marginBottom: "24px" },
  badge: { display: "inline-block", padding: "6px 14px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600, marginBottom: "12px" },
  jobTitle: { fontSize: "24px", fontWeight: 800, marginBottom: "12px", color: "#111" },
  jobMeta: { display: "flex", gap: "20px", flexWrap: "wrap" as const },
  metaItem: { fontSize: "14px", color: "#666" },
  divider: { height: "1px", background: "#eee", margin: "24px 0" },
  section: { marginBottom: "24px" },
  sectionTitle: { fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#111" },
  sectionText: { fontSize: "14px", color: "#666", lineHeight: 1.7, margin: 0 },
  requirementsList: { fontSize: "14px", color: "#666", lineHeight: 2, margin: 0, paddingLeft: "20px" },
  errorAlert: { padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", fontSize: "14px", marginBottom: "24px" },
  action: { marginTop: "24px" },
  applyButton: { width: "100%", height: "56px", background: "linear-gradient(135deg, #FF5E00, #ff7a2f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700 },
};
