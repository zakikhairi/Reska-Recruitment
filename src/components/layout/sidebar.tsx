"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";
import { Home, User, Briefcase, FileText, Calendar, Users, Clipboard, Settings, BarChart2, MessageSquare, LogOut, ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react";

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
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showKaiPopup, setShowKaiPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

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

  const width = isCollapsed ? "80px" : "260px";

  return (
    <div style={{
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
      transition: "width 0.3s ease",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ padding: isCollapsed ? "20px 12px" : "24px", borderBottom: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", position: "relative" }}>
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
            <div>
              <button
                onClick={() => setShowKaiPopup(!showKaiPopup)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
                <div style={{ fontSize: "12px", color: "#888888" }}>{userRole === "APPLICANT" ? "Portal Pelamar" : "HR Admin"}</div>
              </button>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            padding: isCollapsed ? "10px" : "8px",
            background: isCollapsed ? "transparent" : "#f1f5f9",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            color: "#666666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          title={isCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
        >
          {isCollapsed ? icons.chevronRight : icons.chevronLeft}
        </button>
      </div>

      {/* KAI Services Popup */}
      {showKaiPopup && !isCollapsed && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            background: "#ffffff",
            borderBottom: "2px solid #FF5E00",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#00205B" }}>KAI Services</div>
                <div style={{ fontSize: "12px", color: "#888888" }}>Sistem Rekrutmen KAI</div>
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
          <div style={{
            background: "#fff3e0",
            border: "1px solid #FFE0B2",
            borderRadius: "10px",
            padding: "16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#E65100", marginBottom: "4px" }}>
              🚧 Fitur ini sedang dalam pengembangan
            </div>
            <div style={{ fontSize: "12px", color: "#666666" }}>
              Menu dan fitur lengkap akan segera hadir
            </div>
          </div>
        </div>
      )}

      {/* Logo collapsed */}
      {isCollapsed && (
        <div style={{ padding: "16px 12px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "center", position: "relative" }}>
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
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
          </button>
        </div>
      )}

      {/* KAI Services Popup for Collapsed Mode */}
      {showKaiPopup && isCollapsed && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "100%",
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "16px",
            zIndex: 100,
            minWidth: "200px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#00205B" }}>KAI Services</div>
          </div>
          <div style={{
            background: "#fff3e0",
            border: "1px solid #FFE0B2",
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#E65100" }}>
              🚧 Fitur ini sedang dalam pengembangan
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: isCollapsed ? "12px 8px" : "16px 12px", overflowY: "auto", overflowX: "hidden" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const showBadge = item.icon === "message" && unreadMessages > 0;
            return (
              <li key={item.href}>
                <Link href={item.href} title={isCollapsed ? item.label : undefined} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed ? "0" : "12px",
                  padding: isCollapsed ? "12px 0" : "14px 16px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  borderRadius: "10px",
                  fontSize: isCollapsed ? "0" : "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  background: isActive ? "#f0f4ff" : "transparent",
                  color: isActive ? "#00205B" : "#666666",
                  borderLeft: isActive ? "4px solid #FF5E00" : "4px solid transparent",
                  paddingLeft: isActive ? (isCollapsed ? "0" : "12px") : (isCollapsed ? "0" : "16px"),
                }}>
                  <span style={{ color: isActive ? "#00205B" : "#888888", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "20px", position: "relative" }}>
                    {icons[item.icon]}
                    {showBadge && (
                      <span style={{
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
                        border: "2px solid #fff"
                      }}>
                        !
                      </span>
                    )}
                  </span>
                  {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div style={{ padding: isCollapsed ? "12px 8px" : "16px", borderTop: "1px solid #eeeeee" }}>
        <Link href="/help" title={isCollapsed ? "Pusat Bantuan" : undefined} style={{
          display: isCollapsed ? "flex" : "flex",
          alignItems: "center",
          gap: isCollapsed ? "0" : "12px",
          padding: isCollapsed ? "12px 0" : "12px 16px",
          justifyContent: isCollapsed ? "center" : "flex-start",
          borderRadius: "10px",
          fontSize: isCollapsed ? "0" : "14px",
          fontWeight: 500,
          color: "#666666",
          textDecoration: "none",
          marginBottom: isCollapsed ? "0" : "8px",
          transition: "all 0.15s"
        }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "20px" }}>{icons.help}</span>
          {!isCollapsed && "Pusat Bantuan"}
        </Link>

        {/* User Profile */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: isCollapsed ? "0" : "12px",
          padding: isCollapsed ? "12px 0" : "14px",
          background: "#f8f9fa",
          borderRadius: "12px",
          justifyContent: isCollapsed ? "center" : "flex-start"
        }}>
          <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #00205B 0%, #0C2340 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
            {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
          </div>
          {!isCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                <div style={{ fontSize: "12px", color: "#888888" }}>{userRole === "APPLICANT" ? "Pelamar" : "HR Admin"}</div>
              </div>
              <button onClick={handleLogout} disabled={isLoggingOut} title="Keluar" style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "8px", cursor: isLoggingOut ? "not-allowed" : "pointer", color: "#888888", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icons.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CollapsibleSidebar(props: SidebarProps) {
  return <Sidebar {...props} />;
}
