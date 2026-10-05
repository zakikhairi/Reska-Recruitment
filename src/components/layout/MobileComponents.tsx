"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, X, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

interface MobileNavItem {
  label: string;
  href: string;
  icon: "home" | "briefcase" | "file" | "calendar" | "user" | "users" | "clipboard";
}

const MobileIcon: React.FC<{ name: MobileNavItem["icon"]; active?: boolean }> = ({ name, active }) => {
  const c = active ? "#FF5E00" : "#999999";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {name === "home" && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
      {name === "briefcase" && <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>}
      {name === "file" && <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
      {name === "calendar" && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></>}
      {name === "user" && <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
      {name === "users" && <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>}
      {name === "clipboard" && <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>}
    </svg>
  );
};

interface MobileLayoutProps {
  userName?: string;
  userRole?: "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";
  children: React.ReactNode;
}

export function MobileLayout({ userName, userRole, children }: MobileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/auth/login");
  };

  const applicantNav: MobileNavItem[] = [
    { label: "Home", href: "/applicant/dashboard", icon: "home" },
    { label: "Lowongan", href: "/applicant/jobs", icon: "briefcase" },
    { label: "Lamaran", href: "/applicant/applications", icon: "file" },
    { label: "Jadwal", href: "/applicant/schedule", icon: "calendar" },
    { label: "Profil", href: "/applicant/profile", icon: "user" },
  ];

  const adminNav: MobileNavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "home" },
    { label: "Pelamar", href: "/admin/applicants", icon: "users" },
    { label: "Lowongan", href: "/admin/jobs", icon: "briefcase" },
    { label: "Jadwal", href: "/admin/schedule", icon: "calendar" },
    { label: "Soal", href: "/admin/questions", icon: "clipboard" },
  ];

  const navItems = userRole === "APPLICANT" ? applicantNav : adminNav;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="kai-mobile-portal-shell" style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100vw", overflowX: "hidden", boxSizing: "border-box" }}>
      {/* Fixed Header */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          height: "52px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/_logo_kais.png" alt="KAI" style={{ width: "28px", height: "28px" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205B", lineHeight: 1.2 }}>KAI Services</div>
              <div style={{ fontSize: "9px", color: "#888888" }}>{userRole === "APPLICANT" ? "Pelamar" : "HR Admin"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* User Avatar Button - triggers Account Modal */}
            <button
              onClick={() => setShowAccountModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "3px 8px 3px 4px",
                cursor: "pointer",
              }}
              title="Menu Akun"
            >
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00205B, #003380)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700
              }}>
                {(userName || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#1E293B", maxWidth: "75px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName?.split(" ")[0] || "User"}
              </span>
            </button>

            {/* Direct Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "#FEE2E2",
                color: "#DC2626",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "5px 9px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="Keluar dari Akun"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Account Modal for Mobile */}
      {showAccountModal && (
        <div
          onClick={() => setShowAccountModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              padding: "20px 18px 24px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="/_logo_kais.png" alt="KAI" style={{ width: "24px", height: "24px" }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#00205B" }}>Informasi Akun</span>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748B",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "16px"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00205B, #003380)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 700,
                flexShrink: 0
              }}>
                {(userName || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "6px",
                    background: userRole === "APPLICANT" ? "#E0F2FE" : "#FEF3C7",
                    color: userRole === "APPLICANT" ? "#0284C7" : "#D97706"
                  }}>
                    {userRole === "APPLICANT" ? "Pelamar" : "HR Administrator"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>KAI Services</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userRole === "APPLICANT" ? (
                <Link
                  href="/applicant/profile"
                  onClick={() => setShowAccountModal(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#00205B",
                    textDecoration: "none",
                  }}
                >
                  <UserIcon size={16} />
                  <span>Lihat Profil Pelamar</span>
                </Link>
              ) : (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setShowAccountModal(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#00205B",
                    textDecoration: "none",
                  }}
                >
                  <UserIcon size={16} />
                  <span>Dashboard HR Admin</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setShowLogoutConfirm(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 14px",
                  background: "#FEE2E2",
                  color: "#DC2626",
                  border: "1px solid #FECACA",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "4px"
                }}
              >
                <LogOut size={16} />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Mobile Logout */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "22px 20px",
              width: "100%",
              maxWidth: "340px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
          >
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <LogOut size={22} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
              Keluar dari Sesi {userRole === "APPLICANT" ? "Pelamar" : "Admin"}?
            </h3>
            <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "18px", lineHeight: 1.4 }}>
              Anda akan keluar dari akun KAI Services. Anda harus login kembali untuk mengakses halaman ini.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "#F1F5F9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                }}
              >
                {isLoggingOut ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="kai-portal-mobile-main" style={{
        flex: 1,
        paddingTop: "58px",
        paddingBottom: "76px",
        paddingLeft: "12px",
        paddingRight: "12px",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}>
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#FFFFFF",
        boxShadow: "0 -1px 3px rgba(0,0,0,0.1)",
        zIndex: 100,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          height: "56px",
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: active ? "#FF5E00" : "#999999",
                  background: active ? "#FFF5F0" : "transparent",
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "20px",
                    height: "3px",
                    background: "#FF5E00",
                    borderRadius: "0 0 3px 3px"
                  }} />
                )}
                <MobileIcon name={item.icon} active={active} />
                <span style={{ fontSize: "9px", fontWeight: 600, marginTop: "2px" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ============================================
// MOBILE UI COMPONENTS
// ============================================

export function MobileHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#00205B", marginBottom: "2px" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: "12px", color: "#666666" }}>{subtitle}</p>}
    </div>
  );
}

