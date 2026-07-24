"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data
const applications = [
  { id: "1", jobTitle: "Pramugara Kereta Api", division: "Layanan Kereta", appliedDate: "15 Jul 2026", status: "ADMINISTRATION", testScore: null },
  { id: "2", jobTitle: "Staff IT Support", division: "IT Staff", appliedDate: "18 Jul 2026", status: "ADMINISTRATION", testScore: null },
  { id: "3", jobTitle: "Steward Kereta Api", division: "Layanan Kereta", appliedDate: "20 Jul 2026", status: "TEST", testScore: null },
];

const upcomingTests = [];

const applicationSteps = [
  { id: 1, label: "Administrasi", status: "completed" },
  { id: 2, label: "Tes Kompetensi", status: "completed" },
  { id: 3, label: "Interview", status: "active" },
  { id: 4, label: "MCU", status: "pending" },
  { id: 5, label: "Offering", status: "pending" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ADMINISTRATION": return { bg: "#fef3c7", text: "#d97706", label: "Menunggu Administrasi" };
    case "TEST": return { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" };
    case "TEST_COMPLETED": return { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" };
    case "IN_TEST": return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes" };
    case "INTERVIEW": return { bg: "#e0e7ff", text: "#4f46e5", label: "Interview" };
    default: return { bg: "#f1f5f9", text: "#64748b", label: "Menunggu" };
  }
};

export default function ApplicantDashboardPage() {
  const [selectedApplication, setSelectedApplication] = useState(applications[0]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px", marginBottom: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px", letterSpacing: "-0.02em" }}>Dashboard Pelamar</h1>
          <p style={{ fontSize: "15px", color: "#666666" }}>Selamat datang, <strong>Ahmad Wijaya</strong>. Berikut ringkasan aktivitas Anda.</p>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 60px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
          {[
            { label: "Total Lamaran", value: "3", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
            { label: "Menunggu Seleksi", value: "2", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
            { label: "Menunggu Tes", value: "1", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
            { label: "Interview", value: "0", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> }
          ].map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ width: "48px", height: "48px", background: "#f0f4ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: "#00205B" }}>{stat.icon}</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#111111", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "#888888" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Applications List */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111" }}>Lamaran Saya</h2>
                <Link href="/applicant/jobs" style={{ fontSize: "14px", color: "#FF5E00", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  Lihat Semua
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {applications.map((app) => {
                  const status = getStatusColor(app.status);
                  return (
                    <div key={app.id} onClick={() => setSelectedApplication(app)} style={{ padding: "20px", borderRadius: "14px", border: `2px solid ${selectedApplication.id === app.id ? "#FF5E00" : "#eeeeee"}`, background: selectedApplication.id === app.id ? "#fff7f0" : "#ffffff", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>{app.jobTitle}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ padding: "4px 12px", background: "#f0f4ff", color: "#00205B", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{app.division}</span>
                            <span style={{ fontSize: "13px", color: "#888888" }}>{app.appliedDate}</span>
                          </div>
                        </div>
                        <span style={{ padding: "6px 14px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{status.label}</span>
                      </div>
                      {app.testScore !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #eeeeee" }}>
                          <span style={{ fontSize: "13px", color: "#888888" }}>Skor Tes:</span>
                          <div style={{ flex: 1, maxWidth: "120px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${app.testScore}%`, background: app.testScore >= 70 ? "#16a34a" : "#d97706", borderRadius: "4px" }} />
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: app.testScore >= 70 ? "#16a34a" : "#d97706" }}>{app.testScore}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Tests */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Tes Mendatang</h2>
              {upcomingTests.length > 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#fffbeb", borderRadius: "14px", border: "1px solid #fef3c7" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", background: "#FF5E00", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>{upcomingTests[0].title}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "#666666" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {upcomingTests[0].date}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {upcomingTests[0].duration} menit
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/applicant/test/${upcomingTests[0].id}`}>
                    <button style={{ padding: "12px 24px", background: "#FF5E00", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,94,0,0.3)" }}>
                      Mulai Tes
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ margin: "0 auto 12px" }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                  <p style={{ fontSize: "15px", color: "#666666" }}>Tidak ada tes mendatang</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Application Detail */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Detail Lamaran</h2>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111111", marginBottom: "12px" }}>{selectedApplication.jobTitle}</h3>
              <span style={{ display: "inline-block", padding: "6px 14px", background: getStatusColor(selectedApplication.status).bg, color: getStatusColor(selectedApplication.status).text, borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "24px" }}>
                {getStatusColor(selectedApplication.status).label}
              </span>

              {/* Progress Steps */}
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#888888", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress Seleksi</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {applicationSteps.map((step, index) => (
                    <div key={step.id} style={{ display: "flex", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: step.status === "completed" ? "#16a34a" : step.status === "active" ? "#FF5E00" : "#e5e5e5", color: step.status !== "pending" ? "#ffffff" : "#888888", fontSize: "14px", fontWeight: 700 }}>
                          {step.status === "completed" ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                          ) : step.id}
                        </div>
                        {index < applicationSteps.length - 1 && (
                          <div style={{ width: "2px", height: "28px", background: step.status === "completed" ? "#16a34a" : "#e5e5e5" }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: index < applicationSteps.length - 1 ? "28px" : "0" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: step.status === "active" ? "#FF5E00" : "#111111", marginBottom: "2px" }}>{step.label}</p>
                        <p style={{ fontSize: "12px", color: "#888888" }}>
                          {step.status === "completed" ? "Selesai" : step.status === "active" ? "Sedang Berlangsung" : "Menunggu"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Aksi Cepat</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/applicant/jobs" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                    Lihat Lowongan
                  </button>
                </Link>
                <Link href="/applicant/profile" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Edit Profil
                  </button>
                </Link>
                <Link href="/applicant/applications" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "14px 18px", border: "2px solid #eeeeee", background: "#ffffff", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    Semua Lamaran
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
        }
        button:hover { border-color: #FF5E00 !important; }
      `}</style>
    </div>
  );
}
