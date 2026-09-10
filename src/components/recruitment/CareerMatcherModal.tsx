"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  MapPin,
  Flame,
  Award
} from "lucide-react";
import { JobDetail } from "./JobQuickViewModal";

interface CareerMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobDetail[];
  onSelectJob: (job: JobDetail) => void;
}

export default function CareerMatcherModal({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
}: CareerMatcherModalProps) {
  const [step, setStep] = useState<number>(1);
  const [education, setEducation] = useState<string>("SMA");
  const [interest, setInterest] = useState<string>("ON_TRAIN_SERVICE");
  const [locationPref, setLocationPref] = useState<string>("Semua");
  const [height, setHeight] = useState<number>(165);

  if (!isOpen) return null;

  // Calculate recommendation results
  const calculateMatches = () => {
    return jobs.map((job) => {
      let score = 50;

      // Education match
      if (job.minEducation) {
        if (job.minEducation === education) score += 25;
        else if (education === "S1" || education === "D3") score += 20;
        else score += 10;
      }

      // Division / Interest match
      if (job.division === interest) {
        score += 25;
      }

      // Height match
      if (job.minHeight) {
        if (height >= job.minHeight) score += 15;
        else score -= 15;
      }

      // Location match
      if (locationPref !== "Semua" && job.location && job.location.toLowerCase().includes(locationPref.toLowerCase())) {
        score += 15;
      }

      const finalScore = Math.min(Math.max(score, 40), 99);
      return {
        job,
        score: finalScore,
      };
    }).sort((a, b) => b.score - a.score);
  };

  const matches = calculateMatches();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 20, 60, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "modalFadeIn 0.25s ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "600px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 32, 91, 0.35)",
          animation: "modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          border: "1px solid rgba(0, 32, 91, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #FF5E00 0%, #E04E00 100%)",
            padding: "24px 28px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.25)",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Smart Career AI
            </span>
            <Sparkles size={16} />
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
            Career Matcher KAI Services
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.9 }}>
            Temukan posisi yang paling cocok dengan latar belakang & minat Anda dalam 3 langkah cepat.
          </p>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: "4px",
                  borderRadius: "2px",
                  background: step >= s ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px 28px", minHeight: "320px", display: "flex", flexDirection: "column" }}>
          {step === 1 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>
                Langkah 1: Pendidikan Terakhir Anda
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "18px" }}>
                Pilih jenjang pendidikan yang telah Anda selesaikan:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[
                  { id: "SMA", label: "SMA / SMK Sederajat", desc: "Lulusan sekolah menengah" },
                  { id: "D3", label: "Diploma (D3)", desc: "Lulusan program diploma" },
                  { id: "S1", label: "Sarjana (S1 / D4)", desc: "Lulusan sarjana/terapan" },
                  { id: "S2", label: "Magister (S2)", desc: "Lulusan pascasarjana" },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEducation(item.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      border: education === item.id ? "2px solid #FF5E00" : "1.5px solid #e5e7eb",
                      background: education === item.id ? "#fff7ed" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "14px", color: education === item.id ? "#FF5E00" : "#111827" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>
                  Tinggi Badan Anda (cm): <strong style={{ color: "#FF5E00" }}>{height} cm</strong>
                </label>
                <input
                  type="range"
                  min="150"
                  max="195"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#FF5E00", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af" }}>
                  <span>150 cm</span>
                  <span>170 cm</span>
                  <span>195 cm</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>
                Langkah 2: Minat Bidang Pekerjaan
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "18px" }}>
                Pilih divisi kerja di mana Anda ingin berkarier:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { id: "ON_TRAIN_SERVICE", label: "Layanan Kereta (On-Train Service)", desc: "Pramugara/i, Steward, Restorasi & Kuliner Kereta" },
                  { id: "RES_CLEAN", label: "ResClean & Sanitasi Armada", desc: "Standar kebersihan stasiun dan armada kereta api" },
                  { id: "RES_PARKING", label: "ResParking (Manajemen Parkir)", desc: "Pengelolaan dan sistem tiket perparkiran stasiun" },
                  { id: "LOGISTICS", label: "Logistik & Pergudangan KAI", desc: "Manajemen rantai pasok dan operasional logistik" },
                  { id: "IT_STAFF", label: "IT & Administrasi Perusahaan", desc: "Pengembangan sistem, software, dan administrasi perkantoran" },
                ].map((div) => (
                  <div
                    key={div.id}
                    onClick={() => setInterest(div.id)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: interest === div.id ? "2px solid #00205B" : "1.5px solid #e5e7eb",
                      background: interest === div.id ? "#eff6ff" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: interest === div.id ? "#00205B" : "#111827" }}>
                        {div.label}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{div.desc}</div>
                    </div>
                    {interest === div.id && <CheckCircle2 size={18} color="#00205B" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>
                Langkah 3: Preferensi Wilayah Kerja
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "18px" }}>
                Pilih wilayah penempatan yang Anda harapkan:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { id: "Semua", label: "Siap di Mana Saja", desc: "Fleksibel seluruh Daop/Divre" },
                  { id: "Jakarta", label: "Jabodetabek / Daop 1", desc: "Jakarta, Bogor, Depok, Bekasi" },
                  { id: "Bandung", label: "Jawa Barat / Daop 2", desc: "Bandung dan sekitarnya" },
                  { id: "Semarang", label: "Jawa Tengah / Daop 4 & 5", desc: "Semarang, Purwokerto, Solo" },
                  { id: "Surabaya", label: "Jawa Timur / Daop 8 & 9", desc: "Surabaya, Malang, Jember" },
                  { id: "Sumatera", label: "Divre Sumatera", desc: "Medan, Padang, Palembang" },
                ].map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setLocationPref(loc.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: locationPref === loc.id ? "2px solid #FF5E00" : "1.5px solid #e5e7eb",
                      background: locationPref === loc.id ? "#fff7ed" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "14px", color: locationPref === loc.id ? "#FF5E00" : "#111827" }}>
                      {loc.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{loc.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Award size={20} color="#FF5E00" />
                <span style={{ fontWeight: 800, fontSize: "17px", color: "#00205B" }}>
                  Rekomendasi Posisi Terbaik Untuk Anda
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
                Berdasarkan pendidikan {education}, minat kerja, dan profil Anda:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {matches.slice(0, 3).map((match, idx) => (
                  <div
                    key={match.job.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border: idx === 0 ? "2px solid #FF5E00" : "1px solid #e5e7eb",
                      background: idx === 0 ? "#fffaf5" : "#ffffff",
                      boxShadow: idx === 0 ? "0 4px 12px rgba(255,94,0,0.12)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: idx === 0 ? "#FF5E00" : "#00205B",
                            color: "#ffffff",
                          }}
                        >
                          {match.score}% Cocok
                        </span>
                        {idx === 0 && (
                          <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: 700 }}>
                            ★ Rekomendasi Utama
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                        {match.job.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        {match.job.location || "Seluruh Daop/Divre"} • Min. {match.job.minEducation || "SMA"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectJob(match.job);
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: "#00205B",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Detail
                      </button>
                      <Link href={`/auth/register?job=${match.job.id}`}>
                        <button
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#FF5E00",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Lamar
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ marginTop: "auto", paddingTop: "20px", display: "flex", justifyContent: "space-between" }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#f3f4f6",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={16} />
                Sebelumnya
              </button>
            )}

            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  marginLeft: "auto",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  background: "#FF5E00",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(255,94,0,0.3)",
                }}
              >
                Lanjut
                <ArrowRight size={16} />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                style={{
                  marginLeft: "auto",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #00205B 0%, #003399 100%)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(0,32,91,0.3)",
                }}
              >
                <Sparkles size={16} />
                Lihat Hasil Rekomendasi
              </button>
            )}

            {step === 4 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  marginLeft: "auto",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#f3f4f6",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Ulangi Kuis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
