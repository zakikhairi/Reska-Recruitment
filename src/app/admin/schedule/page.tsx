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

interface GroupedByJob {
  jobKey: string;
  position: string;
  division: string;
  type: "TEST" | "INTERVIEW";
  schedules: Schedule[];
  scheduledAt: string;
  location: string;
  totalApplicants: number;
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
  const [groupedByJob, setGroupedByJob] = useState<GroupedByJob[]>([]);
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

  const handleAddSchedule = async () => {
    if (!selectedJobId || selectedJobId.trim() === "") {
      setToast({ message: "Pilih lowongan terlebih dahulu", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      setToast({ message: "Mohon isi tanggal dan waktu", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (scheduleType === "INTERVIEW" && !scheduleForm.interviewer) {
      setToast({ message: "Nama interviewer wajib diisi", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const scheduledAt = `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`;
      const endTime = scheduleForm.endTime ? `${scheduleForm.scheduledDate}T${scheduleForm.endTime}:00` : null;
      const apiEndpoint = scheduleType === "TEST" ? "/api/admin/test-schedule" : "/api/admin/interview-schedule";

      // Build request body
      const requestBody: any = {
        jobPostingId: selectedJobId,
        scheduledAt,
        endTime,
        location: scheduleForm.location,
        message: scheduleForm.message,
      };

      if (scheduleType === "INTERVIEW") {
        requestBody.interviewer = scheduleForm.interviewer;
        requestBody.interviewType = scheduleForm.interviewType;
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: result.message, type: "success" });
        setShowAddModal(false);
        setSelectedJobId("");
        setScheduleType("TEST");
        setScheduleForm({ scheduledDate: "", scheduledTime: "", endTime: "", location: "Online System", message: "", interviewer: "", interviewType: "ONLINE" });
        fetchSchedules();
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: result.error || "Gagal membuat jadwal", type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({ message: "Terjadi kesalahan saat menyimpan", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
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
        const byJob = groupSchedulesByJobPosting(result.schedules);
        setGroupedByJob(byJob);
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

  const groupSchedulesByJobPosting = (schedules: Schedule[]): GroupedByJob[] => {
    const groups: Record<string, GroupedByJob> = {};
    schedules.forEach((schedule) => {
      const key = `${schedule.position}-${schedule.division}-${schedule.type}`;
      if (!groups[key]) {
        groups[key] = {
          jobKey: key,
          position: schedule.position,
          division: schedule.division,
          type: schedule.type,
          scheduledAt: schedule.scheduledAt,
          location: schedule.location,
          schedules: [],
          totalApplicants: 0,
        };
      }
      groups[key].schedules.push(schedule);
      groups[key].totalApplicants++;
    });
    return Object.values(groups).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  };

  const toggleJobExpand = (jobKey: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobKey)) {
      newExpanded.delete(jobKey);
    } else {
      newExpanded.add(jobKey);
    }
    setExpandedJobs(newExpanded);
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
            <button onClick={() => { setScheduleType("TEST"); setShowAddModal(true); }} style={{ padding: "12px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText className="w-4 h-4" /> Jadwalkan Tes
            </button>
            <button onClick={() => { setScheduleType("INTERVIEW"); setShowAddModal(true); }} style={{ padding: "12px 20px", background: "#be185d", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <User className="w-4 h-4" /> Jadwalkan Interview
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Calendar (60%) + List (40%) */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 100px)" }}>

        {/* LEFT: Calendar (60%) */}
        <div style={{ width: "60%", background: "#ffffff", padding: "20px", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>

          {/* Calendar Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#202124", margin: 0 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={goToToday} style={{ padding: "6px 14px", background: "#ffffff", border: "1px solid #dadce0", borderRadius: "4px", fontSize: "12px", fontWeight: 500, color: "#3c4043", cursor: "pointer" }}>
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
              <div key={day} style={{ padding: "8px 4px", textAlign: "center", fontSize: "12px", fontWeight: 500, color: "#70757a" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Fill full height */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", width: "100%", flex: 1 }}>
            {getMonthDays().map((dayInfo, index) => {
              const events = getEventsForDay(dayInfo.date);
              const todayClass = isToday(dayInfo.date);
              return (
                <div
                  key={index}
                  onClick={() => events.length > 0 && setSelectedSchedule(events[0])}
                  style={{
                    borderRight: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                    background: dayInfo.isCurrentMonth ? "#ffffff" : "#f8f9fa",
                    padding: "4px",
                    cursor: events.length > 0 ? "pointer" : "default",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{
                    width: "26px",
                    height: "26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: "12px",
                    fontWeight: todayClass ? 600 : 400,
                    color: todayClass ? "#ffffff" : dayInfo.isCurrentMonth ? "#3c4043" : "#9aa0a6",
                    background: todayClass ? "#4285f4" : "transparent",
                  }}>
                    {dayInfo.date.getDate()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginTop: "2px", width: "100%" }}>
                    {events.slice(0, 1).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedSchedule(event); }}
                        style={{
                          padding: "1px 2px",
                          background: event.type === "TEST" ? "#e8f0fe" : "#fce8f3",
                          borderLeft: `2px solid ${event.type === "TEST" ? "#4285f4" : "#ea4335"}`,
                          borderRadius: "2px",
                          fontSize: "9px",
                          fontWeight: 500,
                          color: event.type === "TEST" ? "#1967d2" : "#c5221f",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        {event.type === "TEST" ? "TES" : "INT"}
                      </div>
                    ))}
                    {events.length > 1 && (
                      <div style={{ fontSize: "9px", color: "#5f6368", textAlign: "center" }}>
                        +{events.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Jadwal per Lowongan + Detail Panel overlay */}
        <div style={{ width: "40%", background: "#f8f9fa", position: "relative", overflow: "hidden" }}>
          {/* Jadwal per Lowongan List */}
          <div style={{ width: "100%", height: "100%", background: "#f8f9fa", overflowY: "auto", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#202124", margin: 0 }}>Jadwal per Lowongan</h3>
              <span style={{ fontSize: "11px", color: "#5f6368", background: "#ffffff", padding: "3px 10px", borderRadius: "10px" }}>
                {groupedByJob.length} jadwal
              </span>
            </div>

            {groupedByJob.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                <Briefcase className="w-8 h-8" style={{ margin: "0 auto 8px", color: "#ccc" }} />
                <p style={{ fontSize: "12px", color: "#9aa0a6", margin: 0 }}>Belum ada jadwal</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {groupedByJob.map((job) => {
                  const isExpanded = expandedJobs.has(job.jobKey);
                  return (
                    <div key={job.jobKey} style={{ background: "#ffffff", borderRadius: "8px", border: `1px solid ${selectedJob === job.jobKey ? (job.type === "TEST" ? "#4285f4" : "#ea4335") : "#e0e0e0"}`, overflow: "hidden" }}>
                      <div
                        onClick={() => { toggleJobExpand(job.jobKey); setSelectedJob(job.jobKey); }}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          background: selectedJob === job.jobKey ? (job.type === "TEST" ? "#e8f0fe" : "#fce8f3") : "#ffffff",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ padding: "2px 6px", background: job.type === "TEST" ? "#4285f4" : "#ea4335", color: "#fff", borderRadius: "3px", fontSize: "9px", fontWeight: 600 }}>
                              {job.type === "TEST" ? "TES" : "INT"}
                            </span>
                            <div>
                              <p style={{ fontSize: "12px", fontWeight: 600, color: "#202124", margin: 0 }}>{job.position}</p>
                              <p style={{ fontSize: "10px", color: "#5f6368", margin: "2px 0 0 0" }}>
                                {divisionLabels[job.division] || job.division} • {job.totalApplicants} pelamar
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontSize: "10px", color: "#5f6368", margin: 0 }}>{formatDate(job.scheduledAt)}</p>
                              <p style={{ fontSize: "10px", color: "#5f6368", margin: "2px 0 0 0" }}>{formatTime(job.scheduledAt)}</p>
                            </div>
                            <ChevronDown className="w-3 h-3" style={{ color: "#5f6368", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #e0e0e0", background: "#fafafa", padding: "8px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {job.schedules.map((schedule) => {
                              const statusStyle = statusConfig[schedule.status] || { bg: "#f1f5f9", text: "#64748b", label: schedule.status };
                              return (
                                <div
                                  key={schedule.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedSchedule(schedule); }}
                                  style={{
                                    padding: "6px 10px",
                                    background: "#ffffff",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4285f4"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 500, color: "#202124" }}>{schedule.applicantName}</span>
                                    <span style={{ padding: "1px 5px", background: statusStyle.bg, color: statusStyle.text, borderRadius: "6px", fontSize: "8px", fontWeight: 600 }}>
                                      {statusStyle.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel - Slide from right */}
          <div style={{
            position: "absolute",
            top: 0,
            right: selectedSchedule ? "0" : "-100%",
            width: "100%",
            height: "100%",
            background: "#ffffff",
            overflowY: "auto",
            transition: "right 0.3s ease-out",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            zIndex: 20,
          }}>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Detail Jadwal</h3>
                <button onClick={() => setSelectedSchedule(null)} style={{ padding: "4px", background: "#f1f5f9", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  <X className="w-4 h-4" style={{ color: "#666" }} />
                </button>
              </div>

              {selectedSchedule && (
                <>
                  <div style={{ padding: "14px", background: selectedSchedule.type === "TEST" ? "#e8f0fe" : "#fce8f3", borderRadius: "10px", marginBottom: "14px" }}>
                    <span style={{ padding: "2px 6px", background: selectedSchedule.type === "TEST" ? "#4285f4" : "#ea4335", color: "#fff", borderRadius: "3px", fontSize: "9px", fontWeight: 600 }}>
                      {selectedSchedule.type === "TEST" ? "TES" : "INTERVIEW"}
                    </span>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#202124", marginTop: "10px", marginBottom: "4px" }}>{selectedSchedule.position}</h4>
                    <p style={{ fontSize: "12px", color: "#5f6368", margin: 0 }}>{selectedSchedule.applicantName}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock className="w-4 h-4" style={{ color: "#666" }} />
                      <div>
                        <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>Tanggal & Waktu</p>
                        <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", margin: 0 }}>{formatDate(selectedSchedule.scheduledAt)}, {formatTime(selectedSchedule.scheduledAt)}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="w-4 h-4" style={{ color: "#666" }} />
                      <div>
                        <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>Lokasi</p>
                        <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", margin: 0 }}>{selectedSchedule.location}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Briefcase className="w-4 h-4" style={{ color: "#666" }} />
                      <div>
                        <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>Divisi</p>
                        <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", margin: 0 }}>{divisionLabels[selectedSchedule.division] || selectedSchedule.division}</p>
                      </div>
                    </div>
                    {selectedSchedule.interviewer && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <User className="w-4 h-4" style={{ color: "#666" }} />
                        <div>
                          <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>Interviewer</p>
                          <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", margin: 0 }}>{selectedSchedule.interviewer}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button style={{ padding: "8px 12px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Calendar className="w-4 h-4" /> Ubah Jadwal
                    </button>
                    <button style={{ padding: "8px 12px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FileText className="w-4 h-4" /> Lihat Pelamar
                    </button>
                    <button style={{ padding: "8px 12px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", fontWeight: 500, color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Trash2 className="w-4 h-4" /> Hapus Jadwal
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
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
            borderRadius: "16px",
            padding: "24px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", background: scheduleType === "TEST" ? "#2563eb" : "#be185d", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {scheduleType === "TEST" ? <FileText className="w-5 h-5" style={{ color: "#fff" }} /> : <User className="w-5 h-5" style={{ color: "#fff" }} />}
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>
                {scheduleType === "TEST" ? "Jadwalkan Tes" : "Jadwalkan Interview"}
              </h2>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Lowongan <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" }}
              >
                <option value="">Pilih Lowongan</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title} - {divisionLabels[job.division] || job.division}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Tanggal <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Waktu <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="time"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>

            {scheduleType === "INTERVIEW" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                    Nama Interviewer <span style={{ color: "#FF5E00" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.interviewer}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer: e.target.value })}
                    placeholder="Contoh: Bpk. John Doe"
                    style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                    Tipe Interview
                  </label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" }}
                  >
                    <option value="ONLINE">Online / Video Call</option>
                    <option value="OFFLINE">Offline / Tatap Muka</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Lokasi
              </label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder="Online System"
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Pesan untuk Pelamar
              </label>
              <textarea
                value={scheduleForm.message}
                onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
                placeholder="Contoh: Pastikan datang tepat waktu 15 menit sebelumnya..."
                rows={3}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
              />
              <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Pesan ini akan ditampilkan ke pelamar</p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setShowAddModal(false); setSelectedJobId(""); setScheduleForm({ scheduledDate: "", scheduledTime: "", endTime: "", location: "Online System", message: "", interviewer: "", interviewType: "ONLINE" }); }}
                style={{ flex: 1, padding: "12px 20px", background: "#fff", color: "#666", border: "2px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={saving}
                style={{ flex: 1, padding: "12px 20px", background: scheduleType === "TEST" ? "#2563eb" : "#be185d", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
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
