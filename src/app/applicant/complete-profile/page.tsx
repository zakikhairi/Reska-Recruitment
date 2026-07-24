"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    nik: "",
    phone: "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    city: "",
    postalCode: "",
    education: "SMA",
    height: "",
    weight: "",
    university: "",
  });

  // Load existing profile data
  useEffect(() => {
    if (user?.applicantId) {
      fetch(`/api/applicant/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.applicant) {
            const a = data.applicant;
            setForm({
              fullName: a.fullName || "",
              nik: a.nik || "",
              phone: a.phone || "",
              placeOfBirth: a.placeOfBirth || "",
              dateOfBirth: a.dateOfBirth ? a.dateOfBirth.split("T")[0] : "",
              gender: a.gender || "MALE",
              address: a.address || "",
              city: a.city || "",
              postalCode: a.postalCode || "",
              education: a.education || "SMA",
              height: a.height?.toString() || "",
              weight: a.weight?.toString() || "",
              university: a.university || "",
            });

            // Check if profile is complete enough
            if (a.fullName && a.nik && a.phone) {
              setIsComplete(true);
            }
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!form.fullName || !form.nik || !form.phone) {
      setError("Nama, NIK, dan Nomor HP harus diisi");
      setIsLoading(false);
      return;
    }

    if (form.nik.length !== 16) {
      setError("NIK harus 16 digit");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/applicant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal menyimpan profil");
        setIsLoading(false);
        return;
      }

      // Update auth store with new data
      if (user) {
        setUser({
          ...user,
          fullName: form.fullName,
          fullProfile: {
            nik: form.nik,
            phone: form.phone,
            education: form.education,
          },
        });
      }

      alert("Profil berhasil disimpan!");
      router.push("/applicant/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
      setIsLoading(false);
    }
  };

  // If profile is complete, show success message with option to update
  if (isComplete && !error) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: "500px", width: "100%", background: "#fff", borderRadius: "20px", padding: "48px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "80px", height: "80px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", marginBottom: "12px" }}>Profil Sudah Lengkap</h1>
          <p style={{ fontSize: "15px", color: "#666", marginBottom: "32px" }}>
            Data profil Anda sudah lengkap. Anda dapat melamar lowongan yang tersedia.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/applicant/dashboard">
              <button style={{ width: "100%", height: "52px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                Buka Dashboard
              </button>
            </Link>
            <Link href="/applicant/profile">
              <button style={{ width: "100%", height: "52px", background: "#fff", color: "#666", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Edit Profil
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Lengkapi Data Diri</h1>
          <p style={{ fontSize: "15px", color: "#666" }}>Lengkapi informasi di bawah untuk dapat melamar pekerjaan</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", marginBottom: "20px", color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Section: Data Pribadi */}
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#00205B", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #eee" }}>
            📋 Data Pribadi
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Nama Lengkap *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Sesuai KTP"
                required
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>NIK (16 digit) *</label>
              <input
                type="text"
                name="nik"
                value={form.nik}
                onChange={handleChange}
                placeholder="3201234567890123"
                maxLength={16}
                required
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Nomor HP *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="081234567890"
                required
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Jenis Kelamin</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fff" }}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Tempat Lahir</label>
              <input
                type="text"
                name="placeOfBirth"
                value={form.placeOfBirth}
                onChange={handleChange}
                placeholder="Bandung"
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Tanggal Lahir</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          {/* Section: Alamat */}
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#00205B", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #eee" }}>
            🏠 Alamat
          </h3>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Alamat Lengkap</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="Jl. Merdeka No. 123, RT/RW 001/002"
              style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Kota</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Bandung"
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Kode Pos</label>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="40111"
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          {/* Section: Data Fisik & Pendidikan */}
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#00205B", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #eee" }}>
            📊 Data Fisik & Pendidikan
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Tinggi (cm)</label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                placeholder="170"
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Berat (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="65"
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Pendidikan</label>
              <select
                name="education"
                value={form.education}
                onChange={handleChange}
                style={{ width: "100%", height: "48px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fff" }}
              >
                <option value="SMA">SMA/SMK</option>
                <option value="D1">D1</option>
                <option value="D2">D2</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "56px",
              background: isLoading ? "#ccc" : "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: isLoading ? "none" : "0 4px 20px rgba(255,94,0,0.35)"
            }}
          >
            {isLoading ? (
              <>
                <div style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Menyimpan...
              </>
            ) : "Simpan & Lanjutkan"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#888" }}>
          Fields dengan * wajib diisi
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, select:focus, textarea:focus {
          border-color: #FF5E00 !important;
        }
      `}</style>
    </div>
  );
}
