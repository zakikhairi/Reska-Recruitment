"use client";

import {
  ShieldCheck,
  Award,
  TrendingUp,
  Plane,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Users
} from "lucide-react";

export default function BenefitsShowcase() {
  const benefits = [
    {
      title: "Gaji & Tunjangan Standar BUMN",
      desc: "Kompensasi menarik sesuai regulasi ketenagakerjaan, tunjangan operasional dinas, dan bonus kinerja berkala.",
      icon: <TrendingUp size={24} color="#FF5E00" />,
      tag: "Kompensasi Finansial",
    },
    {
      title: "Proteksi Kesehatan Menyeluruh",
      desc: "Perlindungan BPJS Kesehatan dan BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) penuh untuk seluruh personel.",
      icon: <ShieldCheck size={24} color="#00205B" />,
      tag: "Kesejahteraan",
    },
    {
      title: "Diklat & Sertifikasi Resmi",
      desc: "Program pelatihan bersertifikasi resmi di bidang pelayanan, hospitality kereta api, dan keselamatan perkeretaapian.",
      icon: <Award size={24} color="#FF5E00" />,
      tag: "Pengembangan Diri",
    },
    {
      title: "Jenjang Karier di KAI Group",
      desc: "Peluang promosi jabatan internal dan jalur karier profesional di lingkungan keluarga besar PT Kereta Api Indonesia.",
      icon: <Sparkles size={24} color="#00205B" />,
      tag: "Karier Berkelanjutan",
    },
    {
      title: "Fasilitas Kerja & Seragam Lengkap",
      desc: "Disediakan seragam dinas berstandar estetika tinggi, ID Card resmi, dan perlengkapan penunjang tugas harian.",
      icon: <Users size={24} color="#FF5E00" />,
      tag: "Fasilitas Kerja",
    },
    {
      title: "Budaya Kerja Kolaboratif AKHLAK",
      desc: "Lingkungan kerja inklusif berlandaskan nilai inti BUMN: Amanah, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif.",
      icon: <HeartHandshake size={24} color="#00205B" />,
      tag: "Budaya Kerja",
    },
  ];

  return (
    <section id="mengapa" style={{ padding: "90px 32px", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", scrollMarginTop: "80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
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
            <Sparkles size={16} color="#FF5E00" />
            Keunggulan & Kesejahteraan Karyawan
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
            Mengapa Berkarier di KAI Services?
          </h2>
          <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "680px", margin: "0 auto" }}>
            Kami percaya bahwa pelayanan terbaik untuk jutaan penumpang kereta api berawal dari kepedulian tulus terhadap kesejahteraan setiap insan KAI Services.
          </p>
        </div>

        {/* Grid of Benefits */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
          className="benefits-grid"
        >
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="card-hover-lift"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "30px 26px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px -4px rgba(0, 32, 91, 0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: idx % 2 === 0 ? "#fff7ed" : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  {item.tag}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "10px",
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </h3>

              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
