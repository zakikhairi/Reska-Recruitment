import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Division labels in Indonesian
export const DIVISION_LABELS: Record<string, string> = {
  ON_TRAIN_SERVICE: "Layanan Kereta",
  RES_CLEAN: "ResClean",
  RES_PARKING: "ResParking",
  LOGISTICS: "Logistik",
  IT_STAFF: "Staf IT",
  ADMIN: "Administrasi",
};

// Education labels in Indonesian
export const EDUCATION_LABELS: Record<string, string> = {
  SMA: "SMA/SMK",
  D3: "Diploma 3",
  S1: "Sarjana (S1)",
  S2: "Magister (S2)",
};

// Application status labels and colors
export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Menunggu",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  ADMIN_CHECK: {
    label: "Verifikasi Administrasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  TEST_SCHEDULED: {
    label: "Tes Terjadwal",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  IN_TEST: {
    label: "Sedang Tes",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  TEST_COMPLETED: {
    label: "Tes Selesai",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
  },
  INTERVIEW: {
    label: "Interview",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  MCU: {
    label: "MCU",
    color: "text-teal-700",
    bgColor: "bg-teal-100",
  },
  OFFERED: {
    label: "Ditawarkan",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  ACCEPTED: {
    label: "Diterima",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  REJECTED: {
    label: "Ditolak",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  WITHDRAWN: {
    label: "Dibatalkan",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

// Test category labels
export const CATEGORY_LABELS: Record<string, string> = {
  AKHLAK: "Nilai AKHLAK",
  HOSPITALITY: "Hospitaliti & Service Excellence",
  TECHNICAL: "Teknis & Operasional",
  FACILITY: "Manajemen Fasilitas",
  APTITUDE: "Aptitude & Logika",
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
};
