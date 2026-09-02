"use client";

import { Sidebar } from "@/components/layout";
import { MobileLayout } from "@/components/layout/MobileComponents";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) router.push("/auth/login");
    else if (user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN") router.push("/admin/dashboard");
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748B" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #FF5E00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B" }}>Mengalihkan...</p>
        </div>
      </div>
    );
  }

  // MOBILE Layout
  if (isMobile) {
    return (
      <MobileLayout userName={user.fullName || "Pelamar"} userRole={user.role}>
        {children}
      </MobileLayout>
    );
  }

  // DESKTOP Layout
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Sidebar userName={user.fullName || "Pelamar"} userRole={user.role} />
      <main style={{ marginLeft: "260px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
