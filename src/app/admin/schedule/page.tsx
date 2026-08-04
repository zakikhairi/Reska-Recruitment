"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";

interface Schedule {
  id: string;
  applicationId: string;
  type: "TEST" | "INTERVIEW";
  scheduledAt: string;
  location: string;
  applicantName: string;
  position: string;
  division: string;
  status: string;
  interviewer?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  TEST_SCHEDULED: { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" },
  IN_TEST: { bg: "#e0e7ff", text: "#4f46e5", label: "Sedang Tes" },
  TEST_COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" },
  INTERVIEW: { bg: "#fce7f3", text: "#be185d", label: "Interview" },
  MCU: { bg: "#d1fae5", text: "#059669", label: "MCU" },
  OFFERING: { bg: "#fef3c7", text: "#d97706", label: "Offering" },
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [testSchedules, setTestSchedules] = useState<Schedule[]>([]);
  const [interviewSchedules, setInterviewSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "TEST" | "INTERVIEW">("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Current month for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/schedule");
      const result = await response.json();

      if (result.success) {
        setSchedules(result.schedules);
        setTestSchedules(result.testSchedules);
        setInterviewSchedules(result.interviewSchedules);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openScheduleModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      scheduledDate: "",
      scheduledTime: "",
      location: schedule.type === "INTERVIEW" ? "" : "Online System",
      notes: "",
    });
    setShowModal(true);
  };

  const handleSubmitSchedule = async () => {
    if (!selectedSchedule || !formData.scheduledDate || !formData.scheduledTime) {
      showToast("Mohon isi semua field yang wajib", "error");
      return;
    }

    setSaving(true);
    try {
      const scheduledAt = `${formData.scheduledDate}T${formData.scheduledTime}:00`;

      const response = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedSchedule.applicationId,
          type: selectedSchedule.type,
          scheduledAt,
          location: formData.location,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setShowModal(false);
        fetchSchedules();
      } else {
        showToast(result.error, "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledAt);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Add empty days for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add empty days for remaining cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const filteredSchedules =
    filter === "all"
      ? schedules
      : schedules.filter((s) => s.type === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calendarDays = generateCalendarDays();

  // Get upcoming schedules (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingSchedules = schedules.filter((s) => {
    const scheduleDate = new Date(s.scheduledAt);
    return scheduleDate >= today && scheduleDate <= nextWeek;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Jadwal Seleksi</h1>
          <p style={{ fontSize: "15px", color: "#666666" }}>Kelola jadwal tes dan interview pelamar</p>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#dbeafe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText className="w-6 h-6" style={{ color: "#2563eb" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{testSchedules.length}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Jadwal Tes</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#fce7f3", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User className="w-6 h-6" style={{ color: "#be185d" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{interviewSchedules.length}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Jadwal Interview</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock className="w-6 h-6" style={{ color: "#d97706" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{upcomingSchedules.length}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Minggu Ini</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#dcfce7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle className="w-6 h-6" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{schedules.filter(s => s.status === "TEST_COMPLETED" || s.status === "INTERVIEW").length}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Selesai</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Calendar View */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Kalender</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: "#666" }} />
                </button>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#111", minWidth: "140px", textAlign: "center" }}>
                  {currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  style={{ padding: "8px", background: "#f8f9fa", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  <ChevronRight className="w-5 h-5" style={{ color: "#666" }} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                <div key={day} style={{ padding: "8px", fontSize: "12px", fontWeight: 600, color: "#888" }}>
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const daySchedules = getSchedulesForDate(day);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = day.toDateString() === today.toDateString();

                return (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      minHeight: "60px",
                      background: isToday ? "#f0f4ff" : isCurrentMonth ? "#ffffff" : "#f8f9fa",
                      borderRadius: "8px",
                      border: isToday ? "2px solid #00205B" : "1px solid #eee",
                    }}
                  >
                    <span style={{
                      fontSize: "12px",
                      fontWeight: isToday ? 700 : 500,
                      color: isCurrentMonth ? "#111" : "#ccc"
                    }}>
                      {day.getDate()}
                    </span>
                    {daySchedules.length > 0 && (
                      <div style={{ marginTop: "4px" }}>
                        {daySchedules.slice(0, 2).map((s, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: "9px",
                              padding: "2px 4px",
                              background: s.type === "TEST" ? "#dbeafe" : "#fce7f3",
                              color: s.type === "TEST" ? "#2563eb" : "#be185d",
                              borderRadius: "4px",
                              marginBottom: "2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.type === "TEST" ? "Tes" : "Interview"}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <span style={{ fontSize: "9px", color: "#888" }}>+{daySchedules.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule List */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Jadwal</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setFilter("all")}
                  style={{
                    padding: "6px 12px",
                    background: filter === "all" ? "#00205B" : "#f8f9fa",
                    color: filter === "all" ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter("TEST")}
                  style={{
                    padding: "6px 12px",
                    background: filter === "TEST" ? "#2563eb" : "#f8f9fa",
                    color: filter === "TEST" ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Tes
                </button>
                <button
                  onClick={() => setFilter("INTERVIEW")}
                  style={{
                    padding: "6px 12px",
                    background: filter === "INTERVIEW" ? "#be185d" : "#f8f9fa",
                    color: filter === "INTERVIEW" ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Interview
                </button>
              </div>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                  <Calendar className="w-12 h-12" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                  <p>Belum ada jadwal</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {filteredSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        padding: "16px",
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        border: `2px solid ${schedule.type === "TEST" ? "#dbeafe" : "#fce7f3"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{
                              padding: "4px 8px",
                              background: schedule.type === "TEST" ? "#dbeafe" : "#fce7f3",
                              color: schedule.type === "TEST" ? "#2563eb" : "#be185d",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}>
                              {schedule.type === "TEST" ? "Tes" : "Interview"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#888" }}>
                              {divisionLabels[schedule.division] || schedule.division}
                            </span>
                          </div>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111", margin: 0 }}>{schedule.position}</h4>
                          <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>{schedule.applicantName}</p>
                        </div>
                        {statusConfig[schedule.status] && (
                          <span style={{
                            padding: "4px 10px",
                            background: statusConfig[schedule.status].bg,
                            color: statusConfig[schedule.status].text,
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}>
                            {statusConfig[schedule.status].label}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#666" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar className="w-4 h-4" />
                          {formatDate(schedule.scheduledAt)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock className="w-4 h-4" />
                          {formatTime(schedule.scheduledAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#666", marginTop: "8px" }}>
                        <MapPin className="w-4 h-4" />
                        {schedule.location}
                      </div>
                      <button
                        onClick={() => openScheduleModal(schedule)}
                        style={{
                          marginTop: "12px",
                          padding: "8px 16px",
                          background: schedule.type === "TEST" ? "#2563eb" : "#be185d",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        Atur Ulang Jadwal
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && selectedSchedule && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>
              Atur Jadwal {selectedSchedule.type === "TEST" ? "Tes" : "Interview"}
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              {selectedSchedule.applicantName} - {selectedSchedule.position}
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Tanggal <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Waktu <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Lokasi <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={selectedSchedule.type === "TEST" ? "Online System" : "Kantor KAI Services"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#fff",
                  color: "#666",
                  border: "2px solid #e5e5e5",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitSchedule}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: selectedSchedule.type === "TEST" ? "#2563eb" : "#be185d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 24px",
          background: toast.type === "success" ? "#10B981" : "#EF4444",
          color: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          fontSize: "14px",
          fontWeight: 600,
        }}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
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
