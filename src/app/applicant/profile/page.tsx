"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    nik: "",
    phone: "",
    email: user?.email || "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    city: "",
    postalCode: "",
    education: "",
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
              email: user?.email || "",
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
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/applicant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...form,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        alert("Profil berhasil diperbarui!");
      } else {
        alert("Gagal menyimpan profil");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Profil Saya</h1>
            <p style={{ fontSize: "14px", color: "#666666" }}>Kelola informasi profil Anda</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ padding: "12px 24px", background: "#FF5E00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              Edit Profil
            </button>
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: "12px 24px", background: "#fff", color: "#666", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={handleSave} style={{ padding: "12px 24px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Simpan
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "28px", fontWeight: 700 }}>
              {form.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "AW"}
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{form.fullName || "Nama Lengkap"}</h2>
              <p style={{ fontSize: "14px", color: "#666" }}>{form.email}</p>
              <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#dcfce7", color: "#16a34a", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Pelamar</span>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              { label: "Nama Lengkap", name: "fullName", type: "text", value: form.fullName },
              { label: "NIK", name: "nik", type: "text", value: form.nik },
              { label: "Nomor HP", name: "phone", type: "tel", value: form.phone },
              { label: "Email", name: "email", type: "email", value: form.email },
              { label: "Kota", name: "city", type: "text", value: form.city },
              { label: "Kode Pos", name: "postalCode", type: "text", value: form.postalCode },
              { label: "Tinggi (cm)", name: "height", type: "number", value: form.height },
              { label: "Berat (kg)", name: "weight", type: "number", value: form.weight },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>{field.label}</label>
                {isEditing ? (
                  <input type={field.type} name={field.name} value={field.value} onChange={handleChange}
                    style={{ width: "100%", height: "44px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
                ) : (
                  <p style={{ fontSize: "15px", color: "#111" }}>{field.value || "-"}</p>
                )}
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Jenis Kelamin</label>
              {isEditing ? (
                <select name="gender" value={form.gender} onChange={handleChange}
                  style={{ width: "100%", height: "44px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fff" }}>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.gender === "MALE" ? "Laki-laki" : "Perempuan"}</p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Pendidikan</label>
              {isEditing ? (
                <select name="education" value={form.education} onChange={handleChange}
                  style={{ width: "100%", height: "44px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fff" }}>
                  <option value="SMA">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.education || "-"}</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Alamat</label>
            {isEditing ? (
              <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }} />
            ) : (
              <p style={{ fontSize: "15px", color: "#111" }}>{form.address || "-"}</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Aksi Cepat</h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/applicant/jobs">
              <button style={{ padding: "12px 20px", background: "#f0f4ff", color: "#00205B", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Lihat Lowongan</button>
            </Link>
            <Link href="/applicant/dashboard">
              <button style={{ padding: "12px 20px", background: "#f8f9fa", color: "#666", border: "2px solid #eee", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
