"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Plus,
  Clock,
  Award,
  Save,
  ArrowLeft,
  CheckCircle,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useTestConfigStore } from "@/stores/test-config";

const divisions = [
  { value: "ON_TRAIN_SERVICE", label: "On-Train Service" },
  { value: "RES_CLEAN", label: "ResClean" },
  { value: "IT_STAFF", label: "IT Staff" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "ADMIN", label: "Admin" },
  { value: "RES_PARKING", label: "ResParking" },
];

const categories = [
  { value: "AKHLAK", label: "AKHLAK (Nilai Dasar BUMN)", color: "#00205B" },
  { value: "HOSPITALITY", label: "Hospitality (Keramahtamahan)", color: "#FF5E00" },
  { value: "TECHNICAL", label: "Technical (Pengetahuan Teknis)", color: "#10B981" },
  { value: "APTITUDE", label: "Aptitude (Tes Bakat)", color: "#8B5CF6" },
];

export default function EditTestConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getConfig, updateConfig, _hasHydrated } = useTestConfigStore();
  const config = getConfig(id);

  const [formData, setFormData] = useState({
    jobTitle: "",
    division: "",
    duration: "60",
    questionsPerCategory: "10",
    passingGrade: "60",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (config) {
      setFormData({
        jobTitle: config.jobTitle,
        division: config.division,
        duration: config.duration.toString(),
        questionsPerCategory: config.questionsPerCategory.toString(),
        passingGrade: config.passingGrade.toString(),
      });
      setSelectedCategories(config.categories);
      setStatus(config.active ? "ACTIVE" : "DRAFT");
    }
  }, [config]);

  const totalQuestions = selectedCategories.length * parseInt(formData.questionsPerCategory || "0");

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = () => {
    if (!formData.jobTitle || !formData.division || selectedCategories.length === 0) {
      alert("Mohon lengkapi semua field wajib!");
      return;
    }

    setIsSubmitting(true);

    updateConfig(id, {
      jobTitle: formData.jobTitle,
      division: formData.division,
      categories: selectedCategories,
      passingGrade: parseInt(formData.passingGrade),
      duration: parseInt(formData.duration),
      questionsPerCategory: parseInt(formData.questionsPerCategory),
      totalQuestions: selectedCategories.length * parseInt(formData.questionsPerCategory),
      active: status === "ACTIVE",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin/test-config");
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

  if (!config) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", color: "#111", marginBottom: "8px" }}>Konfigurasi tidak ditemukan</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>Konfigurasi dengan ID ini tidak tersedia</p>
          <Link href="/admin/test-config">
            <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Kembali ke Konfigurasi
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
            <Link href="/admin/test-config">
              <button style={{ padding: "10px", background: "#f8f9fa", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowLeft className="w-5 h-5" style={{ color: "#00205B" }} />
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Edit Konfigurasi Tes</h1>
              <p style={{ fontSize: "15px", color: "#666666" }}>{config.jobTitle}</p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
          {/* Left Column */}
          <div>
            {/* Job Selection */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Settings className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Informasi Lowongan
              </h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Judul Lowongan <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151", fontWeight: 500 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Divisi <span style={{ color: "#EF4444" }}>*</span>
                </label>
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
            </div>

            {/* Test Settings */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Pengaturan Tes
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Durasi Tes (menit) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    min="15"
                    max="180"
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                    Passing Grade (%) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.passingGrade}
                    onChange={(e) => handleInputChange("passingGrade", e.target.value)}
                    min="0"
                    max="100"
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "8px", display: "block" }}>
                  Jumlah Soal per Kategori <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.questionsPerCategory}
                  onChange={(e) => handleInputChange("questionsPerCategory", e.target.value)}
                  min="5"
                  max="50"
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", color: "#374151" }}
                />
              </div>
            </div>

            {/* Categories */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Award className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Kategori Tes
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {categories.map((cat) => (
                  <div
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    style={{
                      padding: "16px 20px",
                      background: selectedCategories.includes(cat.value) ? `${cat.color}15` : "#f8f9fa",
                      border: `2px solid ${selectedCategories.includes(cat.value) ? cat.color : "transparent"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: selectedCategories.includes(cat.value) ? cat.color : "#ffffff",
                      border: `2px solid ${selectedCategories.includes(cat.value) ? cat.color : "#d1d5db"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {selectedCategories.includes(cat.value) && (
                        <CheckCircle className="w-4 h-4" style={{ color: "#ffffff" }} />
                      )}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Status</h3>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                {[
                  { value: "ACTIVE", label: "Aktif", color: "#10B981" },
                  { value: "DRAFT", label: "Draft", color: "#F59E0B" },
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

              {/* Preview Stats */}
              <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", marginBottom: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#00205B" }}>{selectedCategories.length * parseInt(formData.questionsPerCategory || "0")}</p>
                    <p style={{ fontSize: "12px", color: "#888888" }}>Total Soal</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#FF5E00" }}>{selectedCategories.length}</p>
                    <p style={{ fontSize: "12px", color: "#888888" }}>Kategori</p>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "28px", fontWeight: 800, color: "#10B981" }}>{formData.duration || 0} menit</p>
                  <p style={{ fontSize: "12px", color: "#888888" }}>Durasi</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={handleSubmit}
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
                <Link href="/admin/test-config">
                  <button style={{
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
                  onClick={() => router.push("/admin/test-config")}>
                    Batal
                  </button>
                </Link>
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
