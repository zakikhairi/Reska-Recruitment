"use client";

import { useState } from "react";
import Link from "next/link";
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
  Award,
  XCircle,
  HeartPulse,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

export interface ScheduleItem {
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

export interface ScheduleCardProps {
  schedule: ScheduleItem;
  currentTime: Date;
  activeTab: "upcoming" | "past";
  isTestCompleted: (schedule: ScheduleItem) => boolean;
  isTestExpired: (schedule: ScheduleItem) => boolean;
  isTestPassed: (schedule: ScheduleItem) => boolean;
  isTestFailed: (schedule: ScheduleItem) => boolean;
  canStartTest: (schedule: ScheduleItem) => boolean;
  isApplicationAccepted: (schedule: ScheduleItem) => boolean;
  isApplicationRejected: (schedule: ScheduleItem) => boolean;
  getTestStatusLabel: (schedule: ScheduleItem) => string;
  formatDate: (dateStr?: string) => string;
  formatTime: (dateStr?: string) => string;
  formatTimeRemaining: (seconds: number) => string;
}

export default function ScheduleCard({
  schedule,
  currentTime,
  activeTab,
  isTestCompleted,
  isTestExpired,
  isTestPassed,
  isTestFailed,
  canStartTest,
  isApplicationAccepted,
  isApplicationRejected,
  getTestStatusLabel,
  formatDate,
  formatTime,
  formatTimeRemaining,
}: ScheduleCardProps) {
  const isExpired = isTestExpired(schedule);
  const isCompleted = isTestCompleted(schedule);
  const isPassed = isTestPassed(schedule);
  const isFailed = isTestFailed(schedule);
  const canStart = canStartTest(schedule);
  const isAcceptedApp = isApplicationAccepted(schedule);
  const isRejectedApp = isApplicationRejected(schedule);
  const timeRemaining = schedule.test?.scheduledAt
    ? Math.max(0, Math.floor((new Date(schedule.test.scheduledAt).getTime() - currentTime.getTime()) / 1000))
    : null;

  const hasTest = !!schedule.test;
  const hasInterview = !!schedule.interview;
  const hasMcu = !!schedule.mcu;
  const hasOffering = !!schedule.offering;
  const statusLabel = getTestStatusLabel(schedule);

  // Daftar tahapan yang tersedia
  const stagesList: ("test" | "interview" | "mcu" | "offering")[] = [];
  if (hasTest) stagesList.push("test");
  if (hasInterview) stagesList.push("interview");
  if (hasMcu) stagesList.push("mcu");
  if (hasOffering) stagesList.push("offering");

  const totalStages = stagesList.length;
  const latestStage = stagesList.length > 0 ? stagesList[stagesList.length - 1] : "test";

  // State untuk collapsible accordion pada kartu ini
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const isSectionExpanded = (section: "test" | "interview" | "mcu" | "offering") => {
    if (typeof expandedSections[section] === "boolean") {
      return expandedSections[section];
    }
    // Jika hanya ada 1 atau 2 tahapan, buka secara default
    if (totalStages <= 2) return true;
    // Jika lebih dari 2 tahapan, buka tahapan terbaru, tahapan lampau diringkas
    return section === latestStage;
  };

  const toggleSection = (section: "test" | "interview" | "mcu" | "offering") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !isSectionExpanded(section),
    }));
  };

  const isTestOpen = isSectionExpanded("test");
  const isInterviewOpen = isSectionExpanded("interview");
  const isMcuOpen = isSectionExpanded("mcu");
  const isOfferingOpen = isSectionExpanded("offering");

  const allExpanded =
    (!hasTest || isTestOpen) &&
    (!hasInterview || isInterviewOpen) &&
    (!hasMcu || isMcuOpen) &&
    (!hasOffering || isOfferingOpen);

  const toggleAll = (expand: boolean) => {
    setExpandedSections({
      test: expand,
      interview: expand,
      mcu: expand,
      offering: expand,
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        border: isAcceptedApp
          ? "2px solid #22c55e"
          : isRejectedApp
          ? "2px solid #dc2626"
          : isPassed
          ? "2px solid #22c55e"
          : isFailed
          ? "2px solid #dc2626"
          : hasOffering
          ? "2px solid #f59e0b"
          : "1.5px solid #e2e8f0",
      }}
    >
      {/* Header Kartu */}
      <div
        style={{
          background: "linear-gradient(135deg, #00205B 0%, #003080 100%)",
          padding: "20px 24px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
              {schedule.position}
            </h3>
            <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
              {schedule.division.replace(/_/g, " ")}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <span
              style={{
                padding: "6px 14px",
                background: isAcceptedApp
                  ? "rgba(34,197,94,0.25)"
                  : isRejectedApp
                  ? "rgba(220,38,38,0.25)"
                  : hasOffering
                  ? "rgba(245,158,11,0.25)"
                  : hasMcu
                  ? "rgba(2,132,199,0.25)"
                  : hasInterview
                  ? "rgba(190,24,93,0.2)"
                  : isPassed
                  ? "rgba(34,197,94,0.2)"
                  : isFailed
                  ? "rgba(220,38,38,0.2)"
                  : "rgba(255,255,255,0.2)",
                color: isAcceptedApp
                  ? "#dcfce7"
                  : isRejectedApp
                  ? "#fee2e2"
                  : hasOffering
                  ? "#fef3c7"
                  : hasMcu
                  ? "#bae6fd"
                  : hasInterview
                  ? "#fce7f3"
                  : isPassed
                  ? "#dcfce7"
                  : isFailed
                  ? "#fee2e2"
                  : "#fff",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {isAcceptedApp
                ? "✓ Diterima Resmi"
                : isRejectedApp
                ? "✗ Tidak Lolos Seleksi"
                : hasOffering
                ? "Offering Letter"
                : hasMcu
                ? "MCU Balai Yasa"
                : hasInterview
                ? "Interview"
                : statusLabel}
            </span>

            {/* Tombol Buka/Tutup Semua Detail jika tahapan > 1 */}
            {totalStages > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAll(!allExpanded);
                }}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "background 0.2s",
                }}
              >
                {allExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Ringkas Detail</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Buka Semua Detail</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body Kartu */}
      <div style={{ padding: "20px" }}>
        {/* Banner Selamat Jika Diterima */}
        {isAcceptedApp && (
          <div
            style={{
              background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
              border: "1.5px solid #86efac",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.15)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#166534", margin: "0 0 2px" }}>
                Selamat! Anda Resmi Diterima
              </h4>
              <p style={{ fontSize: "12.5px", color: "#14532d", margin: 0 }}>
                Seluruh tahapan seleksi telah selesai dan Anda dinyatakan diterima di PT Reska Multi Usaha (KAI Services).
              </p>
            </div>
          </div>
        )}

        {/* Banner Informasi Jika Ditolak */}
        {isRejectedApp && (
          <div
            style={{
              background: "#fee2e2",
              border: "1.5px solid #fca5a5",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.1)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#991b1b", margin: "0 0 2px" }}>
                Tahapan Seleksi Berakhir
              </h4>
              <p style={{ fontSize: "12.5px", color: "#7f1d1d", margin: 0 }}>
                Terima kasih atas partisipasi Anda dalam proses seleksi ini. Tetap semangat dan persiapkan diri untuk kesempatan rekrutmen berikutnya.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Progres Horizontal Tahapan */}
        {totalStages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "18px",
              overflowX: "auto",
            }}
          >
            {/* Step: Tes CAT */}
            <div
              onClick={() => toggleSection("test")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: isPassed ? "#16a34a" : isFailed ? "#dc2626" : "#2563eb",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Klik untuk membuka detail Tes CAT"
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isPassed ? "#22c55e" : isFailed ? "#ef4444" : "#3b82f6",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10.5px",
                  fontWeight: 700,
                }}
              >
                {isPassed ? "✓" : "1"}
              </span>
              <span>Tes CAT</span>
            </div>

            {hasInterview && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div
                  onClick={() => toggleSection("interview")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: schedule.interview?.result === "PASSED" ? "#16a34a" : schedule.interview?.result === "FAILED" ? "#dc2626" : "#be185d",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  title="Klik untuk membuka detail Interview"
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: schedule.interview?.result === "PASSED" ? "#22c55e" : schedule.interview?.result === "FAILED" ? "#ef4444" : "#be185d",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                    }}
                  >
                    {schedule.interview?.result === "PASSED" ? "✓" : "2"}
                  </span>
                  <span>Interview</span>
                </div>
              </>
            )}

            {hasMcu && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div
                  onClick={() => toggleSection("mcu")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: schedule.mcu?.result === "FIT" ? "#16a34a" : schedule.mcu?.result === "UNFIT" ? "#dc2626" : "#0284c7",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  title="Klik untuk membuka detail MCU"
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: schedule.mcu?.result === "FIT" ? "#22c55e" : schedule.mcu?.result === "UNFIT" ? "#ef4444" : "#0284c7",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                    }}
                  >
                    {schedule.mcu?.result === "FIT" ? "✓" : "3"}
                  </span>
                  <span>MCU</span>
                </div>
              </>
            )}

            {hasOffering && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div
                  onClick={() => toggleSection("offering")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: (schedule.offering?.status === "ACCEPTED" || isAcceptedApp) ? "#16a34a" : "#d97706",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  title="Klik untuk membuka detail Offering"
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: (schedule.offering?.status === "ACCEPTED" || isAcceptedApp) ? "#22c55e" : "#f59e0b",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10.5px",
                      fontWeight: 700,
                    }}
                  >
                    {(schedule.offering?.status === "ACCEPTED" || isAcceptedApp) ? "✓" : "4"}
                  </span>
                  <span>Offering</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* 1. KARTU TES KOMPETENSI */}
        {hasTest && (
          <div
            style={{
              background: "#eff6ff",
              borderRadius: "16px",
              padding: "18px 20px",
              marginBottom: (hasInterview || hasMcu || hasOffering) ? "16px" : 0,
              border: "1px solid #dbeafe",
            }}
          >
            {/* Header Accordion Tes */}
            <div
              onClick={() => totalStages > 1 && toggleSection("test")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                cursor: totalStages > 1 ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "#2563eb",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 2px 0" }}>
                    Tes Kompetensi
                  </h4>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                    {schedule.test?.scheduledAt ? formatDate(schedule.test.scheduledAt) : "Belum dijadwalkan"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                {/* Badge Status */}
                {isPassed ? (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "#22c55e",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle className="w-3 h-3" /> Lulus
                  </span>
                ) : isFailed ? (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "#dc2626",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <XCircle className="w-3 h-3" /> Ditolak
                  </span>
                ) : isExpired ? (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "#dc2626",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <XCircle className="w-3 h-3" /> Waktu Habis
                  </span>
                ) : canStart ? (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "#22c55e",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    Siap
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "#fbbf24",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "Menunggu"}
                  </span>
                )}

                {totalStages > 1 && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(37, 99, 235, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    {isTestOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Singkat Saat Tertutup */}
            {!isTestOpen && schedule.test?.totalScore !== null && schedule.test?.totalScore !== undefined && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#1e40af", fontWeight: 600 }}>Nilai CAT Online:</span>
                <span style={{ fontWeight: 800, color: "#16a34a" }}>{schedule.test.totalScore} / 100</span>
              </div>
            )}

            {/* Konten Detail Tes Saat Terbuka */}
            {isTestOpen && (
              <div style={{ marginTop: "16px" }}>
                {/* Waktu & Lokasi */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <Clock className="w-4 h-4" style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {schedule.test?.scheduledAt ? formatTime(schedule.test.scheduledAt) : "-"} WIB
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {schedule.test?.location || "Online"}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                {!canStart && !isExpired && timeRemaining !== null && timeRemaining > 0 && (
                  <div
                    style={{
                      padding: "16px",
                      background: "#fffbeb",
                      borderRadius: "12px",
                      marginBottom: "16px",
                      border: "2px solid #fbbf24",
                      textAlign: "center",
                    }}
                  >
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

                {/* Pesan HR */}
                {schedule.test?.message && (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#fef3c7",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <AlertCircle className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                      <strong>Pesan HR:</strong> {schedule.test.message}
                    </p>
                  </div>
                )}

                {/* Skor CAT jika tersedia */}
                {schedule.test?.totalScore !== null && schedule.test?.totalScore !== undefined && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Award className="w-5 h-5" style={{ color: "#16a34a" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>Nilai CAT Online:</span>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>
                      {schedule.test.totalScore} / 100
                    </span>
                  </div>
                )}

                {/* Tombol Aksi / Status Hasil Tes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {isPassed ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "#dcfce7",
                        border: "2px solid #22c55e",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", margin: "0 0 4px 0" }}>
                        ✓ Tes Lulus
                      </p>
                      <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                        Selamat! Anda berhak melanjutkan ke tahap berikutnya
                      </p>
                    </div>
                  ) : isFailed ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "#fee2e2",
                        border: "2px solid #dc2626",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", margin: "0 0 4px 0" }}>
                        ✗ Tes Tidak Lulus
                      </p>
                      <p style={{ fontSize: "12px", color: "#991b1b", margin: 0 }}>
                        Maaf, Anda tidak memenuhi kriteria tes
                      </p>
                    </div>
                  ) : isCompleted ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "#f0fdf4",
                        border: "2px solid #22c55e",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", margin: "0 0 4px 0" }}>
                        ✓ Tes Selesai Dikerjakan
                      </p>
                      <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                        {schedule.test?.totalScore !== null && schedule.test?.totalScore !== undefined
                          ? `Skor Anda: ${schedule.test.totalScore} / 100`
                          : "Jawaban Anda telah tersimpan dan sedang diproses"}
                      </p>
                    </div>
                  ) : isExpired ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "#fee2e2",
                        border: "2px solid #dc2626",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", margin: "0 0 4px 0" }}>
                        ⏰ Waktu Tes Sudah Habis
                      </p>
                      <p style={{ fontSize: "12px", color: "#991b1b", margin: 0 }}>
                        Batas waktu pengerjaan tes telah berakhir
                      </p>
                    </div>
                  ) : activeTab === "upcoming" ? (
                    canStart ? (
                      <Link
                        href={schedule.test?.sessionId ? `/applicant/test/${schedule.test.sessionId}` : `/applicant/test/${schedule.applicationId}`}
                      >
                        <button
                          style={{
                            width: "100%",
                            padding: "14px",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
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
                            boxShadow: "0 4px 14px rgba(34, 197, 94, 0.4)",
                          }}
                        >
                          <Play className="w-5 h-5" />
                          Mulai Tes Sekarang
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1.5px dashed #f59e0b",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span>Belum Waktu Tes (Menunggu Jadwal)</span>
                      </button>
                    )
                  ) : (
                    <div
                      style={{
                        padding: "14px",
                        background: "#f1f5f9",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", margin: 0 }}>
                        Tes belum dapat diakses
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. KARTU INTERVIEW */}
        {hasInterview && schedule.interview && (
          <div
            style={{
              background: "#fdf2f8",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1px solid #fbcfe8",
              marginBottom: (hasMcu || hasOffering) ? "16px" : 0,
            }}
          >
            {/* Header Accordion Interview */}
            <div
              onClick={() => totalStages > 1 && toggleSection("interview")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                cursor: totalStages > 1 ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "#be185d",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 2px 0" }}>
                    Interview
                  </h4>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                    {schedule.interview.type === "ONLINE" ? "Online / Video Call" : "Tatap Muka"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    padding: "5px 12px",
                    background: "#fce7f3",
                    color: "#be185d",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
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

                {totalStages > 1 && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(190, 24, 93, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#be185d",
                    }}
                  >
                    {isInterviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Singkat Saat Tertutup */}
            {!isInterviewOpen && schedule.interview.score !== null && schedule.interview.score !== undefined && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #fbcfe8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#9d174d", fontWeight: 600 }}>Hasil Evaluasi Wawancara:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 800, color: "#be185d" }}>{schedule.interview.score} / 100</span>
                  {schedule.interview.result === "PASSED" && (
                    <span
                      style={{
                        fontSize: "10.5px",
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontWeight: 700,
                      }}
                    >
                      Lolos
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Konten Detail Interview Saat Terbuka */}
            {isInterviewOpen && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {formatDate(schedule.interview.scheduledAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <Clock className="w-4 h-4" style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {formatTime(schedule.interview.scheduledAt)} WIB
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "#fff",
                    borderRadius: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <MapPin className="w-4 h-4" style={{ color: "#6b7280" }} />
                  <span style={{ fontSize: "13px", color: "#111" }}>
                    {schedule.interview.location || "Online System"}
                  </span>
                </div>

                {schedule.interview.interviewer && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      <strong>Interviewer:</strong> {schedule.interview.interviewer}
                    </span>
                  </div>
                )}

                {/* Tombol Gabung Zoom (Hanya ditampilkan jika belum dievaluasi & tab mendatang) */}
                {schedule.interview.zoomLink && !schedule.interview.result && activeTab === "upcoming" && (
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
                        marginTop: "12px",
                      }}
                    >
                      <Video className="w-5 h-5" />
                      Gabung Interview Sekarang
                    </button>
                  </a>
                )}

                {/* Hasil Evaluasi & Nilai Wawancara */}
                {schedule.interview.score !== null && schedule.interview.score !== undefined && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "16px",
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: "1.5px solid #fbcfe8",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#be185d", textTransform: "uppercase" }}>
                        Hasil Evaluasi Wawancara:
                      </span>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: schedule.interview.result === "PASSED" ? "#dcfce7" : schedule.interview.result === "FAILED" ? "#fee2e2" : "#fef3c7",
                          color: schedule.interview.result === "PASSED" ? "#16a34a" : schedule.interview.result === "FAILED" ? "#dc2626" : "#d97706",
                        }}
                      >
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
          </div>
        )}

        {/* 3. KARTU MEDICAL CHECK-UP (MCU) */}
        {hasMcu && schedule.mcu && (
          <div
            style={{
              background: "#f0f9ff",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1px solid #bae6fd",
              marginBottom: hasOffering ? "16px" : 0,
            }}
          >
            {/* Header Accordion MCU */}
            <div
              onClick={() => totalStages > 1 && toggleSection("mcu")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                cursor: totalStages > 1 ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "#0284c7",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HeartPulse className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 2px 0" }}>
                    Medical Check-Up (MCU) Offline
                  </h4>
                  <p style={{ fontSize: "12px", color: "#0369a1", margin: 0 }}>
                    Kantor Balai Yasa PT KAI (Reska Multi Usaha)
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    padding: "5px 12px",
                    background: schedule.mcu.result === "FIT" ? "#dcfce7" : schedule.mcu.result === "UNFIT" ? "#fee2e2" : "#e0f2fe",
                    color: schedule.mcu.result === "FIT" ? "#16a34a" : schedule.mcu.result === "UNFIT" ? "#dc2626" : "#0284c7",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {schedule.mcu.result === "FIT" ? "FIT (Lolos MCU)" : schedule.mcu.result === "UNFIT" ? "UNFIT" : "Pemeriksaan Offline"}
                </span>

                {totalStages > 1 && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(2, 132, 199, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0284c7",
                    }}
                  >
                    {isMcuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Singkat Saat Tertutup */}
            {!isMcuOpen && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#0369a1", fontWeight: 600 }}>Hasil Medis Dokter Balai Yasa:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontWeight: 800,
                      color: schedule.mcu.result === "FIT" ? "#16a34a" : schedule.mcu.result === "UNFIT" ? "#dc2626" : "#0284c7",
                    }}
                  >
                    {schedule.mcu.result === "FIT" ? "✓ FIT (Memenuhi Syarat)" : schedule.mcu.result || "Menunggu Evaluasi"}
                  </span>
                  {schedule.mcu.document && (
                    <span
                      style={{
                        fontSize: "10.5px",
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontWeight: 700,
                      }}
                    >
                      Berkas Ada
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Konten Detail MCU Saat Terbuka */}
            {isMcuOpen && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "#0284c7" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {formatDate(schedule.mcu.scheduledAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    <Clock className="w-4 h-4" style={{ color: "#0284c7" }} />
                    <span style={{ fontSize: "13px", color: "#111" }}>
                      {formatTime(schedule.mcu.scheduledAt)} WIB
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "#fff",
                    borderRadius: "10px",
                    marginBottom: schedule.mcu.notes ? "12px" : 0,
                  }}
                >
                  <MapPin className="w-4 h-4" style={{ color: "#0284c7" }} />
                  <span style={{ fontSize: "13px", color: "#111" }}>
                    {schedule.mcu.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)"}
                  </span>
                </div>

                {/* Ketentuan Puasa & Instruksi Pemeriksaan */}
                {schedule.mcu.notes && (
                  <div
                    style={{
                      padding: "14px",
                      background: "#fffbeb",
                      borderRadius: "10px",
                      borderLeft: "4px solid #f59e0b",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "#92400e", fontWeight: 700, margin: "0 0 4px 0" }}>
                      Ketentuan & Instruksi Pemeriksaan MCU di Balai Yasa:
                    </p>
                    <p style={{ fontSize: "12.5px", color: "#78350f", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {schedule.mcu.notes}
                    </p>
                  </div>
                )}

                {/* Hasil Medis MCU Dokter Balai Yasa */}
                {schedule.mcu.result && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "14px 16px",
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: schedule.mcu.result === "FIT" ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", margin: "0 0 2px 0" }}>
                        Hasil Evaluasi Medis Dokter Balai Yasa
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 800, color: schedule.mcu.result === "FIT" ? "#16a34a" : "#dc2626", margin: 0 }}>
                        {schedule.mcu.result === "FIT" ? "✓ FIT (Memenuhi Syarat Kesehatan)" : schedule.mcu.result === "UNFIT" ? "✗ UNFIT (Tidak Memenuhi Syarat)" : "CONDITIONAL (Pemeriksaan Lanjutan)"}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: schedule.mcu.result === "FIT" ? "#dcfce7" : "#fee2e2",
                        color: schedule.mcu.result === "FIT" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {schedule.mcu.result}
                    </span>
                  </div>
                )}

                {/* Berkas Hasil Rekam Medis MCU */}
                {schedule.mcu.document && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "14px 16px",
                      background: "#f0fdf4",
                      borderRadius: "12px",
                      border: "1.5px solid #86efac",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px", flex: 1 }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          background: "#16a34a",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.15)",
                        }}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase", marginBottom: "2px" }}>
                          Berkas Rekam Medis MCU Resmi
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#166534", margin: 0, wordBreak: "break-all" }}>
                          {schedule.mcu.document.fileName}
                        </p>
                        {schedule.mcu.document.fileSize && (
                          <span style={{ fontSize: "11px", color: "#65a30d" }}>
                            {(schedule.mcu.document.fileSize / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={schedule.mcu.document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        style={{
                          padding: "8px 16px",
                          background: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Lihat / Unduh Berkas
                      </button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. KARTU OFFERING LETTER */}
        {hasOffering && schedule.offering && (
          <div
            style={{
              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #fde68a",
            }}
          >
            {/* Header Accordion Offering */}
            <div
              onClick={() => totalStages > 1 && toggleSection("offering")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                cursor: totalStages > 1 ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#92400e", margin: "0 0 2px 0" }}>
                    Offering Letter (Penawaran Kerja Resmi)
                  </h4>
                  <p style={{ fontSize: "12px", color: "#b45309", margin: 0 }}>
                    PT Reska Multi Usaha (KAI Services)
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    padding: "5px 14px",
                    background: (schedule.offering.status === "ACCEPTED" || isAcceptedApp)
                      ? "#dcfce7"
                      : (schedule.offering.status === "REJECTED" || schedule.offering.status === "DECLINED")
                      ? "#fee2e2"
                      : "#fef3c7",
                    color: (schedule.offering.status === "ACCEPTED" || isAcceptedApp)
                      ? "#16a34a"
                      : (schedule.offering.status === "REJECTED" || schedule.offering.status === "DECLINED")
                      ? "#dc2626"
                      : "#b45309",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid #fde68a",
                  }}
                >
                  {(schedule.offering.status === "ACCEPTED" || isAcceptedApp)
                    ? "✓ Disetujui (Diterima)"
                    : (schedule.offering.status === "REJECTED" || schedule.offering.status === "DECLINED")
                    ? "✗ Ditolak"
                    : "Menunggu Tanggapan"}
                </span>

                {totalStages > 1 && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#d97706",
                    }}
                  >
                    {isOfferingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Singkat Saat Tertutup */}
            {!isOfferingOpen && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#92400e", fontWeight: 600 }}>Gaji yang Ditawarkan:</span>
                <span style={{ fontWeight: 800, color: "#16a34a" }}>
                  Rp {schedule.offering.salary ? Number(schedule.offering.salary).toLocaleString("id-ID") : "-"} / bulan
                </span>
              </div>
            )}

            {/* Konten Detail Offering Saat Terbuka */}
            {isOfferingOpen && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #fef08a",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
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
                        {schedule.offering.workLocation.replace(/JakartaKantor/g, "Jakarta, Kantor")}
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
        )}
      </div>
    </div>
  );
}
