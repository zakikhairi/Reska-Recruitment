"use client";

import { Sidebar } from "@/components/layout";
import { MobileLayout } from "@/components/layout/MobileComponents";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FloatingChat from "@/components/FloatingChat";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#00205B] mb-4">KAI Services</h1>
          <div className="flex gap-2 justify-center">
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0.16s" }}></span>
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0.32s" }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#00205B] mb-4">KAI Services</h1>
          <div className="flex gap-2 justify-center">
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0.16s" }}></span>
            <span className="w-2.5 h-2.5 bg-[#FF5E00] rounded-full animate-bounce" style={{ animationDelay: "0.32s" }}></span>
          </div>
        </div>
      </div>
    );
  }

  // MOBILE Layout
  if (isMobile) {
    return (
      <MobileLayout userName={user.fullName || "Pelamar"} userRole={user.role}>
        {children}
        <FloatingChat />
      </MobileLayout>
    );
  }

  const effectiveCollapsed = mounted ? isCollapsed : false;

  // DESKTOP Layout
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Sidebar userName={user.fullName || "Pelamar"} userRole={user.role} />
      <main
        style={{
          marginLeft: effectiveCollapsed ? "80px" : "260px",
          width: effectiveCollapsed ? "calc(100% - 80px)" : "calc(100% - 260px)",
          minHeight: "100vh",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden"
        }}
      >
        {children}
      </main>
      <FloatingChat />
    </div>
  );
}
