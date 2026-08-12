"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  Lightbulb,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui";

const questions = [
  { id: "1", stem: "Apa singkatan dari nilai-nilai AKHLAK yang menjadi budaya perusahaan BUMN?", category: "AKHLAK", difficulty: "EASY", division: null, active: true, usageCount: 45, options: { A: "Amanah, Kompeten, Harmonis, Loyal, Akhir", B: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", C: "Amanah, Kuat, Harmonis, Loyal, Akhlak", D: "Amanah, Kreatif, Harmonis, Loyal, Akhlak" }, correct: "B" },
  { id: "2", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...", category: "AKHLAK", difficulty: "MEDIUM", division: null, active: true, usageCount: 38, options: { A: "Kompeten", B: "Harmonis", C: "Amanah", D: "Loyal" }, correct: "C" },
  { id: "3", stem: "Seorang pramugara/pramugari kereta api harus memiliki kemampuan untuk menangani penumpang dengan berbagai tingkah laku. Ini termasuk dalam aspek...", category: "HOSPITALITY", difficulty: "MEDIUM", division: "ON_TRAIN_SERVICE", active: true, usageCount: 32, options: { A: "Keterampilan teknis", B: "Manajemen konflik", C: "Keterampilan komunikasi", D: "Kepemimpinan" }, correct: "B" },
  { id: "4", stem: "Apa yang dimaksud dengan \"service excellence\" dalam konteks layanan kereta api?", category: "HOSPITALITY", difficulty: "EASY", division: "ON_TRAIN_SERVICE", active: true, usageCount: 41, options: { A: "Layanan standar sesuai prosedur", B: "Layanan terbaik yang melebihi ekspektasi pelanggan", C: "Layanan tercepat yang tersedia", D: "Layanan termurah yang bisa diberikan" }, correct: "B" },
  { id: "5", stem: "Komponen utama yang menghubungkan antar gerbong kereta api disebut...", category: "TECHNICAL", difficulty: "MEDIUM", division: "LOGISTICS", active: true, usageCount: 28, options: { A: "Trunion", B: "Coupler", C: "Bogie", D: "Buffer" }, correct: "B" },
  { id: "6", stem: "Sistem rem darurat pada kereta api bekerja berdasarkan prinsip...", category: "TECHNICAL", difficulty: "HARD", division: "LOGISTICS", active: true, usageCount: 15, options: { A: "Tekanan hidrolik", B: "Tekanan udara comprimida", C: "Pegas mekanik", D: "Elektromagnetik" }, correct: "B" },
  { id: "7", stem: "Jika semua X adalah Y, dan beberapa Y adalah Z, maka...", category: "APTITUDE", difficulty: "HARD", division: null, active: true, usageCount: 22, options: { A: "Semua X adalah Z", B: "Beberapa X adalah Z", C: "Tidak ada X yang adalah Z", D: "Tidak dapat ditentukan" }, correct: "D" },
  { id: "8", stem: "Deret angka: 2, 6, 12, 20, 30, ... Bilangan selanjutnya adalah?", category: "APTITUDE", difficulty: "HARD", division: null, active: false, usageCount: 18, options: { A: "40", B: "42", C: "44", D: "46" }, correct: "B" },
  { id: "9", stem: "Langkah pertama saat menangani penumpang yang mengeluh adalah...", category: "HOSPITALITY", difficulty: "EASY", division: "ON_TRAIN_SERVICE", active: true, usageCount: 35, options: { A: "Mengabaikan keluhannya", B: "Mendengarkan dengan penuh perhatian", C: "Menyalahkan penumpang lain", D: "Langsung memberikan solusi" }, correct: "B" },
  { id: "10", stem: "AC pada kereta api singkatan dari...", category: "TECHNICAL", difficulty: "EASY", division: "LOGISTICS", active: true, usageCount: 48, options: { A: "Air Conditioner", B: "Automatic Control", C: "Alternating Current", D: "Air Compressor" }, correct: "A" },
];

const categories = [
  { id: "AKHLAK", name: "AKHLAK", color: "#00205B", icon: <Award className="w-5 h-5" /> },
  { id: "HOSPITALITY", name: "Hospitality", color: "#FF5E00", icon: <Lightbulb className="w-5 h-5" /> },
  { id: "TECHNICAL", name: "Teknis", color: "#10B981", icon: <Zap className="w-5 h-5" /> },
  { id: "APTITUDE", name: "Aptitude", color: "#8B5CF6", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "FACILITY", name: "Facility", color: "#EC4899", icon: <BookOpen className="w-5 h-5" /> },
];

const divisions = Array.from(
  new Set(questions.filter((q) => q.division).map((q) => q.division!))
).sort();

const getCategoryStats = () => {
  return categories.map((cat) => ({
    ...cat,
    count: questions.filter((q) => q.category === cat.id).length,
  }));
};

const getDifficultyConfig = (difficulty: string) => {
  switch (difficulty) {
    case "EASY": return { bg: "#dcfce7", text: "#16a34a", label: "Mudah" };
    case "MEDIUM": return { bg: "#fef3c7", text: "#d97706", label: "Sedang" };
    case "HARD": return { bg: "#fee2e2", text: "#dc2626", label: "Sulit" };
    default: return { bg: "#f1f5f9", text: "#64748b", label: difficulty };
  }
};

const getCategoryConfig = (category: string) => {
  const cat = categories.find(c => c.id === category);
  return cat ? { bg: `${cat.color}15`, text: cat.color } : { bg: "#f1f5f9", text: "#64748b" };
};

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.stem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || q.category === categoryFilter;
    const matchDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const matchDivision = divisionFilter === "all" || q.division === divisionFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && q.active) || (statusFilter === "inactive" && !q.active);
    return matchSearch && matchCategory && matchDifficulty && matchDivision && matchStatus;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Bank Soal</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola soal tes kompetensi</p>
          </div>
          <Button size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Soal
          </Button>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {getCategoryStats().map((cat) => (
            <div key={cat.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: `${cat.color}15`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: cat.color }}>
                {cat.icon}
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>{cat.count}</p>
                <p style={{ fontSize: "13px", color: "#888888" }}>{cat.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "280px" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="Cari soal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 48px", border: "2px solid #eeeeee", borderRadius: "12px", fontSize: "14px", outline: "none" }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
            >
              <option value="all">Semua Kategori</option>
              <option value="AKHLAK">AKHLAK</option>
              <option value="HOSPITALITY">Hospitality</option>
              <option value="TECHNICAL">Teknis</option>
              <option value="APTITUDE">Aptitude</option>
              <option value="FACILITY">Facility</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
            >
              <option value="all">Semua Tingkat</option>
              <option value="EASY">Mudah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HARD">Sulit</option>
            </select>

            {/* Division Filter */}
            {divisions.length > 0 && (
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
              >
                <option value="all">Semua Divisi</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>{div.replace(/_/g, " ")}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: "#888888" }}>
            Menampilkan <strong style={{ color: "#111111" }}>{filteredQuestions.length}</strong> dari <strong style={{ color: "#111111" }}>{questions.length}</strong> soal
          </p>
          {(categoryFilter !== "all" || difficultyFilter !== "all" || divisionFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setDifficultyFilter("all"); setDivisionFilter("all"); setStatusFilter("all"); }}
              style={{ fontSize: "13px", color: "#FF5E00", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Questions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredQuestions.map((q) => {
            const difficulty = getDifficultyConfig(q.difficulty);
            const category = getCategoryConfig(q.category);
            return (
              <div key={q.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: category.bg, color: category.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {q.category}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: difficulty.bg, color: difficulty.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {difficulty.label}
                    </span>
                    {q.division && (
                      <span style={{ display: "inline-flex", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        {q.division.replace("_", " ")}
                      </span>
                    )}
                    {!q.active && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: "16px", fontWeight: 500, color: "#111111", lineHeight: 1.6, marginBottom: "20px" }}>
                  {q.stem}
                </p>

                {/* Answer Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const isCorrect = q.correct === opt;
                    return (
                      <div key={opt} style={{
                        position: "relative",
                        padding: "16px 20px",
                        paddingLeft: "68px",
                        background: isCorrect ? "#f0fdf4" : "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderLeft: `4px solid ${isCorrect ? "#16a34a" : "#d1d5db"}`,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                        onMouseEnter={(e) => {
                          if (!isCorrect) {
                            e.currentTarget.style.borderLeftColor = "#00205B";
                            e.currentTarget.style.background = "#f8faff";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCorrect) {
                            e.currentTarget.style.borderLeftColor = "#d1d5db";
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                          }
                        }}
                      >
                        <div style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "40px",
                          height: "40px",
                          background: isCorrect ? "#16a34a" : "#f3f4f6",
                          color: isCorrect ? "#ffffff" : "#6b7280",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          fontWeight: 700,
                        }}>
                          {opt}
                        </div>
                        <p style={{
                          fontSize: "14px",
                          color: isCorrect ? "#166534" : "#374151",
                          fontWeight: isCorrect ? 600 : 500,
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {q.options[opt]}
                        </p>
                        {/* Horizontal line at bottom */}
                        <div style={{
                          position: "absolute",
                          bottom: 0,
                          left: "20px",
                          right: "20px",
                          height: "1px",
                          background: "#e5e7eb",
                        }} />
                        {isCorrect && (
                          <div style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "28px",
                            height: "28px",
                            background: "#16a34a",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <CheckCircle className="w-4 h-4" style={{ color: "#ffffff" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #eeeeee" }}>
                  <span style={{ fontSize: "13px", color: "#888888" }}>
                    Digunakan: {q.usageCount}x
                  </span>
                  <span style={{ fontSize: "13px", color: "#888888" }}>
                    ID: #{q.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#ffffff", borderRadius: "16px" }}>
            <BookOpen className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada soal ditemukan</h3>
            <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Coba ubah filter atau tambah soal baru</p>
            <Button size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
