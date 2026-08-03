"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Load profile from API on mount
  useEffect(() => {
    if (user?.applicantId) {
      fetch(`/api/applicant/profile`)
        .then((r) => r.json())
        .then((data) => {
          if (data.profile) {
            const p = data.profile;
            setForm({
              fullName: p.fullName || "",
              nik: p.nik || "",
              phone: p.phone || "",
              placeOfBirth: p.placeOfBirth || "",
              dateOfBirth: p.dateOfBirth || "",
              gender: p.gender || "MALE",
              address: p.address || "",
              city: p.city || "",
              postalCode: p.postalCode || "",
              education: p.education || "SMA",
              height: p.height?.toString() || "",
              weight: p.weight?.toString() || "",
              university: p.university || "",
            });
            if (p.fullName && p.nik && p.phone) setIsComplete(true);
          }
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
    } else if (user) {
      setIsLoaded(true);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!form.nik || form.nik.length !== 16) {
      setError("NIK harus 16 digit");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/applicant/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          nik: form.nik,
          phone: form.phone,
          placeOfBirth: form.placeOfBirth,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          education: form.education,
          height: form.height ? parseFloat(form.height) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          university: form.university || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan profil");
        setIsLoading(false);
        return;
      }

      alert("Profil berhasil disimpan!");
      router.push("/applicant/dashboard");
    } catch {
      setError("Terjadi kesalahan koneksi");
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Memuat...</p>
      </div>
    );
  }

  if (isComplete && !error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: "48px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "80px", height: "80px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", marginBottom: "12px" }}>Profil Sudah Lengkap</h1>
          <p style={{ color: "#666", marginBottom: "32px" }}>Data profil Anda sudah lengkap.</p>
          <Link href="/applicant/dashboard">
            <button style={{ width: "100%", height: "52px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}>
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
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "32px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Lengkapi Profil</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>Lengkapi data diri Anda</p>

        {error && (
          <div style={{ padding: "14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", marginBottom: "20px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {/* Personal Info */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>Informasi Pribadi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Nama Lengkap *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>NIK (16 digit) *</label>
              <input name="nik" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} required maxLength={16}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Nomor HP *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Tempat Lahir</label>
              <input name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Tanggal Lahir</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Jenis Kelamin</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }}>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingTop: "12px", borderTop: "1px solid #eee" }}>Alamat</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Alamat</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Kota</label>
              <input name="city" value={form.city} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Kode Pos</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
          </div>

          {/* Education */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingTop: "12px", borderTop: "1px solid #eee" }}>Pendidikan</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Pendidikan</label>
              <select name="education" value={form.education} onChange={handleChange}
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }}>
                <option value="SMA">SMA / SMK</option>
                <option value="D3">Diploma 3</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Universitas (jika ada)</label>
              <input name="university" value={form.university} onChange={handleChange} placeholder="Universitas"
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Tinggi (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="170"
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#222" }}>Berat (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="65"
                style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            style={{ width: "100%", height: "54px", background: isLoading ? "#ccc" : "linear-gradient(135deg, #FF5E00, #ff7a2f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer" }}>
            {isLoading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>

        <style>{`
          input:focus, select:focus, textarea:focus { border-color: #FF5E00 !important; }
        `}</style>
      </div>
    </div>
  );
}
