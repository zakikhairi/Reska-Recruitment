"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { Calendar, Clock, MapPin, User, FileText, CheckCircle, AlertCircle, Play, RefreshCw } from "lucide-react";

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
  };
  interview?: {
    scheduledAt: string;
    endTime?: string | null;
    location?: string;
    interviewer: string;
    type: string;
  };
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  TEST_SCHEDULED: { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" },
  IN_TEST: { bg: "#e0e7ff", text: "#4f46e5", label: "Sedang Tes" },
  TEST_COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" },
  INTERVIEW: { bg: "#fce7f3", text: "#be185d", label: "Interview" },
  MCU: { bg: "#d1fae5", text: "#059669", label: "MCU" },
  OFFERING: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
  ACCEPTED: { bg: "#dcfce7", text: "#16a34a", label: "Diterima" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626", label: "Ditolak" },
  PENDING: { bg: "#f1f5f9", text: "#64748b", label: "Menunggu" },
};

const divisionLabels: Record<string, string> = {
  ON_TRAIN_SERVICE: "On-Train Service",
  RES_CLEAN: "ResClean",
  RES_PARKING: "ResParking",
  LOGISTICS: "Logistics",
  IT_STAFF: "IT Staff",
  ADMIN: "Administrasi",
};

export default function SchedulePage() {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh schedules periodically (every 30 seconds)
  useEffect(() => {
    fetchSchedules();
    const refreshInterval = setInterval(() => {
      fetchSchedules();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [user]);

  const fetchSchedules = useCallback(async () => {
    if (!user?.id) return;

    try {
      if (!refreshing) setLoading(true);
      const response = await fetch(`/api/applicant/schedule?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setSchedules(result.schedules);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

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

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return 0;
    const scheduleDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    const diff = scheduleDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Check if test can be started (time has arrived) - uses currentTime for real-time updates
  const canStartTest = useCallback((schedule: ScheduleItem) => {
    const scheduledAt = schedule.test?.scheduledAt;
    if (!scheduledAt) return true; // Can start if no scheduled time
    return currentTime >= new Date(scheduledAt);
  }, [currentTime]);

  // Check if test window has expired (past endTime)
  const isTestExpired = useCallback((schedule: ScheduleItem) => {
    const endTime = schedule.test?.endTime;
    if (!endTime) return false; // No end time means no expiration
    return currentTime > new Date(endTime);
  }, [currentTime]);

  // Get time remaining until test - returns seconds for countdown display
  const getTimeRemainingSeconds = (scheduledAt?: string): number | null => {
    if (!scheduledAt) return null;
    const diff = new Date(scheduledAt).getTime() - currentTime.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return null;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days} hari ${hours} jam`;
    if (hours > 0) return `${hours} jam ${minutes} menit`;
    if (minutes > 0) return `${minutes} menit ${secs} detik`;
    return `${secs} detik`;
  };

  // Get past schedules
  const pastSchedules = schedules.filter((s) => {
    const testDate = s.test?.scheduledAt;
    const interviewDate = s.interview?.scheduledAt;
    if (!testDate && !interviewDate) return false;
    const nextDate = testDate || interviewDate;
    return new Date(nextDate!) < currentTime;
  });

  // Get upcoming schedules with scheduled tests
  const upcomingSchedules = pastSchedules.length > 0
    ? []
    : schedules.filter((s) => {
        const testDate = s.test?.scheduledAt;
        const interviewDate = s.interview?.scheduledAt;
        if (!testDate && !interviewDate) return false;
        const nextDate = testDate || interviewDate;
        return new Date(nextDate!) >= currentTime;
      });

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Jadwal Seleksi</h1>
          <p style={{ fontSize: "15px", color: "#666666" }}>Lihat jadwal tes dan interview Anda</p>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#666" }}>Memuat jadwal...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <Calendar className="w-16 h-16" style={{ color: "#e5e5e5", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Belum Ada Jadwal</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>Jadwal tes dan interview akan muncul di sini setelah ditentukan oleh tim HR.</p>
            <Link href="/applicant/jobs">
              <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Lihat Lowongan
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming Schedules */}
            {upcomingSchedules.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  Jadwal Mendatang
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {upcomingSchedules.map((schedule) => {
                    const status = statusConfig[schedule.status] || statusConfig.PENDING;

                    return (
                      <div key={schedule.applicationId} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                          <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{schedule.position}</h3>
                            <p style={{ fontSize: "13px", color: "#666" }}>{divisionLabels[schedule.division] || schedule.division}</p>
                          </div>
                          <span style={{ padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                            {status.label}
                          </span>
                        </div>

                        {/* Test Schedule */}
                        {schedule.test && (
                          <div style={{ background: "#eff6ff", borderRadius: "12px", padding: "16px", marginBottom: schedule.interview ? "12px" : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <FileText className="w-5 h-5" style={{ color: "#2563eb" }} />
                              <span style={{ fontSize: "14px", fontWeight: 600, color: "#2563eb" }}>Tes Kompetensi</span>
                              {(() => {
                                const canStart = canStartTest(schedule);
                                const isExpired = isTestExpired(schedule);
                                const timeRemaining = getTimeRemainingSeconds(schedule.test?.scheduledAt);
                                if (isExpired) {
                                  return (
                                    <span style={{
                                      marginLeft: "auto",
                                      padding: "4px 10px",
                                      background: "#fee2e2",
                                      color: "#dc2626",
                                      borderRadius: "20px",
                                      fontSize: "11px",
                                      fontWeight: 700
                                    }}>
                                      Waktu Habis
                                    </span>
                                  );
                                }
                                if (canStart) {
                                  return (
                                    <span style={{
                                      marginLeft: "auto",
                                      padding: "4px 10px",
                                      background: "#16a34a",
                                      color: "#fff",
                                      borderRadius: "20px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      animation: "pulse 1.5s infinite"
                                    }}>
                                      Bisa Dimulai!
                                    </span>
                                  );
                                }
                                return (
                                  <span style={{
                                    marginLeft: "auto",
                                    padding: "4px 10px",
                                    background: "#fef3c7",
                                    color: "#d97706",
                                    borderRadius: "20px",
                                    fontSize: "11px",
                                    fontWeight: 700
                                  }}>
                                    {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "Menunggu"}
                                  </span>
                                );
                              })()}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Calendar className="w-4 h-4" style={{ color: "#666" }} />
                                <span style={{ fontSize: "13px", color: "#111" }}>{formatDate(schedule.test?.scheduledAt)}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Clock className="w-4 h-4" style={{ color: "#666" }} />
                                <span style={{ fontSize: "13px", color: "#111" }}>{formatTime(schedule.test?.scheduledAt)} WIB</span>
                              </div>
                            </div>

                            {/* Live Countdown Timer */}
                            {(() => {
                              const canStart = canStartTest(schedule);
                              const isExpired = isTestExpired(schedule);
                              const timeRemaining = getTimeRemainingSeconds(schedule.test?.scheduledAt);
                              if (!canStart && !isExpired && timeRemaining !== null && timeRemaining > 0) {
                                return (
                                  <div style={{
                                    marginTop: "16px",
                                    padding: "20px",
                                    background: "#fffbeb",
                                    borderRadius: "12px",
                                    textAlign: "center",
                                    border: "2px solid #fcd34d"
                                  }}>
                                    <p style={{ fontSize: "12px", color: "#92400e", marginBottom: "8px", fontWeight: 600 }}>
                                      Tes akan dimulai dalam:
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}>
                                      {Math.floor(timeRemaining / 86400) > 0 && (
                                        <>
                                          <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706" }}>{Math.floor(timeRemaining / 86400)}</div>
                                            <div style={{ fontSize: "10px", color: "#92400e" }}>Hari</div>
                                          </div>
                                          <span style={{ fontSize: "20px", color: "#d97706" }}>:</span>
                                        </>
                                      )}
                                      {Math.floor((timeRemaining % 86400) / 3600) > 0 && (
                                        <>
                                          <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706" }}>{Math.floor((timeRemaining % 86400) / 3600)}</div>
                                            <div style={{ fontSize: "10px", color: "#92400e" }}>Jam</div>
                                          </div>
                                          <span style={{ fontSize: "20px", color: "#d97706" }}>:</span>
                                        </>
                                      )}
                                      <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706" }}>{Math.floor((timeRemaining % 3600) / 60)}</div>
                                        <div style={{ fontSize: "10px", color: "#92400e" }}>Menit</div>
                                      </div>
                                      <span style={{ fontSize: "20px", color: "#d97706" }}>:</span>
                                      <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706" }}>{String(timeRemaining % 60).padStart(2, "0")}</div>
                                        <div style={{ fontSize: "10px", color: "#92400e" }}>Detik</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: schedule.test && canStartTest(schedule) || isTestExpired(schedule) ? "0" : "12px" }}>
                              <MapPin className="w-4 h-4" style={{ color: "#666" }} />
                              <span style={{ fontSize: "13px", color: "#111" }}>{schedule.test?.location || "Online System"}</span>
                            </div>
                            {schedule.test?.message && (
                              <div style={{ marginTop: "12px", padding: "12px", background: "#fef3c7", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                <AlertCircle className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0 }} />
                                <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                                  <strong>Pesan dari Admin:</strong> {schedule.test.message}
                                </p>
                              </div>
                            )}
                            {schedule.test && (() => {
                              const canStart = canStartTest(schedule);
                              const isExpired = isTestExpired(schedule);
                              const testUrl = schedule.test.sessionId
                                ? `/applicant/test/${schedule.test.sessionId}`
                                : `/applicant/test/${schedule.applicationId}`;

                              if (isExpired) {
                                return (
                                  <button style={{
                                    marginTop: "16px",
                                    width: "100%",
                                    padding: "14px 20px",
                                    background: "#9ca3af",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    cursor: "not-allowed",
                                  }}
                                    disabled>
                                    <Clock className="w-4 h-4" style={{ display: "inline", marginRight: "8px" }} />
                                    Waktu Tes Sudah Habis
                                  </button>
                                );
                              }

                              return (
                                <Link href={testUrl}>
                                  <button style={{
                                    marginTop: "16px",
                                    width: "100%",
                                    padding: "14px 20px",
                                    background: canStart ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    cursor: canStart ? "pointer" : "not-allowed",
                                    boxShadow: canStart ? "0 4px 14px rgba(22, 163, 74, 0.4)" : "0 4px 14px rgba(245, 158, 11, 0.3)",
                                    transition: "all 0.3s ease",
                                  }}>
                                    {canStart ? (
                                      <>
                                        <Play className="w-4 h-4" style={{ display: "inline", marginRight: "8px" }} />
                                        Mulai Tes Sekarang
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-4 h-4" style={{ display: "inline", marginRight: "8px" }} />
                                        Tunggu Sampai Waktu Tes
                                      </>
                                    )}
                                  </button>
                                </Link>
                              );
                            })()}
                          </div>
                        )}

                        {/* Interview Schedule */}
                        {schedule.interview && (
                          <div style={{ background: "#fdf2f8", borderRadius: "12px", padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <User className="w-5 h-5" style={{ color: "#be185d" }} />
                              <span style={{ fontSize: "14px", fontWeight: 600, color: "#be185d" }}>Interview</span>
                              <span style={{
                                marginLeft: "auto",
                                padding: "4px 10px",
                                background: "#fce7f3",
                                color: "#be185d",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: 700
                              }}>
                                {getDaysUntil(schedule.interview?.scheduledAt) === 0
                                  ? "Hari ini"
                                  : getDaysUntil(schedule.interview?.scheduledAt) === 1
                                  ? "Besok"
                                  : `${getDaysUntil(schedule.interview?.scheduledAt)} hari lagi`}
                              </span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Calendar className="w-4 h-4" style={{ color: "#666" }} />
                                <span style={{ fontSize: "13px", color: "#111" }}>{formatDate(schedule.interview?.scheduledAt)}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Clock className="w-4 h-4" style={{ color: "#666" }} />
                                <span style={{ fontSize: "13px", color: "#111" }}>
                                  {formatTime(schedule.interview?.scheduledAt)}
                                  {schedule.interview?.endTime ? ` - ${formatTime(schedule.interview?.endTime)}` : ""} WIB
                                </span>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                              <MapPin className="w-4 h-4" style={{ color: "#666" }} />
                              <span style={{ fontSize: "13px", color: "#111" }}>{schedule.interview?.location || "Online System"}</span>
                            </div>
                            {schedule.interview?.interviewer && (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                                <User className="w-4 h-4" style={{ color: "#666" }} />
                                <span style={{ fontSize: "13px", color: "#111" }}>Penguji: {schedule.interview?.interviewer}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reminder */}
                        {/* Removed per user request */}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Schedules */}
            {pastSchedules.length > 0 && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle className="w-5 h-5" style={{ color: "#10B981" }} />
                  Riwayat Seleksi
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pastSchedules.map((schedule) => {
                    const status = statusConfig[schedule.status] || statusConfig.PENDING;

                    return (
                      <div key={schedule.applicationId} style={{ background: "#ffffff", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", opacity: 0.7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>{schedule.position}</h4>
                            <p style={{ fontSize: "12px", color: "#666" }}>{divisionLabels[schedule.division] || schedule.division}</p>
                          </div>
                          <span style={{ padding: "4px 10px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
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
