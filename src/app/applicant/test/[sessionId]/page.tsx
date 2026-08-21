"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface OptionItem {
  key: string;
  text: string;
}

interface Question {
  id: string;
  category: string;
  stem: string;
  options: OptionItem[]; // New shuffled format
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  _correctKey?: string; // For debugging only, remove in production
}

interface TestData {
  id: string;
  jobTitle: string;
  questions: Question[];
  durationMinutes: number;
  categories: string[];
  config?: {
    questionsPerCategory?: number;
    passingGrade?: number;
    totalDurationMinutes?: number;
  };
}

interface SessionData {
  id: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  submittedAt?: string;
  endTime?: string;
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

  const [testState, setTestState] = useState<"intro" | "testing" | "submitted" | "loading">("loading");
  const [testData, setTestData] = useState<TestData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canStart, setCanStart] = useState(false);
  const [countdownToStart, setCountdownToStart] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isTestExpired, setIsTestExpired] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
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

      console.log("API Response:", result);
      console.log("isCompleted:", result.isCompleted);
      console.log("session status:", result.session?.status);

      if (result.success) {
        // Check if test is completed
        if (result.isCompleted) {
          console.log("Setting isTestCompleted = true");
          setIsTestCompleted(true);
          setCanStart(false);
          setCompletedMessage(result.completedMessage || "Tes sudah selesai");
        }
        // Check if test is expired
        else if (result.isExpired) {
          setIsTestExpired(true);
          setCanStart(false);
          setCompletedMessage(result.expiredMessage || "Waktu tes sudah berakhir");
          if (result.session) {
            setSessionData(result.session);
          }
        }
        // Check if test can be started
        else if (result.canStart !== undefined) {
          setCanStart(result.canStart);
          setScheduledTime(result.scheduledAt || null);

          if (!result.canStart && result.minutesUntilStart !== undefined && result.minutesUntilStart > 0) {
            // Time hasn't arrived yet - set countdown
            setCountdownToStart(result.minutesUntilStart * 60);
            startCountdownToStart(result.minutesUntilStart * 60);
          }
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
            config: {
              questionsPerCategory: result.config?.questionsPerCategory,
              passingGrade: result.config?.passingGrade,
              totalDurationMinutes: result.config?.totalDurationMinutes,
            },
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
            config: {
              questionsPerCategory: result.config?.questionsPerCategory,
              passingGrade: result.config?.passingGrade,
              totalDurationMinutes: result.config?.totalDurationMinutes,
            },
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
          // Time's up - refresh to check if can start now
          setCanStart(true);
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
    // Prevent starting if test is completed or expired
    if (isTestCompleted || isTestExpired) {
      return;
    }

    // If no session exists yet, create one first
    if (!testData?.questions.length) {
      try {
        const response = await fetch(`/api/test/${sessionId}`, {
          method: "POST",
        });
        const result = await response.json();

        if (result.success) {
          // Fetch again to get questions - MUST wait for this
          await fetchTestSession();

          // Check if questions are now loaded
          if (!testData?.questions.length) {
            setError("Gagal memuat soal. Silakan coba lagi.");
            return;
          }
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

    // Use testData.id if available, otherwise use sessionId from URL
    const currentSessionId = testData?.id || sessionId;
    console.log("Using sessionId:", currentSessionId);

    console.log("Submitting to:", `/api/test/${currentSessionId}/submit`);
    console.log("Answers:", selectedAnswers);

    try {
      // Submit with answers directly (for auto-grade)
      const response = await fetch(`/api/test/${currentSessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const result = await response.json();
      console.log("Submit result:", result);

      if (result.success) {
        // Mark test as completed after successful submit
        setIsTestCompleted(true);
        setCanStart(false);
        setCompletedMessage("Tes sudah dikerjakan");

        if (result.passed) {
          alert(`Selamat! ${result.message}`);
        } else {
          alert(result.message || "Tes telah selesai.");
        }
      } else {
        console.error("Submit failed:", result.error);
        // Revert state if submit failed
        setTestState("testing");
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
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
                    {/* Show total from config if available, otherwise show actual loaded questions */}
                    {testData?.config?.questionsPerCategory && testData?.categories?.length
                      ? `${testData.config.questionsPerCategory * testData.categories.length} Soal`
                      : `${testData?.questions?.length || 0} Soal`
                    }
                  </p>
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

          {/* Countdown Timer - shown when time hasn't arrived */}
          {!canStart && countdownToStart !== null && countdownToStart > 0 && !isTestCompleted && !isTestExpired && (
            <div style={{ background: "#fffbeb", borderRadius: "14px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#92400e", margin: 0 }}>
                  Tes akan dimulai pada:
                </p>
              </div>
              {scheduledTime && (
                <>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>
                    {formatDateTime(scheduledTime)} - {formatTimeOnly(scheduledTime)} WIB
                  </p>
                </>
              )}
              <div style={{ background: "#fef3c7", borderRadius: "10px", padding: "16px", marginTop: "16px" }}>
                <p style={{ fontSize: "12px", color: "#92400e", marginBottom: "8px" }}>Waktu tersisa:</p>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#d97706", fontFamily: "monospace", margin: 0 }}>
                  {formatTime(countdownToStart)}
                </p>
              </div>
            </div>
          )}

          {/* Completed/Expired Message */}
          {(isTestCompleted || isTestExpired) && (
            <div style={{
              background: isTestCompleted ? "#dcfce7" : "#fee2e2",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "24px",
              textAlign: "center",
              border: `2px solid ${isTestCompleted ? "#22c55e" : "#dc2626"}`
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: isTestCompleted ? "#22c55e" : "#dc2626",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                {isTestCompleted ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: 700,
                color: isTestCompleted ? "#16a34a" : "#dc2626",
                marginBottom: "8px"
              }}>
                {isTestCompleted ? "Tes Sudah Dikerjakan" : "Waktu Tes Berakhir"}
              </h3>
              <p style={{
                fontSize: "14px",
                color: isTestCompleted ? "#166534" : "#991b1b",
                margin: 0
              }}>
                {completedMessage || "Anda tidak dapat mengakses tes ini lagi."}
              </p>
              {sessionData?.totalScore !== undefined && (
                <div style={{ marginTop: "16px", padding: "12px", background: "#fff", borderRadius: "10px" }}>
                  <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>Skor Anda:</p>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#111", margin: 0 }}>
                    {sessionData.totalScore}%
                  </p>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: sessionData.passed ? "#16a34a" : "#dc2626",
                    margin: "4px 0 0 0"
                  }}>
                    {sessionData.passed ? "LULUS ✓" : "TIDAK LULUS"}
                  </p>
                </div>
              )}
              <button
                onClick={() => router.push("/applicant/schedule")}
                style={{
                  width: "100%",
                  height: "48px",
                  background: "#00205B",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "16px",
                }}
              >
                Kembali ke Jadwal Seleksi
              </button>
            </div>
          )}

          <div style={{ background: "#fef3c7", borderRadius: "12px", padding: "16px", marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", color: "#92400e", margin: 0, display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Pastikan koneksi internet stabil. Switch tab atau minimize jendela akan tercatat.</span>
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart || isTestCompleted || isTestExpired}
            style={{
              width: "100%",
              height: "56px",
              background: (canStart && !isTestCompleted && !isTestExpired) ? "linear-gradient(135deg, #FF5E00, #ff7a2f)" : "#9ca3af",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: (canStart && !isTestCompleted && !isTestExpired) ? "pointer" : "not-allowed",
              opacity: 0.7,
            }}
          >
            {(isTestCompleted || isTestExpired) ? "Tes Tidak Tersedia" : canStart ? "Mulai Tes" : "Menunggu Waktu Tes..."}
          </button>

          {!canStart && !isTestCompleted && !isTestExpired && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "#888", marginTop: "12px" }}>
              Tombol akan aktif otomatis saat waktu tes tiba
            </p>
          )}
        </div>
      </div>
    );
  }

  // Submitted Screen
  if (testState === "submitted") {
    const score = sessionData?.totalScore;
    const passed = sessionData?.passed;

    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fa 0%, #e8f4f8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {/* Confetti effect */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes progress-fill {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
        `}</style>

        <div style={{ width: "100%", maxWidth: "480px", background: "#ffffff", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 20px 60px rgba(0,32,91,0.15)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Background decoration */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "linear-gradient(135deg, #FF5E0015, #FF5E0008)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", background: "linear-gradient(135deg, #00205B10, #00205B05)", borderRadius: "50%" }} />

          {/* Success Icon with animation */}
          <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 32px" }}>
            {/* Outer ring */}
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              animation: "pulse 2s ease-in-out infinite"
            }} />
            {/* Progress circle background */}
            <svg style={{ position: "absolute", inset: "6px", transform: "rotate(-90deg)" }} viewBox="0 0 108 108">
              <circle cx="48" cy="48" r="48" fill="none" stroke="#e8f5e9" strokeWidth="6" />
              <circle
                cx="48" cy="48" r="48"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="302"
                strokeDashoffset="0"
                style={{ animation: "progress-fill 1.5s ease-out forwards" }}
              />
            </svg>
            {/* Checkmark */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path
                  d="M20 6L9 17l-5-5"
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: 0,
                    animation: "checkmark 0.8s ease-out 0.5s forwards"
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Progress indicator */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "4px 12px", borderRadius: "20px" }}>100% Complete</span>
            </div>
            <div style={{ height: "8px", background: "#e8f5e9", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: "4px", animation: "progress-fill 2s ease-out forwards" }} />
            </div>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "12px" }}>Test Completed!</h1>
          <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "8px", lineHeight: 1.6 }}>
            Great job! You have successfully completed the test.
          </p>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "32px" }}>
            Your answers have been recorded and will be reviewed by our team.
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>{answeredCount}</p>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Answered</p>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "24px", fontWeight: 800, color: "#FF5E00", marginBottom: "4px" }}>{testData?.questions.length || 0}</p>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Total Questions</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => router.push("/applicant/dashboard")}
              style={{
                width: "100%",
                height: "56px",
                background: "linear-gradient(135deg, #FF5E00, #ff7a2f)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255,94,0,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,94,0,0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,94,0,0.3)"; }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push("/applicant/applications")}
              style={{
                width: "100%",
                height: "48px",
                background: "transparent",
                color: "#00205B",
                border: "2px solid #00205B",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#00205B"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#00205B"; }}
            >
              View My Score
            </button>
          </div>
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
              {(currentQuestion.options || ["A", "B", "C", "D"].map(opt => ({ key: opt, text: currentQuestion[`option${opt}` as keyof Question] as string || "" }))).map((option: any) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
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
                      {option.key}
                    </span>
                    <span style={{
                      fontSize: "15px",
                      color: isSelected ? "#fff" : "#374151",
                      lineHeight: 1.5,
                    }}>
                      {option.text}
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
