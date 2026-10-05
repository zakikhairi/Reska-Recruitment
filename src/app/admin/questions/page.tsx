"use client";

import { useState, useEffect, useCallback } from "react";
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
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";

interface Question {
  id: string;
  stem: string;
  category: string;
  jobDivision: string | null;
  division?: string | null;
  difficulty: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  points: number;
  isActive: boolean;
  createdAt?: string;
}

interface CategoryStat {
  category: string;
  count: number;
}

const categories = [
  { id: "AKHLAK", name: "AKHLAK", color: "#00205B", icon: <Award className="w-5 h-5" /> },
  { id: "HOSPITALITY", name: "Hospitality", color: "#FF5E00", icon: <Lightbulb className="w-5 h-5" /> },
  { id: "TECHNICAL", name: "Teknis", color: "#10B981", icon: <Zap className="w-5 h-5" /> },
  { id: "APTITUDE", name: "Aptitude", color: "#8B5CF6", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "FACILITY", name: "Facility", color: "#EC4899", icon: <BookOpen className="w-5 h-5" /> },
];

const divisions = [
  { id: "all", name: "Semua Divisi" },
  { id: "ON_TRAIN_SERVICE", name: "Layanan di Kereta" },
  { id: "RES_CLEAN", name: "Cleaning Service" },
  { id: "RES_PARKING", name: "Parking" },
  { id: "LOGISTICS", name: "Logistik" },
  { id: "IT_STAFF", name: "IT Staff" },
  { id: "ADMIN", name: "Admin" },
];

const difficulties = [
  { id: "EASY", name: "Mudah", bg: "#dcfce7", text: "#16a34a" },
  { id: "MEDIUM", name: "Sedang", bg: "#fef3c7", text: "#d97706" },
  { id: "HARD", name: "Sulit", bg: "#fee2e2", text: "#dc2626" },
];

const getDifficultyConfig = (difficulty: string) => {
  return difficulties.find((d) => d.id === difficulty) || { id: difficulty, name: difficulty, bg: "#f1f5f9", text: "#64748b" };
};

