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
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Question = {
  id: string;
  stem: string;
  category: string;
  difficulty: string;
  division: string | null;
  isActive: boolean;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  points: number;
  explanation?: string;
  createdAt: string;
};

type CategoryStat = {
  category: string;
  count: number;
};

const categories = [
  { id: "AKHLAK", name: "AKHLAK", color: "#00205B", icon: <Award className="w-5 h-5" /> },
  { id: "HOSPITALITY", name: "Hospitality", color: "#FF5E00", icon: <Lightbulb className="w-5 h-5" /> },
  { id: "TECHNICAL", name: "Teknis", color: "#10B981", icon: <Zap className="w-5 h-5" /> },
  { id: "APTITUDE", name: "Aptitude", color: "#8B5CF6", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "FACILITY", name: "Facility", color: "#EC4899", icon: <BookOpen className="w-5 h-5" /> },
];

const divisions = [
  { id: "ON_TRAIN_SERVICE", name: "On Train Service" },
  { id: "RES_CLEAN", name: "Resto & Cleaning" },
  { id: "RES_PARKING", name: "Resto & Parking" },
  { id: "LOGISTICS", name: "Logistics" },
  { id: "IT_STAFF", name: "IT Staff" },
  { id: "ADMIN", name: "Admin" },
];

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

