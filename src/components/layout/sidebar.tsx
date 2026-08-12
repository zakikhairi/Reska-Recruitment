"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userName?: string;
  userRole?: "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";
}

const applicantNavItems = [
  { label: "Dashboard", href: "/applicant/dashboard", icon: "dashboard" },
  { label: "Lowongan Kerja", href: "/applicant/jobs", icon: "briefcase" },
  { label: "Lamaran Saya", href: "/applicant/applications", icon: "file" },
  { label: "Jadwal Seleksi", href: "/applicant/schedule", icon: "calendar" },
  { label: "Profil", href: "/applicant/profile", icon: "user" },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Pelamar", href: "/admin/applicants", icon: "users" },
  { label: "Lowongan", href: "/admin/jobs", icon: "briefcase" },
  { label: "Bank Soal", href: "/admin/questions", icon: "clipboard" },
  { label: "Konfigurasi Tes", href: "/admin/test-config", icon: "settings" },
  { label: "Jadwal", href: "/admin/schedule", icon: "calendar" },
  { label: "Pesan Kontak", href: "/admin/contacts", icon: "message" },
  { label: "Laporan", href: "/admin/reports", icon: "chart" },
];

const icons: Record<string, React.ReactElement> = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  briefcase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  message: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevronLeft: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  help: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export function Sidebar({ userName = "User", userRole = "APPLICANT" }: SidebarProps) {
  const pathname = usePathname();
  const navItems = userRole === "APPLICANT" ? applicantNavItems : adminNavItems;
  const { logout } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/auth/login");
  };

  // Fetch unread message count for admin
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (userRole === "HR_ADMIN") {
      fetch("/api/admin/contacts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.conversations) {
            // Count conversations with unread messages
            const unread = data.conversations.filter((c: any) => c.unreadCount > 0).length;
            setUnreadMessages(unread);
          }
        })
        .catch(() => {});
    }
  }, [userRole]);

  const width = isCollapsed ? "80px" : "260px";
  const sidebarWidth = isCollapsed ? 80 : 260;

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
      {/* Header with Toggle */}
      <div style={{ padding: isCollapsed ? "20px 12px" : "24px", borderBottom: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
        {!isCollapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
              <div style={{ fontSize: "12px", color: "#888888" }}>{userRole === "APPLICANT" ? "Portal Pelamar" : "HR Admin"}</div>
            </div>
          </Link>
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

      {/* Logo when collapsed */}
      {isCollapsed && (
        <div style={{ padding: "16px 12px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "center" }}>
          <img src="/_logo_kais.png" alt="KAI Services" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
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
        {/* Help Link */}
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
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();

  return (
    <>
      {/* Desktop */}
      <div style={{ display: "block" }} className="desktop-sidebar">
        <Sidebar {...props} />
      </div>

      {/* Mobile Bottom Nav */}
      <div style={{ display: "none" }} className="mobile-nav">
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#ffffff", borderTop: "1px solid #eeeeee", zIndex: 40, padding: "8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {(props.userRole === "APPLICANT" ? applicantNavItems : adminNavItems).slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 16px", textDecoration: "none", color: pathname === item.href ? "#00205B" : "#888888" }}>
                <span>{icons[item.icon]}</span>
                <span style={{ fontSize: "11px", fontWeight: 600 }}>{item.label.split(" ")[0]}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </>
  );
}
