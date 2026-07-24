"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useJobsStore } from "@/stores/jobs";

const divisions = [
  { value: "ON_TRAIN_SERVICE", label: "On-Train Service" },
  { value: "RES_CLEAN", label: "ResClean" },
  { value: "IT_STAFF", label: "IT Staff" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "ADMIN", label: "Admin" },
  { value: "RES_PARKING", label: "ResParking" },
];

const educationLevels = [
  { value: "SMA", label: "SMA / SMK" },
  { value: "D3", label: "Diploma 3" },
  { value: "S1", label: "Sarjana (S1)" },
  { value: "S2", label: "Magister (S2)" },
];

const jobTypes = [
  { value: "FULL_TIME", label: "Penuh Waktu" },
  { value: "PART_TIME", label: "Paruh Waktu" },
  { value: "KONTRAK", label: "Kontrak" },
  { value: "MAGANG", label: "Magang" },
];

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getJob, updateJob, _hasHydrated } = useJobsStore();
  const job = getJob(id);

  const [formData, setFormData] = useState({
    title: "",
    division: "",
    jobType: "FULL_TIME",
    location: "",
    minEducation: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    deadline: "",
    vacancies: "",
  });
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when job is loaded
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        division: job.division || "",
        jobType: job.jobType || "FULL_TIME",
        location: job.location || "",
        minEducation: job.minEducation || "",
        salaryMin: job.salaryMin || "",
        salaryMax: job.salaryMax || "",
        description: job.description || "",
        responsibilities: job.responsibilities || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        deadline: job.deadline || "",
        vacancies: job.vacancies || "",
      });
      setStatus(job.status || "DRAFT");
    }
  }, [job]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (publish: boolean) => {
    setIsSubmitting(true);
    const newStatus = publish ? "ACTIVE" : "DRAFT";

    // Update job in store (persisted to localStorage)
    updateJob(id, { ...formData, status: newStatus });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/admin/jobs/${id}`);
    }, 500);
  };

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
            <Link href={`/admin/jobs/${id}`}>
              <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Edit Lowongan</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>{job.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
          {/* Left Column - Form */}
          <div>
            {/* Basic Information */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Briefcase className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Informasi Dasar
              </h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Masukkan informasi dasar posisi pekerjaan</p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Judul Posisi <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Divisi</label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleInputChange("division", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", color: "#374151" }}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Tipe Pekerjaan</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => handleInputChange("jobType", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", color: "#374151" }}
                  >
                    {jobTypes.map((j) => (
                      <option key={j.value} value={j.value}>{j.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Pendidikan Min.</label>
                  <select
                    value={formData.minEducation}
                    onChange={(e) => handleInputChange("minEducation", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", color: "#374151" }}
                  >
                    <option value="">Pilih Pendidikan</option>
                    {educationLevels.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Salary & Deadline */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <DollarSign className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Gaji & Waktu
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Gaji Minimal</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }}>Rp</span>
                    <input
                      type="text"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                      style={{ width: "100%", padding: "12px 16px 12px 40px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Gaji Maksimal</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }}>Rp</span>
                    <input
                      type="text"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                      style={{ width: "100%", padding: "12px 16px 12px 40px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Batas Waktu</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Jumlah Posisi</label>
                  <input
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) => handleInputChange("vacancies", e.target.value)}
                    min="1"
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Deskripsi & Persyaratan
              </h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Deskripsi Pekerjaan</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Tanggung Jawab</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Persyaratan (satu per baris)</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  rows={5}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>Benefit & Keuntungan</label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Status</h3>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                {[
                  { value: "DRAFT", label: "Draft", color: "#F59E0B" },
                  { value: "ACTIVE", label: "Aktif", color: "#10B981" },
                ].map((s) => (
                  <div
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: status === s.value ? `${s.color}15` : "#f8f9fa",
                      border: `2px solid ${status === s.value ? s.color : "transparent"}`,
                      borderRadius: "12px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: 600, color: status === s.value ? s.color : "#888888" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#FF5E00",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: "20px", height: "20px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push(`/admin/jobs/${id}`)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ffffff",
                    color: "#00205B",
                    border: "2px solid #00205B",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
