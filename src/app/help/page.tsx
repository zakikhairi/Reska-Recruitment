"use client";

import Link from "next/link";

export default function HelpPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "32px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/applicant/dashboard" style={{ padding: "10px", background: "#fff", borderRadius: "10px", textDecoration: "none", color: "#666" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B" }}>Pusat Bantuan</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* FAQ Cards */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Pertanyaan Umum</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  q: "Bagaimana cara melamar pekerjaan?",
                  a: "Daftar terlebih dahulu, lalu pilih lowongan yang tersedia dan klik 'Lamar Sekarang'. Ikuti langkah-langkah yang tertera."
                },
                {
                  q: "Berapa lama proses rekrutmen?",
                  a: "Proses rekrutmen biasanya memakan waktu 2-4 minggu tergantung posisi dan jumlah pelamar."
                },
                {
                  q: "Apa saja tahapan seleksi?",
                  a: "Tahapan meliputi: Administrasi → Tes Kompetensi → Interview → Medical Check-up → Offering."
                },
                {
                  q: "Bagaimana cara mengetahui status lamaran?",
                  a: "Masuk ke akun Anda dan cek menu 'Lamaran Saya' untuk melihat status terbaru."
                },
                {
                  q: "Apa itu Tes Kompetensi?",
                  a: "Tes Kompetensi adalah tes yang mengukur kemampuan Anda sesuai dengan posisi yang dilamar, meliputi nilai AKHLAK, Hospitality, dan Technical."
                },
              ].map((item, i) => (
                <div key={i} style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#00205B", marginBottom: "8px" }}>{item.q}</h3>
                  <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Hubungi Kami</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
              Jika Anda memiliki pertanyaan lain yang tidak terjawab di atas, silakan hubungi kami:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#888" }}>Email</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>hrd@kai-services.co.id</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205B" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#888" }}>Telepon</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>(021) 1234-5678</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
