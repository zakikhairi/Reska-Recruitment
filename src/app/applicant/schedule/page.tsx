"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Play,
  Video,
  Building,
  ChevronRight,
  Bell,
  Award,
  XCircle,
  HeartPulse,
  Briefcase,
  CheckCircle2,
  Send,
} from "lucide-react";

interface ScheduleItem {
  applicationId: string;
  position: string;
  division: string;
  status: string;
  test?: {
    scheduledAt?: string;
    endTime?: string | null;
    location?: string;
    status?: string;
    sessionId?: string;
    message?: string | null;
    submittedAt?: string | null;
    totalScore?: number | null;
    passed?: boolean | null;
  };
  interview?: {
    scheduledAt: string;
    endTime?: string | null;
    location?: string;
    interviewer: string;
    type: string;
    zoomLink?: string | null;
    score?: number | null;
    result?: string | null;
    notes?: string | null;
  };
  mcu?: {
    scheduledAt: string;
    location: string;
    result?: string | null;
    notes?: string | null;
  };
  offering?: {
    id: string;
    salary: number;
    salaryPeriod: string;
    startDate: string;
    employmentType: string;
    contractDuration?: number | null;
    contractEndDate?: string | null;
    probationMonths?: number | null;
    workLocation?: string | null;
    positionTitle?: string | null;
    benefits?: string | null;
    notes?: string | null;
    status: string;
    createdAt: string;
  };
}