const getCategoryStats = (stats: CategoryStat[]) => {
  return categories.map((cat) => {
    const stat = stats.find(s => s.category === cat.id);
    return {
      ...cat,
      count: stat?.count || 0,
    };
  });
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    stem: "",
    category: "",
    difficulty: "MEDIUM",
    division: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
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

      if (data.success) {
        setQuestions(data.questions);
        setCategoryStats(data.stats);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveQuestion = async () => {
    if (!formData.stem || !formData.category || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD || !formData.correctAnswer) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddDialogOpen(false);
        setFormData({
          stem: "",
          category: "",
          difficulty: "MEDIUM",
          division: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
        });
        fetchQuestions();
      } else {
        alert(data.error || "Gagal menyimpan soal");
      }
    } catch (error) {
      console.error("Failed to save question:", error);
      alert("Terjadi kesalahan server");
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.stem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || q.category === categoryFilter;
    const matchDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const matchDivision = divisionFilter === "all" || q.division === divisionFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && q.isActive) || (statusFilter === "inactive" && !q.isActive);
    return matchSearch && matchCategory && matchDifficulty && matchDivision && matchStatus;
  });

  const stats = getCategoryStats(categoryStats);
  const availableDivisions = Array.from(new Set(questions.filter(q => q.division).map(q => q.division!)));

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Bank Soal</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola soal tes kompetensi</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-[#FF5E00] hover:bg-[#e65100] border-0 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Tambah Soal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl overflow-hidden p-0">
              {/* Hero Header */}
              <div className="bg-gradient-to-br from-[#00205B] via-[#003380] to-[#0047AB] px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Tambah Soal Baru</h2>
                    <p className="text-white/80 text-sm mt-0.5">Lengkapi semua field untuk membuat soal baru</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Pertanyaan */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-[#00205B]/10 flex items-center justify-center text-xs font-bold text-[#00205B]">1</span>
                    Pertanyaan
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="stem"
                    value={formData.stem}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF5E00] focus:ring-4 focus:ring-[#FF5E00]/10 focus:outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white text-base"
                    rows={4}
                    placeholder="Tulis pertanyaan dengan jelas dan lengkap..."
                  />
                </div>

                {/* Kategori & Kesulitan */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-[#00205B]/10 flex items-center justify-center text-xs font-bold text-[#00205B]">2</span>
                      Kategori
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF5E00] focus:ring-4 focus:ring-[#FF5E00]/10 focus:outline-none bg-slate-50/50 focus:bg-white transition-all text-slate-700 cursor-pointer appearance-none text-base"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-[#00205B]/10 flex items-center justify-center text-xs font-bold text-[#00205B]">3</span>
                      Tingkat Kesulitan
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF5E00] focus:ring-4 focus:ring-[#FF5E00]/10 focus:outline-none bg-slate-50/50 focus:bg-white transition-all text-slate-700 cursor-pointer appearance-none text-base"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                    >
                      <option value="EASY">🟢 Mudah</option>
                      <option value="MEDIUM">🟡 Sedang</option>
                      <option value="HARD">🔴 Sulit</option>
                    </select>
                  </div>
                </div>

                {/* Divisi */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-[#00205B]/10 flex items-center justify-center text-xs font-bold text-[#00205B]">4</span>
                    Divisi
                    <span className="text-xs font-normal text-slate-400">(Opsional)</span>
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-[#FF5E00] focus:ring-4 focus:ring-[#FF5E00]/10 focus:outline-none bg-slate-50/50 focus:bg-white transition-all text-slate-700 cursor-pointer appearance-none text-base"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                  >
                    <option value="">Semua Divisi (Umum)</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>

                {/* Pilihan Jawaban */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-5">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="w-7 h-7 rounded-lg bg-[#FF5E00]/10 flex items-center justify-center text-xs font-bold text-[#FF5E00]">5</span>
                    Pilihan Jawaban
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {["A", "B", "C", "D"].map((opt, idx) => {
                      const colors = [
                        { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", hover: "hover:border-blue-400" },
                        { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", hover: "hover:border-emerald-400" },
                        { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", hover: "hover:border-amber-400" },
                        { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", hover: "hover:border-purple-400" },
                      ];
                      const c = colors[idx];
                      return (
                        <div key={opt} className="flex items-center gap-4">
                          <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${c.bg} ${c.text} border ${c.border}`}>
                            {opt}
                          </span>
                          <input
                            type="text"
                            name={`option${opt}`}
                            value={formData[`option${opt}` as keyof typeof formData]}
                            onChange={handleInputChange}
                            className={`flex-1 px-5 py-4 border-2 ${c.border} rounded-xl focus:border-[#FF5E00] focus:ring-4 focus:ring-[#FF5E00]/10 focus:outline-none transition-all text-slate-700 placeholder:text-slate-400 bg-white ${c.hover} text-base`}
                            placeholder={`Masukkan pilihan ${opt}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Jawaban Benar */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-[#00205B]/10 flex items-center justify-center text-xs font-bold text-[#00205B]">6</span>
                    Jawaban Benar
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {["A", "B", "C", "D"].map((opt) => (
                      <label key={opt} className={`flex-1 flex items-center justify-center gap-3 py-4 px-5 rounded-xl border-2 cursor-pointer transition-all font-semibold text-base ${
                        formData.correctAnswer === opt
                          ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                      }`}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={opt}
                          checked={formData.correctAnswer === opt}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          formData.correctAnswer === opt ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {opt}
                        </span>
                        <span>Jawaban {opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-8 py-3 rounded-xl font-semibold border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-slate-600 text-base"
                >
                  Batal
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF5E00] to-[#FF8C42] hover:from-[#e65100] hover:to-[#FF5E00] border-0 shadow-lg shadow-[#FF5E00]/30 text-white font-semibold px-10 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-base"
                  onClick={handleSaveQuestion}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan Soal
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {stats.map((cat) => (
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
              <option value="EASY">Mudah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HARD">Sulit</option>
            </select>

            {/* Division Filter */}
            {availableDivisions.length > 0 && (
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                style={{ padding: "10px 44px 10px 16px", border: "1px solid #e5e7e9", borderRadius: "9999px", fontSize: "13px", outline: "none", background: "#ffffff", cursor: "pointer", appearance: "none", color: "#374151", fontWeight: 500, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "14px", transition: "all 0.2s" }}
              >
                <option value="all">Semua Divisi</option>
                {availableDivisions.map((div) => (
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

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#ffffff", borderRadius: "16px" }}>
            <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: "#FF5E00" }} />
            <p style={{ marginTop: "16px", color: "#888888" }}>Memuat soal...</p>
          </div>
        ) : (
          /* Questions List */
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
                        {difficulty.label}
                      </span>
                      {q.division && (
                        <span style={{ display: "inline-flex", padding: "6px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          {q.division.replace(/_/g, " ")}
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
                            {q.options[opt as keyof typeof q.options]}
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
                      ID: #{q.id.substring(0, 8)}
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
            <Button size="lg" className="bg-[#FF5E00] hover:bg-[#e65100] border-0" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Tambah Soal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
