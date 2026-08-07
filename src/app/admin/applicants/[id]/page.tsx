"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Send,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui";

const DB_KEY = "kai_recruitment_db";

interface ApplicantData {
  application: {
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
  };
  applicant: {
    id: string;
    fullName: string;
    email: string;
    nik?: string;
    phone?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    education?: string;
    university?: string;
    height?: number;
    weight?: number;
    documents: Array<{
      id: string;
      type: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: string;
    }>;
  };
  job: {
    id: string;
    title: string;
    division: string;
    location: string;
  };
}

// Helper functions for localStorage sync
function getLocalDB() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function saveLocalDB(db: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return { bg: "#fef3c7", text: "#d97706", label: "Menunggu", icon: Clock };
    case "ADMIN_CHECK":
      return { bg: "#dbeafe", text: "#2563eb", label: "Verifikasi", icon: AlertCircle };
    case "TEST_SCHEDULED":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "Tes Terjadwal", icon: Clock };
    case "IN_TEST":
      return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes", icon: Clock };
    case "TEST_COMPLETED":
      return { bg: "#d1fae5", text: "#059669", label: "Tes Selesai", icon: CheckCircle };
    case "INTERVIEW":
      return { bg: "#fae8ff", text: "#c026d3", label: "Interview", icon: User };
    case "MCU":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "MCU", icon: CheckCircle };
    case "OFFERING":
      return { bg: "#fef3c7", text: "#d97706", label: "Offering", icon: CheckCircle };
    case "ACCEPTED":
      return { bg: "#d1fae5", text: "#059669", label: "Diterima", icon: CheckCircle };
    case "REJECTED":
      return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: XCircle };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: status, icon: Clock };
  }
};