export default function SchedulePage() {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedules
  useEffect(() => {
    fetchSchedules();
    const refreshInterval = setInterval(fetchSchedules, 30000);
    return () => clearInterval(refreshInterval);
  }, [user]);

  const fetchSchedules = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/applicant/schedule?userId=${user.id}`);
      const result = await response.json();
      if (result.success) {
        setSchedules(result.schedules);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTestPassed = (schedule: ScheduleItem): boolean => {
    // Cek apakah tes sudah dinilai dan lulus
    if (schedule.test?.status === "SCORED" && schedule.status === "INTERVIEW") {
      return true;
    }
    return false;
  };

  const isTestFailed = (schedule: ScheduleItem): boolean => {
    // Cek apakah tes sudah dinilai tapi tidak lulus
    if (schedule.test?.status === "SCORED" && schedule.status === "REJECTED") {
      return true;
    }
    // Cek apakah waktu habis dan belum dikerjakan
    if (schedule.test?.status === "NOT_STARTED" && isTestExpired(schedule)) {
      return true;
    }
    return false;
  };

  const canStartTest = useCallback((schedule: ScheduleItem) => {
    const scheduledAt = schedule.test?.scheduledAt;
    if (!scheduledAt) return true;
    return currentTime >= new Date(scheduledAt);
  }, [currentTime]);

  const isTestExpired = useCallback((schedule: ScheduleItem) => {
    const endTime = schedule.test?.endTime;
    if (!endTime) return false;
    return currentTime > new Date(endTime);
  }, [currentTime]);

  const isTestCompleted = useCallback((schedule: ScheduleItem) => {
    // Cek jika tes sudah dikerjakan (status SCORED)
    if (schedule.test?.status === "SCORED") return true;
    return false;
  }, []);

  const getTestStatusLabel = useCallback((schedule: ScheduleItem) => {
    if (isTestCompleted(schedule)) {
      return isTestPassed(schedule) ? "Lulus" : "Ditolak";
    }
    if (isTestExpired(schedule)) return "Waktu Habis";
    if (canStartTest(schedule)) return "Siap";
    return "Menunggu";
  }, [canStartTest, isTestExpired, isTestCompleted]);

  const getTimeRemainingSeconds = (scheduledAt?: string): number | null => {
    if (!scheduledAt) return null;
    const diff = new Date(scheduledAt).getTime() - currentTime.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  };

  // Helper: cek apakah tanggal/waktu sudah lewat
  const isDatePassed = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    return currentTime.getTime() > targetDate.getTime();
  };

  // Filter schedules - tampilkan yang masih aktif di "Mendatang"
  const upcomingSchedules = schedules.filter((s) => {
    // Jika ada interview dan belum lewat, tampilkan
    if (s.interview?.scheduledAt) {
      if (!isDatePassed(s.interview.scheduledAt)) {
        return true;
      }
    }

    // Jika ada tes
    if (s.test) {
      // Tes yang belum dikerjakan dan belum expired, tampilkan
      if (!isTestCompleted(s) && !isTestExpired(s)) {
        return true;
      }
      // Tes yang sudah selesai dan LULUS, tetap tampilkan di mendatang
      if (isTestPassed(s)) {
        return true;
      }
    }

    return false;
  });

  // Filter untuk riwayat
  const pastSchedules = schedules.filter((s) => {
    // Interview yang sudah lewat
    if (s.interview?.scheduledAt && isDatePassed(s.interview.scheduledAt)) {
      return true;
    }

    // Tes yang gagal (ditolak atau waktu habis)
    if (isTestFailed(s)) {
      return true;
    }

    return false;
  });

  const displayedSchedules = activeTab === "upcoming" ? upcomingSchedules : pastSchedules;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #00205B 0%, #003080 100%)",
        padding: "32px",
        color: "#fff"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar className="w-8 h-8" />
            Jadwal Seleksi Saya
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>
            Pantau jadwal tes dan interview Anda
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
        {/* Tab Filter */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          background: "#fff",
          padding: "6px",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <button
            onClick={() => setActiveTab("upcoming")}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: activeTab === "upcoming" ? "#00205B" : "transparent",
              color: activeTab === "upcoming" ? "#fff" : "#6b7280",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Clock className="w-5 h-5" />
            Mendatang ({upcomingSchedules.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: activeTab === "past" ? "#6b7280" : "transparent",
              color: activeTab === "past" ? "#fff" : "#6b7280",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <CheckCircle className="w-5 h-5" />
            Riwayat ({pastSchedules.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#00205B",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{ color: "#6b7280" }}>Memuat jadwal...</p>
          </div>
        ) : displayedSchedules.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "60px 40px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "#f0f9ff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <Calendar className="w-10 h-10" style={{ color: "#00205B" }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", margin: "0 0 8px 0" }}>
              {activeTab === "upcoming" ? "Belum Ada Jadwal" : "Tidak Ada Riwayat"}
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
              {activeTab === "upcoming"
                ? "Jadwal tes dan interview akan muncul setelah ditentukan oleh tim HR."
                : "Riwayat seleksi akan muncul di sini setelah Anda menyelesaikan proses."}
            </p>
            {activeTab === "upcoming" && (
              <Link href="/applicant/jobs">
                <button style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #00205B, #003080)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                  Lihat Lowongan
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {displayedSchedules.map((schedule) => {
              const isExpired = isTestExpired(schedule);
              const isCompleted = isTestCompleted(schedule);
              const isPassed = isTestPassed(schedule);
              const isFailed = isTestFailed(schedule);
              const canStart = canStartTest(schedule);
              const timeRemaining = getTimeRemainingSeconds(schedule.test?.scheduledAt);
              const hasTest = !!schedule.test;
              const hasInterview = !!schedule.interview;
              const hasMcu = !!schedule.mcu;
              const hasOffering = !!schedule.offering;
              const statusLabel = getTestStatusLabel(schedule);

              return (
                <div key={schedule.applicationId} style={{
                  background: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  border: isPassed ? "2px solid #22c55e" : isFailed ? "2px solid #dc2626" : "none",
                }}>
                  {/* Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #00205B 0%, #003080 100%)",
                    padding: "20px 24px",
                    color: "#fff",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
                          {schedule.position}
                        </h3>
                        <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
                          {schedule.division.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span style={{
                        padding: "6px 14px",
                        background: hasOffering ? "rgba(245,158,11,0.25)" : hasMcu ? "rgba(2,132,199,0.25)" : hasInterview ? "rgba(190,24,93,0.2)" : isPassed ? "rgba(34,197,94,0.2)" : isFailed ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.2)",
                        color: hasOffering ? "#fef3c7" : hasMcu ? "#bae6fd" : hasInterview ? "#fce7f3" : isPassed ? "#dcfce7" : isFailed ? "#fee2e2" : "#fff",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}>
                        {hasOffering ? "Offering Letter" : hasMcu ? "MCU Balai Yasa" : hasInterview ? "Interview" : statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "20px" }}>
                    {/* Test Card */}
                    {hasTest && (
                      <div style={{
                        background: "#eff6ff",
                        borderRadius: "16px",
                        padding: "20px",
                        marginBottom: hasInterview ? "16px" : 0,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            background: "#2563eb",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <FileText className="w-6 h-6" style={{ color: "#fff" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 2px 0" }}>
                              Tes Kompetensi
                            </h4>
                            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                              {schedule.test?.scheduledAt ? formatDate(schedule.test.scheduledAt) : "Belum dijadwalkan"}
                            </p>
                          </div>
                          {/* Status Badge */}
                          {isPassed ? (
                            <span style={{
                              padding: "6px 12px",
                              background: "#22c55e",
                              color: "#fff",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              <CheckCircle className="w-3 h-3" /> Lulus
                            </span>
                          ) : isFailed ? (
                            <span style={{
                              padding: "6px 12px",
                              background: "#dc2626",
                              color: "#fff",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              <XCircle className="w-3 h-3" /> Ditolak
                            </span>
                          ) : isExpired ? (
                            <span style={{
                              padding: "6px 12px",
                              background: "#dc2626",
                              color: "#fff",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              <XCircle className="w-3 h-3" /> Waktu Habis
                            </span>
                          ) : canStart ? (
                            <span style={{
                              padding: "6px 12px",
                              background: "#22c55e",
                              color: "#fff",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}>
                              Siap
                            </span>
                          ) : (
                            <span style={{
                              padding: "6px 12px",
                              background: "#fbbf24",
                              color: "#fff",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}>
                              {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "Menunggu"}
                            </span>
                          )}
                        </div>

                        {/* Time & Location */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <Clock className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {schedule.test?.scheduledAt ? formatTime(schedule.test.scheduledAt) : "-"} WIB
                            </span>
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <MapPin className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {schedule.test?.location || "Online"}
                            </span>
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        {!canStart && !isExpired && timeRemaining !== null && timeRemaining > 0 && (
                          <div style={{
                            padding: "16px",
                            background: "#fffbeb",
                            borderRadius: "12px",
                            marginBottom: "16px",
                            border: "2px solid #fbbf24",
                            textAlign: "center",
                          }}>
                            <p style={{ fontSize: "11px", color: "#92400e", margin: "0 0 8px 0", fontWeight: 600 }}>
                              Tes dimulai dalam:
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}>
                              {Math.floor(timeRemaining / 86400) > 0 && (
                                <>
                                  <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#d97706" }}>
                                      {Math.floor(timeRemaining / 86400)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#92400e" }}>Hari</div>
                                  </div>
                                  <span style={{ fontSize: "18px", color: "#d97706" }}>:</span>
                                </>
                              )}
                              {Math.floor((timeRemaining % 86400) / 3600) > 0 && (
                                <>
                                  <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#d97706" }}>
                                      {Math.floor((timeRemaining % 86400) / 3600)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#92400e" }}>Jam</div>
                                  </div>
                                  <span style={{ fontSize: "18px", color: "#d97706" }}>:</span>
                                </>
                              )}
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "24px", fontWeight: 800, color: "#d97706" }}>
                                  {Math.floor((timeRemaining % 3600) / 60)}
                                </div>
                                <div style={{ fontSize: "10px", color: "#92400e" }}>Menit</div>
                              </div>
                              <span style={{ fontSize: "18px", color: "#d97706" }}>:</span>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "24px", fontWeight: 800, color: "#d97706" }}>
                                  {String(timeRemaining % 60).padStart(2, "0")}
                                </div>
                                <div style={{ fontSize: "10px", color: "#92400e" }}>Detik</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message from Admin */}
                        {schedule.test?.message && (
                          <div style={{
                            padding: "12px 14px",
                            background: "#fef3c7",
                            borderRadius: "10px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                          }}>
                            <AlertCircle className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                            <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                              <strong>Pesan HR:</strong> {schedule.test.message}
                            </p>
                          </div>
                        )}

                        {/* CAT Score if available */}
                        {schedule.test?.totalScore !== null && schedule.test?.totalScore !== undefined && (
                          <div style={{
                            padding: "12px 16px",
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "10px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Award className="w-5 h-5" style={{ color: "#16a34a" }} />
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>Nilai CAT Online:</span>
                            </div>
                            <span style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>
                              {schedule.test.totalScore} / 100
                            </span>
                          </div>
                        )}

                        {/* Action Button */}
                        {hasTest && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {isPassed ? (
                              // Test passed - show passed message
                              <div style={{
                                padding: "14px",
                                background: "#dcfce7",
                                border: "2px solid #22c55e",
                                borderRadius: "12px",
                                textAlign: "center",
                              }}>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", margin: "0 0 4px 0" }}>
                                  ✓ Tes Lulus
                                </p>
                                <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                                  Selamat! Anda berhak melanjutkan ke tahap berikutnya
                                </p>
                              </div>
                            ) : isFailed ? (
                              // Test failed - show failed message
                              <div style={{
                                padding: "14px",
                                background: "#fee2e2",
                                border: "2px solid #dc2626",
                                borderRadius: "12px",
                                textAlign: "center",
                              }}>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", margin: "0 0 4px 0" }}>
                                  ✗ Tes Tidak Lulus
                                </p>
                                <p style={{ fontSize: "12px", color: "#991b1b", margin: 0 }}>
                                  Maaf, Anda tidak memenuhi kriteria tes
                                </p>
                              </div>
                            ) : isExpired ? (
                              // Waktu habis - show expired message
                              <div style={{
                                padding: "14px",
                                background: "#fee2e2",
                                border: "2px solid #dc2626",
                                borderRadius: "12px",
                                textAlign: "center",
                              }}>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", margin: "0 0 4px 0" }}>
                                  ⏰ Waktu Tes Sudah Habis
                                </p>
                                <p style={{ fontSize: "12px", color: "#991b1b", margin: 0 }}>
                                  Anda tidak mengerjakan tes tepat waktu
                                </p>
                              </div>
                            ) : activeTab === "upcoming" ? (
                              // Belum mulai - tampilkan tombol
                              <Link href={schedule.test?.sessionId ? `/applicant/test/${schedule.test.sessionId}` : `/applicant/test/${schedule.applicationId}`}>
                                <button style={{
                                  width: "100%",
                                  padding: "14px",
                                  background: canStart
                                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                                    : "linear-gradient(135deg, #f59e0b, #d97706)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "12px",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  cursor: canStart ? "pointer" : "not-allowed",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "8px",
                                  boxShadow: canStart
                                    ? "0 4px 14px rgba(34, 197, 94, 0.4)"
                                    : "0 4px 14px rgba(245, 158, 11, 0.3)",
                                }}>
                                  {canStart ? (
                                    <>
                                      <Play className="w-5 h-5" />
                                      Mulai Tes Sekarang
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-5 h-5" />
                                      Tunggu Waktu Tes
                                    </>
                                  )}
                                </button>
                              </Link>
                            ) : (
                              // Di riwayat tapi belum expired - tampilkan info
                              <div style={{
                                padding: "14px",
                                background: "#f1f5f9",
                                borderRadius: "12px",
                                textAlign: "center",
                              }}>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", margin: 0 }}>
                                  Tes belum dapat diakses
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interview Card */}
                    {hasInterview && schedule.interview && (
                      <div style={{
                        background: "#fdf2f8",
                        borderRadius: "16px",
                        padding: "20px",
                        border: "1px solid #fbcfe8",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            background: "#be185d",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <User className="w-6 h-6" style={{ color: "#fff" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 2px 0" }}>
                              Interview
                            </h4>
                            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                              {schedule.interview.type === "ONLINE" ? "Online / Video Call" : "Tatap Muka"}
                            </p>
                          </div>
                          <span style={{
                            padding: "6px 12px",
                            background: "#fce7f3",
                            color: "#be185d",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}>
                            {schedule.interview.type === "ONLINE" ? (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Video className="w-3 h-3" /> Online
                              </span>
                            ) : (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Building className="w-3 h-3" /> Offline
                              </span>
                            )}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <Calendar className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {formatDate(schedule.interview.scheduledAt)}
                            </span>
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <Clock className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {formatTime(schedule.interview.scheduledAt)} WIB
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 14px",
                          background: "#fff",
                          borderRadius: "10px",
                          marginBottom: "12px",
                        }}>
                          <MapPin className="w-4 h-4" style={{ color: "#6b7280" }} />
                          <span style={{ fontSize: "13px", color: "#111" }}>
                            {schedule.interview.location || "Online System"}
                          </span>
                        </div>

                        {schedule.interview.interviewer && (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <User className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              <strong>Interviewer:</strong> {schedule.interview.interviewer}
                            </span>
                          </div>
                        )}

                        {/* Zoom/Meet Link Button */}
                        {schedule.interview.zoomLink && (
                          <a
                            href={schedule.interview.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <button
                              style={{
                                width: "100%",
                                padding: "14px",
                                background: "linear-gradient(135deg, #be185d, #9d174d)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: "0 4px 14px rgba(190, 24, 93, 0.4)",
                                marginTop: "8px",
                              }}
                            >
                              <Video className="w-5 h-5" />
                              Gabung Interview Sekarang
                            </button>
                          </a>
                        )}

                        {/* Interview Result & Score if available */}
                        {(schedule.interview.score !== null && schedule.interview.score !== undefined) && (
                          <div style={{
                            marginTop: "14px",
                            padding: "16px",
                            background: "#ffffff",
                            borderRadius: "12px",
                            border: "1.5px solid #fbcfe8",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#be185d", textTransform: "uppercase" }}>Hasil Evaluasi Wawancara:</span>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: schedule.interview.result === "PASSED" ? "#dcfce7" : schedule.interview.result === "FAILED" ? "#fee2e2" : "#fef3c7",
                                color: schedule.interview.result === "PASSED" ? "#16a34a" : schedule.interview.result === "FAILED" ? "#dc2626" : "#d97706",
                              }}>
                                {schedule.interview.result === "PASSED" ? "✓ Lolos Wawancara" : schedule.interview.result === "FAILED" ? "Belum Lolos" : "Dievaluasi"}
                              </span>
                            </div>
                            <div style={{ fontSize: "22px", fontWeight: 800, color: "#9d174d", marginBottom: "6px" }}>
                              {schedule.interview.score} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>/ 100</span>
                            </div>
                            {schedule.interview.notes && (
                              <div style={{ background: "#fdf2f8", padding: "10px 12px", borderRadius: "8px", borderLeft: "3px solid #be185d" }}>
                                <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#be185d", margin: "0 0 2px 0" }}>Catatan Tim Interviewer:</p>
                                <p style={{ fontSize: "12.5px", color: "#374151", margin: 0, lineHeight: 1.5 }}>
                                  {schedule.interview.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Medical Check-Up (MCU) Card */}
                    {hasMcu && schedule.mcu && (
                      <div style={{
                        background: "#f0f9ff",
                        borderRadius: "16px",
                        padding: "20px",
                        border: "1px solid #bae6fd",
                        marginTop: (hasTest || hasInterview) ? "16px" : 0,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            background: "#0284c7",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <HeartPulse className="w-6 h-6" style={{ color: "#fff" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 2px 0" }}>
                              Medical Check-Up (MCU) Offline
                            </h4>
                            <p style={{ fontSize: "12px", color: "#0369a1", margin: 0 }}>
                              Kantor Balai Yasa PT KAI (Reska Multi Usaha)
                            </p>
                          </div>
                          <span style={{
                            padding: "6px 12px",
                            background: schedule.mcu.result === "FIT" ? "#dcfce7" : schedule.mcu.result === "UNFIT" ? "#fee2e2" : "#e0f2fe",
                            color: schedule.mcu.result === "FIT" ? "#16a34a" : schedule.mcu.result === "UNFIT" ? "#dc2626" : "#0284c7",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}>
                            {schedule.mcu.result === "FIT" ? "FIT (Lolos MCU)" : schedule.mcu.result === "UNFIT" ? "UNFIT" : "Pemeriksaan Offline"}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <Calendar className="w-4 h-4" style={{ color: "#0284c7" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {formatDate(schedule.mcu.scheduledAt)}
                            </span>
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: "10px",
                          }}>
                            <Clock className="w-4 h-4" style={{ color: "#0284c7" }} />
                            <span style={{ fontSize: "13px", color: "#111" }}>
                              {formatTime(schedule.mcu.scheduledAt)} WIB
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 14px",
                          background: "#fff",
                          borderRadius: "10px",
                          marginBottom: schedule.mcu.notes ? "12px" : 0,
                        }}>
                          <MapPin className="w-4 h-4" style={{ color: "#0284c7" }} />
                          <span style={{ fontSize: "13px", color: "#111" }}>
                            {schedule.mcu.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)"}
                          </span>
                        </div>

                        {schedule.mcu.notes && (
                          <div style={{
                            padding: "14px",
                            background: "#fffbeb",
                            borderRadius: "10px",
                            borderLeft: "4px solid #f59e0b",
                          }}>
                            <p style={{ fontSize: "12px", color: "#92400e", fontWeight: 700, margin: "0 0 4px 0" }}>
                              Ketentuan & Instruksi Pemeriksaan MCU di Balai Yasa:
                            </p>
                            <p style={{ fontSize: "12.5px", color: "#78350f", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                              {schedule.mcu.notes}
                            </p>
                          </div>
                        )}

                        {/* Hasil Medis MCU jika sudah dievaluasi */}
                        {schedule.mcu.result && (
                          <div style={{
                            marginTop: "12px",
                            padding: "14px 16px",
                            background: "#ffffff",
                            borderRadius: "12px",
                            border: schedule.mcu.result === "FIT" ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}>
                            <div>
                              <p style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", margin: "0 0 2px 0" }}>Hasil Evaluasi Medis Dokter Balai Yasa</p>
                              <p style={{ fontSize: "14px", fontWeight: 800, color: schedule.mcu.result === "FIT" ? "#16a34a" : "#dc2626", margin: 0 }}>
                                {schedule.mcu.result === "FIT" ? "✓ FIT (Memenuhi Syarat Kesehatan)" : schedule.mcu.result === "UNFIT" ? "✗ UNFIT (Tidak Memenuhi Syarat)" : "CONDITIONAL (Pemeriksaan Lanjutan)"}
                              </p>
                            </div>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                              background: schedule.mcu.result === "FIT" ? "#dcfce7" : "#fee2e2",
                              color: schedule.mcu.result === "FIT" ? "#16a34a" : "#dc2626",
                            }}>
                              {schedule.mcu.result}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Offering Letter Card */}
                    {hasOffering && schedule.offering && (
                      <div style={{
                        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                        borderRadius: "16px",
                        padding: "20px",
                        border: "1.5px solid #fde68a",
                        marginTop: (hasTest || hasInterview || hasMcu) ? "16px" : 0,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                          }}>
                            <Briefcase className="w-6 h-6" style={{ color: "#fff" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#92400e", margin: "0 0 2px 0" }}>
                              Offering Letter (Penawaran Kerja Resmi)
                            </h4>
                            <p style={{ fontSize: "12px", color: "#b45309", margin: 0 }}>
                              PT Reska Multi Usaha (KAI Services)
                            </p>
                          </div>
                          <span style={{
                            padding: "6px 14px",
                            background: schedule.offering.status === "ACCEPTED" ? "#dcfce7" : "#fef3c7",
                            color: schedule.offering.status === "ACCEPTED" ? "#16a34a" : "#b45309",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "1px solid #fde68a",
                          }}>
                            {schedule.offering.status === "ACCEPTED" ? "✓ Penawaran Disetujui" : "Menunggu Tanggapan"}
                          </span>
                        </div>

                        {/* Offering Content Box */}
                        <div style={{
                          background: "#ffffff",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "1px solid #fef08a",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Gaji yang Ditawarkan</span>
                              <p style={{ fontSize: "17px", fontWeight: 800, color: "#16a34a", margin: "2px 0 0 0" }}>
                                Rp {schedule.offering.salary ? Number(schedule.offering.salary).toLocaleString("id-ID") : "-"}
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#4b5563" }}> / bulan</span>
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Status Ketenagakerjaan</span>
                              <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "2px 0 0 0" }}>
                                {schedule.offering.employmentType === "PERMANENT" ? "PKWTT (Karyawan Tetap)" : "PKWT (Karyawan Kontrak)"}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                            <div>
                              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Mulai Masuk Kerja</span>
                              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", margin: "2px 0 0 0" }}>
                                {schedule.offering.startDate ? formatDate(schedule.offering.startDate) : "-"}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                                {schedule.offering.employmentType === "PERMANENT" ? "Masa Percobaan" : "Durasi Masa Kontrak"}
                              </span>
                              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", margin: "2px 0 0 0" }}>
                                {schedule.offering.employmentType === "PERMANENT"
                                  ? `${schedule.offering.probationMonths || 3} Bulan (Probation)`
                                  : `${schedule.offering.contractDuration || 12} Bulan`}
                              </p>
                            </div>
                          </div>

                          {schedule.offering.workLocation && (
                            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Lokasi Penempatan Kerja</span>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", margin: "2px 0 0 0" }}>
                                {schedule.offering.workLocation}
                              </p>
                            </div>
                          )}

                          {schedule.offering.benefits && (
                            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Fasilitas & Tunjangan</span>
                              <p style={{ fontSize: "13px", color: "#15803d", margin: "2px 0 0 0", lineHeight: 1.5 }}>
                                {schedule.offering.benefits}
                              </p>
                            </div>
                          )}

                          {schedule.offering.notes && (
                            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                              <span style={{ fontSize: "11px", color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Catatan Tambahan HR</span>
                              <p style={{ fontSize: "13px", color: "#78350f", margin: "2px 0 0 0", lineHeight: 1.5 }}>
                                {schedule.offering.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

function formatTimeRemaining(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}j`;
  if (hours > 0) return `${hours}j ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}d`;
  return `${secs}d`;
}