export function MobileCard({ children, style, onClick }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      background: "#FFFFFF",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "10px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      cursor: onClick ? "pointer" : "default",
      ...style
    }}>
      {children}
    </div>
  );
}

export function MobileSection({ title, action, children }: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#00205B", borderBottom: "2px solid #FF5E00", paddingBottom: "4px" }}>{title}</h2>
        {action && <span style={{ fontSize: "11px", color: "#FF5E00", fontWeight: 600 }}>{action}</span>}
      </div>
      {children}
    </div>
  );
}

export function MobileBadge({ label, type }: {
  label: string;
  type: "success" | "warning" | "error" | "info" | "pending"
}) {
  const colors = {
    success: { bg: "#DCFCE7", text: "#16A34A" },
    warning: { bg: "#FEF3C7", text: "#D97706" },
    error: { bg: "#FEE2E2", text: "#DC2626" },
    info: { bg: "#DBEAFE", text: "#2563EB" },
    pending: { bg: "#F1F5F9", text: "#64748B" }
  };
  return (
    <span style={{
      display: "inline-flex",
      padding: "4px 8px",
      borderRadius: "10px",
      fontSize: "10px",
      fontWeight: 600,
      background: colors[type].bg,
      color: colors[type].text
    }}>
      {label}
    </span>
  );
}

export function MobileEmpty({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      textAlign: "center"
    }}>
      <div style={{
        width: "56px",
        height: "56px",
        background: "#F1F5F9",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "12px"
      }}>
        {icon || (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
          </svg>
        )}
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{title}</h3>
      {description && <p style={{ fontSize: "12px", color: "#666666", marginBottom: "12px" }}>{description}</p>}
      {action}
    </div>
  );
}

export function MobileLoading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px"
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        border: "3px solid #F1F5F9",
        borderTopColor: "#FF5E00",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: "12px", color: "#666666", fontSize: "12px" }}>Memuat...</p>
    </div>
  );
}

export function MobileButton({ children, variant = "primary", onClick, style }: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} style={{
      width: "100%",
      padding: "12px 16px",
      border: variant === "secondary" ? "2px solid #00205B" : "none",
      background: variant === "secondary" ? "#FFFFFF" : "#FF5E00",
      color: variant === "secondary" ? "#00205B" : "#FFFFFF",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      ...style
    }}>
      {children}
    </button>
  );
}

export function MobileGrid({ cols, gap = 10, children }: {
  cols: number;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: `${gap}px`
    }}>
      {children}
    </div>
  );
}
