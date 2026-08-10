"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { CheckCircle, XCircle } from "lucide-react";

// Strict validation - only allow specific characters per field
const sanitizeInput = (value: string, fieldName: string): string => {
  switch (fieldName) {
    case "nik":
      return value.replace(/\D/g, "").slice(0, 16);
    case "phone":
      return value.replace(/\D/g, "").slice(0, 12);
    case "city":
      return value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
    case "postalCode":
      return value.replace(/\D/g, "").slice(0, 5);
    case "height":
      return value.replace(/\D/g, "").slice(0, 3);
    default:
      return value;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load existing profile data
  useEffect(() => {
    if (user?.applicantId && !isLoaded) {
      fetch(`/api/applicant/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile || data.applicant) {
            const a = data.profile || data.applicant;
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
            setIsLoaded(true);
          }
        })
        .catch(console.error);
    }
  }, [user, isLoaded]);

  // Enforce validation rules whenever form changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      nik: sanitizeInput(prev.nik, "nik"),
      phone: sanitizeInput(prev.phone, "phone"),
      city: sanitizeInput(prev.city, "city"),
      postalCode: sanitizeInput(prev.postalCode, "postalCode"),
      height: sanitizeInput(prev.height, "height"),
    }));
  }, [form.nik, form.phone, form.city, form.postalCode, form.height]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Apply sanitization for validated fields
    const sanitized = sanitizeInput(value, name);

    setForm(prev => ({ ...prev, [name]: sanitized }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nik || form.nik.length !== 16) {
      newErrors.nik = "NIK harus 16 digit";
    }

    if (!form.phone || form.phone.length !== 12) {
      newErrors.phone = "Nomor HP harus 12 digit";
    }

    if (form.city && !/^[a-zA-Z\s]+$/.test(form.city)) {
      newErrors.city = "Kota hanya bisa diisi huruf";
    }

    if (!form.postalCode || form.postalCode.length !== 5) {
      newErrors.postalCode = "Kode Pos harus 5 digit";
    }

    if (!form.height || form.height.length !== 3) {
      newErrors.height = "Tinggi harus 3 digit (cm)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Final sanitization before save
    const sanitizedForm = {
      ...form,
      nik: sanitizeInput(form.nik, "nik"),
      phone: sanitizeInput(form.phone, "phone"),
      city: sanitizeInput(form.city, "city"),
      postalCode: sanitizeInput(form.postalCode, "postalCode"),
      height: sanitizeInput(form.height, "height"),
    };

    // Validate
    if (!validateForm()) {
      showToast("Mohon lengkapi data dengan benar", "error");
      return;
    }

    try {
      const response = await fetch("/api/applicant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...sanitizedForm,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        setErrors({});
        showToast("Profil berhasil diperbarui!", "success");
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/applicant/dashboard");
        }, 1500);
      } else {
        const data = await response.json();
        showToast(data.error || "Gagal menyimpan profil", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Re-fetch data to reset
    setIsLoaded(false);
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
              <button onClick={handleCancel} style={{ padding: "12px 24px", background: "#fff", color: "#666", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
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
            {/* NIK */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                NIK <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="nik"
                    value={form.nik}
                    onChange={handleChange}
                    placeholder="16 digit angka"
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      border: `2px solid ${errors.nik ? "#ef4444" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none",
                      imeMode: "disabled"
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <p style={{ fontSize: "11px", color: errors.nik ? "#ef4444" : "#888" }}>
                      {errors.nik || `${form.nik.length}/16 digit`}
                    </p>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.nik || "-"}</p>
              )}
            </div>

            {/* Nomor HP */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Nomor HP <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="12 digit angka"
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      border: `2px solid ${errors.phone ? "#ef4444" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  <p style={{ fontSize: "11px", color: errors.phone ? "#ef4444" : "#888", marginTop: "4px" }}>
                    {errors.phone || `${form.phone.length}/12 digit`}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.phone || "-"}</p>
              )}
            </div>

            {/* Kota */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Kota <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Nama kota (huruf saja)"
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      border: `2px solid ${errors.city ? "#ef4444" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  {errors.city && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{errors.city}</p>}
                </>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.city || "-"}</p>
              )}
            </div>

            {/* Kode Pos */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Kode Pos <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="5 digit angka"
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      border: `2px solid ${errors.postalCode ? "#ef4444" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  <p style={{ fontSize: "11px", color: errors.postalCode ? "#ef4444" : "#888", marginTop: "4px" }}>
                    {errors.postalCode || `${form.postalCode.length}/5 digit`}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.postalCode || "-"}</p>
              )}
            </div>

            {/* Tinggi */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>
                Tinggi (cm) <span style={{ color: "#FF5E00" }}>*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="3 digit (contoh: 170)"
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      border: `2px solid ${errors.height ? "#ef4444" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  <p style={{ fontSize: "11px", color: errors.height ? "#ef4444" : "#888", marginTop: "4px" }}>
                    {errors.height || `${form.height.length}/3 digit`}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.height ? `${form.height} cm` : "-"}</p>
              )}
            </div>

            {/* Berat */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Berat (kg)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="Berat badan (kg)"
                  style={{ width: "100%", height: "44px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                />
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.weight ? `${form.weight} kg` : "-"}</p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Nama Lengkap</label>
              {isEditing ? (
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  style={{ width: "100%", height: "44px", padding: "0 14px", border: "2px solid #e5e5e5", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
              ) : (
                <p style={{ fontSize: "15px", color: "#111" }}>{form.fullName || "-"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>Email</label>
              <p style={{ fontSize: "15px", color: "#111" }}>{form.email}</p>
            </div>

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

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          animation: "toastSlideIn 0.3s ease",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            background: toast.type === "success" ? "#10B981" : "#EF4444",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: 600,
          }}>
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
