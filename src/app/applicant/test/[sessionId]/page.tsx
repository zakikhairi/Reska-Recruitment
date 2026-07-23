"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  category: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
}

const mockConfig = {
  totalQuestions: 40,
  durationMinutes: 90,
  categories: ["AKHLAK", "HOSPITALITY", "TECHNICAL", "APTITUDE"],
  passingGrade: 65,
};

const mockQuestions: Question[] = [
  { id: "1", category: "AKHLAK", stem: "Apa singkatan dari nilai-nilai AKHLAK yang menjadi budaya perusahaan BUMN?", options: { A: "Amanah, Kompeten, Harmonis, Loyal, Akhir", B: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", C: "Amanah, Kuat, Harmonis, Loyal, Akhlak", D: "Amanah, Kreatif, Harmonis, Loyal, Akhlak" } },
  { id: "2", category: "AKHLAK", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...", options: { A: "Kompeten", B: "Harmonis", C: "Amanah", D: "Loyal" } },
  { id: "3", category: "HOSPITALITY", stem: "Seorang pramugara/pramugari kereta api harus memiliki kemampuan untuk menangani penumpang dengan berbagai tingkah laku. Ini termasuk dalam aspek...", options: { A: "Keterampilan teknis", B: "Manajemen konflik", C: "Keterampilan komunikasi", D: "Kepemimpinan" } },
  { id: "4", category: "HOSPITALITY", stem: "Apa yang dimaksud dengan \"service excellence\" dalam konteks layanan kereta api?", options: { A: "Layanan standar sesuai prosedur", B: "Layanan terbaik yang melebihi ekspektasi pelanggan", C: "Layanan tercepat yang tersedia", D: "Layanan termurah yang bisa diberikan" } },
  { id: "5", category: "TECHNICAL", stem: "Komponen utama yang menghubungkan antar gerbong kereta api disebut...", options: { A: "Trunion", B: "Coupler", C: "Bogie", D: "Buffer" } },
  { id: "6", category: "TECHNICAL", stem: "Sistem rem darurat pada kereta api bekerja berdasarkan prinsip...", options: { A: "Tekanan hidrolik", B: "Tekanan udara comprimida", C: "Pegas mekanik", D: "Elektromagnetik" } },
  { id: "7", category: "APTITUDE", stem: "Jika semua X adalah Y, dan beberapa Y adalah Z, maka...", options: { A: "Semua X adalah Z", B: "Beberapa X adalah Z", C: "Tidak ada X yang adalah Z", D: "Tidak dapat ditentukan" } },
  { id: "8", category: "APTITUDE", stem: "Deret angka: 2, 6, 12, 20, 30, ... Bilangan selanjutnya adalah?", options: { A: "40", B: "42", C: "44", D: "46" } },
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TestInterfacePage() {
  const router = useRouter();
  const [testState, setTestState] = useState<"intro" | "testing" | "submitted">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(mockConfig.durationMinutes * 60);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (testState !== "testing") return;
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [testState]);

  useEffect(() => {
    if (testState !== "testing") return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => c + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [testState]);

  const handleStart = () => setTestState("testing");

  const handleSubmit = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setTestState("submitted");
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return "#ef4444";
    if (timeRemaining <= 300) return "#f59e0b";
    return "#00205B";
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQuestion = mockQuestions[currentIndex];

  // Intro Screen
  if (testState === "intro") {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "560px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(0,32,91,0.3)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Tes Kompetensi Smart</h1>
            <p style={{ fontSize: "16px", color: "#666666" }}>Seleksi Online Berbasis Bidang Pekerjaan</p>
          </div>

          <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Informasi Tes</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div><p style={{ fontSize: "13px", color: "#888888", marginBottom: "4px" }}>Jumlah Soal</p><p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{mockConfig.totalQuestions} soal</p></div>
              <div><p style={{ fontSize: "13px", color: "#888888", marginBottom: "4px" }}>Durasi</p><p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{mockConfig.durationMinutes} menit</p></div>
              <div><p style={{ fontSize: "13px", color: "#888888", marginBottom: "4px" }}>Kategori</p><p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{mockConfig.categories.length} kategori</p></div>
              <div><p style={{ fontSize: "13px", color: "#888888", marginBottom: "4px" }}>Passing Grade</p><p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{mockConfig.passingGrade}%</p></div>
            </div>
          </div>

          <div style={{ background: "#fffbeb", borderRadius: "14px", padding: "20px", marginBottom: "28px", border: "1px solid #fef3c7" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#92400e", marginBottom: "8px" }}>Peringatan Penting</h4>
                <ul style={{ fontSize: "13px", color: "#92400e", paddingLeft: "16px", margin: 0, lineHeight: 1.8 }}>
                  <li>Pastikan koneksi internet stabil</li>
                  <li>Dilarang berganti tab selama tes</li>
                  <li>Jawaban disimpan otomatis</li>
                  <li>Tes otomatis submit saat waktu habis</li>
                </ul>
              </div>
            </div>
          </div>

          <button onClick={handleStart} style={{ width: "100%", height: "56px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", color: "#ffffff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,94,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Mulai Tes Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Submitted Screen
  if (testState === "submitted") {
    return (
      <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "500px", background: "#ffffff", borderRadius: "20px", padding: "48px", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ width: "80px", height: "80px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Tes Kompetensi Selesai!</h1>
          <p style={{ fontSize: "16px", color: "#666666", marginBottom: "32px" }}>Jawaban Anda telah tersimpan dan sedang diproses.</p>

          <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "24px", marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Ringkasan Jawaban</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <div><p style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>{mockConfig.totalQuestions}</p><p style={{ fontSize: "13px", color: "#888888" }}>Total Soal</p></div>
              <div><p style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", marginBottom: "4px" }}>{answeredCount}</p><p style={{ fontSize: "13px", color: "#888888" }}>Terjawab</p></div>
              <div><p style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b", marginBottom: "4px" }}>{mockConfig.totalQuestions - answeredCount}</p><p style={{ fontSize: "13px", color: "#888888" }}>Kosong</p></div>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "#888888", marginBottom: "28px" }}>Hasil tes akan diinformasikan melalui email dan dapat dilihat di dashboard pelamar dalam 1x24 jam.</p>

          <button onClick={() => router.push("/applicant/dashboard")} style={{ width: "100%", height: "56px", background: "#00205B", color: "#ffffff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,32,91,0.3)" }}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Testing Screen
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "16px 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>Tes Kompetensi Smart</p>
              <p style={{ fontSize: "13px", color: "#888888" }}>KAI Services Recruitment</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {tabSwitchCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#f59e0b" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                {tabSwitchCount}x
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "#f8f9fa", borderRadius: "10px", color: getTimerColor(), fontWeight: 700, fontSize: "18px", fontFamily: "monospace" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ maxWidth: "1100px", margin: "16px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#888888", marginBottom: "6px" }}>
            <span>Progress: {currentIndex + 1} dari {mockConfig.totalQuestions}</span>
            <span>{answeredCount} dijawab</span>
          </div>
          <div style={{ height: "6px", background: "#e5e5e5", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((currentIndex + 1) / mockConfig.totalQuestions) * 100}%`, background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", borderRadius: "4px", transition: "width 0.3s" }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "28px" }}>
          {/* Question */}
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ padding: "8px 16px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "14px", fontWeight: 700 }}>{currentQuestion.category}</span>
                <span style={{ fontSize: "14px", color: "#888888" }}>No. {currentIndex + 1}</span>
              </div>
              <button onClick={() => { const s = new Set(flaggedQuestions); s.has(currentQuestion.id) ? s.delete(currentQuestion.id) : s.add(currentQuestion.id); setFlaggedQuestions(s); }}
                style={{ padding: "10px 18px", border: `2px solid ${flaggedQuestions.has(currentQuestion.id) ? "#f59e0b" : "#e5e5e5"}`, background: flaggedQuestions.has(currentQuestion.id) ? "#fffbeb" : "#ffffff", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: flaggedQuestions.has(currentQuestion.id) ? "#d97706" : "#666666", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={flaggedQuestions.has(currentQuestion.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                {flaggedQuestions.has(currentQuestion.id) ? "Diflag" : "Flag"}
              </button>
            </div>

            <p style={{ fontSize: "18px", color: "#111111", lineHeight: 1.7, marginBottom: "32px" }}>{currentQuestion.stem}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button key={opt} onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: opt })}
                  style={{ width: "100%", padding: "18px 20px", borderRadius: "14px", border: `2px solid ${selectedAnswers[currentQuestion.id] === opt ? "#FF5E00" : "#e5e5e5"}`, background: selectedAnswers[currentQuestion.id] === opt ? "#fff7f0" : "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px", textAlign: "left", transition: "all 0.2s" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: selectedAnswers[currentQuestion.id] === opt ? "#FF5E00" : "#f1f5f9", color: selectedAnswers[currentQuestion.id] === opt ? "#ffffff" : "#888888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, flexShrink: 0 }}>{opt}</div>
                  <span style={{ fontSize: "15px", color: selectedAnswers[currentQuestion.id] === opt ? "#111111" : "#555555", lineHeight: 1.5 }}>{currentQuestion.options[opt]}</span>
                  {selectedAnswers[currentQuestion.id] === opt && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5E00" strokeWidth="2.5" style={{ marginLeft: "auto", flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #eeeeee" }}>
              <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
                style={{ padding: "14px 28px", border: "2px solid #e5e5e5", background: "#ffffff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, color: currentIndex === 0 ? "#cccccc" : "#111111", cursor: currentIndex === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                Sebelumnya
              </button>
              {currentIndex < mockConfig.totalQuestions - 1 ? (
                <button onClick={() => setCurrentIndex(currentIndex + 1)}
                  style={{ padding: "14px 28px", background: "#FF5E00", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>
                  Selanjutnya
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ) : (
                <button onClick={() => setShowSubmitModal(true)}
                  style={{ padding: "14px 28px", background: "#16a34a", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(22,163,74,0.3)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Submit Tes
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", position: "sticky", top: "120px", alignSelf: "start" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Navigasi Soal</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "20px" }}>
              {mockQuestions.map((q, i) => (
                <button key={q.id} onClick={() => setCurrentIndex(i)}
                  style={{ width: "44px", height: "44px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s",
                    background: currentIndex === i ? "#00205B" : selectedAnswers[q.id] ? "#dcfce7" : flaggedQuestions.has(q.id) ? "#fffbeb" : "#f1f5f9",
                    color: currentIndex === i ? "#ffffff" : selectedAnswers[q.id] ? "#16a34a" : flaggedQuestions.has(q.id) ? "#d97706" : "#888888" }}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div style={{ fontSize: "12px", color: "#888888", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", background: "#00205B", borderRadius: "4px" }}></div>Sekarang</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", background: "#dcfce7", borderRadius: "4px" }}></div>Terjawab</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", background: "#fffbeb", borderRadius: "4px" }}></div>Diflag</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", background: "#f1f5f9", borderRadius: "4px" }}></div>Belum dijawab</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "32px", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>Konfirmasi Submit</h2>
            <p style={{ fontSize: "15px", color: "#666666", marginBottom: "24px" }}>Apakah Anda yakin ingin menyelesaikan tes?</p>

            <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                <div><p style={{ fontSize: "13px", color: "#888888" }}>Total Soal</p><p style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>{mockConfig.totalQuestions}</p></div>
                <div><p style={{ fontSize: "13px", color: "#888888" }}>Terjawab</p><p style={{ fontSize: "18px", fontWeight: 700, color: "#16a34a" }}>{answeredCount}</p></div>
                <div><p style={{ fontSize: "13px", color: "#888888" }}>Sisa Waktu</p><p style={{ fontSize: "18px", fontWeight: 700, color: getTimerColor() }}>{formatTime(timeRemaining)}</p></div>
                <div><p style={{ fontSize: "13px", color: "#888888" }}>Kosong</p><p style={{ fontSize: "18px", fontWeight: 700, color: "#f59e0b" }}>{mockConfig.totalQuestions - answeredCount}</p></div>
              </div>
              {mockConfig.totalQuestions - answeredCount > 0 && (
                <p style={{ fontSize: "13px", color: "#d97706", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e5e5" }}>⚠️ Masih ada {mockConfig.totalQuestions - answeredCount} soal yang belum dijawab!</p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowSubmitModal(false)} style={{ flex: 1, padding: "14px", border: "2px solid #e5e5e5", background: "#ffffff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, color: "#111111", cursor: "pointer" }}>Lanjutkan Tes</button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: "14px", background: "#16a34a", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, color: "#ffffff", cursor: "pointer", boxShadow: "0 4px 16px rgba(22,163,74,0.3)" }}>Submit Sekarang</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .test-grid { grid-template-columns: 1fr !important; }
          .navigator { display: none; }
        }
      `}</style>
    </div>
  );
}
