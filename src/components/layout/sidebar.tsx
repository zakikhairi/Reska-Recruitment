"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Clipboard,
  Settings,
  BarChart2,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
} from "lucide-react";

interface SidebarProps {
  userName?: string;
  userRole?: "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";
}

const applicantNavItems = [
  { label: "Dashboard", href: "/applicant/dashboard", icon: "home" },
  { label: "Lowongan Kerja", href: "/applicant/jobs", icon: "briefcase" },
  { label: "Lamaran Saya", href: "/applicant/applications", icon: "file" },
  { label: "Jadwal Seleksi", href: "/applicant/schedule", icon: "calendar" },
  { label: "Profil", href: "/applicant/profile", icon: "user" },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "home" },
  { label: "Pelamar", href: "/admin/applicants", icon: "users" },
  { label: "Lowongan", href: "/admin/jobs", icon: "briefcase" },
  { label: "Bank Soal", href: "/admin/questions", icon: "clipboard" },
  { label: "Konfigurasi Tes", href: "/admin/test-config", icon: "settings" },
  { label: "Jadwal", href: "/admin/schedule", icon: "calendar" },
  { label: "Pesan Kontak", href: "/admin/contacts", icon: "message" },
  { label: "Laporan", href: "/admin/reports", icon: "chart" },
];

const icons: Record<string, React.ReactElement> = {
  home: <Home className="w-5 h-5" />,
  dashboard: <Home className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  file: <FileText className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  clipboard: <Clipboard className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  chart: <BarChart2 className="w-5 h-5" />,
  calendar: <Calendar className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  logout: <LogOut className="w-5 h-5" />,
  chevronLeft: <ChevronLeft className="w-5 h-5" />,
  chevronRight: <ChevronRight className="w-5 h-5" />,
  help: <HelpCircle className="w-5 h-5" />,
};

