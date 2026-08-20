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
          <div className="w-12 h-12 border-4 border-[#FF5E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF5E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Memuat...</p>
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
