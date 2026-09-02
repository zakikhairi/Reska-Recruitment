"use client";

import { Sidebar } from "@/components/layout";
import { MobileLayout } from "@/components/layout/MobileComponents";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) { setIsReady(false); return; }
    setIsReady(true);
    if (!isAuthenticated || !user) router.push("/auth/login");
    else if (user.role === "APPLICANT") router.push("/applicant/dashboard");
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated || !isReady) {
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

  if (!isAuthenticated || !user || user.role === "APPLICANT") {
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
      <MobileLayout userName={user.fullName || "Admin"} userRole={user.role}>
        <div style={{ marginBottom: "12px" }}>
          <Link href="/admin/jobs/create" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%",
              padding: "12px 16px",
              background: "#FF5E00",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}>
              <Plus size={16} />
              Buat Lowongan
            </button>
          </Link>
        </div>
        {children}
      </MobileLayout>
    );
  }

  // DESKTOP Layout
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Sidebar userName={user.fullName || "Admin"} userRole={user.role} />
      <main style={{ marginLeft: "260px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
