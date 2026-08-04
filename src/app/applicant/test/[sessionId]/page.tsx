"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface Question {
  id: string;
  category: string;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface TestData {
  id: string;
  jobTitle: string;
  questions: Question[];
  durationMinutes: number;
  categories: string[];
}

interface SessionData {
  id: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  submittedAt?: string;
  totalScore?: number;
  passed?: boolean;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeOnly(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const categoryLabels: Record<string, string> = {
  AKHLAK: "Nilai AKHLAK",
  HOSPITALITY: "Hospitality",
  TECHNICAL: "Pengetahuan Teknis",
  FACILITY: "Pengetahuan Fasilitas",
  APTITUDE: "Tes Bakat Skolastik",
};

const categoryColors: Record<string, string> = {
  AKHLAK: "#8B5CF6",
  HOSPITALITY: "#06B6D4",
  TECHNICAL: "#F59E0B",
  FACILITY: "#10B981",
  APTITUDE: "#EF4444",
};

export default function TestInterfacePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const router = useRouter();
  const { user } = useAuthStore();

  const [testState, setTestState] = useState<"intro" | "testing" | "submitted" | "loading" | "blocked">("loading");
  const [testData, setTestData] = useState<TestData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [countdownToStart, setCountdownToStart] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const countdownToStartRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test session data
  useEffect(() => {
    fetchTestSession();
  }, [sessionId]);

  const fetchTestSession = async () => {
    try {
      const response = await fetch(`/api/test/${sessionId}`);
      const result = await response.json();

      if (result.success) {
        // Check if blocked
        if (result.blocked) {
          setBlockedReason(result.blockedReason);
          setScheduledTime(result.timeUntilStart || null);

          if (result.blockedReason === "WAKTU_BELUM_TIBA") {
            setCountdownToStart(result.minutesUntilStart * 60); // Convert to seconds
            setTestState("blocked");
            startCountdownToStart(result.minutesUntilStart * 60);
          } else if (result.blockedReason === "SUDAH_SELESAI") {
            setSessionData({
              id: result.session.id,
              status: result.session.status,
              scheduledAt: result.session.scheduledAt,
              submittedAt: result.session.submittedAt,
              totalScore: result.session.totalScore,
              passed: result.session.passed,
              startedAt: result.session.startedAt,
            });
            setTestData({
              id: result.session.id,
              jobTitle: result.jobTitle || "Tes Kompetensi",
              questions: result.questions || [],
              durationMinutes: result.config?.totalDurationMinutes || 90,
              categories: result.config?.categories || [],
            });
            setTestState("submitted");
          }
          return;
        }

        if (result.session) {
          // Has existing session - load questions
          setSessionData(result.session);
          setTestData({
            id: result.session.id,
            jobTitle: result.jobTitle || "Tes Kompetensi",
            questions: result.questions || [],
            durationMinutes: result.config?.totalDurationMinutes || 90,
            categories: result.config?.categories || [],
          });
          setTimeRemaining((result.config?.totalDurationMinutes || 90) * 60);
        } else {
          // No session yet - just config info
          setTestData({
            id: sessionId,
            jobTitle: result.jobTitle || "Tes Kompetensi",
            questions: [],
            durationMinutes: result.config?.totalDurationMinutes || 90,
            categories: result.config?.categories || [],
          });
          setTimeRemaining((result.config?.totalDurationMinutes || 90) * 60);
        }
        setTestState("intro");
      } else {
        setError(result.error || "Gagal memuat tes");
        setTestState("intro");
      }
    } catch (err) {
      console.error("Error fetching test:", err);
      setError("Terjadi kesalahan saat memuat tes");
      setTestState("intro");
    }
  };

  // Countdown to test start time
  const startCountdownToStart = (seconds: number) => {
    if (countdownToStartRef.current) {
      clearInterval(countdownToStartRef.current);
    }

    countdownToStartRef.current = setInterval(() => {
      setCountdownToStart((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownToStartRef.current) {
            clearInterval(countdownToStartRef.current);
          }
          // Refresh to check if can start now
          fetchTestSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownToStartRef.current) {
        clearInterval(countdownToStartRef.current);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (testState !== "testing") return;

    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [testState]);

  // Tab switch detection
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

  const handleStart = async () => {
    // If no session exists yet, create one first
    if (!testData?.questions.length) {
      try {
        const response = await fetch(`/api/test/${sessionId}`, {
          method: "POST",
        });
        const result = await response.json();

        if (result.success) {
          // Fetch again to get questions
          await fetchTestSession();
        } else {
          setError(result.error || "Gagal memulai tes");
          return;
        }
      } catch (err) {
        console.error("Error starting test:", err);
        setError("Terjadi kesalahan saat memulai tes");
        return;
      }
    }
    setTestState("testing");
  };

  const handleSubmit = async () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setTestState("submitted");

    const currentSessionId = testData?.id || sessionId;
    try {
      // Submit with answers directly (for auto-grade)
      const response = await fetch(`/api/test/${currentSessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.passed) {
          alert(`Selamat! ${result.message}`);
        } else {
          alert(result.message || "Tes telah selesai.");
        }
      }
    } catch (err) {
      console.error("Error submitting test:", err);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return "#ef4444";
    if (timeRemaining <= 300) return "#f59e0b";
    return "#00205B";
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const questions = testData?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Loading State
  if (testState === "loading") {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat tes...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Blocked State - Waiting for scheduled time
  if (testState === "blocked") {
    const countdownMins = countdownToStart !== null ? Math.floor(countdownToStart / 60) : 0;
    const countdownSecs = countdownToStart !== null ? countdownToStart % 60 : 0;

    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "560px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "100px", height: "100px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(251, 191, 36, 0.3)" }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Menunggu Jadwal Tes</h1>
            <p style={{ fontSize: "16px", color: "#666666" }}>{testData?.jobTitle || "Tes Kompetensi"}</p>
          </div>

          <div style={{ background: "#fffbeb", borderRadius: "16px", padding: "32px", marginBottom: "28px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#92400e", marginBottom: "16px" }}>Tes akan dimulai pada:</p>
            {scheduledTime && (
              <>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>
                  {formatDateTime(scheduledTime)}
                </p>
                <p style={{ fontSize: "20px", fontWeight: 600, color: "#d97706", marginBottom: "24px" }}>
                  Pukul {formatTimeOnly(scheduledTime)} WIB
                </p>
              </>
            )}
            <div style={{ background: "#fef3c7", borderRadius: "12px", padding: "20px", marginTop: "16px" }}>
              <p style={{ fontSize: "13px", color: "#92400e", marginBottom: "8px" }}>Waktu tersisa sebelum tes dimulai:</p>
              <p style={{ fontSize: "48px", fontWeight: 800, color: "#d97706", fontFamily: "monospace" }}>
                {formatTime(countdownToStart || 0)}
              </p>
            </div>
          </div>

          <div style={{ background: "#eff6ff", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
            <p style={{ fontSize: "14px", color: "#1e40af", margin: 0, display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>
                <strong>Persiapkan diri Anda!</strong><br/>
                Pastikan koneksi internet stabil. Tes akan dimulai secara otomatis ketika waktu telah tiba. Jangan tutup halaman ini.
              </span>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#888", fontSize: "14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 019.95 9" strokeLinecap="round"/>
            </svg>
            Halaman akan refresh otomatis...
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Intro Screen
  if (testState === "intro") {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "560px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(0,32,91,0.3)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Tes Kompetensi Smart</h1>
            <p style={{ fontSize: "16px", color: "#666666" }}>{testData?.jobTitle || "Seleksi Online Berbasis Bidang Pekerjaan"}</p>
          </div>

          {error && (
            <div style={{ padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", fontSize: "14px", marginBottom: "24px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "24px", marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Informasi Tes:</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", background: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/><rect x="3" y="4" width="18" height="18" rx="2"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888" }}>Jumlah Soal</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>{testData?.questions.length || 0} Soal</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", background: "#fef3c7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888" }}>Durasi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>{testData?.durationMinutes || 90} Menit</p>
                </div>
              </div>
            </div>

            {testData?.categories && testData.categories.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Kategori:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {testData.categories.map((cat) => (
                    <span key={cat} style={{ padding: "4px 12px", background: `${categoryColors[cat] || "#666"}20`, color: categoryColors[cat] || "#666", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {categoryLabels[cat] || cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "#fef3c7", borderRadius: "12px", padding: "16px", marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", color: "#92400e", margin: 0, display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Pastikan koneksi internet stabil.切换 tab atau minimize jendela akan tercatat.</span>
            </p>
          </div>

          <button
            onClick={handleStart}
            style={{ width: "100%", height: "56px", background: "linear-gradient(135deg, #FF5E00, #ff7a2f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
          >
            Mulai Tes
          </button>
        </div>
      </div>
    );
  }

  // Submitted Screen
  if (testState === "submitted") {
    const score = sessionData?.totalScore;
    const passed = sessionData?.passed;

    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "560px", background: "#ffffff", borderRadius: "20px", padding: "48px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: passed ? "#dcfce7" : "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            {passed ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111", marginBottom: "12px" }}>
            {passed ? "Selamat! Anda Lulus Tes" : "Tes Selesai"}
          </h1>

          {score !== undefined && score !== null && (
            <div style={{ background: passed ? "#f0fdf4" : "#fef2f2", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
              <p style={{ fontSize: "14px", color: passed ? "#166534" : "#991b1b", marginBottom: "8px" }}>Nilai Akhir</p>
              <p style={{ fontSize: "48px", fontWeight: 800, color: passed ? "#16a34a" : "#dc2626" }}>{score}</p>
              <p style={{ fontSize: "14px", color: passed ? "#166534" : "#991b1b" }}>
                {passed ? "Melampaui batas kelulusan" : "Di bawah batas kelulusan"}
              </p>
            </div>
          )}

          <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px", lineHeight: 1.6 }}>
            {passed
              ? "Selamat! Anda telah melewati tahap tes kompetensi. Tim HR akan menghubungi Anda untuk tahap selanjutnya."
              : "Jawaban Anda telah tersimpan. Tim HR akan meninjau hasil tes Anda."}
          </p>
          <button
            onClick={() => router.push("/applicant/dashboard")}
            style={{ width: "100%", height: "56px", background: "#00205B", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Testing Screen
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#00205B" }}>Tes Kompetensi</h1>
            <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#2563eb", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
              {answeredCount}/{questions.length} dijawab
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Timer */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: `${getTimerColor()}15`, borderRadius: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={getTimerColor()} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span style={{ fontSize: "18px", fontWeight: 700, color: getTimerColor(), fontFamily: "monospace" }}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Tab Switch Warning */}
            {tabSwitchCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontSize: "13px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {tabSwitchCount}x
              </div>
            )}

            <button
              onClick={() => setShowSubmitModal(true)}
              style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Kirim Jawaban
            </button>
          </div>
        </div>
      </header>

      {/* Question Navigation */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: i === currentIndex
                    ? "#00205B"
                    : selectedAnswers[q.id]
                      ? flaggedQuestions.has(q.id)
                        ? "#fef3c7"
                        : "#16a34a"
                      : flaggedQuestions.has(q.id)
                        ? "#fef3c7"
                        : "#f1f5f9",
                  color: i === currentIndex
                    ? "#fff"
                    : selectedAnswers[q.id]
                      ? "#fff"
                      : flaggedQuestions.has(q.id)
                        ? "#d97706"
                        : "#64748b",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "800px", margin: "32px auto", padding: "0 24px" }}>
        {currentQuestion && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {/* Question Number & Category */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ padding: "6px 14px", background: `${categoryColors[currentQuestion.category] || "#666"}20`, color: categoryColors[currentQuestion.category] || "#666", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                {categoryLabels[currentQuestion.category] || currentQuestion.category}
              </span>
              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                style={{
                  padding: "8px 14px",
                  background: flaggedQuestions.has(currentQuestion.id) ? "#fef3c7" : "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: flaggedQuestions.has(currentQuestion.id) ? "#d97706" : "#64748b",
                  cursor: "pointer",
                }}
              >
                {flaggedQuestions.has(currentQuestion.id) ? "🚩 Ditandai" : "🚩 Tandai"}
              </button>
            </div>

            {/* Question Stem */}
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111", lineHeight: 1.7, marginBottom: "28px" }}>
              {currentIndex + 1}. {currentQuestion.stem}
            </h2>

            {/* Answer Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["A", "B", "C", "D"].map((option) => {
                const optionKey = `option${option}` as keyof Question;
                const optionText = currentQuestion[optionKey];
                const isSelected = selectedAnswers[currentQuestion.id] === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      background: isSelected ? "#00205B" : "#f8f9fa",
                      border: `2px solid ${isSelected ? "#00205B" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: isSelected ? "#fff" : "#e2e8f0",
                      color: isSelected ? "#00205B" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {option}
                    </span>
                    <span style={{
                      fontSize: "15px",
                      color: isSelected ? "#fff" : "#374151",
                      lineHeight: 1.5,
                    }}>
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{
              padding: "12px 24px",
              background: currentIndex === 0 ? "#f1f5f9" : "#fff",
              color: currentIndex === 0 ? "#94a3b8" : "#374151",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Sebelumnya
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            style={{
              padding: "12px 24px",
              background: currentIndex === questions.length - 1 ? "#f1f5f9" : "#00205B",
              color: currentIndex === questions.length - 1 ? "#94a3b8" : "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: currentIndex === questions.length - 1 ? "not-allowed" : "pointer",
            }}
          >
            Selanjutnya →
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
        }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "400px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Kirim Jawaban?</h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: 1.6 }}>
              Anda telah menjawab <strong>{answeredCount}</strong> dari <strong>{questions.length}</strong> soal.
              {answeredCount < questions.length && " Masih ada soal yang belum dijawab."}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ flex: 1, padding: "12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Lanjut Mengerjakan
              </button>
              <button
                onClick={handleSubmit}
                style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
