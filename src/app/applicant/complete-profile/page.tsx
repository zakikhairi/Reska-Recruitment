"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { updateUser, findUserById } from "@/lib/local-db";

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

  // Load existing profile data from local database
  useEffect(() => {
    if (user?.id) {
      const userData = findUserById(user.id);
      if (userData) {
        setForm({
          fullName: userData.fullName || "",
          nik: userData.nik || "",
          phone: userData.phone || "",
          placeOfBirth: userData.placeOfBirth || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender || "MALE",
          address: userData.address || "",
          city: userData.city || "",
          postalCode: userData.postalCode || "",
          education: userData.education || "SMA",
          height: userData.height?.toString() || "",
          weight: userData.weight?.toString() || "",
          university: userData.university || "",
        });

        // Check if profile is complete enough
        if (userData.fullName && userData.nik && userData.phone) {
          setIsComplete(true);
        }
      }
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
      // Update in local database
      const updated = updateUser(user!.id, {
        fullName: form.fullName,
        nik: form.nik,
        phone: form.phone,
        placeOfBirth: form.placeOfBirth,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        education: form.education,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        university: form.university || undefined,
      });

      if (!updated) {
        setError("Gagal menyimpan profil");
        setIsLoading(false);
        return;
      }

      // Update auth store with new data
      setUser({
        ...user!,
        fullName: form.fullName,
        nik: form.nik,
        phone: form.phone,
        education: form.education,
      });

      alert("Profil berhasil disimpan!");
      router.push("/applicant/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan");
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
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#f8f9fa", padding: "32px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "8px" }}>Lengkapi Profil</h1>
          <p style={{ fontSize: "15px", color: "#666" }}>Lengkapi data diri Anda untuk dapat melamar posisi yang tersedia</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", marginBottom: "20px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {/* Personal Info Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
              Informasi Pribadi
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Nama Lengkap *</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>NIK (16 digit) *</label>
                <input type="text" name="nik" value={form.nik} onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setForm({ ...form, nik: value });
                }} required maxLength={16}
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Nomor HP *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="08xxxxxxxxxx"
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Tempat Lahir</label>
                <input type="text" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange}
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Tanggal Lahir</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Jenis Kelamin</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", background: "#fff" }}>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
              Alamat
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Alamat Lengkap</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Kota</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange}
                    style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Kode Pos</label>
                  <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange}
                    style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
              Pendidikan
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Pendidikan Terakhir</label>
                <select name="education" value={form.education} onChange={handleChange}
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none", background: "#fff" }}>
                  <option value="SMA">SMA / SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Universitas (opsional)</label>
                <input type="text" name="university" value={form.university} onChange={handleChange} placeholder="Jika sudah lulus"
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>
            </div>
          </div>

          {/* Physical Info Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
              Informasi Fisik (opsional)
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Tinggi Badan (cm)</label>
                <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="170"
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#222", marginBottom: "8px" }}>Berat Badan (kg)</label>
                <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="65"
                  style={{ width: "100%", height: "50px", padding: "0 16px", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "15px", outline: "none" }} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} style={{
            width: "100%",
            height: "54px",
            background: isLoading ? "#ccc" : "linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 20px rgba(255,94,0,0.35)"
          }}>
            {isLoading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>

      <style>{`
        input:focus, select:focus, textarea:focus {
          border-color: #FF5E00 !important;
        }
      `}</style>
    </div>
  );
}
