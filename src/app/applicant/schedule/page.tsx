"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import ScheduleCard from "./ScheduleCard";
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
  ChevronDown,
  ChevronUp,
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
    document?: {
      id?: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      uploadedAt?: string;
    } | null;
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
  const hasInitialTabSet = useRef(false);

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

  const isTestCompleted = useCallback((schedule: ScheduleItem) => {
    if (!schedule) return false;
    const testStatus = schedule.test?.status;
    if (testStatus === "SCORED" || testStatus === "SUBMITTED" || testStatus === "COMPLETED") return true;
    if (schedule.test?.submittedAt) return true;
    if (["INTERVIEW", "MCU", "OFFERING", "OFFERED", "ACCEPTED"].includes(schedule.status)) return true;
    return false;
  }, []);

  const isTestExpired = useCallback((schedule: ScheduleItem) => {
    const endTime = schedule.test?.endTime;
    if (!endTime) return false;
    return currentTime > new Date(endTime);
  }, [currentTime]);

  const isTestPassed = useCallback((schedule: ScheduleItem): boolean => {
    if (schedule.test?.passed === true) return true;
    if (schedule.test?.status === "SCORED" && ["INTERVIEW", "MCU", "OFFERING", "OFFERED", "ACCEPTED"].includes(schedule.status)) {
      return true;
    }
    if (["INTERVIEW", "MCU", "OFFERING", "OFFERED", "ACCEPTED"].includes(schedule.status)) {
      return true;
    }
    return false;
  }, []);

  const isTestFailed = useCallback((schedule: ScheduleItem): boolean => {
    if (schedule.test?.passed === false && schedule.status === "REJECTED") return true;
    if (schedule.test?.status === "SCORED" && schedule.status === "REJECTED") return true;
    if (!isTestCompleted(schedule) && isTestExpired(schedule)) {
      return true;
    }
    return false;
  }, [isTestCompleted, isTestExpired]);

  const canStartTest = useCallback((schedule: ScheduleItem) => {
    if (isTestCompleted(schedule)) return false;
    if (isTestExpired(schedule)) return false;
    const scheduledAt = schedule.test?.scheduledAt;
    if (!scheduledAt) return false;
    return currentTime >= new Date(scheduledAt);
  }, [currentTime, isTestCompleted, isTestExpired]);

  // Helper: cek apakah lamaran sudah diterima (ACCEPTED)
  const isApplicationAccepted = useCallback((schedule: ScheduleItem) => {
    if (!schedule) return false;
    return schedule.status === "ACCEPTED" || schedule.offering?.status === "ACCEPTED";
  }, []);

  // Helper: cek apakah lamaran ditolak (REJECTED)
  const isApplicationRejected = useCallback((schedule: ScheduleItem) => {
    if (!schedule) return false;
    if (schedule.status === "REJECTED" || schedule.status === "WITHDRAWN") return true;
    if (isTestFailed(schedule)) return true;
    if (schedule.interview?.result === "FAILED" || schedule.interview?.result === "REJECTED") return true;
    if (schedule.mcu?.result === "UNFIT") return true;
    if (schedule.offering?.status === "REJECTED" || schedule.offering?.status === "DECLINED") return true;
    return false;
  }, [isTestFailed]);

  const getTestStatusLabel = useCallback((schedule: ScheduleItem) => {
    if (isApplicationAccepted(schedule)) return "Diterima";
    if (isApplicationRejected(schedule)) return "Ditolak";
    if (isTestPassed(schedule)) return "Lulus";
    if (isTestFailed(schedule)) return isTestExpired(schedule) ? "Waktu Habis" : "Ditolak";
    if (isTestCompleted(schedule)) return "Selesai";
    if (isTestExpired(schedule)) return "Waktu Habis";
    if (canStartTest(schedule)) return "Siap";
    return "Menunggu";
  }, [isApplicationAccepted, isApplicationRejected, canStartTest, isTestExpired, isTestCompleted, isTestPassed, isTestFailed]);

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

  // Filter schedules - tampilkan yang masih aktif dalam proses seleksi di "Mendatang"
  const upcomingSchedules = schedules.filter((s) => {
    // 1. Apabila sudah diterima -> otomatis masuk ke Riwayat (bukan Mendatang)
    if (isApplicationAccepted(s)) {
      return false;
    }

    // 2. Apabila ditolak -> langsung masuk ke Riwayat (bukan Mendatang)
    if (isApplicationRejected(s)) {
      return false;
    }

    // 3. Masih dalam proses seleksi aktif yang sedang berjalan
    return true;
  });

  // Filter untuk Riwayat: Menampung yang sudah Diterima dan yang Ditolak
  const pastSchedules = schedules.filter((s) => {
    // 1. Pelamar sudah Diterima
    if (isApplicationAccepted(s)) {
      return true;
    }

    // 2. Pelamar Ditolak
    if (isApplicationRejected(s)) {
      return true;
    }

    return false;
  });

  // Auto-switch to "past" tab on initial load if no upcoming but has past
  useEffect(() => {
    if (!loading && schedules.length > 0 && !hasInitialTabSet.current) {
      hasInitialTabSet.current = true;
      if (upcomingSchedules.length === 0 && pastSchedules.length > 0) {
        setActiveTab("past");
      }
    }
  }, [loading, schedules, upcomingSchedules.length, pastSchedules.length]);

  const displayedSchedules = activeTab === "upcoming" ? upcomingSchedules : pastSchedules;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #00205B 0%, #003080 100%)",
        padding: "32px",
        color: "#fff"
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar className="w-8 h-8" />
            Jadwal Seleksi Saya
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>
            Pantau jadwal tes dan interview Anda
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Tab Filter */}
        <div style={{
          display: "flex",
          gap: "8px",
          maxWidth: "480px",
          margin: "0 auto 28px",
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
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
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
                {pastSchedules.length > 0 && (
                  <button
                    onClick={() => setActiveTab("past")}
                    style={{
                      padding: "14px 28px",
                      background: "#f1f5f9",
                      color: "#00205B",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Lihat Riwayat Seleksi ({pastSchedules.length})
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          displayedSchedules.length === 1 ? (
          <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            <ScheduleCard
              key={displayedSchedules[0].applicationId}
              schedule={displayedSchedules[0]}
              currentTime={currentTime}
              activeTab={activeTab}
              isTestCompleted={isTestCompleted}
              isTestExpired={isTestExpired}
              isTestPassed={isTestPassed}
              isTestFailed={isTestFailed}
              canStartTest={canStartTest}
              isApplicationAccepted={isApplicationAccepted}
              isApplicationRejected={isApplicationRejected}
              getTestStatusLabel={getTestStatusLabel}
              formatDate={formatDate}
              formatTime={formatTime}
              formatTimeRemaining={formatTimeRemaining}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {/* Kolom 1 (Kiri) */}
            <div style={{ flex: "1 1 450px", minWidth: "320px", maxWidth: "650px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {displayedSchedules
                .filter((_, idx) => idx % 2 === 0)
                .map((schedule) => (
                  <ScheduleCard
                    key={schedule.applicationId}
                    schedule={schedule}
                    currentTime={currentTime}
                    activeTab={activeTab}
                    isTestCompleted={isTestCompleted}
                    isTestExpired={isTestExpired}
                    isTestPassed={isTestPassed}
                    isTestFailed={isTestFailed}
                    canStartTest={canStartTest}
                    isApplicationAccepted={isApplicationAccepted}
                    isApplicationRejected={isApplicationRejected}
                    getTestStatusLabel={getTestStatusLabel}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatTimeRemaining={formatTimeRemaining}
                  />
                ))}
            </div>

            {/* Kolom 2 (Kanan) */}
            <div style={{ flex: "1 1 450px", minWidth: "320px", maxWidth: "650px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {displayedSchedules
                .filter((_, idx) => idx % 2 === 1)
                .map((schedule) => (
                  <ScheduleCard
                    key={schedule.applicationId}
                    schedule={schedule}
                    currentTime={currentTime}
                    activeTab={activeTab}
                    isTestCompleted={isTestCompleted}
                    isTestExpired={isTestExpired}
                    isTestPassed={isTestPassed}
                    isTestFailed={isTestFailed}
                    canStartTest={canStartTest}
                    isApplicationAccepted={isApplicationAccepted}
                    isApplicationRejected={isApplicationRejected}
                    getTestStatusLabel={getTestStatusLabel}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatTimeRemaining={formatTimeRemaining}
                  />
                ))}
            </div>
          </div>
        )
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
