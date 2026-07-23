"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  Award,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useTestConfigStore, TestConfig } from "@/stores/test-config";

const categoryColors: Record<string, { bg: string; text: string }> = {
  "AKHLAK": { bg: "#00205B15", text: "#00205B" },
  "HOSPITALITY": { bg: "#FF5E0015", text: "#FF5E00" },
  "TECHNICAL": { bg: "#10B98115", text: "#10B981" },
  "APTITUDE": { bg: "#8B5CF615", text: "#8B5CF6" },
  "FACILITY": { bg: "#EC489915", text: "#EC4899" },
};

const categoryWeights: Record<string, number> = {
  "AKHLAK": 25,
  "HOSPITALITY": 35,
  "TECHNICAL": 20,
  "APTITUDE": 20,
};

export default function TestConfigPage() {
  const { configs, deleteConfig, _hasHydrated } = useTestConfigStore();
  const [mounted, setMounted] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<TestConfig | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; config: TestConfig | null }>({ show: false, config: null });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (configs.length > 0 && !selectedConfig) {
      setSelectedConfig(configs[0]);
    } else if (selectedConfig) {
      const found = configs.find(c => c.id === selectedConfig.id);
      if (!found) {
        setSelectedConfig(configs[0] || null);
      }
    }
  }, [configs, selectedConfig]);

  const handleDeleteClick = (config: TestConfig) => {
    setDeleteModal({ show: true, config });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.config) {
      deleteConfig(deleteModal.config.id);
      setDeleteModal({ show: false, config: null });
    }
  };

  if (!mounted || !_hasHydrated) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Konfigurasi Tes</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Atur parameter tes kompetensi per lowongan</p>
          </div>
          <Link href="/admin/test-config/create">
            <button style={{ padding: "14px 24px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 16px rgba(255,94,0,0.3)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,94,0,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,94,0,0.3)"; }}>
              <Plus className="w-5 h-5" />
              Buat Konfigurasi
            </button>
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          {/* Config List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {configs.map((config) => (
              <div
                key={config.id}
                onClick={() => setSelectedConfig(config)}
                style={{
                  background: selectedConfig?.id === config.id ? "#f0f4ff" : "#ffffff",
                  border: `2px solid ${selectedConfig?.id === config.id ? "#00205B" : "#eeeeee"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{config.jobTitle}</h3>
                    <span style={{ fontSize: "12px", color: "#888888" }}>{config.division.replace("_", " ")}</span>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: config.active ? "#dcfce7" : "#f1f5f9", color: config.active ? "#16a34a" : "#64748b", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>
                    {config.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {config.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#666666" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <BarChart3 className="w-4 h-4" />
                    {config.totalQuestions} soal
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock className="w-4 h-4" />
                    {config.duration} menit
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Award className="w-4 h-4" />
                    Min. {config.passingGrade}%
                  </span>
                </div>
              </div>
            ))}

            {configs.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 40px", background: "#ffffff", borderRadius: "16px" }}>
                <Settings className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Belum ada konfigurasi</h3>
                <p style={{ fontSize: "14px", color: "#888888" }}>Buat konfigurasi tes baru untuk memulai</p>
              </div>
            )}
          </div>

          {/* Config Detail */}
          {selectedConfig && (
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>Detail Konfigurasi</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/admin/test-config/${selectedConfig.id}/edit`}>
                    <button style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}>
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(selectedConfig)}
                    style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Job Info */}
              <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>{selectedConfig.jobTitle}</h3>
                <span style={{ display: "inline-block", padding: "4px 10px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                  {selectedConfig.division.replace("_", " ")}
                </span>
              </div>

              {/* General Settings */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#888888", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pengaturan Umum</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Durasi</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>{selectedConfig.duration} menit</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Soal/Kategori</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>{selectedConfig.questionsPerCategory}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Total Soal</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>{selectedConfig.totalQuestions}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px" }}>Passing Grade</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#FF5E00" }}>{selectedConfig.passingGrade}%</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#888888", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kategori & Bobot</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedConfig.categories.map((cat) => (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", background: categoryColors[cat]?.bg || "#f1f5f9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: categoryColors[cat]?.text || "#666666" }}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{cat}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "100px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${categoryWeights[cat] || 20}%`, background: categoryColors[cat]?.text || "#666666", borderRadius: "4px" }} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111", width: "40px", textAlign: "right" }}>{categoryWeights[cat] || 20}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div style={{ padding: "16px", background: "#fff7f0", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <Shield className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>Pengaturan Keamanan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666666" }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "#16a34a" }} />
                  Anti-ganti tab browser aktif
                </div>
              </div>
            </div>
          )}

          {!selectedConfig && configs.length > 0 && (
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
              <Settings className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Pilih konfigurasi</h3>
              <p style={{ fontSize: "14px", color: "#888888" }}>Klik salah satu konfigurasi di samping untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "450px", width: "100%", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", background: "#fee2e2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: "#EF4444" }} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: 0 }}>Hapus Konfigurasi</h2>
              </div>
              <button onClick={() => setDeleteModal({ show: false, config: null })} style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                <X className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: "15px", color: "#666666", marginBottom: "8px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus konfigurasi ini?
              </p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", marginBottom: "24px" }}>
                "{deleteModal.config?.jobTitle}"
              </p>
              <p style={{ fontSize: "13px", color: "#EF4444", marginBottom: "24px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait konfigurasi ini akan dihapus permanen.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setDeleteModal({ show: false, config: null })}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#ffffff",
                    color: "#666666",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#EF4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
