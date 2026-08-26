"use client";

import { Sidebar, CollapsibleSidebar } from "@/components/layout";
import FloatingChat from "@/components/FloatingChat";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.push("/auth/login");
    } else if (user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  // Show loading state while rehydrating from localStorage
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar userName={user.fullName || "Pelamar"} userRole={user.role} />
      <CollapsibleSidebar userName={user.fullName || "Pelamar"} userRole={user.role} />
      <main
        className="pb-20 lg:pb-0 transition-all duration-300"
        style={{
          paddingLeft: isCollapsed ? "80px" : "260px",
          transition: "padding-left 0.3s ease"
        }}
      >
        <div className="min-h-screen">{children}</div>
      </main>
      <FloatingChat />
    </div>
  );
}
