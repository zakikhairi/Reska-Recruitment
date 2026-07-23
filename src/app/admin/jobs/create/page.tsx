"use client";

import { useState } from "react";
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
  Upload,
  Image,
  X,
} from "lucide-react";

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

const requirements = [
  "Usia maksimal 35 tahun",
  "Sehat jasmani dan rohani",
  "Tidak memiliki catatan kriminal",
  "Bersedia bekerja shift",
  "Mampu berkomunikasi dengan baik",
];

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    division: "",
    jobType: "FULL_TIME",
    location: "",
    multipleLocations: false,
    otherLocations: [] as string[],
    education: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    responsibilities: "",
    requirements: requirements.join("\n"),
    benefits: "",
    deadline: "",
    vacancies: "",
  });
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData({
        ...formData,
        otherLocations: [...formData.otherLocations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      otherLocations: formData.otherLocations.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (publish: boolean) => {
    setIsSubmitting(true);
    setStatus(publish ? "ACTIVE" : "DRAFT");

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin/jobs");
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => router.push("/admin/jobs")}
              style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
            </button>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Buat Lowongan Baru</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>Tambah posisi pekerjaan baru</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{ padding: "10px 20px", background: "#ffffff", color: "#00205B", border: "2px solid #00205B", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Preview
            </button>
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

              {/* Title */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Judul Posisi <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Contoh: Pramugara / Pramugari Kereta Api"
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500, transition: "border-color 0.2s" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#00205B"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Division */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Divisi <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.division}
                      onChange={(e) => handleInputChange("division", e.target.value)}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      <option value="">Pilih Divisi</option>
                      {divisions.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Tipe Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.jobType}
                      onChange={(e) => handleInputChange("jobType", e.target.value)}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      {jobTypes.map((j) => (
                        <option key={j.value} value={j.value}>{j.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                {/* Location */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Lokasi <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Contoh: Jakarta"
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                  />
                </div>

                {/* Education */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Pendidikan Min. <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.education}
                      onChange={(e) => handleInputChange("education", e.target.value)}
                      style={{ width: "100%", padding: "12px 40px 12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                    >
                      <option value="">Pilih Pendidikan</option>
                      {educationLevels.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Multiple Locations */}
              {formData.location && (
                <div style={{ marginTop: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.multipleLocations}
                      onChange={(e) => handleInputChange("multipleLocations", e.target.checked ? "true" : "")}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>Lokasi lebih dari satu</span>
                  </label>

                  {formData.multipleLocations && (
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Tambah lokasi..."
                          style={{ flex: 1, padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                          onKeyPress={(e) => { if (e.key === "Enter") addLocation(); }}
                        />
                        <button
                          onClick={addLocation}
                          style={{ padding: "10px 16px", background: "#00205B", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {formData.otherLocations.map((loc, i) => (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", fontSize: "13px", color: "#374151" }}>
                            {formData.location}{loc}
                            <button onClick={() => removeLocation(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#888888" }}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Salary & Deadline */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <DollarSign className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Gaji & Waktu
              </h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Tentukan kisaran gaji dan batas waktu lamaran</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Salary Min */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Gaji Minimal
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888", fontSize: "14px" }}>Rp</span>
                    <input
                      type="text"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                      placeholder="4.500.000"
                      style={{ width: "100%", padding: "12px 16px 12px 40px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                    />
                  </div>
                </div>

                {/* Salary Max */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Gaji Maksimal
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888", fontSize: "14px" }}>Rp</span>
                    <input
                      type="text"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                      placeholder="6.000.000"
                      style={{ width: "100%", padding: "12px 16px 12px 40px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                {/* Deadline */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Batas Waktu <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                  />
                </div>

                {/* Vacancies */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Jumlah Posisi <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) => handleInputChange("vacancies", e.target.value)}
                    placeholder="10"
                    min="1"
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Deskripsi & Persyaratan
              </h2>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Jelaskan detail pekerjaan dan persyaratan pelamar</p>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Deskripsi Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Jelaskan tugas dan tanggung jawab posisi ini..."
                  rows={4}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Responsibilities */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Tanggung Jawab
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  placeholder="Daftar tanggung jawab utama..."
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Requirements */}
              <div>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Persyaratan (satu per baris) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Satu persyaratan per baris..."
                  rows={6}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Benefits */}
              <div style={{ marginTop: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Benefit & Keuntungan
                </label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="Contoh:&#10;- BPJS Kesehatan & Ketenagakerjaan&#10;- THR&#10;- Cuti tahunan&#10;- Pelatihan & pengembangan"
                  rows={4}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              {/* Status Badge */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "12px", display: "block" }}>Status</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { value: "DRAFT", label: "Draft", color: "#F59E0B" },
                    { value: "ACTIVE", label: "Publikasi", color: "#10B981" },
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
                        transition: "all 0.2s",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 600, color: status === s.value ? s.color : "#888888" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "16px" }}>Ringkasan</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Posisi</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {formData.title || "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Divisi</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {formData.division ? divisions.find(d => d.value === formData.division)?.label : "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Lokasi</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {formData.location || "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Gaji</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#FF5E00" }}>
                      {formData.salaryMin && formData.salaryMax
                        ? `Rp ${formData.salaryMin} - ${formData.salaryMax}`
                        : formData.salaryMin
                        ? `Rp ${formData.salaryMin}+`
                        : "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Batas</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {formData.deadline ? new Date(formData.deadline).toLocaleDateString("id-ID") : "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#888888" }}>Posisi</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                      {formData.vacancies || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Status */}
              <div style={{ marginBottom: "24px" }}>
                {formData.title && formData.division && formData.location && formData.deadline && formData.vacancies ? (
                  <div style={{ padding: "14px", background: "#dcfce7", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle className="w-5 h-5" style={{ color: "#16a34a" }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#166534" }}>Semua field wajib terisi</span>
                  </div>
                ) : (
                  <div style={{ padding: "14px", background: "#fef3c7", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <AlertCircle className="w-5 h-5" style={{ color: "#d97706" }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#92400e" }}>Lengkapi field wajib</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={!formData.title || !formData.division || !formData.location || !formData.deadline || !formData.vacancies || isSubmitting}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: formData.title && formData.division && formData.location && formData.deadline && formData.vacancies ? "#FF5E00" : "#d1d5db",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: formData.title && formData.division && formData.location && formData.deadline && formData.vacancies ? "pointer" : "not-allowed",
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
                      <CheckCircle className="w-5 h-5" />
                      Publikasikan Lowongan
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!formData.title || !formData.division || !formData.location || !formData.deadline || !formData.vacancies || isSubmitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ffffff",
                    color: "#00205B",
                    border: "2px solid #00205B",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: formData.title && formData.division && formData.location && formData.deadline && formData.vacancies ? "pointer" : "not-allowed",
                    opacity: formData.title && formData.division && formData.location && formData.deadline && formData.vacancies ? 1 : 0.5,
                  }}
                >
                  Simpan sebagai Draft
                </button>
                <button
                  onClick={() => router.push("/admin/jobs")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    color: "#888888",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 500,
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
