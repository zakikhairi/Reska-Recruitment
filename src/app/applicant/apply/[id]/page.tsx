"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

interface Job {
  id: string;
  title: string;
  division: string;
  location: string;
  minEducation: string;
  minHeight?: number;
  minAge?: number;
  maxAge?: number;
  description: string;
  requirements: string;
  deadline: string;
  status: string;
}

interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  description: string;
}

const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: "CV",
    label: "Curriculum Vitae (CV)",
    required: true,
    description: "CV terbaru dalam format PDF"
  },
  {
    type: "KTPCARD",
    label: "KTP",
    required: true,
    description: "Kartu Tanda Penduduk (KTP)"
  },
  {
    type: "IJAZAH",
    label: "Ijazah",
    required: true,
    description: "Ijazah terakhir yang dimiliki"
  },
  {
    type: "TRANSCRIPT",
    label: "Transkrip Nilai",
    required: false,
    description: "Transkrip nilai akademik"
  },
  {
    type: "SKCK",
    label: "Pas Foto 3x4",
    required: false,
    description: "Pas Foto ukuran 3x4 dengan latar merah"
  },
  {
    type: "CERTIFICATE",
    label: "Sertifikat",
    required: false,
    description: "Sertifikat pelatihan/sertifikasi (opsional)"
  },
];

