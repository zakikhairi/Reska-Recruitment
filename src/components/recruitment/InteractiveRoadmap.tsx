"use client";

import { useState } from "react";
import {
  FileCheck,
  MonitorCheck,
  Users2,
  HeartPulse,
  Award,
  CheckCircle,
  Lightbulb,
  Clock,
  ShieldAlert,
  ChevronRight
} from "lucide-react";

export default function InteractiveRoadmap() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: 0,
      number: "01",
      title: "Pendaftaran Akun & Profil",
      shortDesc: "Pembuatan akun resmi & pengisian biodata",
      duration: "10 - 15 Menit",
      icon: <FileCheck size={22} />,
      color: "#00205B",
      details: [
        "Buat akun dengan email aktif dan NIK yang valid.",
        "Lengkapi data pribadi: kontak, alamat domisili, dan riwayat pendidikan.",
        "Pastikan nomor WhatsApp aktif untuk verifikasi OTP dan notifikasi darurat.",
      ],
      tips: "Periksa kembali ejaan nama lengkap dan NIK sesuai KTP asli agar tidak bermasalah saat sinkronisasi ijazah.",
      documents: ["KTP Elektronik (e-KTP)", "Email & No. HP Aktif", "Pas Foto Terbaru"],
    },
    {
      id: 1,
      number: "02",
      title: "Seleksi Administrasi & Berkas",
      shortDesc: "Verifikasi dokumen oleh tim verifikator HRD",
      duration: "3 - 5 Hari Kerja",
      icon: <CheckCircle size={22} />,
      color: "#003399",
      details: [
        "Unggah berkas dalam format PDF/JPG berukuran maksimal 2MB per dokumen.",
        "Tim verifikator memeriksa keaslian ijazah, transkrip, dan surat keterangan sehat.",
        "Hasil verifikasi akan langsung diumumkan di Dashboard pelamar & notifikasi email.",
      ],
      tips: "Pastikan hasil scan dokumen jelas terbaca, tidak buram, dan tidak terpotong pada bagian tepi atau nomor ijazah.",
      documents: ["Ijazah Asli / SKL Legalisir", "Transkrip Nilai", "Surat Bebas Narkoba (Opsional awal)"],
    },
    {
      id: 2,
      number: "03",
      title: "Ujian Online Berbasis CAT",
      shortDesc: "Tes kompetensi, logika & kepribadian digital",
      duration: "60 - 90 Menit",
      icon: <MonitorCheck size={22} />,
      color: "#FF5E00",
      details: [
        "Ujian online langsung dapat diakses lewat Dashboard Pelamar pada menu Jadwal Tes.",
        "Materi tes meliputi: Tes Kompetensi Bidang Perkeretaapian, Logika Numerik & Verbal, serta Karakteristik Pribadi.",
        "Dilengkapi sistem timer otomatis dan rekam jejak penilaian real-time.",
      ],
      tips: "Gunakan laptop/PC dengan koneksi internet stabil dan browser Google Chrome ter-update untuk pengalaman tes terbaik.",
      documents: ["Perangkat Laptop / PC dengan Webcam", "Koneksi Internet Stabil"],
    },
    {
      id: 3,
      number: "04",
      title: "Wawancara (Interview) HRD & User",
      shortDesc: "Eksplorasi motivasi, integritas, dan keahlian",
      duration: "30 - 45 Menit per kandidat",
      icon: <Users2 size={22} />,
      color: "#2563eb",
      details: [
        "Wawancara tatap muka atau daring (Zoom) bersama tim HRD dan User Divisi terkait.",
        "Penilaian mencakup kemampuan komunikasi, integritas, keramahan layanan (service excellence), dan kesiapan kerja lapangan.",
        "Bagi kandidat On-Train, dilakukan pengukuran tinggi/berat badan ulang.",
      ],
      tips: "Pelajari profil dan nilai-nilai inti KAI Services (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif - AKHLAK).",
      documents: ["Curriculum Vitae (CV) Terkini", "Portofolio Prestasi (jika ada)"],
    },
    {
      id: 4,
      number: "05",
      title: "Medical Check-Up (MCU)",
      shortDesc: "Pemeriksaan kesehatan fisik & bebas narkoba",
      duration: "1 Hari Pemeriksaan",
      icon: <HeartPulse size={22} />,
      color: "#059669",
      details: [
        "Pemeriksaan kesehatan menyeluruh di klinik/laboratorium yang ditunjuk oleh PT Reska Multi Usaha.",
        "Mencakup pemeriksaan darah, rontgen paru-paru, tes penglihatan (buta warna), pendengaran, dan tes bebas narkoba.",
        "Standar kesehatan mengacu pada regulasi keselamatan transportasi perkeretaapian.",
      ],
      tips: "Istirahat cukup minimal 8 jam sebelum tes dan puasa makan 10-12 jam sebelum pemeriksaan laboratorium.",
      documents: ["Kartu Identitas Diri", "Surat Pengantar MCU dari KAI Services"],
    },
    {
      id: 5,
      number: "06",
      title: "Offering & Pelatihan Onboarding",
      shortDesc: "Penandatanganan kontrak kerja & orientasi",
      duration: "1 - 2 Minggu Diklat",
      icon: <Award size={22} />,
      color: "#7c3aed",
      details: [
        "Penjelasan hak, kewajiban, gaji, benefit, dan penandatanganan Perjanjian Kerja Waktu Tertentu (PKWT).",
        "Pemberian seragam resmi, badge pegawai, dan perlengkapan dinas.",
        "Mengikuti program orientasi dan Diklat Service Excellence KAI Services.",
      ],
      tips: "Siapkan rekening bank aktif yang bekerja sama (Bank Mandiri / BNI / BRI) untuk pencairan payroll gaji dan tunjangan.",
      documents: ["Buku Rekening Payroll", "NPWP", "SKCK Aktif"],
    },
  ];

  const current = stages[activeStage];

  return (
    <section style={{ padding: "80px 32px", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(0, 32, 91, 0.08)",
              color: "#00205B",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Clock size={16} color="#FF5E00" />
            Alur Perekrutan Transparan & Terstandar
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#00205B",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Roadmap Menjadi Bagian Dari KAI Services
          </h2>
          <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "680px", margin: "0 auto" }}>
            Seluruh tahapan rekrutmen dilakukan secara objektif, transparan, dan bebas biaya. Klik setiap tahapan untuk melihat panduan lengkap dan tips sukses.
          </p>
        </div>

        {/* Step Tabs Horizontal */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "12px",
            marginBottom: "32px",
          }}
          className="roadmap-tabs-grid"
        >
          {stages.map((stg) => {
            const isActive = activeStage === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(stg.id)}
                style={{
                  padding: "16px 12px",
                  borderRadius: "16px",
                  background: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                  border: isActive ? `2px solid ${stg.color}` : "1px solid #e2e8f0",
                  boxShadow: isActive ? "0 10px 25px -5px rgba(0, 32, 91, 0.12)" : "none",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "center",
                  transform: isActive ? "translateY(-4px)" : "translateY(0)",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: isActive ? stg.color : "#f1f5f9",
                    color: isActive ? "#ffffff" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    transition: "all 0.2s",
                  }}
                >
                  {stg.icon}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: isActive ? stg.color : "#94a3b8" }}>
                  TAHAP {stg.number}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: isActive ? "#0f172a" : "#475569",
                    marginTop: "2px",
                    lineHeight: 1.3,
                  }}
                >
                  {stg.title.split(" ")[0]} {stg.title.split(" ")[1] || ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Detailed Panel */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "36px 40px",
            boxShadow: "0 12px 36px -8px rgba(0, 32, 91, 0.08)",
            border: "1px solid #e2e8f0",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}
          className="roadmap-panel-grid"
        >
          {/* Left Column: Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: current.color,
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                Tahap {current.number}
              </span>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} />
                Estimasi Waktu: <strong>{current.duration}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#00205B", margin: "0 0 12px" }}>
              {current.title}
            </h3>

            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, marginBottom: "24px" }}>
              {current.shortDesc}
            </p>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                Rincian Aktivitas Tahapan Ini:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {current.details.map((dt, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#e0e7ff",
                        color: "#00205B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>{dt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tips & Documents */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* HR Tips Box */}
            <div
              style={{
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #fed7aa",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", fontWeight: 800, fontSize: "15px", marginBottom: "10px" }}>
                <Lightbulb size={20} />
                Tips Sukses dari Tim HRD
              </div>
              <p style={{ fontSize: "14px", color: "#9a3412", lineHeight: 1.7, margin: 0 }}>
                &ldquo;{current.tips}&rdquo;
              </p>
            </div>

            {/* Documents Required */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                Kelengkapan / Dokumen Terkait:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {current.documents.map((doc, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
