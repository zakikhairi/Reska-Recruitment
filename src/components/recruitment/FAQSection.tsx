"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  MessageCircleQuestion,
  FileQuestion
} from "lucide-react";

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Administrasi",
      q: "Apakah pendaftaran rekrutmen KAI Services dipungut biaya?",
      a: "Sama sekali TIDAK DIPUNGUT BIAYA (100% GRATIS). Seluruh proses rekrutmen PT Reska Multi Usaha (KAI Services) tidak pernah memungut biaya apapun, tidak bekerja sama dengan agen travel mana pun, dan tidak meminta penggantian tiket akomodasi. Waspadalah terhadap penipuan.",
    },
    {
      category: "Administrasi",
      q: "Bolehkah saya melamar lebih dari satu posisi sekaligus?",
      a: "Setiap pelamar hanya dapat mengajukan 1 (satu) lamaran aktif pada periode rekrutmen yang sama agar fokus pada proses seleksi dan kompetensi posisi yang dipilih.",
    },
    {
      category: "Administrasi",
      q: "Format dan ukuran dokumen apa saja yang diperbolehkan untuk diunggah?",
      a: "Dokumen KTP, Ijazah, CV, dan Transkrip Nilai diunggah dalam format PDF atau JPG/PNG dengan ukuran berkas maksimal 2MB per dokumen. Pastikan tulisan dan angka pada scan dokumen terlihat jernih dan terbaca.",
    },
    {
      category: "Ujian CAT",
      q: "Bagaimana mekanisme pelaksanaan Ujian Online Kompetensi (CAT)?",
      a: "Setelah berkas Anda lolos verifikasi administrasi, jadwal ujian akan muncul di Dashboard Pelamar pada tab 'Jadwal Tes'. Anda dapat mengerjakan tes online langsung melalui browser menggunakan laptop atau komputer dengan webcam aktif.",
    },
    {
      category: "Ujian CAT",
      q: "Apa yang harus dilakukan jika koneksi internet terputus saat tes berlangsung?",
      a: "Sistem kami menyimpan jawaban Anda secara otomatis (auto-save). Jika koneksi terputus, segera refresh halaman dan lanjutkan pengerjaan selama batas waktu pengerjaan timer belum habis.",
    },
    {
      category: "Kesehatan & Wawancara",
      q: "Apakah ada standar tinggi badan untuk posisi On-Train Service?",
      a: "Ya. Untuk posisi Pramugara/Pramugari Kereta Api, standar tinggi badan minimal adalah 165 cm untuk Pria dan 160 cm untuk Wanita, dengan berat badan proporsional (BMI ideal) serta tidak buta warna.",
    },
    {
      category: "Kesehatan & Wawancara",
      q: "Kapan dan di mana pengumuman kelulusan setiap tahapan diberikan?",
      a: "Pengumuman resmi kelulusan setiap tahapan hanya diumumkan melalui Dashboard Pelamar di situs resmi rekrutmen ini serta notifikasi email ke alamat email yang Anda daftarkan.",
    },
  ];

  const categories = ["Semua", "Administrasi", "Ujian CAT", "Kesehatan & Wawancara"];

  const filteredFaqs = faqs.filter((faq) => {
    const matchCategory = activeCategory === "Semua" || faq.category === activeCategory;
    const matchSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section id="faq" style={{ padding: "90px 32px", background: "#ffffff" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(255, 94, 0, 0.1)",
              color: "#FF5E00",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <HelpCircle size={16} />
            Pusat Informasi & Bantuan Pelamar
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
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p style={{ fontSize: "16px", color: "#64748b" }}>
            Temukan jawaban cepat seputar persyaratan, jadwal tes, dan tata cara rekrutmen KAI Services.
          </p>
        </div>

        {/* Search Input & Category Filters */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <Search
              size={18}
              color="#9ca3af"
              style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Cari pertanyaan seputar berkas, tes online, persyaratan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 20px 14px 48px",
                borderRadius: "14px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                outline: "none",
                transition: "border-color 0.2s",
                background: "#f8fafc",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF5E00")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeCategory === cat ? "#00205B" : "#f1f5f9",
                  color: activeCategory === cat ? "#ffffff" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "16px" }}>
              <FileQuestion size={32} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#64748b", margin: 0 }}>Tidak ada pertanyaan yang sesuai dengan pencarian Anda.</p>
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: "16px",
                    border: isOpen ? "1.5px solid #00205B" : "1px solid #e2e8f0",
                    background: isOpen ? "#ffffff" : "#f8fafc",
                    overflow: "hidden",
                    transition: "all 0.25s ease",
                    boxShadow: isOpen ? "0 8px 24px -6px rgba(0, 32, 91, 0.08)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "20px 24px",
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: isOpen ? "#00205B" : "#1e293b",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.q}
                    </span>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: isOpen ? "#00205B" : "#e2e8f0",
                        color: isOpen ? "#ffffff" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease, background 0.2s",
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 24px 22px 24px",
                        fontSize: "14px",
                        lineHeight: 1.8,
                        color: "#475569",
                        borderTop: "1px solid #f1f5f9",
                        marginTop: "4px",
                        paddingTop: "14px",
                        animation: "slideInUp 0.2s ease-out forwards",
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