export default function ApplyJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Resolve params promise
  useEffect(() => {
    params.then((p) => setJobId(p.id));
  }, [params]);

  useEffect(() => {
    if (jobId) {
      fetchJob(jobId);
      if (user?.id) {
        fetchApplicantDocuments();
      }
    }
  }, [jobId, user]);

  const fetchJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      const result = await response.json();

      if (result.job) {
        setJob(result.job);
      } else {
        setError(result.error || "Lowongan tidak ditemukan");
      }
    } catch (err) {
      console.error("Failed to fetch job:", err);
      setError("Gagal memuat data lowongan");
    }
    setIsLoading(false);
  };

  const fetchApplicantDocuments = async () => {
    if (!user?.id) return;

    try {
      // Get applicant ID first
      const applicantRes = await fetch(`/api/applicant/profile?userId=${user.id}`);
      const applicantData = await applicantRes.json();

      if (applicantData.profile) {
        const docsRes = await fetch(`/api/documents/upload?applicantId=${applicantData.profile.id}`);
        const docsData = await docsRes.json();

        if (docsData.success) {
          setUploadedDocuments(docsData.documents);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!user?.id) {
      setError("Silakan login terlebih dahulu");
      return;
    }

    // Get applicant ID
    try {
      const applicantRes = await fetch(`/api/applicant/profile?userId=${user.id}`);
      const applicantData = await applicantRes.json();

      if (!applicantData.profile) {
        setError("Profil pelamar tidak ditemukan");
        return;
      }

      const applicantId = applicantData.profile.id;

      setUploadingType(type);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("applicantId", applicantId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedDocuments(prev => [...prev, result.document]);
        setError("");
      } else {
        setError(result.error || "Gagal mengupload dokumen");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Terjadi kesalahan saat mengupload");
    } finally {
      setUploadingType(null);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[type];
        return newProgress;
      });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/upload?id=${docId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setUploadedDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        setError(result.error || "Gagal menghapus dokumen");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Terjadi kesalahan saat menghapus");
    }
  };

  const getDocumentByType = (type: string) => {
    return uploadedDocuments.find(d => d.type === type);
  };

  const isAllRequiredUploaded = () => {
    const requiredTypes = DOCUMENT_REQUIREMENTS.filter(d => d.required).map(d => d.type);
    return requiredTypes.every(type => uploadedDocuments.some(d => d.type === type));
  };

  const handleApply = async () => {
    if (!user?.id) {
      setError("Silakan login terlebih dahulu");
      return;
    }

    if (!jobId) {
      setError("ID lowongan tidak valid");
      return;
    }

    // Check required documents
    if (!isAllRequiredUploaded()) {
      setError("Mohon upload semua dokumen yang diperlukan terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: jobId,
          userId: user.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Gagal melamar");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat melamar");
    }
    setIsSubmitting(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

  if (!jobId || isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "80px" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            <div style={styles.badge}>{(job.division || "").replace(/_/g, " ")}</div>
            <h1 style={styles.jobTitle}>{job.title}</h1>
            <div style={styles.jobMeta}>
              <span style={styles.metaItem}>📍 {job.location || "-"}</span>
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
        </div>

        {/* Document Upload Section */}
        <div style={styles.card}>
          <div style={styles.documentHeader}>
            <h2 style={styles.documentTitle}>📄 Upload Dokumen Lamaran</h2>
            <p style={styles.documentSubtitle}>
              Silakan upload dokumen yang diperlukan. Format yang diizinkan: JPG, PNG, PDF (maksimal 10MB)
            </p>
          </div>

          <div style={styles.documentList}>
            {DOCUMENT_REQUIREMENTS.map((doc) => {
              const uploaded = getDocumentByType(doc.type);
              const isUploading = uploadingType === doc.type;

              return (
                <div key={doc.type} style={styles.documentItem}>
                  <div style={styles.documentInfo}>
                    <div style={styles.documentLabel}>
                      <span style={styles.documentName}>{doc.label}</span>
                      {doc.required && <span style={styles.requiredBadge}>Wajib</span>}
                    </div>
                    <p style={styles.documentDesc}>{doc.description}</p>
                  </div>

                  <div style={styles.documentAction}>
                    {uploaded ? (
                      <div style={styles.uploadedFile}>
                        <div style={styles.fileInfo}>
                          <span style={styles.fileName}>{uploaded.fileName}</span>
                          <span style={styles.fileSize}>{formatFileSize(uploaded.fileSize)}</span>
                        </div>
                        <div style={styles.fileActions}>
                          <a
                            href={uploaded.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.viewButton}
                          >
                            Lihat
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(uploaded.id)}
                            style={styles.deleteButton}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={styles.uploadButton}>
                        {isUploading ? (
                          <span style={styles.uploadingText}>Mengupload...</span>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17,8 12,3 7,8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Pilih File
                          </>
                        )}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.type, file);
                          }}
                          disabled={isUploading}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.action}>
          <button
            onClick={handleApply}
            disabled={isSubmitting || !isAllRequiredUploaded()}
            style={{
              ...styles.applyButton,
              opacity: (isSubmitting || !isAllRequiredUploaded()) ? 0.6 : 1,
              cursor: (isSubmitting || !isAllRequiredUploaded()) ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Mengirim..." : "Lamar Sekarang"}
          </button>
          {!isAllRequiredUploaded() && (
            <p style={styles.hintText}>
              * Mohon upload semua dokumen wajib sebelum melamar
            </p>
          )}
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
  card: { background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" },
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
  action: { marginTop: "8px" },
  applyButton: { width: "100%", height: "56px", background: "linear-gradient(135deg, #FF5E00, #ff7a2f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700 },
  hintText: { fontSize: "13px", color: "#666", textAlign: "center", marginTop: "12px", marginBottom: 0 },

  // Document upload styles
  documentHeader: { marginBottom: "24px" },
  documentTitle: { fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#111" },
  documentSubtitle: { fontSize: "14px", color: "#666", margin: 0 },
  documentList: { display: "flex", flexDirection: "column", gap: "16px" },
  documentItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8f9fa", borderRadius: "12px", gap: "16px" },
  documentInfo: { flex: 1 },
  documentLabel: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  documentName: { fontSize: "14px", fontWeight: 600, color: "#111" },
  requiredBadge: { fontSize: "11px", padding: "2px 8px", background: "#fef2f2", color: "#dc2626", borderRadius: "10px", fontWeight: 600 },
  documentDesc: { fontSize: "12px", color: "#666", margin: 0 },
  documentAction: { minWidth: "140px" },
  uploadButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 20px", background: "#fff", border: "2px dashed #ddd", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#666", cursor: "pointer", transition: "all 0.2s" },
  uploadingText: { fontSize: "14px", color: "#FF5E00" },
  uploadedFile: { display: "flex", flexDirection: "column", gap: "8px" },
  fileInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  fileName: { fontSize: "12px", fontWeight: 500, color: "#111", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileSize: { fontSize: "11px", color: "#999" },
  fileActions: { display: "flex", gap: "8px" },
  viewButton: { fontSize: "12px", padding: "4px 12px", background: "#e0f2fe", color: "#0284c7", border: "none", borderRadius: "6px", textDecoration: "none", cursor: "pointer" },
  deleteButton: { fontSize: "12px", padding: "4px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" },
};
