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
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Trash2,
  Users,
  Briefcase,
  Plus,
  Info,
  X,
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

        // Group schedules by job posting
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

    return Object.values(groups).sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddSchedule = async () => {
    if (!selectedJobId || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      showToast("Mohon isi semua field yang wajib", "error");
      return;
    }

    if (scheduleType === "INTERVIEW" && !scheduleForm.interviewer) {
      showToast("Nama interviewer wajib diisi", "error");
      return;
    }

    if (scheduleType === "INTERVIEW" && scheduleForm.endTime && scheduleForm.scheduledTime >= scheduleForm.endTime) {
      showToast("Jam selesai harus lebih晚 dari jam mulai", "error");
      return;
    }

    setSaving(true);
    try {
      const scheduledAt = `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`;
      const endTime = scheduleForm.endTime ? `${scheduleForm.scheduledDate}T${scheduleForm.endTime}:00` : null;

      const apiEndpoint = scheduleType === "TEST" ? "/api/admin/test-schedule" : "/api/admin/interview-schedule";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: selectedJobId,
          scheduledAt,
          endTime,
          location: scheduleForm.location,
          message: scheduleForm.message,
          ...(scheduleType === "INTERVIEW" && {
            interviewer: scheduleForm.interviewer,
            interviewType: scheduleForm.interviewType,
          }),
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setShowAddModal(false);
        setSelectedJobId("");
        setScheduleType("TEST");
        setScheduleForm({ scheduledDate: "", scheduledTime: "", endTime: "", location: "Online System", message: "", interviewer: "", interviewType: "ONLINE" });
        fetchSchedules();
      } else {
        showToast(result.error || "Gagal membuat jadwal", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleJob = (position: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(position)) {
      newExpanded.delete(position);
    } else {
      newExpanded.add(position);
    }
    setExpandedJobs(newExpanded);
    setSelectedJob(position);
  };

  const handleDeleteJob = async () => {
    if (!deleteModal.job) return;

    setDeleting(true);
    try {
      // Delete all schedules for this job posting
      const response = await fetch(`/api/admin/schedule?deleteAll=true&position=${encodeURIComponent(deleteModal.job.position)}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || "Jadwal berhasil dihapus", "success");
        setDeleteModal({ show: false, job: null });
        fetchSchedules();
      } else {
        showToast(result.error || "Gagal menghapus jadwal", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menghapus", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllSchedules = async () => {
    setDeletingAll(true);
    try {
      const response = await fetch("/api/admin/schedule?deleteAll=true", {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message, "success");
        setDeleteAllModal(false);
        fetchSchedules();
      } else {
        showToast(result.error || "Gagal menghapus semua jadwal", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menghapus", "error");
    } finally {
      setDeletingAll(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSchedules = groupedSchedules.length;
  const totalApplicants = groupedSchedules.reduce((sum, g) => sum + g.totalApplicants, 0);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Jadwal Seleksi</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Kelola jadwal tes dan interview per lowongan</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => { setScheduleType("TEST"); setShowAddModal(true); }}
              style={{ padding: "12px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FileText className="w-4 h-4" />
              Jadwalkan Tes
            </button>
            <button
              onClick={() => { setScheduleType("INTERVIEW"); setShowAddModal(true); }}
              style={{ padding: "12px 20px", background: "#be185d", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <User className="w-4 h-4" />
              Jadwalkan Interview
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#dbeafe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase className="w-6 h-6" style={{ color: "#2563eb" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{totalSchedules}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Lowongan Terjadwal</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#fce7f3", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users className="w-6 h-6" style={{ color: "#be185d" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>{totalApplicants}</p>
                <p style={{ fontSize: "13px", color: "#888" }}>Total Pelamar</p>
              </div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar className="w-6 h-6" style={{ color: "#d97706" }} />
              </div>
              <div>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "#111" }}>
                  {groupedSchedules.filter(g => g.type === "TEST").length}
                </p>
                <p style={{ fontSize: "13px", color: "#888" }}>Jadwal Tes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Job List with Tabs */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "12px" }}>
            <button
              onClick={() => setActiveTab("ALL")}
              style={{
                padding: "10px 20px",
                background: activeTab === "ALL" ? "#00205B" : "transparent",
                color: activeTab === "ALL" ? "#fff" : "#666",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Calendar className="w-4 h-4" />
              Semua ({totalSchedules})
            </button>
            <button
              onClick={() => setActiveTab("TEST")}
              style={{
                padding: "10px 20px",
                background: activeTab === "TEST" ? "#2563eb" : "transparent",
                color: activeTab === "TEST" ? "#fff" : "#2563eb",
                border: "2px solid #2563eb",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileText className="w-4 h-4" />
              Tes ({groupedSchedules.filter(g => g.type === "TEST").length})
            </button>
            <button
              onClick={() => setActiveTab("INTERVIEW")}
              style={{
                padding: "10px 20px",
                background: activeTab === "INTERVIEW" ? "#be185d" : "transparent",
                color: activeTab === "INTERVIEW" ? "#fff" : "#be185d",
                border: "2px solid #be185d",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User className="w-4 h-4" />
              Interview ({groupedSchedules.filter(g => g.type === "INTERVIEW").length})
            </button>
          </div>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                <p style={{ marginTop: "16px", color: "#888" }}>Memuat jadwal...</p>
              </div>
            ) : groupedSchedules.filter(g => activeTab === "ALL" || g.type === activeTab).length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
                <Calendar className="w-16 h-16" style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Belum Ada Jadwal</h3>
                <p style={{ fontSize: "14px" }}>Jadwalkan tes atau interview untuk pelamar</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {groupedSchedules.filter(g => activeTab === "ALL" || g.type === activeTab).map((job, index) => {
                  const isExpanded = expandedJobs.has(job.position);
                  const isSelected = selectedJob === job.position;

                  return (
                    <div
                      key={`${job.position}-${index}`}
                      style={{
                        background: isSelected ? "#f8f9fa" : "#ffffff",
                        border: `2px solid ${isSelected ? "#00205B" : "#eeeeee"}`,
                        borderRadius: "16px",
                        overflow: "hidden",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Job Header - Clickable */}
                      <div
                        onClick={() => toggleJob(job.position)}
                        style={{
                          padding: "20px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            background: job.type === "TEST" ? "#dbeafe" : "#fce7f3",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {job.type === "TEST" ? (
                              <FileText className="w-6 h-6" style={{ color: "#2563eb" }} />
                            ) : (
                              <User className="w-6 h-6" style={{ color: "#be185d" }} />
                            )}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <span style={{
                                padding: "4px 10px",
                                background: job.type === "TEST" ? "#dbeafe" : "#fce7f3",
                                color: job.type === "TEST" ? "#2563eb" : "#be185d",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}>
                                {job.type === "TEST" ? "TES" : "INTERVIEW"}
                              </span>
                              <span style={{ fontSize: "12px", color: "#888" }}>
                                {divisionLabels[job.division] || job.division}
                              </span>
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: 0 }}>{job.position}</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#666" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar className="w-4 h-4" />
                                {formatShortDate(job.scheduledAt)}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock className="w-4 h-4" />
                                {formatTime(job.scheduledAt)}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Users className="w-4 h-4" />
                                {job.totalApplicants} pelamar
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ show: true, job });
                            }}
                            style={{
                              padding: "8px",
                              background: "#fef2f2",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              color: "#dc2626",
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            background: isExpanded ? "#00205B" : "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" style={{ color: "#fff" }} />
                            ) : (
                              <ChevronRight className="w-5 h-5" style={{ color: "#666" }} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Applicants List */}
                      {isExpanded && (
                        <div style={{
                          borderTop: "1px solid #eeeeee",
                          background: "#ffffff",
                          padding: "20px",
                        }}>
                          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>
                              Daftar Pelamar ({job.applicants.length})
                            </h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#666" }}>
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {job.applicants.map((applicant, idx) => (
                              <div
                                key={applicant.applicationId}
                                style={{
                                  padding: "14px 16px",
                                  background: "#f8f9fa",
                                  borderRadius: "10px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{
                                    width: "36px",
                                    height: "36px",
                                    background: "#e5e7eb",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#666",
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111", margin: 0 }}>{applicant.applicantName}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#666" }}>
                                      <span>{formatShortDate(applicant.scheduledAt)}</span>
                                      <span>•</span>
                                      <span>{formatTime(applicant.scheduledAt)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {statusConfig[applicant.status] && (
                                    <span style={{
                                      padding: "4px 10px",
                                      background: statusConfig[applicant.status].bg,
                                      color: statusConfig[applicant.status].text,
                                      borderRadius: "20px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                    }}>
                                      {statusConfig[applicant.status].label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Job Confirmation Modal */}
      {deleteModal.show && deleteModal.job && (
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
            maxWidth: "420px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle className="w-8 h-8" style={{ color: "#dc2626" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Hapus Semua Jadwal?</h2>
              <p style={{ fontSize: "14px", color: "#666" }}>
                {deleteModal.job.position}
              </p>
              <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                {deleteModal.job.totalApplicants} pelamar • {formatDate(deleteModal.job.scheduledAt)}
              </p>
            </div>
            <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "24px", padding: "12px", background: "#fef2f2", borderRadius: "8px", textAlign: "center" }}>
              ⚠️ Semua jadwal untuk lowongan ini akan dihapus permanen
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setDeleteModal({ show: false, job: null })}
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
                onClick={handleDeleteJob}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllModal && (
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
            maxWidth: "420px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle className="w-8 h-8" style={{ color: "#dc2626" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Hapus Semua Jadwal?</h2>
              <p style={{ fontSize: "14px", color: "#666" }}>
                {totalSchedules} lowongan • {totalApplicants} pelamar
              </p>
            </div>
            <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "24px", padding: "12px", background: "#fef2f2", borderRadius: "8px", textAlign: "center" }}>
              ⚠️ Semua jadwal akan dihapus permanen. Pelamar perlu dijadwalkan ulang.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setDeleteAllModal(false)}
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
                onClick={handleDeleteAllSchedules}
                disabled={deletingAll}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: deletingAll ? "not-allowed" : "pointer",
                  opacity: deletingAll ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Trash2 className="w-4 h-4" />
                {deletingAll ? "Menghapus..." : "Ya, Hapus Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "40px", height: "40px", background: scheduleType === "TEST" ? "#2563eb" : "#be185d", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {scheduleType === "TEST" ? (
                  <FileText className="w-5 h-5" style={{ color: "#fff" }} />
                ) : (
                  <User className="w-5 h-5" style={{ color: "#fff" }} />
                )}
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>
                {scheduleType === "TEST" ? "Jadwalkan Tes" : "Jadwalkan Interview"}
              </h2>
            </div>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              {scheduleType === "TEST"
                ? "Jadwalkan tes untuk semua pelamar yang sudah lulus administrasi"
                : "Jadwalkan interview untuk semua pelamar yang sudah lulus tes"}
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Lowongan <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "#fff",
                }}
              >
                <option value="">Pilih Lowongan</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {divisionLabels[job.division] || job.division}
                  </option>
                ))}
              </select>
              {jobs.length === 0 && (
                <div style={{
                  marginTop: "12px",
                  padding: "14px 16px",
                  background: "#FEF3C7",
                  border: "1px solid #FCD34D",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}>
                  <Info className="w-5 h-5" style={{ color: "#D97706", flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#92400E", margin: 0 }}>
                      Tidak Ada Lowongan
                    </p>
                    <p style={{ fontSize: "12px", color: "#B45309", margin: "4px 0 0 0" }}>
                      Belum ada lowongan yang dibuat. Silakan buat lowongan terlebih dahulu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Tanggal <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              <input
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
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
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
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

            {/* Interview-specific fields */}
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
                    Tipe Interview
                  </label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "2px solid #e5e5e5",
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none",
                      background: "#fff",
                    }}
                  >
                    <option value="ONLINE">Online / Video Call</option>
                    <option value="OFFLINE">Offline / Tatap Muka</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                      Jam Mulai <span style={{ color: "#FF5E00" }}>*</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
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
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      placeholder="Opsional"
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
                </div>
                <p style={{ fontSize: "11px", color: "#888", marginTop: "-8px", marginBottom: "16px" }}>
                  Kosongkan jam selesai jika tidak ada batasan
                </p>
              </>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Lokasi
              </label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder={scheduleType === "INTERVIEW" ? "Contoh: Ruang Meeting Lantai 3" : "Online System"}
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
                Pesan untuk Pelamar
              </label>
              <textarea
                value={scheduleForm.message}
                onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
                placeholder="Contoh: Pastikan datang tepat waktu dan bawa KTP asli..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #e5e5e5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                Pesan ini akan ditampilkan kepada pelamar saat mereka melihat jadwal tes.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedJobId("");
                  setScheduleType("TEST");
                  setScheduleForm({ scheduledDate: "", scheduledTime: "", location: "Online System", message: "", interviewer: "", interviewType: "ONLINE" });
                }}
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
                onClick={handleAddSchedule}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#2563eb",
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
