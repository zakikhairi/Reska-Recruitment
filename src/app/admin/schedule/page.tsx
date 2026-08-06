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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Users,
  Briefcase,
  Plus,
  Info,
  X,
  List,
  Grid3X3,
} from "lucide-react";
import { useJobsStore, Job } from "@/stores/jobs";

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
  applicantId?: string;
}

interface GroupedSchedule {
  position: string;
  division: string;
  type: "TEST" | "INTERVIEW";
  scheduledAt: string;
  location: string;
  applicants: {
    id: string;
    applicationId: string;
    applicantName: string;
    status: string;
    scheduledAt: string;
    location: string;
  }[];
  totalApplicants: number;
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: GroupedSchedule | null }>({ show: false, job: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<"TEST" | "INTERVIEW">("TEST");
  const [activeTab, setActiveTab] = useState<"TEST" | "INTERVIEW" | "ALL">("ALL");
  const [jobs, setJobs] = useState<{ id: string; title: string; division: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    endTime: "",
    location: "Online System",
    message: "",
    interviewer: "",
    interviewType: "ONLINE",
  });
  const [saving, setSaving] = useState(false);

  // Calendar state - Google Calendar style
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Calendar helpers
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getEventsForDay = (date: Date) => {
    return schedules.filter((s) => {
      const eventDate = new Date(s.scheduledAt);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedSchedule && date.toDateString() === new Date(selectedSchedule.scheduledAt).toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  useEffect(() => {
    fetchSchedules();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/admin/jobs");
      const result = await response.json();
      if (result.jobs) {
        setJobs(result.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/schedule");
      const result = await response.json();
      if (result.success) {
        setSchedules(result.schedules);
        const grouped = groupSchedulesByJob(result.schedules);
        setGroupedSchedules(grouped);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupSchedulesByJob = (schedules: Schedule[]): GroupedSchedule[] => {
    const groups: Record<string, GroupedSchedule> = {};
    schedules.forEach((schedule) => {
      const key = `${schedule.position}-${schedule.division}-${schedule.type}`;
      if (!groups[key]) {
        groups[key] = {
          position: schedule.position,
          division: schedule.division,
          type: schedule.type,
          scheduledAt: schedule.scheduledAt,
          location: schedule.location,
          applicants: [],
          totalApplicants: 0,
        };
      }
      groups[key].applicants.push({
        id: schedule.id,
        applicationId: schedule.applicationId,
        applicantName: schedule.applicantName,
        status: schedule.status,
        scheduledAt: schedule.scheduledAt,
        location: schedule.location,
      });
      groups[key].totalApplicants++;
    });
    return Object.values(groups).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  };

  const totalSchedules = groupedSchedules.length;
  const totalApplicants = groupedSchedules.reduce((sum, g) => sum + g.totalApplicants, 0);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "0" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Jadwal Seleksi</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>{totalSchedules} jadwal • {totalApplicants} pelamar</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setScheduleType("TEST")} style={{ padding: "12px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText className="w-4 h-4" /> Jadwalkan Tes
            </button>
            <button onClick={() => setScheduleType("INTERVIEW")} style={{ padding: "12px 20px", background: "#be185d", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <User className="w-4 h-4" /> Jadwalkan Interview
            </button>
          </div>
        </div>
      </header>

      {/* Split Layout: Left = Calendar (Square), Right = Schedule List */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 100px)" }}>

        {/* LEFT SIDE: Calendar (Square 50%) */}
        <div style={{ width: "50%", background: "#ffffff", padding: "20px", borderRight: "1px solid #e0e0e0" }}>

          {/* Calendar Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#202124", margin: 0 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={goToToday} style={{ padding: "6px 12px", background: "#ffffff", border: "1px solid #dadce0", borderRadius: "4px", fontSize: "12px", fontWeight: 500, color: "#3c4043", cursor: "pointer" }}>
                Hari Ini
              </button>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={prevMonth} style={{ padding: "6px", background: "#ffffff", border: "1px solid #dadce0", borderRadius: "4px", cursor: "pointer" }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: "#5f6368" }} />
                </button>
                <button onClick={nextMonth} style={{ padding: "6px", background: "#ffffff", border: "1px solid #dadce0", borderRadius: "4px", cursor: "pointer" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "#5f6368" }} />
                </button>
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #e0e0e0" }}>
            {dayNames.map((day) => (
              <div key={day} style={{ padding: "8px 4px", textAlign: "center", fontSize: "11px", fontWeight: 500, color: "#70757a" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Square cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", width: "100%", aspectRatio: "1" }}>
            {getMonthDays().map((dayInfo, index) => {
              const events = getEventsForDay(dayInfo.date);
              const todayClass = isToday(dayInfo.date);
              return (
                <div
                  key={index}
                  onClick={() => events.length > 0 && setSelectedSchedule(events[0])}
                  style={{
                    aspectRatio: "1/1",
                    borderRight: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                    background: dayInfo.isCurrentMonth ? "#ffffff" : "#f8f9fa",
                    padding: "2px",
                    cursor: events.length > 0 ? "pointer" : "default",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: "10px",
                    fontWeight: todayClass ? 600 : 400,
                    color: todayClass ? "#ffffff" : dayInfo.isCurrentMonth ? "#3c4043" : "#9aa0a6",
                    background: todayClass ? "#4285f4" : "transparent",
                    marginBottom: "1px",
                  }}>
                    {dayInfo.date.getDate()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                    {events.slice(0, 1).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedSchedule(event); }}
                        style={{
                          padding: "1px 3px",
                          background: event.type === "TEST" ? "#e8f0fe" : "#fce8f3",
                          borderLeft: `2px solid ${event.type === "TEST" ? "#4285f4" : "#ea4335"}`,
                          borderRadius: "3px",
                          fontSize: "8px",
                          fontWeight: 500,
                          color: event.type === "TEST" ? "#1967d2" : "#c5221f",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                      >
                        {event.type === "TEST" ? "TES" : "INT"}
                      </div>
                    ))}
                    {events.length > 1 && (
                      <div style={{ fontSize: "7px", color: "#5f6368", padding: "0 2px" }}>
                        +{events.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Schedule List (50%) */}
        <div style={{ width: "50%", background: "#f8f9fa", padding: "20px", overflowY: "auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#202124", marginBottom: "16px" }}>Jadwal Tes & Interview</h3>

          {/* Test Schedules */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", background: "#4285f4", borderRadius: "2px" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>Tes</span>
              <span style={{ fontSize: "11px", color: "#5f6368" }}>({schedules.filter(s => s.type === "TEST").length})</span>
            </div>
            {schedules.filter(s => s.type === "TEST").length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                <p style={{ fontSize: "12px", color: "#9aa0a6", margin: 0 }}>Belum ada jadwal tes</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {schedules.filter(s => s.type === "TEST").slice(0, 5).map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    style={{
                      padding: "12px",
                      background: selectedSchedule?.id === schedule.id ? "#e8f0fe" : "#ffffff",
                      border: `1px solid ${selectedSchedule?.id === schedule.id ? "#4285f4" : "#e0e0e0"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>{schedule.position}</span>
                      <span style={{ fontSize: "10px", color: "#5f6368" }}>{formatTime(schedule.scheduledAt)}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#5f6368" }}>{schedule.applicantName}</div>
                    <div style={{ fontSize: "11px", color: "#5f6368", marginTop: "4px" }}>{formatDate(schedule.scheduledAt)} • {schedule.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview Schedules */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", background: "#ea4335", borderRadius: "2px" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>Interview</span>
              <span style={{ fontSize: "11px", color: "#5f6368" }}>({schedules.filter(s => s.type === "INTERVIEW").length})</span>
            </div>
            {schedules.filter(s => s.type === "INTERVIEW").length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                <p style={{ fontSize: "12px", color: "#9aa0a6", margin: 0 }}>Belum ada jadwal interview</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {schedules.filter(s => s.type === "INTERVIEW").slice(0, 5).map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    style={{
                      padding: "12px",
                      background: selectedSchedule?.id === schedule.id ? "#fce8f3" : "#ffffff",
                      border: `1px solid ${selectedSchedule?.id === schedule.id ? "#ea4335" : "#e0e0e0"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>{schedule.position}</span>
                      <span style={{ fontSize: "10px", color: "#5f6368" }}>{formatTime(schedule.scheduledAt)}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#5f6368" }}>{schedule.applicantName}</div>
                    <div style={{ fontSize: "11px", color: "#5f6368", marginTop: "4px" }}>{formatDate(schedule.scheduledAt)} • {schedule.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Event Detail Modal */}
      {selectedSchedule && (
        <div style={{ maxWidth: "800px", margin: "24px auto", padding: "0 32px" }}>
          <div style={{ background: "#ffffff", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: selectedSchedule.type === "TEST" ? "#e8f0fe" : "#fce8f3", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedSchedule.type === "TEST" ? <FileText className="w-5 h-5" style={{ color: "#4285f4" }} /> : <User className="w-5 h-5" style={{ color: "#ea4335" }} />}
                </div>
                <div>
                  <span style={{ padding: "4px 8px", background: selectedSchedule.type === "TEST" ? "#4285f4" : "#ea4335", color: "#ffffff", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>
                    {selectedSchedule.type === "TEST" ? "TES" : "INTERVIEW"}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedSchedule(null)} style={{ padding: "8px", background: "transparent", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                <X className="w-5 h-5" style={{ color: "#5f6368" }} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#202124", marginBottom: "16px" }}>{selectedSchedule.position}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock className="w-5 h-5" style={{ color: "#5f6368" }} />
                  <div>
                    <p style={{ fontSize: "12px", color: "#70757a", margin: 0 }}>Waktu</p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#202124", margin: 0 }}>{formatDate(selectedSchedule.scheduledAt)} • {formatTime(selectedSchedule.scheduledAt)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin className="w-5 h-5" style={{ color: "#5f6368" }} />
                  <div>
                    <p style={{ fontSize: "12px", color: "#70757a", margin: 0 }}>Lokasi</p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#202124", margin: 0 }}>{selectedSchedule.location}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User className="w-5 h-5" style={{ color: "#5f6368" }} />
                  <div>
                    <p style={{ fontSize: "12px", color: "#70757a", margin: 0 }}>Pelamar</p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#202124", margin: 0 }}>{selectedSchedule.applicantName}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Briefcase className="w-5 h-5" style={{ color: "#5f6368" }} />
                  <div>
                    <p style={{ fontSize: "12px", color: "#70757a", margin: 0 }}>Divisi</p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#202124", margin: 0 }}>{divisionLabels[selectedSchedule.division] || selectedSchedule.division}</p>
                  </div>
                </div>
              </div>
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
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: "14px",
          fontWeight: 600,
        }}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