const documentTypes = [
  { key: "CV", label: "Curriculum Vitae (CV)", icon: FileText },
  { key: "KTPCARD", label: "KTP", icon: FileText },
  { key: "IJAZAH", label: "Ijazah", icon: GraduationCap },
  { key: "TRANSCRIPT", label: "Transkrip Nilai", icon: FileText },
  { key: "SKCK", label: "Pas Foto 3x4", icon: Image },
  { key: "CERTIFICATE", label: "Sertifikat", icon: FileText },
];

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;

  const [data, setData] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [editedPersonal, setEditedPersonal] = useState({
    fullName: "",
    nik: "",
    phone: "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
  });
  const [editedEducation, setEditedEducation] = useState({
    education: "",
    university: "",
    height: "",
    weight: "",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEditPersonal = () => {
    setEditedPersonal({
      fullName: applicant.fullName || "",
      nik: applicant.nik || "",
      phone: applicant.phone || "",
      placeOfBirth: applicant.placeOfBirth || "",
      dateOfBirth: applicant.dateOfBirth ? applicant.dateOfBirth.split("T")[0] : "",
      gender: applicant.gender || "",
      address: applicant.address || "",
      city: applicant.city || "",
    });
    setIsEditingPersonal(true);
  };

  const startEditEducation = () => {
    setEditedEducation({
      education: applicant.education || "",
      university: applicant.university || "",
      height: applicant.height?.toString() || "",
      weight: applicant.weight?.toString() || "",
    });
    setIsEditingEducation(true);
  };

  const savePersonalData = async () => {
    setActionLoading(true);
    try {
      const localDB = getLocalDB();
      const response = await fetch(`/api/admin/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "personal",
          data: editedPersonal,
          db: localDB,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.db) saveLocalDB(result.db);
        await fetchApplicantData();
        setIsEditingPersonal(false);
        showToast("Data pribadi berhasil diperbarui", "success");
      } else {
        showToast(result.error || "Gagal memperbarui data", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const saveEducationData = async () => {
    setActionLoading(true);
    try {
      const localDB = getLocalDB();
      const response = await fetch(`/api/admin/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "education",
          data: editedEducation,
          db: localDB,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.db) saveLocalDB(result.db);
        await fetchApplicantData();
        setIsEditingEducation(false);
        showToast("Data pendidikan berhasil diperbarui", "success");
      } else {
        showToast(result.error || "Gagal memperbarui data", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantData();
  }, [applicantId]);

  const fetchApplicantData = async () => {
    try {
      // Get local database to sync with server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/verify`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        // If server returned updated database, save to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectModal) {
      setShowRejectModal(true);
      return;
    }

    setActionLoading(true);
    try {
      // Get local database to send to server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: action === "reject" ? rejectNotes : undefined,
          db: localDB, // Send local database to server
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save updated database from server to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
        // Refresh data
        await fetchApplicantData();
        setShowRejectModal(false);
        setRejectNotes("");
        showToast(result.message, "success");
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      // Get local database to send to server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          db: localDB, // Send local database to server
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save updated database from server to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
        await fetchApplicantData();
        showToast(`Status berhasil diubah ke: ${getStatusConfig(newStatus).label}`, "success");
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666666" }}>Memuat data pelamar...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <AlertCircle className="w-16 h-16" style={{ color: "#ef4444", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Data Tidak Ditemukan</h2>
          <p style={{ color: "#666666", marginBottom: "24px" }}>{error || "Pelamar tidak ditemukan"}</p>
          <Link href="/admin/applicants">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Pelamar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { application, applicant, job } = data;
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  const divisionLabels: Record<string, string> = {
    ON_TRAIN_SERVICE: "On-Train Service",
    RES_CLEAN: "ResClean",
    RES_PARKING: "ResParking",
    LOGISTICS: "Logistics",
    IT_STAFF: "IT Staff",
    ADMIN: "Administrasi",
  };

  const genderLabels: Record<string, string> = {
    MALE: "Laki-laki",
    FEMALE: "Perempuan",
  };

  const educationLabels: Record<string, string> = {
    SMA: "SMA/SMK",
    D3: "Diploma 3",
    S1: "Sarjana (S1)",
    S2: "Magister (S2)",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link href="/admin/applicants" style={{ textDecoration: "none", color: "#666666" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", marginBottom: "12px", cursor: "pointer" }}>
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Pelamar
            </span>
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "24px", fontWeight: 700 }}>
                {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
              </div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>{applicant.fullName || "Nama Tidak Diketahui"}</h1>
                <p style={{ fontSize: "15px", color: "#666666", marginBottom: "8px" }}>ID: {application.id}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: statusConfig.bg, color: statusConfig.text, borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Action Buttons - tampil sesuai dengan status aplikasi */}

            {/* Status PENDING - Tombol untuk mulai verifikasi */}
            {application.status === "PENDING" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                <button
                  onClick={() => handleAdvanceStatus("ADMIN_CHECK")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#f59e0b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Mulai Verifikasi
                </button>
              </div>
            )}

            {(application.status === "ADMIN_CHECK" || application.status === "TEST_COMPLETED" || application.status === "INTERVIEW") && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                {application.status === "ADMIN_CHECK" && (
                  <button
                    onClick={() => handleVerify("approve")}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verifikasi Lulus
                  </button>
                )}
                {application.status === "TEST_COMPLETED" && (
                  <button
                    onClick={() => handleAdvanceStatus("INTERVIEW")}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#7c3aed",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                    }}
                  >
                    <User className="w-5 h-5" />
                    Lanjut ke Interview
                  </button>
                )}
                {application.status === "INTERVIEW" && (
                  <button
                    onClick={() => handleAdvanceStatus("MCU")}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#0891b2",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)",
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Lanjut ke MCU
                  </button>
                )}
              </div>
            )}
            {/* MCU -> Offering */}
            {application.status === "MCU" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                <button
                  onClick={() => handleAdvanceStatus("OFFERING")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#059669",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Lanjut ke Offering
                </button>
              </div>
            )}
            {/* Offering -> Accepted */}
            {application.status === "OFFERING" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                <button
                  onClick={() => setShowAcceptModal(true)}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Terima Pelamar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "28px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Info Lowongan */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Briefcase className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Informasi Lowongan
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Posisi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{job.title || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Divisi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{divisionLabels[job.division] || job.division || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Lokasi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{job.location || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tanggal Lamar</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                    {new Date(application.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Pribadi */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                  <User className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  Data Pribadi
                </h2>
                {!isEditingPersonal ? (
                  <button
                    onClick={startEditPersonal}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f4ff",
                      color: "#00205B",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setIsEditingPersonal(false)}
                      style={{
                        padding: "8px 16px",
                        background: "#ffffff",
                        color: "#666666",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={savePersonalData}
                      disabled={actionLoading}
                      style={{
                        padding: "8px 16px",
                        background: "#00205B",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {actionLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Nama Lengkap</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.fullName}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, fullName: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.fullName || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>NIK</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.nik}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, nik: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.nik || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Email</p>
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.email || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>No. Telepon</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.phone}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.phone || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tempat Lahir</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.placeOfBirth}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, placeOfBirth: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.placeOfBirth || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tanggal Lahir</p>
                  {isEditingPersonal ? (
                    <input
                      type="date"
                      value={editedPersonal.dateOfBirth}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, dateOfBirth: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>
                      {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Jenis Kelamin</p>
                  {isEditingPersonal ? (
                    <select
                      value={editedPersonal.gender}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, gender: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff" }}
                    >
                      <option value="">Pilih</option>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{genderLabels[applicant.gender || ""] || applicant.gender || "-"}</p>
                  )}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Alamat</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.address}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, address: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.address || "-"}, {applicant.city || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Kota</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.city}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, city: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.city || "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Data Pendidikan */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                  <GraduationCap className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  Data Pendidikan
                </h2>
                {!isEditingEducation ? (
                  <button
                    onClick={startEditEducation}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f4ff",
                      color: "#00205B",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setIsEditingEducation(false)}
                      style={{
                        padding: "8px 16px",
                        background: "#ffffff",
                        color: "#666666",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveEducationData}
                      disabled={actionLoading}
                      style={{
                        padding: "8px 16px",
                        background: "#00205B",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {actionLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Pendidikan Terakhir</p>
                  {isEditingEducation ? (
                    <select
                      value={editedEducation.education}
                      onChange={(e) => setEditedEducation({ ...editedEducation, education: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff" }}
                    >
                      <option value="">Pilih</option>
                      <option value="SMA">SMA/SMK</option>
                      <option value="D3">Diploma 3</option>
                      <option value="S1">Sarjana (S1)</option>
                      <option value="S2">Magister (S2)</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{educationLabels[applicant.education || ""] || applicant.education || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Universitas (jika ada)</p>
                  {isEditingEducation ? (
                    <input
                      type="text"
                      value={editedEducation.university}
                      onChange={(e) => setEditedEducation({ ...editedEducation, university: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.university || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tinggi Badan (cm)</p>
                  {isEditingEducation ? (
                    <input
                      type="number"
                      value={editedEducation.height}
                      onChange={(e) => setEditedEducation({ ...editedEducation, height: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.height ? `${applicant.height} cm` : "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Berat Badan (kg)</p>
                  {isEditingEducation ? (
                    <input
                      type="number"
                      value={editedEducation.weight}
                      onChange={(e) => setEditedEducation({ ...editedEducation, weight: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.weight ? `${applicant.weight} kg` : "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dokumen Pendukung */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Dokumen Pendukung
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {documentTypes.map((doc) => {
                  const DocIcon = doc.icon;
                  const uploadedDoc = data?.applicant?.documents?.find(d => d.type === doc.key);
                  const hasDocument = !!uploadedDoc;
                  return (
                    <div
                      key={doc.key}
                      style={{
                        padding: "16px",
                        background: hasDocument ? "#f0fdf4" : "#f8f9fa",
                        borderRadius: "12px",
                        border: `2px solid ${hasDocument ? "#d1fae5" : "#eeeeee"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{
                        width: "44px",
                        height: "44px",
                        background: hasDocument ? "#d1fae5" : "#eeeeee",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <DocIcon className="w-5 h-5" style={{ color: hasDocument ? "#16a34a" : "#888888" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "2px" }}>{doc.label}</p>
                        <p style={{ fontSize: "12px", color: hasDocument ? "#16a34a" : "#888888" }}>
                          {hasDocument ? uploadedDoc.fileName : "Belum diupload"}
                        </p>
                      </div>
                      {hasDocument && (
                        <a
                          href={uploadedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "8px 12px",
                            background: "#ffffff",
                            border: "1px solid #d1fae5",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#16a34a",
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                        >
                          Lihat
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Timeline Status */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Timeline Status</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "Pendaftaran", status: "completed" },
                  { label: "Verifikasi Admin", status: application.status === "ADMIN_CHECK" ? "current" : ["TEST_SCHEDULED", "IN_TEST", "TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Tes Kompetensi", status: ["TEST_SCHEDULED", "IN_TEST"].includes(application.status) ? "current" : ["TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Interview", status: application.status === "INTERVIEW" ? "current" : ["MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "MCU", status: application.status === "MCU" ? "current" : ["OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Offering", status: ["OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                ].map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "12px", position: "relative" }}>
                    {/* Line connector */}
                    {index < 5 && (
                      <div style={{
                        position: "absolute",
                        left: "11px",
                        top: "28px",
                        width: "2px",
                        height: "32px",
                        background: item.status === "completed" ? "#16a34a" : "#eeeeee",
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: item.status === "completed" ? "#16a34a" : item.status === "current" ? "#FF5E00" : "#eeeeee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      {item.status === "completed" && (
                        <CheckCircle className="w-3 h-3" style={{ color: "#ffffff" }} />
                      )}
                      {item.status === "current" && (
                        <div style={{ width: "8px", height: "8px", background: "#ffffff", borderRadius: "50%" }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: "20px" }}>
                      <p style={{ fontSize: "14px", fontWeight: item.status === "current" ? 700 : 500, color: item.status === "pending" ? "#888888" : "#111111" }}>
                        {item.label}
                      </p>
                      {item.status === "current" && (
                        <p style={{ fontSize: "12px", color: "#FF5E00" }}>Sedang berlangsung</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan Review */}
            {application.notes && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Catatan Review</h2>
                <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6 }}>{application.notes}</p>
              </div>
            )}

            {/* Kontak Pelamar */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Kontak Pelamar</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href={`mailto:${applicant.email}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111111", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#FF5E00" }} />
                  <span style={{ fontSize: "14px" }}>{applicant.email}</span>
                </a>
                {applicant.phone && (
                  <a href={`tel:${applicant.phone}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111111", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                    <Phone className="w-4 h-4" style={{ color: "#FF5E00" }} />
                    <span style={{ fontSize: "14px" }}>{applicant.phone}</span>
                  </a>
                )}
                {applicant.address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                    <MapPin className="w-4 h-4" style={{ color: "#FF5E00", marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px" }}>{applicant.address}, {applicant.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Success Icon */}
            <div style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <CheckCircle className="w-10 h-10" style={{ color: "#ffffff" }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111111",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              Terima Pelamar Ini?
            </h2>

            {/* Candidate Info Card */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #00205B 0%, #003380 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
                flexShrink: 0
              }}>
                {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "2px" }}>
                  {applicant.fullName || "Nama Tidak Diketahui"}
                </p>
                <p style={{ fontSize: "13px", color: "#666666" }}>
                  {job.title || "Posisi"}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <AlertCircle className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.5 }}>
                Pelamar akan menerima notifikasi bahwa mereka <strong>diterima</strong>. Pastikan semua data sudah benar sebelum melanjutkan.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowAcceptModal(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#ffffff",
                  color: "#666666",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  handleAdvanceStatus("ACCEPTED");
                }}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                {actionLoading ? "Memproses..." : "Terima Pelamar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Warning Icon */}
            <div style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <XCircle className="w-10 h-10" style={{ color: "#ffffff" }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111111",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              Tolak Lamaran?
            </h2>

            {/* Candidate Info Card */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #00205B 0%, #003380 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
                flexShrink: 0
              }}>
                {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "2px" }}>
                  {applicant.fullName || "Nama Tidak Diketahui"}
                </p>
                <p style={{ fontSize: "13px", color: "#666666" }}>
                  {job.title || "Posisi"}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#666666", marginBottom: "16px" }}>
              Berikan alasan penolakan agar pelamar dapat mengetahui penyebabnya.
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Contoh: Data tidak sesuai persyaratan, dokumen tidak lengkap, dll..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "14px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "24px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#EF4444"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#ffffff",
                  color: "#666666",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify("reject")}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          animation: "toastSlideIn 0.3s ease",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            background: toast.type === "success" ? "#10B981" : "#EF4444",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: 600,
          }}>
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "48px 40px",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            boxShadow: "0 25px 80px rgba(0,32,91,0.25)",
            animation: "slideUp 0.4s ease-out",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background decoration */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "120px", height: "120px", background: "linear-gradient(135deg, #16a34120, transparent)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "80px", height: "80px", background: "linear-gradient(135deg, #FF5E0015, transparent)", borderRadius: "50%" }} />

            {/* Success Icon */}
            <div style={{
              width: "100px",
              height: "100px",
              background: successStatus === "error" ? "#fee2e2" : "#dcfce7",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              animation: "scaleIn 0.5s ease-out"
            }}>
              {successStatus === "error" ? (
                <XCircle className="w-12 h-12" style={{ color: "#dc2626" }} />
              ) : (
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: "checkmark 0.6s ease-out 0.2s forwards" }} />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: successStatus === "error" ? "#dc2626" : "#00205B",
              marginBottom: "12px"
            }}>
              {successStatus === "error" ? "Terjadi Kesalahan" : "Berhasil!"}
            </h2>

            {/* Message */}
            <p style={{
              fontSize: "16px",
              color: "#64748b",
              marginBottom: successStatus === "error" ? "24px" : "8px",
              lineHeight: 1.6
            }}>
              {successMessage}
            </p>

            {/* Status Badge */}
            {successStatus !== "error" && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "#dcfce7",
                color: "#16a34a",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "24px"
              }}>
                <Check className="w-4 h-4" />
                {successStatus}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: successStatus === "error" ? "#dc2626" : "linear-gradient(135deg, #FF5E00, #ff7a2f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: successStatus === "error"
                  ? "0 4px 14px rgba(220,38,38,0.3)"
                  : "0 4px 14px rgba(255,94,0,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {successStatus === "error" ? "Tutup" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