const getCategoryConfig = (category: string) => {
  const cat = categories.find((c) => c.id === category);
  return cat ? { bg: `${cat.color}15`, text: cat.color } : { bg: "#f1f5f9", text: "#64748b" };
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    stem: "",
    category: "AKHLAK",
    jobDivision: "",
    difficulty: "MEDIUM",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    points: 1,
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);
      if (divisionFilter !== "all") params.set("division", divisionFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.questions) {
        setQuestions(data.questions);
        if (data.stats) setCategoryStats(data.stats);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, difficultyFilter, divisionFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      stem: "",
      category: "AKHLAK",
      jobDivision: "",
      difficulty: "MEDIUM",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
      points: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      stem: question.stem,
      category: question.category,
      jobDivision: question.jobDivision || question.division || "",
      difficulty: question.difficulty,
      optionA: question.optionA || (question as any).options?.A || "",
      optionB: question.optionB || (question as any).options?.B || "",
      optionC: question.optionC || (question as any).options?.C || "",
      optionD: question.optionD || (question as any).options?.D || "",
      correctAnswer: question.correctAnswer || (question as any).correct || "A",
      explanation: question.explanation || "",
      points: question.points || 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stem || !formData.category || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD || !formData.correctAnswer) {
      alert("Mohon lengkapi semua field wajib!");
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            id: editingQuestion.id,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          fetchQuestions();
        } else {
          alert(data.error || "Gagal memperbarui soal");
        }
      } else {
        const response = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          fetchQuestions();
        } else {
          alert(data.error || "Gagal membuat soal");
        }
      }
    } catch (error) {
      console.error("Failed to save question:", error);
      alert("Terjadi kesalahan server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setDeleteConfirm(null);
        fetchQuestions();
      } else {
        alert(data.error || "Gagal menghapus soal");
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Terjadi kesalahan server");
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.stem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || q.category === categoryFilter;
    const matchDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const divVal = q.jobDivision || q.division;
    const matchDivision = divisionFilter === "all" || divVal === divisionFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && q.isActive) || (statusFilter === "inactive" && !q.isActive);
    return matchSearch && matchCategory && matchDifficulty && matchDivision && matchStatus;
  });

  const getCategoryStatsData = () => {
    return categories.map((cat) => {
      const count = questions.filter((q) => q.category === cat.id).length;
      return { ...cat, count };
    });
  };

  const stats = getCategoryStatsData();

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Bank Soal</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola soal tes kompetensi</p>
          </div>
          <Button onClick={openAddModal} size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0 text-white font-semibold flex items-center gap-2 px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Tambah Soal
          </Button>
        </div>
      </header>

      <div className="admin-page-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 64px" }}>
        {/* Category Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => setCategoryFilter(categoryFilter === stat.id ? "all" : stat.id)}
              style={{
                background: categoryFilter === stat.id ? `${stat.color}10` : "#ffffff",
                border: `2px solid ${categoryFilter === stat.id ? stat.color : "#eeeeee"}`,
                borderRadius: "16px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <span style={{ fontSize: "24px", fontWeight: 800, color: stat.color }}>{stat.count}</span>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>{stat.name}</h3>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px 16px 10px 42px", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer" }}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer" }}
            >
              <option value="all">Semua Tingkat</option>
              {difficulties.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer" }}
            >
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer" }}
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

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#ffffff", borderRadius: "16px" }}>
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: "#FF5E00" }} />
            <p style={{ marginTop: "16px", color: "#888888" }}>Memuat soal...</p>
          </div>
        ) : (
          /* Questions List */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredQuestions.map((q) => {
              const difficulty = getDifficultyConfig(q.difficulty);
              const category = getCategoryConfig(q.category);
              const divVal = q.jobDivision || q.division;
              return (
                <div key={q.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: category.bg, color: category.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        {q.category}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: difficulty.bg, color: difficulty.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        {difficulty.name}
                      </span>
                      {divVal && (
                        <span style={{ display: "inline-flex", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          {divVal.replace(/_/g, " ")}
                        </span>
                      )}
                      {!q.isActive && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          <XCircle className="w-3 h-3" />
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openEditModal(q)} style={{ padding: "8px", background: "#f0f4ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#00205B" }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(q.id)} style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}>
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
                      const isCorrect = (q.correctAnswer || (q as any).correct) === opt;
                      const optionText = q[`option${opt}` as keyof Question] || (q as any).options?.[opt] || "";
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
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                        }}>
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
                            {optionText as string}
                          </p>
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
                      Poin: {q.points || 1}
                    </span>
                    <span style={{ fontSize: "13px", color: "#888888" }}>
                      ID: #{q.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredQuestions.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#ffffff", borderRadius: "16px" }}>
            <BookOpen className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#cccccc" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Tidak ada soal ditemukan</h3>
            <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>Coba ubah filter atau tambah soal baru</p>
            <Button onClick={openAddModal} size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0 text-white font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "700px",
            maxHeight: "90vh",
            overflow: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: 0 }}>
                {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
                <X className="w-6 h-6" style={{ color: "#666666" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {/* Stem */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Pertanyaan *
                </label>
                <textarea
                  value={formData.stem}
                  onChange={(e) => setFormData({ ...formData, stem: e.target.value })}
                  placeholder="Masukkan pertanyaan..."
                  rows={3}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", resize: "vertical", outline: "none" }}
                />
              </div>

              {/* Category & Difficulty */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Tingkat Kesulitan *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
                  >
                    {difficulties.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Division */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Divisi (Opsional)
                </label>
                <select
                  value={formData.jobDivision}
                  onChange={(e) => setFormData({ ...formData, jobDivision: e.target.value })}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
                >
                  <option value="">Semua Divisi</option>
                  {divisions.filter((d) => d.id !== "all").map((div) => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              {/* Answer Options */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Pilihan Jawaban *
                </label>
                <div style={{ display: "grid", gap: "12px" }}>
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "32px", height: "32px", background: formData.correctAnswer === opt ? "#16a34a" : "#f3f4f6", color: formData.correctAnswer === opt ? "#ffffff" : "#6b7280", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>
                        {opt}
                      </span>
                      <input
                        type="text"
                        value={formData[`option${opt}` as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                        placeholder={`Jawaban ${opt}`}
                        style={{ flex: 1, padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none" }}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === opt}
                        onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                        style={{ width: "20px", height: "20px", accentColor: "#16a34a", cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Penjelasan (Opsional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Masukkan penjelasan jawaban..."
                  rows={2}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", resize: "vertical", outline: "none" }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "24px", borderTop: "1px solid #eeeeee", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "12px 24px", background: "#ffffff", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: "12px 24px", background: saving ? "#cccccc" : "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                {saving && <Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "12px" }}>Hapus Soal?</h3>
            <p style={{ fontSize: "14px", color: "#666666", marginBottom: "24px" }}>Soal yang dihapus tidak dapat dikembalikan.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "10px 20px", background: "#ffffff", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "10px 20px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Hapus
              </button>
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
