"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data for applications
const applications = [
  {
    id: "1",
    jobTitle: "Pramugara / Pramugari Kereta Api",
    division: "ON_TRAIN_SERVICE",
    location: "Jakarta, Bandung, Surabaya",
    appliedDate: "2026-07-15",
    deadline: "2026-08-15",
    status: "ADMINISTRATION",
    score: null,
  },
  {
    id: "2",
    jobTitle: "Staff IT Support",
    division: "IT_STAFF",
    location: "Jakarta",
    appliedDate: "2026-07-18",
    deadline: "2026-08-10",
    status: "TEST",
    score: null,
  },
  {
    id: "3",
    jobTitle: "Steward Kereta Api",
    division: "ON_TRAIN_SERVICE",
    location: "Bandung",
    appliedDate: "2026-07-20",
    deadline: "2026-08-20",
    status: "ADMINISTRATION",
    score: null,
  }
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ADMINISTRATION: { bg: "#fef3c7", text: "#d97706", label: "Menunggu Administrasi" },
  TEST: { bg: "#dbeafe", text: "#2563eb", label: "Menunggu Tes" },
  TEST_COMPLETED: { bg: "#dcfce7", text: "#16a34a", label: "Tes Selesai" },
  INTERVIEW: { bg: "#e0e7ff", text: "#4f46e5", label: "Interview" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626", label: "Ditolak" },
};

export default function ApplicationsPage() {
  const [selectedApp, setSelectedApp] = useState(applications[0]);
  const [filter, setFilter] = useState("all");

  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Lamaran Saya</h1>
          <p style={{ fontSize: "14px", color: "#666666" }}>{applications.length} lamaran terdaftar</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          {/* Left - Application List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "ADMINISTRATION", "TEST", "INTERVIEW"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "8px 16px",
                  background: filter === f ? "#00205B" : "#fff",
                  color: filter === f ? "#fff" : "#666",
                  border: "2px solid",
                  borderColor: filter === f ? "#00205B" : "#e5e5e5",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  {f === "all" ? "Semua" : statusConfig[f]?.label || f}
                </button>
              ))}
            </div>

            {filteredApps.map((app) => {
              const status = statusConfig[app.status] || statusConfig.PENDING;
              const isSelected = selectedApp.id === app.id;
              return (
                <div key={app.id} onClick={() => setSelectedApp(app)} style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  border: `2px solid ${isSelected ? "#FF5E00" : "transparent"}`,
                  backgroundColor: isSelected ? "#fff7f0" : "#fff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{app.jobTitle}</h3>
                      <p style={{ fontSize: "13px", color: "#666" }}>{app.location}</p>
                    </div>
                    <span style={{ padding: "6px 12px", background: status.bg, color: status.text, borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{status.label}</span>
                  </div>
                  {app.score !== null && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>Skor:</span>
                      <div style={{ flex: 1, maxWidth: "100px", height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${app.score}%`, background: app.score >= 70 ? "#16a34a" : "#d97706", borderRadius: "4px" }} />
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: app.score >= 70 ? "#16a34a" : "#d97706" }}>{app.score}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right - Detail */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>{selectedApp.jobTitle}</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>{selectedApp.location}</p>
            <span style={{ display: "inline-block", padding: "8px 16px", background: statusConfig[selectedApp.status]?.bg, color: statusConfig[selectedApp.status]?.text, borderRadius: "20px", fontSize: "14px", fontWeight: 700, marginBottom: "24px" }}>
              {statusConfig[selectedApp.status]?.label}
            </span>

            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #eee" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#888", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Detail</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>Tanggal Lamar</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{new Date(selectedApp.appliedDate).toLocaleDateString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>Batas Lamar</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{new Date(selectedApp.deadline).toLocaleDateString("id-ID")}</span>
                </div>
                {selectedApp.score !== null && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>Skor Tes</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: selectedApp.score >= 70 ? "#16a34a" : "#d97706" }}>{selectedApp.score}%</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <Link href="/applicant/jobs">
                <button style={{ width: "100%", padding: "12px", background: "#f0f4ff", color: "#00205B", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Lihat Lowongan Lain</button>
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Link href="/applicant/dashboard" style={{ fontSize: "14px", color: "#FF5E00", textDecoration: "none", fontWeight: 600 }}>← Kembali ke Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
