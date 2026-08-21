"use client";

import { useState, useEffect } from "react";
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
  difficulty: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  points: number;
  isActive: boolean;
  usageCount?: number;
}

const categories = [
  { id: "AKHLAK", name: "AKHLAK", color: "#00205B", icon: <Award className="w-5 h-5" /> },
  { id: "HOSPITALITY", name: "Hospitality", color: "#FF5E00", icon: <Lightbulb className="w-5 h-5" /> },
  { id: "TECHNICAL", name: "Teknis", color: "#10B981", icon: <Zap className="w-5 h-5" /> },
  { id: "APTITUDE", name: "Aptitude", color: "#8B5CF6", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "FACILITY", name: "Facility", color: "#EC4899", icon: <BookOpen className="w-5 h-5" /> },
];

const divisions = [
  { id: "", name: "Semua Divisi" },
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
  return difficulties.find(d => d.id === difficulty) || { id: difficulty, name: difficulty, bg: "#f1f5f9", text: "#64748b" };
};

const getCategoryConfig = (category: string) => {
  const cat = categories.find(c => c.id === category);
  return cat ? { bg: `${cat.color}15`, text: cat.color } : { bg: "#f1f5f9", text: "#64748b" };
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
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
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.stem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || q.category === categoryFilter;
    const matchDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const matchDivision = divisionFilter === "all" || q.jobDivision === divisionFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && q.isActive) || (statusFilter === "inactive" && !q.isActive);
    return matchSearch && matchCategory && matchDifficulty && matchDivision && matchStatus;
  });

  const getCategoryStats = () => {
    return categories.map((cat) => ({
      ...cat,
      count: questions.filter((q) => q.category === cat.id).length,
    }));
  };

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
    });
    setShowModal(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      stem: question.stem,
      category: question.category,
      jobDivision: question.jobDivision || "",
      difficulty: question.difficulty,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.stem || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    setSaving(true);
    try {
      const url = editingQuestion ? "/api/admin/questions" : "/api/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";
      const body = editingQuestion ? { ...formData, id: editingQuestion.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchQuestions();
        setShowModal(false);
      } else {
        alert("Gagal menyimpan soal");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        await fetchQuestions();
        setDeleteConfirm(null);
      } else {
        alert(data.error || "Gagal menghapus soal");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Terjadi kesalahan saat menghapus soal");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF5E00" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Bank Soal</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola soal tes kompetensi</p>
          </div>
          <Button onClick={openAddModal} size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0">
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
            >
              <option value="all">Semua Tingkat</option>
              {difficulties.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
            >
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>

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
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: category.bg, color: category.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {q.category}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: difficulty.bg, color: difficulty.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {difficulty.name}
                    </span>
                    {q.jobDivision && (
                      <span style={{ display: "inline-flex", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        {q.jobDivision.replace(/_/g, " ")}
                      </span>
                    )}
                    {!q.isActive && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
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
                    const isCorrect = q.correctAnswer === opt;
                    const optionText = q[`option${opt}` as keyof Question];
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
                          {optionText}
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
                    Poin: {q.points}
                  </span>
                  <span style={{ fontSize: "13px", color: "#888888" }}>
                    ID: #{q.id.slice(0, 8)}
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
            <Button onClick={openAddModal} size="sm" className="bg-[#FF5E00] hover:bg-[#e65100] border-0">
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
                  {divisions.filter(d => d.id).map((div) => (
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
                  {["A", "B", "C", "D"].map((opt) => (
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
                        style={{ width: "20px", height: "20px", accentColor: "#16a34a" }}
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
