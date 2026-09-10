"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Briefcase,
  MapPin,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle
} from "lucide-react";

export interface JobDetail {
  id: string;
  title: string;
  division: string;
  location: string | null;
  description: string;
  requirements: string;
  minEducation?: string;
  minHeight?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  startDate: string;
  deadline: string;
  status: string;
  applicantCount?: number;
}

interface JobQuickViewModalProps {
  job: JobDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  divisionLabel: string;
}

export default function JobQuickViewModal({
  job,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  divisionLabel,
}: JobQuickViewModalProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "syarat" | "benefit">("detail");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const now = new Date();
  const startDate = new Date(job.startDate);
  const deadline = new Date(job.deadline);
  const isOpenRegistration = now >= startDate && now <= deadline;
  const isUpcoming = now < startDate;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + "/auth/register?job=" + job.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 20, 60, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "modalFadeIn 0.25s ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 32, 91, 0.35)",
          animation: "modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          border: "1px solid rgba(0, 32, 91, 0.1)",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            background: "linear-gradient(135deg, #00205B 0%, #003399 100%)",
            padding: "28px 28px 20px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          {/* Action buttons top right */}
          <div style={{ position: "absolute", top: "18px", right: "18px", display: "flex", gap: "8px" }}>
            <button
              onClick={() => onToggleBookmark(job.id)}
              title={isBookmarked ? "Hapus dari tersimpan" : "Simpan lowongan"}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: isBookmarked ? "#FF5E00" : "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Bookmark size={17} fill={isBookmarked ? "#ffffff" : "none"} />
            </button>
            <button
              onClick={handleShare}
              title="Salin tautan lowongan"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copied ? <CheckCircle2 size={17} color="#4ade80" /> : <Share2 size={17} />}
            </button>
            <button
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <X size={19} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                background: "rgba(255, 94, 0, 0.25)",
                color: "#FF9800",
                border: "1px solid rgba(255, 152, 0, 0.4)",
              }}
            >
              {divisionLabel}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                background: isOpenRegistration ? "rgba(34, 197, 94, 0.25)" : "rgba(245, 158, 11, 0.25)",
                color: isOpenRegistration ? "#4ade80" : "#fcd34d",
                border: isOpenRegistration ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(252, 211, 77, 0.3)",
              }}
            >
              {isOpenRegistration ? "Pendaftaran Terbuka" : isUpcoming ? "Segera Hadir" : "Ditutup"}
            </span>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.3 }}>
            {job.title}
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={15} color="#FF5E00" />
              {job.location || "Penempatan Seluruh Wilayah Operasional"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <GraduationCap size={15} color="#FF5E00" />
              Min. {job.minEducation || "SMA/SMK"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={15} color="#FF5E00" />
              Batas: {deadline.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "0 20px",
          }}
        >
          {[
            { key: "detail", label: "Deskripsi Posisi" },
            { key: "syarat", label: "Persyaratan & Kualifikasi" },
            { key: "benefit", label: "Benefit & Keuntungan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "14px 18px",
                border: "none",
                background: "transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? "#00205B" : "#6b7280",
                borderBottom: activeTab === tab.key ? "3px solid #FF5E00" : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, fontSize: "14px", lineHeight: 1.7, color: "#374151" }}>
          {activeTab === "detail" && (
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={18} color="#00205B" />
                Gambaran Pekerjaan
              </h4>
              <p style={{ whiteSpace: "pre-line", marginBottom: "20px", color: "#4b5563" }}>
                {job.description || "Bertanggung jawab dalam menjalankan tugas operasional dan pelayanan prima sesuai standar PT Reska Multi Usaha (KAI Services)."}
              </p>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "14px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={18} color="#16a34a" />
                  Keaslian & Akuntabilitas Rekrutmen
                </div>
                <div style={{ fontSize: "13px", color: "#15803d" }}>
                  Proses seleksi KAI Services bebas dari pungutan biaya apapun (GRATIS). Waspada terhadap segala bentuk penipuan yang mengatasnamakan PT Reska Multi Usaha.
                </div>
              </div>
            </div>
          )}

          {activeTab === "syarat" && (
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={18} color="#FF5E00" />
                Kualifikasi yang Dibutuhkan
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Pendidikan Minimal</span>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{job.minEducation || "SMA/SMK"}</div>
                </div>
                <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Penempatan</span>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{job.location || "Sesuai Kebutuhan"}</div>
                </div>
                {job.minHeight && (
                  <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Tinggi Badan Min.</span>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{job.minHeight} cm</div>
                  </div>
                )}
                {(job.minAge || job.maxAge) && (
                  <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Batas Usia</span>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{job.minAge || 18} - {job.maxAge || 35} Tahun</div>
                  </div>
                )}
              </div>

              <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "8px" }}>Persyaratan Detail:</div>
              <div style={{ whiteSpace: "pre-line", color: "#4b5563", background: "#fafafa", padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                {job.requirements || "- Warga Negara Indonesia (WNI)\n- Sehat jasmani dan rohani\n- Berkelakuan baik dan tidak pernah terlibat tindak pidana\n- Siap ditempatkan di seluruh wilayah operasional KAI Services"}
              </div>
            </div>
          )}

          {activeTab === "benefit" && (
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={18} color="#FF5E00" />
                Fasilitas & Keuntungan Bergabung
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {[
                  { title: "Penghasilan Kompetitif & Tunjangan", desc: "Gaji pokok standar BUMN grup, tunjangan kinerja, dan uang perjalanan dinas." },
                  { title: "Perlindungan Kesehatan Lengkap", desc: "Asuransi BPJS Kesehatan dan BPJS Ketenagakerjaan komprehensif." },
                  { title: "Sertifikasi & Diklat Profesional", desc: "Pelatihan resmi bersertifikat keselamatan dan keahlian industri perkeretaapian." },
                  { title: "Jenjang Karier Jelas", desc: "Peluang pengembangan karier dan promosi terbuka luas di lingkungan KAI Group." },
                  { title: "Seragam & Perlengkapan Resmi", desc: "Disediakan seragam dinas dan atribut operasional lengkap." },
                ].map((b, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 14px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e0e7ff", color: "#00205B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "13px" }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>{b.title}</div>
                      <div style={{ color: "#64748b", fontSize: "13px" }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 28px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff",
          }}
        >
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            {job.applicantCount || 0} pelamar telah mendaftar
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
            {isOpenRegistration ? (
              <Link href={`/auth/register?job=${job.id}`}>
                <button
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #FF5E00 0%, #FF8A3D 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 14px rgba(255, 94, 0, 0.35)",
                  }}
                >
                  Lamar Posisi Ini
                  <ArrowRight size={16} />
                </button>
              </Link>
            ) : (
              <button
                disabled
                style={{
                  padding: "10px 20px",
                  background: "#e5e7eb",
                  color: "#9ca3af",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                }}
              >
                Pendaftaran Tidak Aktif
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
