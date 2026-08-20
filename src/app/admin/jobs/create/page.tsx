"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Save,
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

export default function CreateJobPage() {
  const router = useRouter();
  const fetchJobs = useJobsStore((state) => state.fetchJobs);
  const [formData, setFormData] = useState({
    title: "",
    division: "",
    location: "",
    minEducation: "",
    description: "",
    requirements: "",
    startDate: "",
    deadline: "",
  });
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title || !formData.division || !formData.location || !formData.startDate || !formData.deadline) {
      setError("Mohon lengkapi semua field wajib");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const jobData = {
      title: formData.title,
      division: formData.division,
      location: formData.location,
      description: formData.description,
      requirements: formData.requirements,
      minEducation: formData.minEducation,
      startDate: formData.startDate,
      deadline: formData.deadline,
      status: publish ? "ACTIVE" : "DRAFT",
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchJobs();
        router.push("/admin/jobs");
      } else {
        setError(result.error || "Gagal membuat lowongan");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link href="/admin/jobs">
            <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#00205B", fontWeight: 600 }}>
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginTop: "16px" }}>Buat Lowongan Baru</h1>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "24px" }}>Informasi Lowongan</h2>

          {error && (
            <div style={{ padding: "12px 16px", background: "#FEE2E2", color: "#DC2626", borderRadius: "8px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
              Judul Posisi <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Contoh: Pramugara"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                Divisi <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                value={formData.division}
                onChange={(e) => handleInputChange("division", e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#fff" }}
              >
                <option value="">Pilih Divisi</option>
                {divisions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                Lokasi <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Contoh: Jakarta"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                Pendidikan Min.
              </label>
              <select
                value={formData.minEducation}
                onChange={(e) => handleInputChange("minEducation", e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#fff" }}
              >
                <option value="">Pilih Pendidikan</option>
                {educationLevels.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                Tanggal Mulai Pendaftaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                Batas Waktu Pendaftaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
              Deskripsi Pekerjaan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
              Persyaratan
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              rows={5}
              placeholder="Satu persyaratan per baris"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "16px",
                background: "#FF5E00",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Menyimpan..." : "Publikasikan"}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "16px",
                background: "#ffffff",
                color: "#374151",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Simpan sebagai Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
