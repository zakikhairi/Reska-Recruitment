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