export function Sidebar({ userName = "User", userRole = "APPLICANT" }: SidebarProps) {
  const pathname = usePathname();
  const navItems = userRole === "APPLICANT" ? applicantNavItems : adminNavItems;
  const { logout } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showKaiPopup, setShowKaiPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowKaiPopup(false);
      }
    };
    if (showKaiPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showKaiPopup]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/auth/login");
  };

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (userRole === "HR_ADMIN") {
      fetch("/api/admin/contacts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.conversations) {
            const unread = data.conversations.filter((c: any) => c.unreadCount > 0).length;
            setUnreadMessages(unread);
          }
        })
        .catch(() => {});
    }
  }, [userRole, pathname]);

  const effectiveCollapsed = mounted ? isCollapsed : false;
  const width = effectiveCollapsed ? "80px" : "260px";

  return (
    <div
      style={{
        width: width,
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #eeeeee",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* Unified Header */}
      <div
        style={{
          padding: effectiveCollapsed ? "16px 8px 12px 8px" : "18px 16px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: effectiveCollapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: effectiveCollapsed ? "center" : "space-between",
          gap: effectiveCollapsed ? "10px" : "12px",
          position: "relative",
          minHeight: effectiveCollapsed ? "96px" : "76px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
        }}
      >
        {!effectiveCollapsed ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <button
                onClick={() => setShowKaiPopup(!showKaiPopup)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                }}
                title="Informasi KAI Services"
              >
                <img
                  src="/_logo_kais.png"
                  alt="KAI Services"
                  style={{ width: "44px", height: "44px", objectFit: "contain", flexShrink: 0 }}
                />
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#00205B",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    KAI Services
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#FF5E00",
                      letterSpacing: "0.5px",
                      marginTop: "2px",
                    }}
                  >
                    {userRole === "APPLICANT" ? "PORTAL PELAMAR" : "HR ADMIN"}
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={toggleSidebar}
              style={{
                width: "34px",
                height: "34px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              title="Persempit Sidebar (Tutup)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowKaiPopup(!showKaiPopup)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="KAI Services"
            >
              <img
                src="/_logo_kais.png"
                alt="KAI Services"
                style={{ width: "40px", height: "40px", objectFit: "contain" }}
              />
            </button>
            <button
              onClick={toggleSidebar}
              style={{
                width: "48px",
                height: "26px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              title="Perluas Sidebar (Buka)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* KAI Services Popup for Expanded Mode */}
      {showKaiPopup && !effectiveCollapsed && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: "76px",
            left: "0",
            right: "0",
            background: "#ffffff",
            borderBottom: "2px solid #FF5E00",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "20px 24px",
            zIndex: 50,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/_logo_kais.png"
                alt="KAI Services"
                style={{ width: "44px", height: "44px", objectFit: "contain" }}
              />
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#00205B" }}>KAI Services</div>
                <div style={{ fontSize: "12px", color: "#888888" }}>PT Reska Multi Usaha</div>
              </div>
            </div>
            <button
              onClick={() => setShowKaiPopup(false)}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                padding: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666666",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #ffedd5",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#c2410c", marginBottom: "4px" }}>
              Official Recruitment Portal
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Sistem Rekrutmen dan Pengadaan Pegawai Resmi PT Reska Multi Usaha (KAI Services)
            </div>
          </div>
        </div>
      )}

      {/* KAI Services Popup for Collapsed Mode */}
      {showKaiPopup && effectiveCollapsed && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: "16px",
            left: "88px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            padding: "16px",
            zIndex: 100,
            width: "240px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/_logo_kais.png"
                alt="KAI Services"
                style={{ width: "36px", height: "36px", objectFit: "contain" }}
              />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#00205B" }}>KAI Services</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>PT Reska Multi Usaha</div>
              </div>
            </div>
            <button
              onClick={() => setShowKaiPopup(false)}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "6px",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #ffedd5",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#c2410c" }}>
              Official Recruitment
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Sistem Resmi KAI Services
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: effectiveCollapsed ? "16px 8px" : "16px 12px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: effectiveCollapsed ? "8px" : "4px",
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const showBadge = item.icon === "message" && unreadMessages > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: effectiveCollapsed ? "0" : "12px",
                    padding: effectiveCollapsed ? "0" : "12px 14px",
                    width: effectiveCollapsed ? "48px" : "100%",
                    height: effectiveCollapsed ? "48px" : "auto",
                    margin: effectiveCollapsed ? "0 auto" : "0",
                    justifyContent: effectiveCollapsed ? "center" : "flex-start",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: isActive
                      ? effectiveCollapsed
                        ? "#00205B"
                        : "#EEF2FF"
                      : "transparent",
                    color: isActive
                      ? effectiveCollapsed
                        ? "#FFFFFF"
                        : "#00205B"
                      : "#64748B",
                    borderLeft:
                      !effectiveCollapsed && isActive
                        ? "4px solid #FF5E00"
                        : !effectiveCollapsed
                        ? "4px solid transparent"
                        : "none",
                    boxShadow:
                      effectiveCollapsed && isActive
                        ? "0 4px 12px rgba(0, 32, 91, 0.25)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      color: isActive
                        ? effectiveCollapsed
                          ? "#FFFFFF"
                          : "#00205B"
                        : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "20px",
                      position: "relative",
                    }}
                  >
                    {icons[item.icon]}
                    {showBadge && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                          width: "14px",
                          height: "14px",
                          borderRadius: "9999px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        !
                      </span>
                    )}
                  </span>
                  {!effectiveCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          padding: effectiveCollapsed ? "12px 8px" : "16px",
          borderTop: "1px solid #f1f5f9",
          flexShrink: 0,
        }}
      >
        <Link
          href="/help"
          title="Pusat Bantuan"
          style={{
            display: "flex",
            alignItems: "center",
            gap: effectiveCollapsed ? "0" : "12px",
            padding: effectiveCollapsed ? "0" : "10px 14px",
            width: effectiveCollapsed ? "48px" : "100%",
            height: effectiveCollapsed ? "44px" : "auto",
            margin: effectiveCollapsed ? "0 auto 8px" : "0 0 10px 0",
            justifyContent: effectiveCollapsed ? "center" : "flex-start",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#64748B",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "20px",
              color: "#64748B",
            }}
          >
            {icons.help}
          </span>
          {!effectiveCollapsed && "Pusat Bantuan"}
        </Link>

        {/* User Profile Card */}
        <div
          style={{
            display: "flex",
            flexDirection: effectiveCollapsed ? "column" : "row",
            alignItems: "center",
            gap: effectiveCollapsed ? "8px" : "12px",
            padding: effectiveCollapsed ? "10px 4px" : "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            justifyContent: effectiveCollapsed ? "center" : "flex-start",
            transition: "all 0.2s",
          }}
        >
          <div
            title={`${userName} (${userRole === "APPLICANT" ? "Pelamar" : "HR Admin"})`}
            style={{
              width: "38px",
              height: "38px",
              background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(0, 32, 91, 0.2)",
            }}
          >
            {userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {!effectiveCollapsed ? (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userName}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>
                  {userRole === "APPLICANT" ? "Pelamar" : "HR Admin"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Keluar dari Akun"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#fee2e2",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Keluar dari Akun"
              style={{
                width: "32px",
                height: "32px",
                background: "#fee2e2",
                border: "none",
                borderRadius: "8px",
                cursor: isLoggingOut ? "not-allowed" : "pointer",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CollapsibleSidebar(props: SidebarProps) {
  return <Sidebar {...props} />;
}
