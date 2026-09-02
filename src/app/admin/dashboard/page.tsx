"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  Filter,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  ChevronRight,
  RefreshCw,
  X,
  FileText,
  Calendar,
  UserPlus,
  AlertTriangle,
  CheckCheck,
  Check,
} from "lucide-react";
import { useJobsStore } from "@/stores/jobs";

const stats: { label: string; value: string; change: string; trend: "up" | "down"; icon: any; color: string }[] = [];
const statusDistribution = [
  { name: "Pending", value: 0, color: "#F59E0B" },
  { name: "Verifikasi", value: 0, color: "#d97706" },
  { name: "Tes Terjadwal", value: 0, color: "#8B5CF6" },
  { name: "Sedang Tes", value: 0, color: "#f59e0b" },
  { name: "Tes Selesai", value: 0, color: "#22c55e" },
  { name: "Interview", value: 0, color: "#3B82F6" },
  { name: "MCU", value: 0, color: "#a855f7" },
  { name: "Offering", value: 0, color: "#14b8a6" },
  { name: "Diterima", value: 0, color: "#10B981" },
  { name: "Ditolak", value: 0, color: "#EF4444" },
];
const monthlyTrend = [
  { month: "Jan", pelamar: 0, lulus: 0 },
  { month: "Feb", pelamar: 0, lulus: 0 },
  { month: "Mar", pelamar: 0, lulus: 0 },
  { month: "Apr", pelamar: 0, lulus: 0 },
  { month: "Mei", pelamar: 0, lulus: 0 },
  { month: "Jun", pelamar: 0, lulus: 0 },
  { month: "Jul", pelamar: 0, lulus: 0 },
  { month: "Agt", pelamar: 0, lulus: 0 },
  { month: "Sep", pelamar: 0, lulus: 0 },
  { month: "Okt", pelamar: 0, lulus: 0 },
  { month: "Nov", pelamar: 0, lulus: 0 },
  { month: "Des", pelamar: 0, lulus: 0 },
];
const recentApplications: any[] = [];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "INTERVIEW": return { bg: "#dbeafe", text: "#2563eb", label: "Interview", icon: <Clock className="w-3 h-3" /> };
    case "TEST_COMPLETED": return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "ADMIN_CHECK": return { bg: "#fef3c7", text: "#d97706", label: "Verifikasi", icon: <AlertCircle className="w-3 h-3" /> };
    case "REJECTED": return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: <XCircle className="w-3 h-3" /> };
    case "TEST_SCHEDULED": return { bg: "#e0e7ff", text: "#4f46e5", label: "Tes Terjadwal", icon: <Clock className="w-3 h-3" /> };
    case "MCU": return { bg: "#fae8ff", text: "#c026d3", label: "MCU", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "OFFERING": return { bg: "#fef3c7", text: "#d97706", label: "Offering", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "ACCEPTED": return { bg: "#dcfce7", text: "#16a34a", label: "Diterima", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "PENDING": return { bg: "#f1f5f9", text: "#64748b", label: "Pending", icon: <Clock className="w-3 h-3" /> };
    case "IN_TEST": return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes", icon: <Clock className="w-3 h-3" /> };
    default: return { bg: "#f1f5f9", text: "#64748b", label: status, icon: <Clock className="w-3 h-3" /> };
  }
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  ADMIN_CHECK: "Verifikasi",
  TEST_SCHEDULED: "Tes Terjadwal",
  IN_TEST: "Sedang Tes",
  TEST_COMPLETED: "Tes Selesai",
  INTERVIEW: "Interview",
  MCU: "MCU",
  OFFERING: "Offering",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

// Types for notifications
interface Notification {
  id: string;
  type: "new_applicant" | "status_change" | "test_due" | "deadline" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatusFilterDropdown({ statusFilter, setStatusFilter }: { statusFilter: string; setStatusFilter: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          padding: "10px 16px",
          border: `2px solid ${statusFilter !== "all" ? "#FF5E00" : "#eeeeee"}`,
          background: statusFilter !== "all" ? "#fff7f0" : "#ffffff",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 600,
          color: statusFilter !== "all" ? "#FF5E00" : "#666666",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Filter className="w-4 h-4" />
        {statusFilter === "all" ? "Filter" : statusLabels[statusFilter] || statusFilter}
      </button>
      {show && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "8px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          border: "1px solid #eeeeee",
          zIndex: 100,
          minWidth: "200px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "8px" }}>
            <button
              onClick={() => { setStatusFilter("all"); setShow(false); }}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "none",
                background: statusFilter === "all" ? "#fff7f0" : "transparent",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: statusFilter === "all" ? 600 : 500,
                color: statusFilter === "all" ? "#FF5E00" : "#666666",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              Semua Status
            </button>
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setStatusFilter(key); setShow(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: statusFilter === key ? "#fff7f0" : "transparent",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: statusFilter === key ? 600 : 500,
                  color: statusFilter === key ? "#FF5E00" : "#666666",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { jobs, _hasHydrated } = useJobsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applications, setApplications] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<typeof stats>([]);
  const [statusDist, setStatusDist] = useState<typeof statusDistribution>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successStatus, setSuccessStatus] = useState("");

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Helper to get dismissed IDs directly from localStorage (not from state)
  const getDismissedIdsFromStorage = (): string[] => {
    try {
      const saved = localStorage.getItem('dismissedNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  // Helper to save dismissed IDs to localStorage
  const saveDismissedIds = (ids: string[]) => {
    localStorage.setItem('dismissedNotifications', JSON.stringify(ids));
  };

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Monthly data state - initialize with proper data
  const [monthlyData, setMonthlyData] = useState<Array<{month: string; pelamar: number; lulus: number}>>([
    { month: "Jan", pelamar: 0, lulus: 0 },
    { month: "Feb", pelamar: 0, lulus: 0 },
    { month: "Mar", pelamar: 0, lulus: 0 },
    { month: "Apr", pelamar: 0, lulus: 0 },
    { month: "Mei", pelamar: 0, lulus: 0 },
    { month: "Jun", pelamar: 0, lulus: 0 },
    { month: "Jul", pelamar: 0, lulus: 0 },
    { month: "Agt", pelamar: 0, lulus: 0 },
    { month: "Sep", pelamar: 0, lulus: 0 },
    { month: "Okt", pelamar: 0, lulus: 0 },
    { month: "Nov", pelamar: 0, lulus: 0 },
    { month: "Des", pelamar: 0, lulus: 0 },
  ]);

  useEffect(() => {
    loadData();
  }, [_hasHydrated, jobs.length]);

  // Reload data periodically or on focus
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = async () => {
    try {
      // Fetch applications from API
      const response = await fetch('/api/admin/applications');
      const result = await response.json();

      if (result.success) {
        const apps = result.applications.map((app: any) => ({
          ...app,
          applicationId: app.id,
          jobTitle: app.job?.title || "Lowongan",
          division: app.job?.division || "Umum",
          applicantName: app.applicant?.fullName || app.applicant?.email?.split("@")[0] || "Pelamar",
        }));

        setApplications(apps);

        // Calculate stats
        const totalApplicants = apps.length;
        const activeJobsCount = jobs.filter((j: any) => j.status === "ACTIVE").length;
        const completedTests = apps.filter((a: any) => a.status === "TEST_COMPLETED").length;
        const passedTests = apps.filter((a: any) => ["ACCEPTED", "INTERVIEW", "MCU", "OFFERED"].includes(a.status)).length;
        const passingRate = totalApplicants > 0 ? Math.round((passedTests / totalApplicants) * 100) : 0;

        setStatsData([
          { label: "Total Pelamar", value: totalApplicants.toString(), change: "+0%", trend: totalApplicants > 0 ? "up" : "down", icon: Users, color: "#00205B" },
          { label: "Tes Diselesaikan", value: completedTests.toString(), change: "+0%", trend: completedTests > 0 ? "up" : "down", icon: ClipboardCheck, color: "#16a34a" },
          { label: "Passing Rate", value: `${passingRate}%`, change: "+0%", trend: passingRate > 50 ? "up" : "down", icon: TrendingUp, color: "#f59e0b" },
          { label: "Lowongan Aktif", value: activeJobsCount.toString(), change: "+0%", trend: activeJobsCount > 0 ? "up" : "down", icon: Briefcase, color: "#8b5cf6" },
        ]);

        // Status distribution
        const statusCounts = apps.reduce((acc: any, app: any) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStatusDist([
          { name: "Pending", value: statusCounts["PENDING"] || 0, color: "#F59E0B" },
          { name: "Verifikasi", value: statusCounts["ADMIN_CHECK"] || 0, color: "#d97706" },
          { name: "Tes Terjadwal", value: statusCounts["TEST_SCHEDULED"] || 0, color: "#8B5CF6" },
          { name: "Sedang Tes", value: statusCounts["IN_TEST"] || 0, color: "#f59e0b" },
          { name: "Tes Selesai", value: statusCounts["TEST_COMPLETED"] || 0, color: "#22c55e" },
          { name: "Interview", value: statusCounts["INTERVIEW"] || 0, color: "#3B82F6" },
          { name: "MCU", value: statusCounts["MCU"] || 0, color: "#a855f7" },
          { name: "Offering", value: statusCounts["OFFERING"] || 0, color: "#14b8a6" },
          { name: "Diterima", value: statusCounts["ACCEPTED"] || 0, color: "#10B981" },
          { name: "Ditolak", value: statusCounts["REJECTED"] || 0, color: "#EF4444" },
        ]);

        // Calculate monthly trend
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const monthlyApplicants = new Array(12).fill(0);
        const monthlyPassed = new Array(12).fill(0);

        console.log("Total applications:", apps.length);
        apps.forEach((app: any) => {
          const date = new Date(app.createdAt);
          const monthIndex = date.getMonth();
          console.log("App createdAt:", app.createdAt, "-> month:", monthIndex, monthNames[monthIndex]);
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyApplicants[monthIndex]++;
            if (["ACCEPTED", "OFFERING", "MCU", "INTERVIEW", "TEST_COMPLETED"].includes(app.status)) {
              monthlyPassed[monthIndex]++;
            }
          }
        });

        console.log("Monthly applicants:", monthlyApplicants);
        console.log("Monthly passed:", monthlyPassed);

        setMonthlyData(monthNames.map((month, i) => ({
          month,
          pelamar: monthlyApplicants[i],
          lulus: monthlyPassed[i],
        })));

        // Generate notifications from application data
        const newNotifications: Notification[] = [];
        const now = new Date();

        // Check for applications needing verification (ADMIN_CHECK status)
        const pendingVerification = apps.filter((a: any) => a.status === "ADMIN_CHECK");
        if (pendingVerification.length > 0) {
          newNotifications.push({
            id: "pending-verification",
            type: "new_applicant",
            title: "Verifikasi Tertunda",
            message: `${pendingVerification.length} pelamar menunggu verifikasi dokumen`,
            time: "Baru saja",
            isRead: false,
            actionUrl: "/admin/applicants",
            icon: <AlertCircle className="w-5 h-5" />,
            iconBg: "#fef3c7",
            iconColor: "#d97706",
          });
        }

        // Check for applications in test (IN_TEST)
        const inTest = apps.filter((a: any) => a.status === "IN_TEST");
        if (inTest.length > 0) {
          newNotifications.push({
            id: "in-test",
            type: "test_due",
            title: "Tes Sedang Berlangsung",
            message: `${inTest.length} pelamar sedang mengerjakan tes`,
            time: "Sekarang",
            isRead: false,
            actionUrl: "/admin/schedule",
            icon: <FileText className="w-5 h-5" />,
            iconBg: "#dbeafe",
            iconColor: "#2563eb",
          });
        }

        // Check for interview scheduled
        const interviewScheduled = apps.filter((a: any) => a.status === "INTERVIEW");
        if (interviewScheduled.length > 0) {
          newNotifications.push({
            id: "interview-scheduled",
            type: "status_change",
            title: "Interview Terjadwal",
            message: `${interviewScheduled.length} pelamar menunggu interview`,
            time: "Hari ini",
            isRead: false,
            actionUrl: "/admin/schedule",
            icon: <Calendar className="w-5 h-5" />,
            iconBg: "#e0e7ff",
            iconColor: "#4f46e5",
          });
        }

        // Check for new applications (most recent - ADMIN_CHECK or PENDING)
        const newApps = apps
          .filter((a: any) => ["ADMIN_CHECK", "PENDING"].includes(a.status))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        newApps.forEach((app: any, index: number) => {
          const appDate = new Date(app.createdAt);
          const diffHours = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60));
          const timeAgo = diffHours < 1 ? "Baru saja" : diffHours < 24 ? `${diffHours} jam lalu` : `${Math.floor(diffHours / 24)} hari lalu`;

          newNotifications.push({
            id: `new-app-${app.id}`,
            type: "new_applicant",
            title: "Lamaran Baru",
            message: `${app.applicantName} melamar ${app.jobTitle}`,
            time: timeAgo,
            isRead: false,
            actionUrl: `/admin/applicants/${app.id}`,
            icon: <UserPlus className="w-5 h-5" />,
            iconBg: "#dcfce7",
            iconColor: "#16a34a",
          });
        });

        // Check for jobs with approaching deadline
        const approachingDeadline = jobs.filter((j: any) => {
          if (j.status !== "ACTIVE") return false;
          const deadline = new Date(j.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7 && daysLeft > 0;
        });

        if (approachingDeadline.length > 0) {
          approachingDeadline.forEach((job: any) => {
            const deadline = new Date(job.deadline);
            const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `deadline-${job.id}`,
              type: "deadline",
              title: "Deadline Mendekat",
              message: `Lowongan "${job.title}" deadline dalam ${daysLeft} hari`,
              time: `${daysLeft} hari lagi`,
              isRead: false,
              actionUrl: `/admin/jobs/${job.id}`,
              icon: <AlertTriangle className="w-5 h-5" />,
              iconBg: "#fee2e2",
              iconColor: "#dc2626",
            });
          });
        }

        // Add system notification if no important notifications
        if (newNotifications.length === 0) {
          newNotifications.push({
            id: "system-welcome",
            type: "system",
            title: "Selamat Datang",
            message: "Tidak ada notifikasi penting saat ini",
            time: "Sekarang",
            isRead: true,
            icon: <CheckCheck className="w-5 h-5" />,
            iconBg: "#f1f5f9",
            iconColor: "#64748b",
          });
        }

        // Remove dismissed notifications from the list (persisted in localStorage)
        const dismissedIds = getDismissedIdsFromStorage();
        const filteredNotifications = newNotifications.filter(
          n => !dismissedIds.includes(n.id)
        );
        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    if (!applicationId) return;

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        loadData(); // Refresh data
        setSuccessStatus(getStatusConfig(newStatus).label);
        setSuccessMessage(`Status berhasil diubah ke`);
        setShowSuccessModal(true);
        // Auto close after 3 seconds
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        setSuccessMessage(result.error || "Terjadi kesalahan");
        setSuccessStatus("error");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      setSuccessMessage("Terjadi kesalahan saat mengupdate status");
      setSuccessStatus("error");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  // Remove notification from list and save to localStorage
  const removeNotification = (id: string) => {
    const currentDismissed = getDismissedIdsFromStorage();
    const newDismissed = [...currentDismissed, id];
    saveDismissedIds(newDismissed);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setShowNotifications(false);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    const currentDismissed = getDismissedIdsFromStorage();
    const newDismissed = [...currentDismissed, ...allIds.filter(id => !currentDismissed.includes(id))];
    saveDismissedIds(newDismissed);
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
  };

  // Filter and sort applications based on search query
  const filteredApplications = applications
    .filter((app) => {
      // Filter by status if not "all"
      if (statusFilter !== "all" && app.status !== statusFilter) return false;

      // If no search query, show all
      if (!searchQuery.trim()) return true;

      // Search by name (case insensitive)
      const query = searchQuery.toLowerCase();
      return app.applicantName?.toLowerCase().includes(query) || app.jobTitle?.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Wait for hydration
  if (!_hasHydrated || isLoading) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Dashboard HR</h1>
            <p style={{ fontSize: "15px", color: "#666666" }}>Ringkasan aktivitas rekrutmen • Juli 2026</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={loadData}
              style={{ padding: "10px", background: "#f1f5f9", border: "none", borderRadius: "12px", cursor: "pointer" }}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" style={{ color: "#64748b" }} />
            </button>
            {/* Notification Bell Button */}
            <div ref={notificationRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: "relative",
                  padding: "10px",
                  background: showNotifications ? "#fff7f0" : "#f1f5f9",
                  border: showNotifications ? "2px solid #FF5E00" : "2px solid transparent",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Bell className="w-5 h-5" style={{ color: showNotifications ? "#FF5E00" : "#64748b" }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    minWidth: "18px",
                    height: "18px",
                    background: "#ef4444",
                    borderRadius: "9px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px"
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "380px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                  border: "1px solid #eeeeee",
                  zIndex: 1000,
                  overflow: "hidden",
                  animation: "slideDown 0.2s ease-out"
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eeeeee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fafafa"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111111" }}>Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span style={{
                          padding: "2px 8px",
                          background: "#ef4444",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#ffffff"
                        }}>
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          style={{
                            padding: "6px 12px",
                            background: "transparent",
                            border: "1px solid #eeeeee",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#666666",
                            cursor: "pointer"
                          }}
                        >
                          Hapus semua
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{
                          padding: "6px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <X className="w-4 h-4" style={{ color: "#666666" }} />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "40px 20px", textAlign: "center" }}>
                        <Bell className="w-12 h-12" style={{ color: "#cccccc", margin: "0 auto 12px" }} />
                        <p style={{ color: "#888888", fontSize: "14px", margin: 0 }}>Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.actionUrl || "#"}
                          onClick={() => removeNotification(notification.id)}
                          style={{
                            display: "flex",
                            gap: "14px",
                            padding: "16px 20px",
                            borderBottom: "1px solid #f1f5f9",
                            textDecoration: "none",
                            background: notification.isRead ? "#ffffff" : "#fafbfc",
                            transition: "background 0.15s"
                          }}
                        >
                          {/* Icon */}
                          <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: notification.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: notification.iconColor
                          }}>
                            {notification.icon}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                              <p style={{ margin: 0, fontSize: "14px", fontWeight: notification.isRead ? 500 : 700, color: "#111111" }}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span style={{
                                  width: "8px",
                                  height: "8px",
                                  background: "#FF5E00",
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  marginLeft: "8px",
                                  marginTop: "4px"
                                }} />
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "#666666", lineHeight: 1.4 }}>
                              {notification.message}
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#999999" }}>
                              {notification.time}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-4 h-4" style={{ color: "#cccccc", flexShrink: 0, marginTop: "16px" }} />
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: "12px 20px",
                    borderTop: "1px solid #eeeeee",
                    background: "#fafafa",
                    textAlign: "center"
                  }}>
                    <Link
                      href="/admin/applicants"
                      onClick={() => setShowNotifications(false)}
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#FF5E00",
                        textDecoration: "none"
                      }}
                    >
                      Lihat semua aktivitas →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/admin/jobs/create">
              <button style={{ padding: "12px 20px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>
                <Plus className="w-4 h-4" />
                Buat Lowongan
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {statsData.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", background: `${stat.color}15`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: stat.trend === "up" ? "#16a34a" : "#ef4444" }}>
                  {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "#888888" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Recent Applications Table */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>Lamaran Terbaru</h2>
                  <p style={{ fontSize: "14px", color: "#888888" }}>{filteredApplications.length} pelamar ditemukan</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <Search className="w-4 h-4" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ padding: "10px 14px 10px 42px", border: "2px solid #eeeeee", borderRadius: "10px", fontSize: "14px", outline: "none", width: "200px" }}
                    />
                  </div>
                  <StatusFilterDropdown statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eeeeee" }}>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pelamar</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Posisi</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skor</th>
                      <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                          <p style={{ color: "#888888", fontSize: "14px" }}>Belum ada lamaran</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const status = getStatusConfig(app.status);
                        return (
                          <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>
                                  {(app.applicantName || "P").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{app.applicantName || "Pelamar"}</p>
                                  <p style={{ fontSize: "12px", color: "#888888" }}>ID: #{app.id}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{app.jobTitle}</p>
                              <p style={{ fontSize: "12px", color: "#888888" }}>{(app.division || "").replace("_", " ")}</p>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ fontSize: "14px", color: "#666666" }}>
                                {new Date(app.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <span style={{ fontSize: "14px", color: "#888888" }}>-</span>
                            </td>
                            <td style={{ padding: "16px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                {/* Quick Accept Button - ADMIN_CHECK */}
                                {app.status === "ADMIN_CHECK" && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "TEST_SCHEDULED")}
                                    style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Terima ke Tahap Tes"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Quick Accept Button - TEST_SCHEDULED */}
                                {app.status === "TEST_SCHEDULED" && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "TEST_COMPLETED")}
                                    style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Selesaikan Tes"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {app.status === "TEST_COMPLETED" && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "INTERVIEW")}
                                    style={{ padding: "8px", background: "#dcfce7", border: "none", borderRadius: "8px", cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Terima ke Tahap Interview"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Quick Reject Button */}
                                {(app.status === "PENDING" || app.status === "ADMIN_CHECK" || app.status === "TEST_SCHEDULED" || app.status === "TEST_COMPLETED" || app.status === "INTERVIEW") && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.applicationId, "REJECTED")}
                                    style={{ padding: "8px", background: "#fee2e2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    title="Tolak"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <Link href={`/admin/applicants/${app.applicationId}`}>
                                  <button style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: "#888888" }}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eeeeee" }}>
                <p style={{ fontSize: "14px", color: "#888888" }}>Menampilkan {filteredApplications.length} dari {applications.length} data</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }} disabled>Sebelumnya</button>
                  <button style={{ padding: "8px 16px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#888888", cursor: "pointer" }}>Selanjutnya</button>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>Tren Pelamar Bulanan</h2>
                  <p style={{ fontSize: "14px", color: "#888888" }}>Data pelamar dan kelulusan per bulan</p>
                </div>
                <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#2563eb", borderRadius: "3px" }} />
                    <span style={{ color: "#666666" }}>Total Pelamar</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#10B981", borderRadius: "3px" }} />
                    <span style={{ color: "#666666" }}>Lulus</span>
                  </div>
                </div>
              </div>

              {/* Simple bar chart - per month */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "150px", gap: "8px" }}>
                {monthlyData.map((data, i) => {
                  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.pelamar, d.lulus)), 1);
                  const pelamarHeight = (data.pelamar / maxVal) * 100;
                  const lulusHeight = (data.lulus / maxVal) * 100;

                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                      {/* Values on top */}
                      <div style={{ display: "flex", gap: "4px", marginBottom: "8px", alignItems: "flex-end", height: "60px" }}>
                        <div style={{
                          width: "20px",
                          background: "#2563eb",
                          borderRadius: "4px 4px 0 0",
                          height: `${Math.max(pelamarHeight * 0.6, data.pelamar > 0 ? 20 : 0)}px`,
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          paddingTop: "4px"
                        }}>
                          {data.pelamar > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#fff" }}>{data.pelamar}</span>}
                        </div>
                        <div style={{
                          width: "20px",
                          background: "#10B981",
                          borderRadius: "4px 4px 0 0",
                          height: `${Math.max(lulusHeight * 0.6, data.lulus > 0 ? 20 : 0)}px`,
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          paddingTop: "4px"
                        }}>
                          {data.lulus > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#fff" }}>{data.lulus}</span>}
                        </div>
                      </div>
                      {/* Month label */}
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Status Distribution */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Distribusi Status</h2>

              {/* Simple pie chart visualization */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: `conic-gradient(${statusDist.map((item, i) => {
                    const total = statusDist.reduce((sum, s) => sum + s.value, 0);
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return `${item.color} ${statusDist.slice(0, i).reduce((sum, s) => sum + (total > 0 ? (s.value / total) * 360 : 0), 0)}deg ${statusDist.slice(0, i + 1).reduce((sum, s) => sum + (total > 0 ? (s.value / total) * 360 : 0), 0)}deg`;
                  }).join(', ')})`,
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80px", height: "80px", background: "#ffffff", borderRadius: "50%" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>{applications.length}</div>
                      <div style={{ fontSize: "11px", color: "#888888" }}>Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {statusDist.filter(item => item.value > 0).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "10px", height: "10px", background: item.color, borderRadius: "50%" }} />
                      <span style={{ fontSize: "14px", color: "#666666" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Aksi Cepat</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/admin/jobs/create" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#fff7f0", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus className="w-5 h-5" style={{ color: "#FF5E00" }} />
                    </div>
                    Buat Lowongan Baru
                  </button>
                </Link>
                <Link href="/admin/questions" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ClipboardCheck className="w-5 h-5" style={{ color: "#00205B" }} />
                    </div>
                    Kelola Bank Soal
                  </button>
                </Link>
                <Link href="/admin/reports" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <div style={{ width: "36px", height: "36px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Download className="w-5 h-5" style={{ color: "#16a34a" }} />
                    </div>
                    Export Laporan
                  </button>
                </Link>
              </div>
            </div>

              {/* Top Divisi */}
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Lowongan Aktif</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {jobs.filter(j => j.status === "ACTIVE").length === 0 ? (
                  <p style={{ color: "#888888", fontSize: "14px", textAlign: "center", padding: "20px" }}>Belum ada lowongan aktif</p>
                ) : (
                  jobs.filter(j => j.status === "ACTIVE").map((div: any, i: number) => (
                    <div key={div.id || i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#111111" }}>{div.title}</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#FF5E00" }}>{applications.filter(a => a.jobPostingId === div.id).length}</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "30%", background: "#FF5E00", borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
          /* Hide desktop header on mobile */
          .desktop-header {
            display: none !important;
          }

          /* Show mobile header styles */
          .mobile-dashboard-header {
            display: flex !important;
          }

          /* Stack header elements on mobile */
          .header-actions {
            flex-wrap: wrap;
            gap: 8px;
          }

          /* Mobile stats - 2 columns */
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }

          /* Mobile table - card style */
          .mobile-table-row {
            display: flex !important;
          }

          /* Mobile quick actions - stack vertically */
          .quick-actions-grid {
            flex-direction: column !important;
          }
        }

        /* Extra small screens */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }

          .stat-card {
            padding: 16px !important;
          }

          .stat-number {
            font-size: 28px !important;
          }
        }

        button:hover { border-color: #FF5E00 !important; }
        input:focus { border-color: #FF5E00 !important; }
        .notification-item:hover {
          background: #f8f9fa !important;
        }

        /* Mobile notification panel adjustments */
        @media (max-width: 1024px) {
          .notification-panel {
            width: calc(100vw - 32px) !important;
            right: -16px !important;
          }
        }
      `}</style>

      {/* Success Modal */}
      {showSuccessModal && (
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
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes checkmark {
              0% { stroke-dashoffset: 100; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes scaleIn {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "48px 40px",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            boxShadow: "0 25px 80px rgba(0,32,91,0.25)",
            animation: "slideUp 0.4s ease-out",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background decoration */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "120px", height: "120px", background: "linear-gradient(135deg, #16a34120, transparent)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "80px", height: "80px", background: "linear-gradient(135deg, #FF5E0015, transparent)", borderRadius: "50%" }} />

            {/* Success Icon */}
            <div style={{
              width: "100px",
              height: "100px",
              background: successStatus === "error" ? "#fee2e2" : "#dcfce7",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              animation: "scaleIn 0.5s ease-out"
            }}>
              {successStatus === "error" ? (
                <XCircle className="w-12 h-12" style={{ color: "#dc2626" }} />
              ) : (
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: "checkmark 0.6s ease-out 0.2s forwards" }} />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: successStatus === "error" ? "#dc2626" : "#00205B",
              marginBottom: "12px"
            }}>
              {successStatus === "error" ? "Terjadi Kesalahan" : "Berhasil!"}
            </h2>

            {/* Message */}
            <p style={{
              fontSize: "16px",
              color: "#64748b",
              marginBottom: successStatus === "error" ? "24px" : "8px",
              lineHeight: 1.6
            }}>
              {successMessage}
            </p>

            {/* Status Badge */}
            {successStatus !== "error" && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "#dcfce7",
                color: "#16a34a",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "24px"
              }}>
                <Check className="w-4 h-4" />
                {successStatus}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: successStatus === "error" ? "#dc2626" : "linear-gradient(135deg, #FF5E00, #ff7a2f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: successStatus === "error"
                  ? "0 4px 14px rgba(220,38,38,0.3)"
                  : "0 4px 14px rgba(255,94,0,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {successStatus === "error" ? "Tutup" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
