"use client";

import { Sidebar, CollapsibleSidebar } from "@/components/layout";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    if (!_hasHydrated) {
      setIsReady(false);
      return;
    }

    setIsReady(true);

    // Check auth after hydration
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
    } else if (user.role === "APPLICANT") {
      router.push("/applicant/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, user, router, isReady]);

  // Show loading state while rehydrating from localStorage
  if (!_hasHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF5E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Memuat...</p>
        </div>
      </div>
    );
  }

  // Additional check after ready
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF5E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Mengalihkan ke login...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user.role === "APPLICANT") {
    router.push("/applicant/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar userName={user.fullName || "Admin"} userRole={user.role} />
      <CollapsibleSidebar userName={user.fullName || "Admin"} userRole={user.role} />
      <main
        className="pb-20 lg:pb-0 transition-all duration-300"
        style={{
          paddingLeft: isCollapsed ? "80px" : "260px",
          transition: "padding-left 0.3s ease"
        }}
      >
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
