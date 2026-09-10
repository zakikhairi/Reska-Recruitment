"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Send,
  Upload,
  Activity,
  Award,
  HeartPulse,
  Paperclip,
  ExternalLink,
  Edit,
  Download,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui";

const DB_KEY = "kai_recruitment_db";

interface ApplicantData {
  application: {
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
  };
  applicant: {
    id: string;
    fullName: string;
    email: string;
    nik?: string;
    phone?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    education?: string;
    university?: string;
    height?: number;
    weight?: number;
    photoUrl?: string;
    documents: Array<{
      id: string;
      type: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: string;
    }>;
  };
  job: {
    id: string;
    title: string;
    division: string;
    location: string;
  };
  interview?: {
    id: string;
    interviewer: string;
    scheduledAt: string;
    location?: string | null;
    type?: string | null;
    zoomLink?: string | null;
    score?: number | null;
    result?: string | null;
    notes?: string | null;
    aspects?: {
      communication?: number;
      technicalSkill?: number;
      personality?: number;
      leadership?: number;
      motivation?: number;
    } | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  mcu?: {
    id: string;
    scheduledAt: string;
    location: string;
    result?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  testSession?: {
    id: string;
    status: string;
    scheduledAt?: string | null;
    endTime?: string | null;
    location?: string | null;
    adminMessage?: string | null;
    totalScore?: number | null;
    passed?: boolean | null;
  } | null;
  offering?: {
    id: string;
    salary: number;
    salaryPeriod: string;
    startDate: string;
    employmentType: string;
    contractDuration?: number | null;
    contractEndDate?: string | null;
    probationMonths?: number | null;
    workLocation?: string | null;
    positionTitle?: string | null;
    benefits?: string | null;
    notes?: string | null;
    status: string;
    acceptedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}

// Helper functions for localStorage sync
function getLocalDB() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function saveLocalDB(db: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return { bg: "#fef3c7", text: "#d97706", label: "Menunggu", icon: Clock };
    case "ADMIN_CHECK":
      return { bg: "#dbeafe", text: "#2563eb", label: "Verifikasi", icon: AlertCircle };
    case "TEST_SCHEDULED":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "Tes Terjadwal", icon: Clock };
    case "IN_TEST":
      return { bg: "#fef3c7", text: "#d97706", label: "Sedang Tes", icon: Clock };
    case "TEST_COMPLETED":
      return { bg: "#d1fae5", text: "#059669", label: "Tes Selesai", icon: CheckCircle };
    case "INTERVIEW":
      return { bg: "#fae8ff", text: "#c026d3", label: "Interview", icon: User };
    case "MCU":
      return { bg: "#e0e7ff", text: "#4f46e5", label: "MCU", icon: CheckCircle };
    case "OFFERING":
      return { bg: "#fef3c7", text: "#d97706", label: "Offering", icon: CheckCircle };
    case "ACCEPTED":
      return { bg: "#d1fae5", text: "#059669", label: "Diterima", icon: CheckCircle };
    case "REJECTED":
      return { bg: "#fee2e2", text: "#dc2626", label: "Ditolak", icon: XCircle };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: status, icon: Clock };
  }
};

const documentTypes = [
  { key: "CV", label: "Curriculum Vitae (CV)", icon: FileText },
  { key: "KTPCARD", label: "KTP", icon: FileText },
  { key: "IJAZAH", label: "Ijazah", icon: GraduationCap },
  { key: "TRANSCRIPT", label: "Transkrip Nilai", icon: FileText },
  { key: "SKCK", label: "Pas Foto 3x4", icon: Image },
  { key: "CERTIFICATE", label: "Sertifikat", icon: FileText },
  { key: "MCU", label: "Hasil / Berkas MCU", icon: HeartPulse },
  { key: "INTERVIEW_NOTE", label: "Catatan Interview", icon: Award },
];

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;

  const [data, setData] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [editedPersonal, setEditedPersonal] = useState({
    fullName: "",
    nik: "",
    phone: "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
  });
  const [editedEducation, setEditedEducation] = useState({
    education: "",
    university: "",
    height: "",
    weight: "",
  });

  // Modal states for Interview (Separated: Schedule vs Score)
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [scheduleInterviewForm, setScheduleInterviewForm] = useState({
    interviewer: "Tim HRD KAI Services",
    scheduledAt: "",
    location: "Kantor Pusat KAI Services / Online",
    type: "ONLINE",
    zoomLink: "",
    notes: "",
  });

  const [showScoreInterviewModal, setShowScoreInterviewModal] = useState(false);
  const [scoreInterviewForm, setScoreInterviewForm] = useState({
    score: 83,
    result: "PASSED",
    aspects: {
      communication: 85,
      technicalSkill: 80,
      personality: 85,
      leadership: 75,
      motivation: 90,
    },
    notes: "",
    advanceStatus: true,
  });

  // Modal states for MCU (Separated: Schedule at Balai Yasa vs Result/Upload)
  const [showScheduleMcuModal, setShowScheduleMcuModal] = useState(false);
  const [scheduleMcuForm, setScheduleMcuForm] = useState({
    location: "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
    scheduledAt: "",
    examiner: "Tim Medis Balai Yasa & Klinik Mediska KAI",
    notes: "1. Wajib berpuasa 10-12 jam sebelum pemeriksaan laboratorium (hanya diperkenankan minum air putih).\n2. Membawa Kartu Tanda Penduduk (KTP) asli dan pas foto berwarna 4x6 (2 lembar).\n3. Mengenakan kemeja putih rapi dan celana bahan sopan.\n4. Hadir tepat waktu 15 menit sebelum jadwal pemeriksaan di Kantor Balai Yasa.",
  });

  const [showResultMcuModal, setShowResultMcuModal] = useState(false);
  const [resultMcuForm, setResultMcuForm] = useState({
    result: "FIT",
    notes: "",
    advanceStatus: true,
  });
  const [mcuFile, setMcuFile] = useState<File | null>(null);
  const [isSubmittingMcu, setIsSubmittingMcu] = useState(false);

  // Modal states for Offering Letter
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [isSubmittingOffering, setIsSubmittingOffering] = useState(false);
  const [offeringForm, setOfferingForm] = useState({
    salary: "",
    salaryPeriod: "MONTHLY",
    startDate: "",
    employmentType: "CONTRACT",
    contractDuration: "12",
    probationMonths: "3",
    workLocation: "",
    positionTitle: "",
    benefits: "",
    notes: "",
  });

  // Modal state for Test Scheduling
  const [showScheduleTestModal, setShowScheduleTestModal] = useState(false);
  const [scheduleTestForm, setScheduleTestForm] = useState({
    scheduledAt: "",
    endTime: "",
    location: "Online System (Portal CBT KAI Services)",
    adminMessage: "Silakan login ke portal karir KAI Services tepat waktu. Pastikan koneksi internet stabil dan perangkat Anda dilengkapi webcam aktif.",
    notes: "Berkas dan dokumen persyaratan telah diverifikasi dan memenuhi kriteria.",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openScheduleTestModal = () => {
    if (data?.testSession?.scheduledAt) {
      setScheduleTestForm({
        scheduledAt: data.testSession.scheduledAt ? new Date(data.testSession.scheduledAt).toISOString().slice(0, 16) : "",
        endTime: data.testSession.endTime ? new Date(data.testSession.endTime).toISOString().slice(0, 16) : "",
        location: data.testSession.location || "Online System (Portal CBT KAI Services)",
        adminMessage: data.testSession.adminMessage || "Silakan login ke portal karir KAI Services tepat waktu. Pastikan koneksi internet stabil dan perangkat Anda dilengkapi webcam aktif.",
        notes: "Berkas dan dokumen persyaratan telah diverifikasi dan memenuhi kriteria.",
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(11, 0, 0, 0);

      const formatLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setScheduleTestForm({
        scheduledAt: formatLocal(tomorrow),
        endTime: formatLocal(tomorrowEnd),
        location: "Online System (Portal CBT KAI Services)",
        adminMessage: "Silakan login ke portal karir KAI Services tepat waktu. Pastikan koneksi internet stabil dan perangkat Anda dilengkapi webcam aktif.",
        notes: "Berkas dan dokumen persyaratan telah diverifikasi dan memenuhi kriteria.",
      });
    }
    setShowScheduleTestModal(true);
  };

  const handleConfirmScheduleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const localDB = getLocalDB();
      const response = await fetch(`/api/admin/applications/${applicantId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: data?.application.status === "TEST_SCHEDULED" ? "schedule_test" : "approve",
          notes: scheduleTestForm.notes,
          testSchedule: {
            scheduledAt: scheduleTestForm.scheduledAt,
            endTime: scheduleTestForm.endTime,
            location: scheduleTestForm.location,
            adminMessage: scheduleTestForm.adminMessage,
          },
          db: localDB,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.db) saveLocalDB(result.db);
        setShowScheduleTestModal(false);
        await fetchApplicantData();
        showToast(result.message || "Berkas disetujui & jadwal tes berhasil ditetapkan!", "success");
      } else {
        showToast(result.error || "Gagal menjadwalkan tes", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses jadwal tes", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openScheduleInterviewModal = () => {
    if (data?.interview?.scheduledAt) {
      setScheduleInterviewForm({
        interviewer: data.interview.interviewer || "Tim HRD KAI Services",
        scheduledAt: new Date(data.interview.scheduledAt).toISOString().slice(0, 16),
        location: data.interview.location || "Kantor Pusat KAI Services / Online",
        type: data.interview.type || "ONLINE",
        zoomLink: data.interview.zoomLink || "",
        notes: data.interview.notes?.split("[Rincian Skor")[0]?.trim() || "",
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const formatLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setScheduleInterviewForm({
        interviewer: "Tim HRD KAI Services",
        scheduledAt: formatLocal(tomorrow),
        location: "Kantor Pusat KAI Services / Online",
        type: "ONLINE",
        zoomLink: "https://meet.google.com/kai-recruitment",
        notes: "Harap hadir 15 menit sebelum waktu wawancara dimulai dan mengenakan kemeja formal putih rapi.",
      });
    }
    setShowScheduleInterviewModal(true);
  };

  const handleSaveInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "schedule",
          ...scheduleInterviewForm,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showToast("Jadwal wawancara berhasil ditetapkan!", "success");
        setShowScheduleInterviewModal(false);
        await fetchApplicantData();
      } else {
        showToast(result.error || "Gagal menetapkan jadwal wawancara", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan jadwal wawancara", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAspectScoreChange = (key: string, val: number) => {
    const updatedAspects = {
      ...scoreInterviewForm.aspects,
      [key]: val,
    };
    const avg = Math.round(
      (updatedAspects.communication +
       updatedAspects.technicalSkill +
       updatedAspects.personality +
       updatedAspects.leadership +
       updatedAspects.motivation) / 5
    );
    setScoreInterviewForm((prev) => ({
      ...prev,
      aspects: updatedAspects,
      score: avg,
      result: avg >= 75 ? (prev.result === "FAILED" ? "PASSED" : prev.result) : (prev.result === "PASSED" ? "FAILED" : prev.result),
    }));
  };

  const openScoreInterviewModal = () => {
    if (!data?.interview?.scheduledAt) {
      showToast("Harap tetapkan jadwal wawancara terlebih dahulu!", "error");
      return;
    }

    const initialAspects = {
      communication: data?.interview?.aspects?.communication ?? 85,
      technicalSkill: data?.interview?.aspects?.technicalSkill ?? 80,
      personality: data?.interview?.aspects?.personality ?? 85,
      leadership: data?.interview?.aspects?.leadership ?? 75,
      motivation: data?.interview?.aspects?.motivation ?? 90,
    };

    const calculatedAvg = Math.round(
      (initialAspects.communication +
       initialAspects.technicalSkill +
       initialAspects.personality +
       initialAspects.leadership +
       initialAspects.motivation) / 5
    );

    setScoreInterviewForm({
      score: data?.interview?.score ?? calculatedAvg,
      result: data?.interview?.result || (calculatedAvg >= 75 ? "PASSED" : "FAILED"),
      aspects: initialAspects,
      notes: data?.interview?.notes?.split("[Rincian Skor")[0]?.trim() || "",
      advanceStatus: true,
    });
    setShowScoreInterviewModal(true);
  };

  const handleSaveInterviewScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "score",
          score: scoreInterviewForm.score,
          result: scoreInterviewForm.result,
          aspectScores: scoreInterviewForm.aspects,
          notes: scoreInterviewForm.notes,
          advanceStatus: scoreInterviewForm.advanceStatus,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showToast("Nilai dan evaluasi wawancara berhasil disimpan!", "success");
        setShowScoreInterviewModal(false);
        await fetchApplicantData();
      } else {
        showToast(result.error || "Gagal menyimpan hasil wawancara", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan nilai wawancara", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openScheduleMcuModal = () => {
    if (data?.mcu?.scheduledAt) {
      setScheduleMcuForm({
        location: data.mcu.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
        scheduledAt: new Date(data.mcu.scheduledAt).toISOString().slice(0, 16),
        examiner: "Tim Medis Balai Yasa & Klinik Mediska KAI",
        notes: data.mcu.notes || "1. Wajib berpuasa 10-12 jam sebelum pemeriksaan laboratorium (hanya diperkenankan minum air putih).\n2. Membawa Kartu Tanda Penduduk (KTP) asli dan pas foto berwarna 4x6 (2 lembar).\n3. Mengenakan kemeja putih rapi dan celana bahan sopan.\n4. Hadir tepat waktu 15 menit sebelum jadwal pemeriksaan di Kantor Balai Yasa.",
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(8, 0, 0, 0);
      const formatLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setScheduleMcuForm({
        location: "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
        scheduledAt: formatLocal(tomorrow),
        examiner: "Tim Medis Balai Yasa & Klinik Mediska KAI",
        notes: "1. Wajib berpuasa 10-12 jam sebelum pemeriksaan laboratorium (hanya diperkenankan minum air putih).\n2. Membawa Kartu Tanda Penduduk (KTP) asli dan pas foto berwarna 4x6 (2 lembar).\n3. Mengenakan kemeja putih rapi dan celana bahan sopan.\n4. Hadir tepat waktu 15 menit sebelum jadwal pemeriksaan di Kantor Balai Yasa.",
      });
    }
    setShowScheduleMcuModal(true);
  };

  const handleSaveMcuSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/mcu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "schedule",
          location: scheduleMcuForm.location,
          scheduledAt: scheduleMcuForm.scheduledAt,
          notes: scheduleMcuForm.notes,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showToast("Jadwal MCU offline di Balai Yasa berhasil ditetapkan!", "success");
        setShowScheduleMcuModal(false);
        await fetchApplicantData();
      } else {
        showToast(result.error || "Gagal menetapkan jadwal MCU", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan jadwal MCU", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openResultMcuModal = () => {
    if (!data?.mcu?.scheduledAt) {
      showToast("Harap tetapkan jadwal MCU offline di Balai Yasa terlebih dahulu!", "error");
      return;
    }
    setResultMcuForm({
      result: data?.mcu?.result || "FIT",
      notes: data?.mcu?.notes || "",
      advanceStatus: true,
    });
    setMcuFile(null);
    setShowResultMcuModal(true);
  };

  const openMcuModal = () => {
    if (data?.mcu?.scheduledAt) {
      openResultMcuModal();
    } else {
      openScheduleMcuModal();
    }
  };

  const handleSaveMcuResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMcu(true);
    try {
      const formData = new FormData();
      formData.append("actionType", "result");
      formData.append("location", data?.mcu?.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)");
      if (data?.mcu?.scheduledAt) formData.append("scheduledAt", data.mcu.scheduledAt);
      formData.append("result", resultMcuForm.result);
      formData.append("notes", resultMcuForm.notes);
      formData.append("advanceStatus", String(resultMcuForm.advanceStatus));
      if (mcuFile) {
        formData.append("file", mcuFile);
      }

      const response = await fetch(`/api/admin/applications/${applicantId}/mcu`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        showToast("Hasil dan berkas MCU berhasil disimpan!", "success");
        setShowResultMcuModal(false);
        setMcuFile(null);
        await fetchApplicantData();
      } else {
        showToast(result.error || "Gagal menyimpan hasil MCU", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan hasil MCU", "error");
    } finally {
      setIsSubmittingMcu(false);
    }
  };

  const startEditPersonal = () => {
    const appApplicant = data?.applicant;
    if (!appApplicant) return;
    setEditedPersonal({
      fullName: appApplicant.fullName || "",
      nik: appApplicant.nik || "",
      phone: appApplicant.phone || "",
      placeOfBirth: appApplicant.placeOfBirth || "",
      dateOfBirth: appApplicant.dateOfBirth ? appApplicant.dateOfBirth.split("T")[0] : "",
      gender: appApplicant.gender || "",
      address: appApplicant.address || "",
      city: appApplicant.city || "",
    });
    setIsEditingPersonal(true);
  };

  const startEditEducation = () => {
    const appApplicant = data?.applicant;
    if (!appApplicant) return;
    setEditedEducation({
      education: appApplicant.education || "",
      university: appApplicant.university || "",
      height: appApplicant.height?.toString() || "",
      weight: appApplicant.weight?.toString() || "",
    });
    setIsEditingEducation(true);
  };

  const savePersonalData = async () => {
    setActionLoading(true);
    try {
      const localDB = getLocalDB();
      const response = await fetch(`/api/admin/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "personal",
          data: editedPersonal,
          db: localDB,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.db) saveLocalDB(result.db);
        await fetchApplicantData();
        setIsEditingPersonal(false);
        showToast("Data pribadi berhasil diperbarui", "success");
      } else {
        showToast(result.error || "Gagal memperbarui data", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const saveEducationData = async () => {
    setActionLoading(true);
    try {
      const localDB = getLocalDB();
      const response = await fetch(`/api/admin/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "education",
          data: editedEducation,
          db: localDB,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.db) saveLocalDB(result.db);
        await fetchApplicantData();
        setIsEditingEducation(false);
        showToast("Data pendidikan berhasil diperbarui", "success");
      } else {
        showToast(result.error || "Gagal memperbarui data", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantData();
  }, [applicantId]);

  const fetchApplicantData = async () => {
    try {
      // Get local database to sync with server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/verify`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        // If server returned updated database, save to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectModal) {
      setShowRejectModal(true);
      return;
    }

    setActionLoading(true);
    try {
      // Get local database to send to server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: action === "reject" ? rejectNotes : undefined,
          db: localDB, // Send local database to server
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save updated database from server to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
        // Refresh data
        await fetchApplicantData();
        setShowRejectModal(false);
        setRejectNotes("");
        showToast(result.message, "success");
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      // Get local database to send to server
      const localDB = getLocalDB();

      const response = await fetch(`/api/admin/applications/${applicantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: undefined, // Notes handled separately in verify route
          db: localDB, // Send local database to server
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save updated database from server to localStorage
        if (result.db) {
          saveLocalDB(result.db);
        }
        await fetchApplicantData();
        showToast(`Status berhasil diubah ke: ${getStatusConfig(newStatus).label}. Email notifikasi sudah dikirim.`, "success");
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Offering Letter submission
  const handleSaveOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOffering(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/offering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: parseInt(offeringForm.salary),
          salaryPeriod: offeringForm.salaryPeriod,
          startDate: offeringForm.startDate,
          employmentType: offeringForm.employmentType,
          contractDuration: offeringForm.employmentType === "CONTRACT" ? parseInt(offeringForm.contractDuration) : null,
          probationMonths: offeringForm.employmentType === "PERMANENT" ? parseInt(offeringForm.probationMonths) : null,
          workLocation: offeringForm.workLocation,
          positionTitle: offeringForm.positionTitle || data?.job?.title,
          benefits: offeringForm.benefits,
          notes: offeringForm.notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchApplicantData();
        setShowOfferingModal(false);
        showToast("Offering letter berhasil dibuat dan dikirim ke pelamar!", "success");
      } else {
        showToast(result.error || "Gagal membuat offering letter", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat membuat offering", "error");
    } finally {
      setIsSubmittingOffering(false);
    }
  };

  // Handle Accept from Offering
  const handleAcceptOffering = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/offering`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchApplicantData();
        showToast("Pelamar berhasil diterima sebagai karyawan!", "success");
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memproses", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #eeeeee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666666" }}>Memuat data pelamar...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <AlertCircle className="w-16 h-16" style={{ color: "#ef4444", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Data Tidak Ditemukan</h2>
          <p style={{ color: "#666666", marginBottom: "24px" }}>{error || "Pelamar tidak ditemukan"}</p>
          <Link href="/admin/applicants">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Pelamar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { application, applicant, job } = data;
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  const divisionLabels: Record<string, string> = {
    ON_TRAIN_SERVICE: "On-Train Service",
    RES_CLEAN: "ResClean",
    RES_PARKING: "ResParking",
    LOGISTICS: "Logistics",
    IT_STAFF: "IT Staff",
    ADMIN: "Administrasi",
  };

  const genderLabels: Record<string, string> = {
    MALE: "Laki-laki",
    FEMALE: "Perempuan",
  };

  const educationLabels: Record<string, string> = {
    SMA: "SMA/SMK",
    D3: "Diploma 3",
    S1: "Sarjana (S1)",
    S2: "Magister (S2)",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111111", margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #eeeeee", padding: "20px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link href="/admin/applicants" style={{ textDecoration: "none", color: "#666666" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", marginBottom: "12px", cursor: "pointer" }}>
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Pelamar
            </span>
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
                {applicant.photoUrl ? (
                  <img src={applicant.photoUrl} alt={applicant.fullName || "Foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "24px", fontWeight: 700 }}>
                    {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
                  </div>
                )}
              </div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>{applicant.fullName || "Nama Tidak Diketahui"}</h1>
                <p style={{ fontSize: "15px", color: "#666666", marginBottom: "8px" }}>ID: {application.id}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: statusConfig.bg, color: statusConfig.text, borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Action Buttons - tampil sesuai dengan status aplikasi */}

            {/* Status PENDING - Tombol untuk mulai verifikasi */}
            {application.status === "PENDING" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                <button
                  onClick={() => handleAdvanceStatus("ADMIN_CHECK")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#f59e0b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Mulai Verifikasi
                </button>
              </div>
            )}

            {(application.status === "ADMIN_CHECK" || application.status === "TEST_SCHEDULED" || application.status === "TEST_COMPLETED" || application.status === "INTERVIEW") && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                {application.status === "ADMIN_CHECK" && (
                  <button
                    onClick={openScheduleTestModal}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verifikasi Lulus & Jadwalkan Tes
                  </button>
                )}
                {application.status === "TEST_SCHEDULED" && (
                  <>
                    <button
                      onClick={openScheduleTestModal}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 24px",
                        background: "#4f46e5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                      }}
                    >
                      <Calendar className="w-5 h-5" />
                      Ubah Jadwal Tes
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus("IN_TEST")}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 24px",
                        background: "#d97706",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                      }}
                    >
                      <Clock className="w-5 h-5" />
                      Mulai Sesi Tes
                    </button>
                  </>
                )}
                {application.status === "TEST_COMPLETED" && (
                  <button
                    onClick={openScheduleInterviewModal}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#7c3aed",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    Jadwalkan Wawancara
                  </button>
                )}
                {application.status === "INTERVIEW" && (
                  <>
                    {!data?.interview?.scheduledAt ? (
                      <button
                        onClick={openScheduleInterviewModal}
                        disabled={actionLoading}
                        style={{
                          padding: "12px 24px",
                          background: "#7c3aed",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity: actionLoading ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                        }}
                      >
                        <Calendar className="w-5 h-5" />
                        Atur Jadwal Wawancara
                      </button>
                    ) : data?.interview?.score === null || data?.interview?.score === undefined ? (
                      <>
                        <button
                          onClick={openScheduleInterviewModal}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 20px",
                            background: "#ffffff",
                            color: "#4f46e5",
                            border: "2px solid #4f46e5",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                          Ubah Jadwal
                        </button>
                        <button
                          onClick={openScoreInterviewModal}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 24px",
                            background: "#c026d3",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 12px rgba(192, 38, 211, 0.3)",
                          }}
                        >
                          <Award className="w-5 h-5" />
                          Input Nilai Wawancara
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={openScoreInterviewModal}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 20px",
                            background: "#fae8ff",
                            color: "#c026d3",
                            border: "1px solid #d8b4fe",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Award className="w-5 h-5" />
                          Edit Nilai Wawancara
                        </button>
                        <button
                          onClick={() => handleAdvanceStatus("MCU")}
                          disabled={actionLoading}
                          style={{
                            padding: "12px 24px",
                            background: "#0891b2",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            opacity: actionLoading ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)",
                          }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Lanjut ke MCU
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            {/* MCU -> Offering */}
            {application.status === "MCU" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                {!data?.mcu?.scheduledAt ? (
                  <button
                    onClick={openScheduleMcuModal}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    Jadwalkan MCU Offline Balai Yasa
                  </button>
                ) : !data?.mcu?.result ? (
                  <>
                    <button
                      onClick={openScheduleMcuModal}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 20px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        border: "1px solid #c7d2fe",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Calendar className="w-5 h-5" />
                      Ubah Jadwal MCU
                    </button>
                    <button
                      onClick={openResultMcuModal}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      Input & Upload Berkas MCU
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={openResultMcuModal}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 20px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        border: "1px solid #c7d2fe",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      Edit Berkas MCU
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus("OFFERING")}
                      disabled={actionLoading}
                      style={{
                        padding: "12px 24px",
                        background: "#059669",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                      }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Lanjut ke Offering
                    </button>
                  </>
                )}
              </div>
            )}
            {/* Offering -> Accepted */}
            {application.status === "OFFERING" && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={actionLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
                {!data?.offering ? (
                  <button
                    onClick={() => {
                      setOfferingForm({
                        ...offeringForm,
                        positionTitle: data?.job?.title || "",
                        workLocation: data?.job?.location || "",
                      });
                      setShowOfferingModal(true);
                    }}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <Send className="w-5 h-5" />
                    Buat Offering Letter
                  </button>
                ) : (
                  <button
                    onClick={() => handleAcceptOffering()}
                    disabled={actionLoading}
                    style={{
                      padding: "12px 24px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Terima Pelamar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "28px" }}>
          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Info Lowongan */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Briefcase className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Informasi Lowongan
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Posisi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{job.title || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Divisi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{divisionLabels[job.division] || job.division || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Lokasi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{job.location || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tanggal Lamar</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                    {new Date(application.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Pribadi */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                  <User className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  Data Pribadi
                </h2>
                {!isEditingPersonal ? (
                  <button
                    onClick={startEditPersonal}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f4ff",
                      color: "#00205B",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setIsEditingPersonal(false)}
                      style={{
                        padding: "8px 16px",
                        background: "#ffffff",
                        color: "#666666",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={savePersonalData}
                      disabled={actionLoading}
                      style={{
                        padding: "8px 16px",
                        background: "#00205B",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {actionLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Nama Lengkap</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.fullName}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, fullName: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.fullName || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>NIK</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.nik}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, nik: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.nik || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Email</p>
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.email || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>No. Telepon</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.phone}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.phone || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tempat Lahir</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.placeOfBirth}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, placeOfBirth: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.placeOfBirth || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tanggal Lahir</p>
                  {isEditingPersonal ? (
                    <input
                      type="date"
                      value={editedPersonal.dateOfBirth}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, dateOfBirth: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>
                      {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Jenis Kelamin</p>
                  {isEditingPersonal ? (
                    <select
                      value={editedPersonal.gender}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, gender: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff" }}
                    >
                      <option value="">Pilih</option>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{genderLabels[applicant.gender || ""] || applicant.gender || "-"}</p>
                  )}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Alamat</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.address}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, address: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.address || "-"}, {applicant.city || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Kota</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editedPersonal.city}
                      onChange={(e) => setEditedPersonal({ ...editedPersonal, city: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.city || "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Data Pendidikan */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                  <GraduationCap className="w-5 h-5" style={{ color: "#FF5E00" }} />
                  Data Pendidikan
                </h2>
                {!isEditingEducation ? (
                  <button
                    onClick={startEditEducation}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f4ff",
                      color: "#00205B",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setIsEditingEducation(false)}
                      style={{
                        padding: "8px 16px",
                        background: "#ffffff",
                        color: "#666666",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveEducationData}
                      disabled={actionLoading}
                      style={{
                        padding: "8px 16px",
                        background: "#00205B",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {actionLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Pendidikan Terakhir</p>
                  {isEditingEducation ? (
                    <select
                      value={editedEducation.education}
                      onChange={(e) => setEditedEducation({ ...editedEducation, education: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff" }}
                    >
                      <option value="">Pilih</option>
                      <option value="SMA">SMA/SMK</option>
                      <option value="D3">Diploma 3</option>
                      <option value="S1">Sarjana (S1)</option>
                      <option value="S2">Magister (S2)</option>
                    </select>
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{educationLabels[applicant.education || ""] || applicant.education || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Universitas (jika ada)</p>
                  {isEditingEducation ? (
                    <input
                      type="text"
                      value={editedEducation.university}
                      onChange={(e) => setEditedEducation({ ...editedEducation, university: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.university || "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Tinggi Badan (cm)</p>
                  {isEditingEducation ? (
                    <input
                      type="number"
                      value={editedEducation.height}
                      onChange={(e) => setEditedEducation({ ...editedEducation, height: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.height ? `${applicant.height} cm` : "-"}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888888", marginBottom: "4px", textTransform: "uppercase" }}>Berat Badan (kg)</p>
                  {isEditingEducation ? (
                    <input
                      type="number"
                      value={editedEducation.weight}
                      onChange={(e) => setEditedEducation({ ...editedEducation, weight: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>{applicant.weight ? `${applicant.weight} kg` : "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dokumen Pendukung */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="w-5 h-5" style={{ color: "#FF5E00" }} />
                Dokumen Pendukung
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {documentTypes.map((doc) => {
                  const DocIcon = doc.icon;
                  const uploadedDoc = data?.applicant?.documents?.find(d => d.type === doc.key);
                  const hasDocument = !!uploadedDoc;
                  return (
                    <div
                      key={doc.key}
                      style={{
                        padding: "16px",
                        background: hasDocument ? "#f0fdf4" : "#f8f9fa",
                        borderRadius: "12px",
                        border: `2px solid ${hasDocument ? "#d1fae5" : "#eeeeee"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{
                        width: "44px",
                        height: "44px",
                        background: hasDocument ? "#d1fae5" : "#eeeeee",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <DocIcon className="w-5 h-5" style={{ color: hasDocument ? "#16a34a" : "#888888" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", marginBottom: "2px" }}>{doc.label}</p>
                        <p style={{ fontSize: "12px", color: hasDocument ? "#16a34a" : "#888888" }}>
                          {hasDocument ? uploadedDoc.fileName : "Belum diupload"}
                        </p>
                      </div>
                      {hasDocument && (
                        <a
                          href={uploadedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "8px 12px",
                            background: "#ffffff",
                            border: "1px solid #d1fae5",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#16a34a",
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                        >
                          Lihat
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Jadwal & Sesi Tes Kompetensi */}
            {(["TEST_SCHEDULED", "IN_TEST", "TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) || data.testSession) && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e0e7ff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                    <Calendar className="w-5 h-5" style={{ color: "#4f46e5" }} />
                    Jadwal & Sesi Tes Kompetensi
                  </h2>
                  <button
                    onClick={openScheduleTestModal}
                    style={{
                      padding: "8px 16px",
                      background: "#e0e7ff",
                      color: "#4f46e5",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    {data.testSession?.scheduledAt ? "Ubah Jadwal Tes" : "Jadwalkan Tes"}
                  </button>
                </div>

                {data.testSession?.scheduledAt ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "16px", background: "#f5f7ff", borderRadius: "12px", border: "1px solid #c7d2fe" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Waktu Mulai Tes</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>
                          {new Date(data.testSession.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Batas Akhir / Selesai</p>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                          {data.testSession.endTime ? new Date(data.testSession.endTime).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Format / Lokasi</p>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                          {data.testSession.location || "Online System (Portal CBT KAI Services)"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Status Pelaksanaan</p>
                        <div>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: data.testSession.status === "COMPLETED" || data.testSession.status === "SUBMITTED" || data.testSession.status === "SCORED"
                              ? "#d1fae5"
                              : data.testSession.status === "IN_PROGRESS"
                              ? "#fef3c7"
                              : "#e0e7ff",
                            color: data.testSession.status === "COMPLETED" || data.testSession.status === "SUBMITTED" || data.testSession.status === "SCORED"
                              ? "#059669"
                              : data.testSession.status === "IN_PROGRESS"
                              ? "#d97706"
                              : "#4f46e5",
                          }}>
                            {data.testSession.status === "COMPLETED" || data.testSession.status === "SUBMITTED" || data.testSession.status === "SCORED" ? "Selesai Dikerjakan" : data.testSession.status === "IN_PROGRESS" ? "Sedang Mengerjakan" : "Menunggu Pelaksanaan"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {data.testSession.adminMessage && (
                      <div style={{ padding: "14px", background: "#f8f9fa", borderRadius: "10px", borderLeft: "4px solid #4f46e5" }}>
                        <p style={{ fontSize: "12px", color: "#4338ca", fontWeight: 700, marginBottom: "4px" }}>Pesan / Instruksi dari Admin:</p>
                        <p style={{ fontSize: "14px", color: "#333333", lineHeight: 1.6, margin: 0 }}>{data.testSession.adminMessage}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 16px", background: "#f5f7ff", borderRadius: "12px", border: "1px dashed #c7d2fe" }}>
                    <Calendar className="w-10 h-10" style={{ color: "#4f46e5", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111", marginBottom: "4px" }}>Jadwal Tes Belum Ditetapkan</p>
                    <p style={{ fontSize: "13px", color: "#666666", marginBottom: "16px" }}>
                      Tentukan waktu pelaksanaan tes kompetensi dan instruksi pengerjaan untuk pelamar ini.
                    </p>
                    <button
                      onClick={openScheduleTestModal}
                      style={{
                        padding: "10px 20px",
                        background: "#4f46e5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Jadwalkan Tes Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hasil Evaluasi Wawancara */}
            {(["TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) || data.interview) && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #fae8ff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fae8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Award className="w-5 h-5" style={{ color: "#c026d3" }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", margin: 0 }}>
                        {!data.interview?.scheduledAt
                          ? "Jadwal & Evaluasi Wawancara"
                          : data.interview.score === null || data.interview.score === undefined
                          ? "Jadwal Wawancara Terjadwal"
                          : "Hasil Evaluasi Wawancara"}
                      </h2>
                      <p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>
                        Tahap seleksi wawancara kompetensi & etika AKHLAK
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!data.interview?.scheduledAt ? (
                      <button
                        onClick={openScheduleInterviewModal}
                        style={{
                          padding: "8px 16px",
                          background: "#7c3aed",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        Jadwalkan Wawancara
                      </button>
                    ) : data.interview.score === null || data.interview.score === undefined ? (
                      <>
                        <button
                          onClick={openScheduleInterviewModal}
                          style={{
                            padding: "8px 14px",
                            background: "#ffffff",
                            color: "#4f46e5",
                            border: "1px solid #c7d2fe",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                          Ubah Jadwal
                        </button>
                        <button
                          onClick={openScoreInterviewModal}
                          style={{
                            padding: "8px 16px",
                            background: "#c026d3",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 8px rgba(192, 38, 211, 0.25)",
                          }}
                        >
                          <Award className="w-4 h-4" />
                          Input Nilai Wawancara
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={openScoreInterviewModal}
                        style={{
                          padding: "8px 16px",
                          background: "#fae8ff",
                          color: "#c026d3",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Nilai Wawancara
                      </button>
                    )}
                  </div>
                </div>

                {/* Content: 3 States */}
                {!data.interview?.scheduledAt ? (
                  <div style={{ textAlign: "center", padding: "32px 20px", background: "#fdf4ff", borderRadius: "14px", border: "1px dashed #e879f9" }}>
                    <Calendar className="w-12 h-12" style={{ color: "#c026d3", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", margin: "0 0 6px 0" }}>
                      Wawancara Belum Dijadwalkan
                    </h3>
                    <p style={{ fontSize: "13px", color: "#666666", maxWidth: "480px", margin: "0 auto 18px", lineHeight: 1.5 }}>
                      Pelamar telah menyelesaikan tes kompetensi online. Silakan tentukan jadwal pelaksanaan wawancara (tanggal, waktu, format online/tatap muka, dan pewawancara) terlebih dahulu.
                    </p>
                    <button
                      onClick={openScheduleInterviewModal}
                      style={{
                        padding: "10px 24px",
                        background: "#7c3aed",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      Jadwalkan Wawancara Sekarang
                    </button>
                  </div>
                ) : data.interview.score === null || data.interview.score === undefined ? (
                  /* STATE 2: SUDAH DIJADWALKAN, MENUNGGU PELAKSANAAN & INPUT NILAI */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", padding: "18px", background: "#faf5ff", borderRadius: "12px", border: "1px solid #f3e8ff" }}>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Pewawancara / HRD</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>{data.interview.interviewer || "Tim HRD KAI Services"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Jadwal Wawancara</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>
                          {new Date(data.interview.scheduledAt).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Format & Ruangan</p>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0 }}>
                          {data.interview.type === "ONLINE" ? "Online (Zoom / Meet)" : "Tatap Muka"} - {data.interview.location || "Kantor Pusat KAI Services"}
                        </p>
                        {data.interview.zoomLink && (
                          <a
                            href={data.interview.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "12px", color: "#2563eb", textDecoration: "underline", display: "inline-block", marginTop: "2px" }}
                          >
                            Buka Link Meeting ↗
                          </a>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Status Evaluasi</p>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          background: "#fef3c7",
                          color: "#d97706",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid #fde68a",
                        }}>
                          <Clock className="w-3.5 h-3.5" />
                          Menunggu Pelaksanaan / Nilai
                        </span>
                      </div>
                    </div>

                    {/* Pesan / Catatan Jadwal */}
                    {data.interview.notes && (
                      <div style={{ padding: "14px 16px", background: "#f8f9fa", borderRadius: "10px", borderLeft: "4px solid #7c3aed" }}>
                        <p style={{ fontSize: "12px", color: "#6b21a8", fontWeight: 700, margin: "0 0 4px 0" }}>Instruksi / Catatan Jadwal untuk Pelamar:</p>
                        <p style={{ fontSize: "13.5px", color: "#333333", lineHeight: 1.5, margin: 0 }}>{data.interview.notes}</p>
                      </div>
                    )}

                    {/* Callout Aksi Input Nilai */}
                    <div style={{
                      background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      border: "1.5px solid #f0abfc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}>
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#701a75", margin: "0 0 2px 0" }}>
                          Sesi Wawancara Telah Selesai Dilaksanakan?
                        </h4>
                        <p style={{ fontSize: "12.5px", color: "#86198f", margin: 0 }}>
                          Input skor kompetensi, nilai aspek AKHLAK, dan keputusan evaluasi agar pelamar dapat lanjut ke tahap MCU.
                        </p>
                      </div>
                      <button
                        onClick={openScoreInterviewModal}
                        style={{
                          padding: "10px 20px",
                          background: "#c026d3",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "13.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(192, 38, 211, 0.3)",
                          flexShrink: 0,
                        }}
                      >
                        <Award className="w-4 h-4" />
                        Input Nilai Wawancara
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STATE 3: SUDAH DINILAI (EVALUASI LENGKAP) */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "16px", background: "#fdf4ff", borderRadius: "12px", border: "1px solid #f5d0fe" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Pewawancara / HRD</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>{data.interview.interviewer || "-"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Waktu Pelaksanaan</p>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111", margin: 0 }}>
                          {data.interview.scheduledAt ? new Date(data.interview.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Format & Lokasi</p>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111", margin: 0 }}>
                          {data.interview.type === "ONLINE" ? "Online (Zoom / Meet)" : "Tatap Muka"} - {data.interview.location || "Kantor Pusat KAI Services"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#86198f", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Hasil & Skor Akhir</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "20px", fontWeight: 800, color: (data.interview.score ?? 0) >= 75 ? "#059669" : "#dc2626" }}>
                            {data.interview.score ?? "-"} / 100
                          </span>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: data.interview.result === "PASSED" ? "#d1fae5" : data.interview.result === "FAILED" ? "#fee2e2" : "#fef3c7",
                            color: data.interview.result === "PASSED" ? "#059669" : data.interview.result === "FAILED" ? "#dc2626" : "#d97706",
                          }}>
                            {data.interview.result === "PASSED" ? "LULUS" : data.interview.result === "FAILED" ? "TIDAK LULUS" : "RESCHEDULE"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Aspek Kompetensi */}
                    {data.interview.aspects && (
                      <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #eeeeee" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "12px" }}>Penilaian Rinci Aspek Kompetensi:</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          {[
                            { label: "Komunikasi & Artikulasi", val: data.interview.aspects.communication },
                            { label: "Kemampuan Teknis & Pemahaman Kerja", val: data.interview.aspects.technicalSkill },
                            { label: "Sikap, Etika & Nilai AKHLAK", val: data.interview.aspects.personality },
                            { label: "Kepemimpinan & Inisiatif", val: data.interview.aspects.leadership },
                            { label: "Motivasi & Komitmen terhadap KAI", val: data.interview.aspects.motivation },
                          ].map((asp, idx) => (
                            <div key={idx} style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontSize: "12px", color: "#555555", fontWeight: 500 }}>{asp.label}</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#00205B" }}>{asp.val ?? "-"}/100</span>
                              </div>
                              <div style={{ width: "100%", height: "6px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{
                                  width: `${Math.min(100, Math.max(0, asp.val || 0))}%`,
                                  height: "100%",
                                  background: (asp.val || 0) >= 75 ? "#10b981" : (asp.val || 0) >= 60 ? "#f59e0b" : "#ef4444",
                                  borderRadius: "4px"
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catatan Wawancara */}
                    {data.interview.notes && (
                      <div style={{ padding: "14px", background: "#fdf8f6", borderRadius: "10px", borderLeft: "4px solid #c026d3" }}>
                        <p style={{ fontSize: "12px", color: "#86198f", fontWeight: 700, marginBottom: "4px" }}>Catatan & Rekomendasi Interviewer:</p>
                        <p style={{ fontSize: "14px", color: "#333333", lineHeight: 1.6, margin: 0 }}>{data.interview.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Hasil & Berkas Medical Check-Up (MCU) */}
            {(["MCU", "OFFERING", "ACCEPTED"].includes(application.status) || data.mcu || data.applicant?.documents?.some(d => d.type === "MCU")) && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e0e7ff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                    <HeartPulse className="w-5 h-5" style={{ color: "#4f46e5" }} />
                    Medical Check-Up (MCU) Offline - Balai Yasa
                  </h2>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!data?.mcu?.scheduledAt ? (
                      <button
                        onClick={openScheduleMcuModal}
                        style={{
                          padding: "8px 16px",
                          background: "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        Jadwalkan MCU Offline
                      </button>
                    ) : !data?.mcu?.result ? (
                      <>
                        <button
                          onClick={openScheduleMcuModal}
                          style={{
                            padding: "8px 14px",
                            background: "#e0e7ff",
                            color: "#4338ca",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                          Ubah Jadwal
                        </button>
                        <button
                          onClick={openResultMcuModal}
                          style={{
                            padding: "8px 16px",
                            background: "#4f46e5",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Input & Upload Berkas
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={openScheduleMcuModal}
                          style={{
                            padding: "8px 14px",
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                          Detail Jadwal
                        </button>
                        <button
                          onClick={openResultMcuModal}
                          style={{
                            padding: "8px 16px",
                            background: "#e0e7ff",
                            color: "#4f46e5",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Edit Berkas MCU
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* State 1: Belum Dijadwalkan */}
                {!data?.mcu?.scheduledAt ? (
                  <div style={{ textAlign: "center", padding: "32px 20px", background: "#f8fafc", borderRadius: "14px", border: "2px dashed #cbd5e1" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <Calendar className="w-7 h-7" style={{ color: "#0284c7" }} />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Belum Ada Jadwal MCU Offline di Balai Yasa</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "520px", margin: "0 auto 20px", lineHeight: 1.6 }}>
                      Sesuai prosedur KAI Services, pelamar yang lolos seleksi wawancara wajib dijadwalkan untuk pemeriksaan kesehatan secara langsung di Kantor Balai Yasa PT KAI (Reska Multi Usaha).
                    </p>
                    <button
                      onClick={openScheduleMcuModal}
                      style={{
                        padding: "11px 22px",
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      Jadwalkan MCU Offline di Balai Yasa
                    </button>
                  </div>
                ) : !data?.mcu?.result ? (
                  /* State 2: Terjadwal di Balai Yasa, Menunggu Pemeriksaan & Berkas */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <Clock className="w-5 h-5" style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", background: "#dbeafe", color: "#1d4ed8", padding: "3px 8px", borderRadius: "6px" }}>
                            Terjadwal • Menunggu Pemeriksaan
                          </span>
                          <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>Pemeriksaan Langsung di Balai Yasa</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#1e3a8a", margin: 0, lineHeight: 1.5 }}>
                          Kandidat telah dijadwalkan untuk menjalani pemeriksaan kesehatan offline. Berkas hasil lab dan evaluasi medis dapat diunggah setelah pemeriksaan di Balai Yasa selesai.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                          <MapPin className="w-3.5 h-3.5" style={{ color: "#0284c7" }} /> Lokasi MCU Offline
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{data.mcu.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                          <Calendar className="w-3.5 h-3.5" style={{ color: "#0284c7" }} /> Tanggal & Waktu Pemeriksaan
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {new Date(data.mcu.scheduledAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • {new Date(data.mcu.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                          <HeartPulse className="w-3.5 h-3.5" style={{ color: "#0284c7" }} /> Tim Medis Pemeriksa
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Tim Medis Balai Yasa & Klinik Mediska KAI</p>
                      </div>
                    </div>

                    {data.mcu.notes && (
                      <div style={{ padding: "14px 16px", background: "#fefce8", borderRadius: "10px", borderLeft: "4px solid #eab308" }}>
                        <p style={{ fontSize: "12px", color: "#854d0e", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <AlertCircle className="w-4 h-4" /> Petunjuk & Ketentuan Pemeriksaan di Balai Yasa:
                        </p>
                        <p style={{ fontSize: "13px", color: "#713f12", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{data.mcu.notes}</p>
                      </div>
                    )}

                    <div style={{ padding: "16px", background: "#f5f3ff", borderRadius: "12px", border: "1px dashed #c4b5fd", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#4c1d95", margin: "0 0 2px 0" }}>Pemeriksaan MCU di Balai Yasa telah selesai?</p>
                        <p style={{ fontSize: "12px", color: "#6d28d9", margin: 0 }}>Input hasil kelayakan medis (FIT/UNFIT) dan upload surat/hasil lab dokter di sini.</p>
                      </div>
                      <button
                        onClick={openResultMcuModal}
                        style={{
                          padding: "10px 18px",
                          background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Input & Upload Berkas MCU
                      </button>
                    </div>
                  </div>
                ) : (
                  /* State 3: Hasil Evaluasi MCU Selesai */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "16px", background: "#eef2ff", borderRadius: "12px", border: "1px solid #c7d2fe" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Lokasi Pemeriksaan Offline</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>{data.mcu.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Tanggal MCU</p>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>
                          {data.mcu.scheduledAt ? new Date(data.mcu.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#3730a3", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Kelayakan Medis</p>
                        <div>
                          <span style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: data.mcu.result === "FIT" ? "#d1fae5" : data.mcu.result === "UNFIT" ? "#fee2e2" : "#fef3c7",
                            color: data.mcu.result === "FIT" ? "#059669" : data.mcu.result === "UNFIT" ? "#dc2626" : "#d97706",
                          }}>
                            {data.mcu.result === "FIT" && <CheckCircle className="w-4 h-4" />}
                            {data.mcu.result === "UNFIT" && <XCircle className="w-4 h-4" />}
                            {data.mcu.result === "CONDITIONAL" && <AlertCircle className="w-4 h-4" />}
                            {data.mcu.result === "FIT" ? "FIT (Memenuhi Syarat)" : data.mcu.result === "UNFIT" ? "UNFIT (Tidak Memenuhi Syarat)" : "CONDITIONAL (Catatan Khusus)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Medis Dokter */}
                    {data.mcu.notes && (
                      <div style={{ padding: "14px", background: "#f8f9fa", borderRadius: "10px", borderLeft: "4px solid #4f46e5" }}>
                        <p style={{ fontSize: "12px", color: "#4338ca", fontWeight: 700, marginBottom: "4px" }}>Catatan Tim Medis / Dokter Balai Yasa:</p>
                        <p style={{ fontSize: "14px", color: "#333333", lineHeight: 1.6, margin: 0 }}>{data.mcu.notes}</p>
                      </div>
                    )}

                    {/* Uploaded MCU Files */}
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>Berkas Dokumen Hasil MCU / Lab Balai Yasa:</p>
                      {data.applicant?.documents?.filter(d => d.type === "MCU" || d.type === "MCU_RESULT").length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {data.applicant.documents.filter(d => d.type === "MCU" || d.type === "MCU_RESULT").map((doc) => (
                            <div
                              key={doc.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "10px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <FileText className="w-5 h-5" style={{ color: "#16a34a" }} />
                                <div>
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0 }}>{doc.fileName}</p>
                                  <p style={{ fontSize: "12px", color: "#666666", margin: 0 }}>
                                    {(doc.fileSize / 1024).toFixed(1)} KB • Diunggah: {new Date(doc.uploadedAt).toLocaleDateString("id-ID")}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: "6px 14px",
                                  background: "#16a34a",
                                  color: "#ffffff",
                                  borderRadius: "8px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Buka Berkas
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: "12px 16px", background: "#fffbeb", border: "1px dashed #fcd34d", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", color: "#92400e" }}>Belum ada berkas dokumen hasil MCU yang diunggah.</span>
                          <button
                            onClick={openResultMcuModal}
                            style={{
                              padding: "6px 12px",
                              background: "#f59e0b",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Upload Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Offering Letter Card */}
            {(data.offering || ["OFFERING", "ACCEPTED"].includes(application.status)) && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #fef3c7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                    <Briefcase className="w-5 h-5" style={{ color: "#d97706" }} />
                    Offering Letter & Ketentuan Kerja
                  </h2>
                  {data.offering ? (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: data.offering.status === "ACCEPTED" ? "#d1fae5" : "#fef3c7",
                      color: data.offering.status === "ACCEPTED" ? "#059669" : "#d97706",
                    }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {data.offering.status === "ACCEPTED" ? "Disetujui Pelamar" : "Offering Terkirim"}
                    </span>
                  ) : (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "#fee2e2",
                      color: "#dc2626",
                    }}>
                      Belum Dibuat
                    </span>
                  )}
                </div>

                {data.offering ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", padding: "18px", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", borderRadius: "14px", border: "1px solid #fde68a" }}>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#92400e", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Gaji Pokok Disepakati</p>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#b45309", margin: 0 }}>
                          Rp {data.offering.salary ? Number(data.offering.salary).toLocaleString("id-ID") : "0"} <span style={{ fontSize: "12px", fontWeight: 600, color: "#78350f" }}>/ bulan</span>
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#92400e", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Status Kepegawaian</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>
                          {data.offering.employmentType === "PERMANENT" ? "PKWTT (Karyawan Tetap)" : "PKWT (Karyawan Kontrak)"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#92400e", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>Mulai Kerja</p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>
                          {data.offering.startDate ? new Date(data.offering.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11.5px", color: "#92400e", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>
                          {data.offering.employmentType === "PERMANENT" ? "Masa Percobaan" : "Masa Kontrak"}
                        </p>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>
                          {data.offering.employmentType === "PERMANENT"
                            ? `${data.offering.probationMonths || 3} Bulan (Probation)`
                            : `${data.offering.contractDuration || 12} Bulan`}
                          {data.offering.contractEndDate && data.offering.employmentType === "CONTRACT" && (
                            <span style={{ fontSize: "12px", fontWeight: 500, color: "#78350f", display: "block" }}>
                              s/d {new Date(data.offering.contractEndDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      <div style={{ padding: "12px 16px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px 0" }}>Posisi / Jabatan</p>
                        <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#1f2937", margin: 0 }}>{data.offering.positionTitle || data.job?.title}</p>
                      </div>
                      <div style={{ padding: "12px 16px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px 0" }}>Lokasi Penempatan</p>
                        <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#1f2937", margin: 0 }}>{data.offering.workLocation || data.job?.location || "Kantor KAI Services"}</p>
                      </div>
                    </div>

                    {data.offering.benefits && (
                      <div style={{ padding: "14px 16px", background: "#f0fdf4", borderRadius: "10px", borderLeft: "4px solid #16a34a" }}>
                        <p style={{ fontSize: "12px", color: "#166534", fontWeight: 700, marginBottom: "4px" }}>Tunjangan & Fasilitas Kerja:</p>
                        <p style={{ fontSize: "13.5px", color: "#15803d", lineHeight: 1.6, margin: 0 }}>{data.offering.benefits}</p>
                      </div>
                    )}

                    {data.offering.notes && (
                      <div style={{ padding: "14px 16px", background: "#f8f9fa", borderRadius: "10px", borderLeft: "4px solid #d97706" }}>
                        <p style={{ fontSize: "12px", color: "#92400e", fontWeight: 700, marginBottom: "4px" }}>Catatan Tambahan:</p>
                        <p style={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.6, margin: 0 }}>{data.offering.notes}</p>
                      </div>
                    )}

                    {application.status === "OFFERING" && (
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                        <button
                          onClick={() => {
                            if (data.offering) {
                              setOfferingForm({
                                salary: String(data.offering.salary || ""),
                                salaryPeriod: data.offering.salaryPeriod || "MONTHLY",
                                startDate: data.offering.startDate ? new Date(data.offering.startDate).toISOString().slice(0, 10) : "",
                                employmentType: data.offering.employmentType || "CONTRACT",
                                contractDuration: String(data.offering.contractDuration || "12"),
                                probationMonths: String(data.offering.probationMonths || "3"),
                                workLocation: data.offering.workLocation || "",
                                positionTitle: data.offering.positionTitle || "",
                                benefits: data.offering.benefits || "",
                                notes: data.offering.notes || "",
                              });
                            }
                            setShowOfferingModal(true);
                          }}
                          style={{
                            padding: "9px 18px",
                            background: "#ffffff",
                            border: "1.5px solid #d97706",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#d97706",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Ubah Offering
                        </button>
                        <button
                          onClick={handleAcceptOffering}
                          disabled={actionLoading}
                          style={{
                            padding: "9px 18px",
                            background: "#16a34a",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#ffffff",
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Terima Sebagai Karyawan
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "18px", background: "#fffbeb", borderRadius: "12px", border: "1.5px dashed #fcd34d", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#92400e", margin: "0 0 2px 0" }}>Kandidat telah lolos tahap MCU Balai Yasa</p>
                      <p style={{ fontSize: "12.5px", color: "#b45309", margin: 0 }}>Silakan buat Offering Letter resmi dengan besaran gaji, tanggal mulai kerja, dan jenis kontrak (PKWT/PKWTT).</p>
                    </div>
                    <button
                      onClick={() => {
                        setOfferingForm({
                          ...offeringForm,
                          positionTitle: data?.job?.title || "",
                          workLocation: data?.job?.location || "",
                        });
                        setShowOfferingModal(true);
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <Send className="w-4 h-4" />
                      Buat Offering Letter Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Timeline Status */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "20px" }}>Timeline Status</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "Pendaftaran", status: "completed" },
                  { label: "Verifikasi Admin", status: application.status === "ADMIN_CHECK" ? "current" : ["TEST_SCHEDULED", "IN_TEST", "TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Tes Kompetensi", status: ["TEST_SCHEDULED", "IN_TEST"].includes(application.status) ? "current" : ["TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Interview", status: application.status === "INTERVIEW" ? "current" : ["MCU", "OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "MCU", status: application.status === "MCU" ? "current" : ["OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                  { label: "Offering", status: ["OFFERING", "ACCEPTED"].includes(application.status) ? "completed" : "pending" },
                ].map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "12px", position: "relative" }}>
                    {/* Line connector */}
                    {index < 5 && (
                      <div style={{
                        position: "absolute",
                        left: "11px",
                        top: "28px",
                        width: "2px",
                        height: "32px",
                        background: item.status === "completed" ? "#16a34a" : "#eeeeee",
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: item.status === "completed" ? "#16a34a" : item.status === "current" ? "#FF5E00" : "#eeeeee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      {item.status === "completed" && (
                        <CheckCircle className="w-3 h-3" style={{ color: "#ffffff" }} />
                      )}
                      {item.status === "current" && (
                        <div style={{ width: "8px", height: "8px", background: "#ffffff", borderRadius: "50%" }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: "20px" }}>
                      <p style={{ fontSize: "14px", fontWeight: item.status === "current" ? 700 : 500, color: item.status === "pending" ? "#888888" : "#111111" }}>
                        {item.label}
                      </p>
                      {item.status === "current" && (
                        <p style={{ fontSize: "12px", color: "#FF5E00" }}>Sedang berlangsung</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan Review */}
            {application.notes && (
              <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Catatan Review</h2>
                <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6 }}>{application.notes}</p>
              </div>
            )}

            {/* Kontak Pelamar */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Kontak Pelamar</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href={`mailto:${applicant.email}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111111", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#FF5E00" }} />
                  <span style={{ fontSize: "14px" }}>{applicant.email}</span>
                </a>
                {applicant.phone && (
                  <a href={`tel:${applicant.phone}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111111", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                    <Phone className="w-4 h-4" style={{ color: "#FF5E00" }} />
                    <span style={{ fontSize: "14px" }}>{applicant.phone}</span>
                  </a>
                )}
                {applicant.address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "10px" }}>
                    <MapPin className="w-4 h-4" style={{ color: "#FF5E00", marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px" }}>{applicant.address}, {applicant.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Success Icon */}
            <div style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <CheckCircle className="w-10 h-10" style={{ color: "#ffffff" }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111111",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              Terima Pelamar Ini?
            </h2>

            {/* Candidate Info Card */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                flexShrink: 0
              }}>
                {applicant.photoUrl ? (
                  <img src={applicant.photoUrl} alt={applicant.fullName || "Foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>
                    {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "2px" }}>
                  {applicant.fullName || "Nama Tidak Diketahui"}
                </p>
                <p style={{ fontSize: "13px", color: "#666666" }}>
                  {job.title || "Posisi"}
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <AlertCircle className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.5 }}>
                Pelamar akan menerima notifikasi bahwa mereka <strong>diterima</strong>. Pastikan semua data sudah benar sebelum melanjutkan.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowAcceptModal(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#ffffff",
                  color: "#666666",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  handleAdvanceStatus("ACCEPTED");
                }}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                {actionLoading ? "Memproses..." : "Terima Pelamar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Warning Icon */}
            <div style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <XCircle className="w-10 h-10" style={{ color: "#ffffff" }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111111",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              Tolak Lamaran?
            </h2>

            {/* Candidate Info Card */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                flexShrink: 0
              }}>
                {applicant.photoUrl ? (
                  <img src={applicant.photoUrl} alt={applicant.fullName || "Foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #00205B 0%, #003380 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>
                    {applicant.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AP"}
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "2px" }}>
                  {applicant.fullName || "Nama Tidak Diketahui"}
                </p>
                <p style={{ fontSize: "13px", color: "#666666" }}>
                  {job.title || "Posisi"}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#666666", marginBottom: "16px" }}>
              Berikan alasan penolakan agar pelamar dapat mengetahui penyebabnya.
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Contoh: Data tidak sesuai persyaratan, dokumen tidak lengkap, dll..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "14px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "24px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#EF4444"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#ffffff",
                  color: "#666666",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify("reject")}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Modal Atur Jadwal Wawancara */}
      {showScheduleInterviewModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eeeeee", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar className="w-6 h-6" style={{ color: "#4f46e5" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#00205B", margin: 0 }}>Atur Jadwal Wawancara</h2>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Tahap 1: Tetapkan waktu, pewawancara, dan moda wawancara</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleInterviewModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#888888", cursor: "pointer", padding: "4px" }}
              >
                ×
              </button>
            </div>

            {/* Candidate summary chip */}
            <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#888888" }}>Pelamar: </span>
                <strong style={{ fontSize: "14px", color: "#111111" }}>{applicant.fullName}</strong>
              </div>
              <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 700, background: "#e0e7ff", padding: "4px 10px", borderRadius: "6px" }}>
                {job.title}
              </span>
            </div>

            <form onSubmit={handleSaveInterviewSchedule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Pewawancara / Tim HRD <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleInterviewForm.interviewer}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, interviewer: e.target.value })}
                    placeholder="Contoh: Tim HRD KAI Services / Ibu Sarah"
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Waktu & Tanggal Wawancara <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleInterviewForm.scheduledAt}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, scheduledAt: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>Format Pelaksanaan</label>
                  <select
                    value={scheduleInterviewForm.type}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, type: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#ffffff" }}
                  >
                    <option value="ONLINE">Online (Google Meet / Zoom)</option>
                    <option value="OFFLINE">Tatap Muka / On-Site</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    {scheduleInterviewForm.type === "ONLINE" ? "Link Meeting / Video Call" : "Lokasi Ruangan / Kantor"}
                  </label>
                  <input
                    type="text"
                    value={scheduleInterviewForm.type === "ONLINE" ? scheduleInterviewForm.zoomLink : scheduleInterviewForm.location}
                    onChange={(e) => scheduleInterviewForm.type === "ONLINE"
                      ? setScheduleInterviewForm({ ...scheduleInterviewForm, zoomLink: e.target.value })
                      : setScheduleInterviewForm({ ...scheduleInterviewForm, location: e.target.value })}
                    placeholder={scheduleInterviewForm.type === "ONLINE" ? "https://meet.google.com/..." : "Gedung KAI Services Lt. 2"}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Instruksi & Catatan untuk Pelamar
                </label>
                <textarea
                  rows={3}
                  value={scheduleInterviewForm.notes}
                  onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, notes: e.target.value })}
                  placeholder="Contoh: Harap hadir 15 menit sebelum wawancara dimulai. Berpakaian kemeja putih rapi dan siapkan dokumen asli..."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>

              {/* Info workflow notice */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle className="w-5 h-5" style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ margin: 0, fontSize: "12.5px", color: "#166534", lineHeight: "1.5" }}>
                  <strong>Alur Terpisah:</strong> Menyimpan form ini akan memperbarui status pelamar menjadi <strong>INTERVIEW (Wawancara)</strong> dan mengirimkan undangan jadwal ke email pelamar. Penginputan nilai dilakukan setelah sesi wawancara selesai dilaksanakan.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleInterviewModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  {actionLoading ? "Menyimpan Jadwal..." : "Simpan & Jadwalkan Wawancara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Input Nilai & Evaluasi Wawancara */}
      {showScoreInterviewModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "640px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eeeeee", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fae8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award className="w-6 h-6" style={{ color: "#c026d3" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#00205B", margin: 0 }}>Input Nilai & Evaluasi Wawancara</h2>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Tahap 2: Masukkan penilaian kompetensi setelah wawancara selesai</p>
                </div>
              </div>
              <button
                onClick={() => setShowScoreInterviewModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#888888", cursor: "pointer", padding: "4px" }}
              >
                ×
              </button>
            </div>

            {/* Candidate & Schedule info chip */}
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", border: "1px solid #e9ecef" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#888888" }}>Pelamar: </span>
                  <strong style={{ fontSize: "14px", color: "#111111" }}>{applicant.fullName}</strong>
                </div>
                <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 700, background: "#ede9fe", padding: "3px 10px", borderRadius: "6px" }}>
                  {job.title}
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#555555", borderTop: "1px dashed #e2e8f0", paddingTop: "6px" }}>
                <span>📅 Jadwal: <strong>{data?.interview?.scheduledAt ? new Date(data.interview.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-"}</strong></span>
                <span>👤 Pewawancara: <strong>{data?.interview?.interviewer || "-"}</strong></span>
                <span>📍 Format: <strong>{data?.interview?.type || "ONLINE"}</strong></span>
              </div>
            </div>

            <form onSubmit={handleSaveInterviewScore} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Nilai Keseluruhan (Auto Rata-Rata dari 5 Aspek) */}
              <div style={{ background: "#faf5ff", padding: "18px 20px", borderRadius: "14px", border: "1.5px solid #e9d5ff", boxShadow: "0 2px 10px rgba(192, 38, 211, 0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#701a75" }}>
                        Skor Total Wawancara (0 - 100)
                      </label>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#f3e8ff", color: "#9333ea", padding: "2px 8px", borderRadius: "6px" }}>
                        ⚡ Rata-Rata Otomatis
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#86198f", margin: 0 }}>
                      Dihitung otomatis dari akumulasi rata-rata 5 aspek kompetensi di bawah
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: "2px" }}>
                      <span style={{ fontSize: "32px", fontWeight: 800, color: scoreInterviewForm.score >= 75 ? "#059669" : "#dc2626", lineHeight: 1 }}>
                        {scoreInterviewForm.score}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#888888" }}> / 100</span>
                    </div>
                    <span style={{
                      display: "inline-block",
                      marginTop: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: scoreInterviewForm.score >= 75 ? "#d1fae5" : "#fee2e2",
                      color: scoreInterviewForm.score >= 75 ? "#065f46" : "#991b1b",
                    }}>
                      {scoreInterviewForm.score >= 75 ? "✓ Memenuhi Standar (Min. 75)" : "✕ Di Bawah Standar (Min. 75)"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar visual indicator */}
                <div style={{ width: "100%", height: "10px", background: "#f3e8ff", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      width: `${Math.min(Math.max(scoreInterviewForm.score, 0), 100)}%`,
                      height: "100%",
                      background: scoreInterviewForm.score >= 75
                        ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)",
                      borderRadius: "999px",
                      transition: "width 0.25s ease-out",
                    }}
                  />
                </div>

                {/* Mathematical breakdown detail */}
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #e9d5ff", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#6b21a8" }}>
                  <span>Rumus: ({scoreInterviewForm.aspects.communication} + {scoreInterviewForm.aspects.technicalSkill} + {scoreInterviewForm.aspects.personality} + {scoreInterviewForm.aspects.leadership} + {scoreInterviewForm.aspects.motivation}) ÷ 5</span>
                  <strong style={{ fontSize: "12px", color: scoreInterviewForm.score >= 75 ? "#059669" : "#dc2626" }}>= {scoreInterviewForm.score}</strong>
                </div>
              </div>

              {/* Aspek Penilaian */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#333333", margin: 0 }}>Penilaian Rinci Aspek Kompetensi (0 - 100):</p>
                  <span style={{ fontSize: "11px", color: "#666666" }}>Geser slider untuk mengubah nilai aspek</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { key: "communication", label: "Komunikasi & Artikulasi", val: scoreInterviewForm.aspects.communication },
                    { key: "technicalSkill", label: "Kemampuan Teknis & Pemahaman", val: scoreInterviewForm.aspects.technicalSkill },
                    { key: "personality", label: "Sikap, Etika & Kepribadian", val: scoreInterviewForm.aspects.personality },
                    { key: "leadership", label: "Kepemimpinan & Inisiatif", val: scoreInterviewForm.aspects.leadership },
                    { key: "motivation", label: "Motivasi & Komitmen KAI", val: scoreInterviewForm.aspects.motivation },
                  ].map((asp) => (
                    <div key={asp.key} style={{ padding: "10px 14px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e9ecef" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 600, color: "#333333" }}>{asp.label}</span>
                        <span style={{
                          fontWeight: 800,
                          color: asp.val >= 75 ? "#059669" : "#dc2626",
                          background: asp.val >= 75 ? "#dcfce7" : "#fee2e2",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "12px"
                        }}>
                          {asp.val}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={asp.val}
                        onChange={(e) => handleAspectScoreChange(asp.key, parseInt(e.target.value) || 0)}
                        style={{ width: "100%", accentColor: "#00205B" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Keputusan Hasil Wawancara */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                  Keputusan Evaluasi Wawancara <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { val: "PASSED", label: "Lulus Wawancara", desc: "Direkomendasikan lanjut ke MCU", color: "#059669", bg: "#d1fae5" },
                    { val: "FAILED", label: "Tidak Lulus", desc: "Kualifikasi belum sesuai", color: "#dc2626", bg: "#fee2e2" },
                    { val: "RESCHEDULE", label: "Reschedule", desc: "Perlu wawancara ulang", color: "#d97706", bg: "#fef3c7" },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() => setScoreInterviewForm({ ...scoreInterviewForm, result: opt.val })}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: `2px solid ${scoreInterviewForm.result === opt.val ? opt.color : "#e5e7eb"}`,
                        background: scoreInterviewForm.result === opt.val ? opt.bg : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <p style={{ fontSize: "13px", fontWeight: 700, color: opt.color, margin: "0 0 2px 0" }}>{opt.label}</p>
                      <p style={{ fontSize: "11px", color: "#666666", margin: 0 }}>{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Wawancara */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Catatan & Rekomendasi Interviewer
                </label>
                <textarea
                  rows={3}
                  value={scoreInterviewForm.notes}
                  onChange={(e) => setScoreInterviewForm({ ...scoreInterviewForm, notes: e.target.value })}
                  placeholder="Kandidat memiliki kemampuan komunikasi yang baik, memahami alur operasional KAI Services, direkomendasikan..."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>

              {/* Auto-advance status checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <input
                  type="checkbox"
                  checked={scoreInterviewForm.advanceStatus}
                  onChange={(e) => setScoreInterviewForm({ ...scoreInterviewForm, advanceStatus: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#c026d3" }}
                />
                <span style={{ fontSize: "13px", color: "#333333", fontWeight: 500 }}>
                  Otomatis perbarui status lamaran (jika <strong>Lulus</strong> lanjut ke MCU, jika <strong>Tidak Lulus</strong> tolak lamaran) dan kirim email notifikasi ke pelamar.
                </span>
              </label>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowScoreInterviewModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #c026d3 0%, #9333ea 100%)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(192, 38, 211, 0.3)",
                  }}
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Nilai & Selesaikan Wawancara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Offline MCU Modal at Balai Yasa */}
      {showScheduleMcuModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "620px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eeeeee", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar className="w-6 h-6" style={{ color: "#0284c7" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#00205B", margin: 0 }}>Jadwalkan MCU Offline di Balai Yasa</h2>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Atur tanggal & instruksi MCU offline di Kantor Balai Yasa</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleMcuModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#888888", cursor: "pointer", padding: "4px" }}
              >
                ×
              </button>
            </div>

            {/* Candidate summary chip */}
            <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#888888" }}>Pelamar: </span>
                <strong style={{ fontSize: "13px", color: "#111111" }}>{applicant.fullName}</strong>
              </div>
              <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 600 }}>{job.title}</span>
            </div>

            <form onSubmit={handleSaveMcuSchedule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Lokasi MCU Offline <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={scheduleMcuForm.location}
                    onChange={(e) => setScheduleMcuForm({ ...scheduleMcuForm, location: e.target.value })}
                    placeholder="Kantor Balai Yasa PT KAI (Reska Multi Usaha)"
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "10px", fontSize: "11px", color: "#0284c7", fontWeight: 700, background: "#e0f2fe", padding: "2px 8px", borderRadius: "6px" }}>
                    OFFLINE
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Tanggal & Waktu MCU <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleMcuForm.scheduledAt}
                    onChange={(e) => setScheduleMcuForm({ ...scheduleMcuForm, scheduledAt: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Tim Medis / Pelaksana
                  </label>
                  <input
                    type="text"
                    value={scheduleMcuForm.examiner}
                    onChange={(e) => setScheduleMcuForm({ ...scheduleMcuForm, examiner: e.target.value })}
                    placeholder="Tim Medis Balai Yasa & Klinik Mediska KAI"
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Ketentuan Puasa & Persiapan */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Instruksi Persiapan MCU & Ketentuan Hadir di Balai Yasa
                </label>
                <textarea
                  rows={4}
                  value={scheduleMcuForm.notes}
                  onChange={(e) => setScheduleMcuForm({ ...scheduleMcuForm, notes: e.target.value })}
                  placeholder="Contoh: Wajib berpuasa 10-12 jam, membawa KTP, pas foto..."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", outline: "none", resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              {/* Notification Notice */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#f0f9ff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #bae6fd" }}>
                <Mail className="w-5 h-5" style={{ color: "#0284c7", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "12px", color: "#0369a1", margin: 0, lineHeight: 1.5 }}>
                  Undangan resmi MCU offline di Balai Yasa dan petunjuk puasa laboratorium akan dikirimkan otomatis ke email pelamar (<strong>{applicant.user?.email || "email pelamar"}</strong>).
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleMcuModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  {actionLoading ? "Menyimpan..." : "Simpan & Jadwalkan MCU Offline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input Result & Upload MCU Document Modal */}
      {showResultMcuModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eeeeee", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HeartPulse className="w-6 h-6" style={{ color: "#4f46e5" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#00205B", margin: 0 }}>Input Hasil & Upload Berkas MCU</h2>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Unggah hasil lab & tentukan kelayakan medis dari Balai Yasa</p>
                </div>
              </div>
              <button
                onClick={() => setShowResultMcuModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#888888", cursor: "pointer", padding: "4px" }}
              >
                ×
              </button>
            </div>

            {/* Candidate & Balai Yasa info chip */}
            <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#888888" }}>Pelamar: </span>
                  <strong style={{ fontSize: "13px", color: "#111111" }}>{applicant.fullName}</strong>
                </div>
                <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 600 }}>{job.title}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#555555", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: "#0284c7" }} />
                <span>{data?.mcu?.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)"}</span>
                {data?.mcu?.scheduledAt && (
                  <span>• {new Date(data.mcu.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveMcuResult} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Status Kelayakan Medis */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                  Hasil Kelayakan Medis Balai Yasa <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { val: "FIT", label: "FIT (Memenuhi)", desc: "Sehat jasmani & bebas narkoba", color: "#059669", bg: "#d1fae5" },
                    { val: "CONDITIONAL", label: "CONDITIONAL", desc: "Catatan khusus / evaluasi", color: "#d97706", bg: "#fef3c7" },
                    { val: "UNFIT", label: "UNFIT (Tidak)", desc: "Tidak memenuhi syarat medis", color: "#dc2626", bg: "#fee2e2" },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() => setResultMcuForm({ ...resultMcuForm, result: opt.val })}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: `2px solid ${resultMcuForm.result === opt.val ? opt.color : "#e5e7eb"}`,
                        background: resultMcuForm.result === opt.val ? opt.bg : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <p style={{ fontSize: "14px", fontWeight: 700, color: opt.color, margin: "0 0 2px 0" }}>{opt.label}</p>
                      <p style={{ fontSize: "11px", color: "#666666", margin: 0 }}>{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Berkas MCU */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "6px" }}>
                  Unggah Berkas / Dokumen Hasil Lab MCU Balai Yasa (PDF / JPG / PNG)
                </label>
                <div style={{
                  border: "2px dashed #c7d2fe",
                  borderRadius: "12px",
                  padding: "18px",
                  textAlign: "center",
                  background: "#f5f7ff",
                  position: "relative",
                  cursor: "pointer",
                }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMcuFile(e.target.files[0]);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <Upload className="w-8 h-8" style={{ color: "#4f46e5", margin: "0 auto 8px" }} />
                  {mcuFile ? (
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#16a34a", margin: "0 0 2px 0" }}>
                        Berkas Dipilih: {mcuFile.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "#666666", margin: 0 }}>
                        Ukuran: {(mcuFile.size / 1024).toFixed(1)} KB (Klik untuk ganti file)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#4f46e5", margin: "0 0 2px 0" }}>
                        Klik untuk memilih berkas hasil MCU
                      </p>
                      <p style={{ fontSize: "12px", color: "#888888", margin: 0 }}>
                        Format yang didukung: PDF, JPG, PNG (Maks 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Catatan Medis */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Catatan Medis & Keterangan Dokter Balai Yasa
                </label>
                <textarea
                  rows={3}
                  value={resultMcuForm.notes}
                  onChange={(e) => setResultMcuForm({ ...resultMcuForm, notes: e.target.value })}
                  placeholder="Contoh: Tekanan darah normal 120/80, visus mata baik, rontgen thorax normal, tidak ada riwayat kelainan medis..."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>

              {/* Auto-advance status checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#f8f9fa", padding: "12px", borderRadius: "10px" }}>
                <input
                  type="checkbox"
                  checked={resultMcuForm.advanceStatus}
                  onChange={(e) => setResultMcuForm({ ...resultMcuForm, advanceStatus: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }}
                />
                <span style={{ fontSize: "13px", color: "#333333", fontWeight: 500 }}>
                  Otomatis perbarui status lamaran (jika <strong>FIT</strong> lanjut ke Offering, jika <strong>UNFIT</strong> tolak lamaran) dan kirim email notifikasi ke pelamar.
                </span>
              </label>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowResultMcuModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMcu}
                  style={{
                    flex: 2,
                    padding: "12px 20px",
                    background: "#4f46e5",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: isSubmittingMcu ? "not-allowed" : "pointer",
                    opacity: isSubmittingMcu ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  {isSubmittingMcu ? "Mengunggah & Menyimpan..." : "Simpan Hasil & Berkas MCU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Test Modal */}
      {showScheduleTestModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            animation: "modalSlideIn 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eeeeee", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar className="w-6 h-6" style={{ color: "#4f46e5" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#00205B", margin: 0 }}>
                    {data?.application.status === "TEST_SCHEDULED" ? "Ubah Jadwal Tes Kompetensi" : "Verifikasi Lulus & Jadwalkan Tes"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>
                    Tentukan waktu pelaksanaan dan instruksi tes kompetensi untuk pelamar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleTestModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#888888", cursor: "pointer", padding: "4px" }}
              >
                ×
              </button>
            </div>

            {/* Candidate summary chip */}
            <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#888888" }}>Pelamar: </span>
                <strong style={{ fontSize: "13px", color: "#111111" }}>{applicant.fullName}</strong>
              </div>
              <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 600 }}>{job.title}</span>
            </div>

            <form onSubmit={handleConfirmScheduleTest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Waktu Mulai Tes <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleTestForm.scheduledAt}
                    onChange={(e) => setScheduleTestForm({ ...scheduleTestForm, scheduledAt: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                    Batas Akhir / Selesai <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleTestForm.endTime}
                    onChange={(e) => setScheduleTestForm({ ...scheduleTestForm, endTime: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Format & Lokasi Pelaksanaan Tes <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={scheduleTestForm.location}
                  onChange={(e) => setScheduleTestForm({ ...scheduleTestForm, location: e.target.value })}
                  placeholder="Online System (Portal CBT KAI Services)"
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", marginBottom: "8px" }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    "Online System (Portal CBT KAI Services)",
                    "Ruang Asesmen Kantor Pusat KAI Services",
                    "Kantor Cabang / Stasiun Terkait",
                  ].map((locOption) => (
                    <button
                      key={locOption}
                      type="button"
                      onClick={() => setScheduleTestForm({ ...scheduleTestForm, location: locOption })}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        background: scheduleTestForm.location === locOption ? "#e0e7ff" : "#f3f4f6",
                        color: scheduleTestForm.location === locOption ? "#4338ca" : "#4b5563",
                        cursor: "pointer",
                      }}
                    >
                      {locOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Instruksi & Pesan untuk Pelamar
                </label>
                <textarea
                  rows={3}
                  value={scheduleTestForm.adminMessage}
                  onChange={(e) => setScheduleTestForm({ ...scheduleTestForm, adminMessage: e.target.value })}
                  placeholder="Silakan login ke portal karir KAI Services tepat waktu. Pastikan koneksi internet stabil..."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "6px" }}>
                  Catatan Verifikasi Berkas
                </label>
                <input
                  type="text"
                  value={scheduleTestForm.notes}
                  onChange={(e) => setScheduleTestForm({ ...scheduleTestForm, notes: e.target.value })}
                  placeholder="Berkas dan dokumen persyaratan telah diverifikasi dan memenuhi kriteria."
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                />
              </div>

              {/* Information Notice */}
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <CheckCircle className="w-5 h-5" style={{ color: "#059669", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#065f46", margin: 0, lineHeight: 1.5 }}>
                  Pelamar akan otomatis menerima email notifikasi berisi jadwal tes, batas waktu pengerjaan, dan instruksi lengkap.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleTestModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? "Memproses..." : data?.application.status === "TEST_SCHEDULED" ? "Simpan Perubahan Jadwal" : "Setujui & Jadwalkan Tes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Offering Letter ===== */}
      {showOfferingModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowOfferingModal(false)} />
          <div style={{ position: "relative", background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflow: "auto", animation: "modalSlideIn 0.3s ease" }}>
            {/* Header */}
            <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(245,158,11,0.3)" }}>
                  <Send className="w-6 h-6" style={{ color: "#ffffff" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", margin: 0 }}>Buat Offering Letter</h3>
                  <p style={{ fontSize: "13px", color: "#666666", margin: "4px 0 0" }}>Tentukan detail penawaran kerja untuk kandidat</p>
                </div>
              </div>
              {/* Candidate chip */}
              <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#f8f9fa", padding: "8px 14px", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <User className="w-4 h-4" style={{ color: "#FF5E00" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#333333" }}>{data?.applicant.fullName}</span>
                <span style={{ fontSize: "12px", color: "#999999" }}>•</span>
                <span style={{ fontSize: "12px", color: "#666666" }}>{data?.job?.title}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveOffering}>
              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* Employment Type Toggle */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                    Jenis Karyawan <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setOfferingForm({ ...offeringForm, employmentType: "CONTRACT" })}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: offeringForm.employmentType === "CONTRACT" ? "2px solid #f59e0b" : "2px solid #e5e7eb",
                        background: offeringForm.employmentType === "CONTRACT" ? "#fffbeb" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 700, color: offeringForm.employmentType === "CONTRACT" ? "#d97706" : "#333333" }}>PKWT</div>
                      <div style={{ fontSize: "11px", color: "#888888", marginTop: "2px" }}>Karyawan Kontrak</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferingForm({ ...offeringForm, employmentType: "PERMANENT" })}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: offeringForm.employmentType === "PERMANENT" ? "2px solid #16a34a" : "2px solid #e5e7eb",
                        background: offeringForm.employmentType === "PERMANENT" ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 700, color: offeringForm.employmentType === "PERMANENT" ? "#16a34a" : "#333333" }}>PKWTT</div>
                      <div style={{ fontSize: "11px", color: "#888888", marginTop: "2px" }}>Karyawan Tetap</div>
                    </button>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                    Gaji Pokok (per bulan) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#999999", fontWeight: 600 }}>Rp</span>
                    <input
                      type="number"
                      required
                      value={offeringForm.salary}
                      onChange={(e) => setOfferingForm({ ...offeringForm, salary: e.target.value })}
                      placeholder="5.000.000"
                      style={{ width: "100%", padding: "12px 14px 12px 42px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                  {offeringForm.salary && (
                    <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
                      = Rp {parseInt(offeringForm.salary).toLocaleString("id-ID")} / bulan
                    </p>
                  )}
                </div>

                {/* Start Date & Position in a row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                      Tanggal Mulai Kerja <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={offeringForm.startDate}
                      onChange={(e) => setOfferingForm({ ...offeringForm, startDate: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={offeringForm.positionTitle}
                      onChange={(e) => setOfferingForm({ ...offeringForm, positionTitle: e.target.value })}
                      placeholder={data?.job?.title || "Posisi"}
                      style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Contract Duration (shown if CONTRACT) */}
                {offeringForm.employmentType === "CONTRACT" && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                      Masa Kontrak <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="number"
                        required
                        min="1"
                        max="60"
                        value={offeringForm.contractDuration}
                        onChange={(e) => setOfferingForm({ ...offeringForm, contractDuration: e.target.value })}
                        style={{ width: "100px", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                      />
                      <span style={{ fontSize: "14px", color: "#666666", fontWeight: 600 }}>bulan</span>
                      {offeringForm.startDate && offeringForm.contractDuration && (
                        <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 600, background: "#fffbeb", padding: "4px 10px", borderRadius: "8px" }}>
                          s/d {(() => {
                            const end = new Date(offeringForm.startDate);
                            end.setMonth(end.getMonth() + parseInt(offeringForm.contractDuration));
                            return end.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Probation Months (shown if PERMANENT) */}
                {offeringForm.employmentType === "PERMANENT" && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                      Masa Percobaan
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={offeringForm.probationMonths}
                        onChange={(e) => setOfferingForm({ ...offeringForm, probationMonths: e.target.value })}
                        style={{ width: "100px", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                      />
                      <span style={{ fontSize: "14px", color: "#666666", fontWeight: 600 }}>bulan masa percobaan</span>
                    </div>
                  </div>
                )}

                {/* Work Location */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    value={offeringForm.workLocation}
                    onChange={(e) => setOfferingForm({ ...offeringForm, workLocation: e.target.value })}
                    placeholder="Kantor Pusat KAI Services, Jakarta"
                    style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                    Tunjangan & Fasilitas
                  </label>
                  <textarea
                    value={offeringForm.benefits}
                    onChange={(e) => setOfferingForm({ ...offeringForm, benefits: e.target.value })}
                    placeholder="BPJS Kesehatan, BPJS Ketenagakerjaan, Tunjangan Makan, Tunjangan Transport"
                    rows={2}
                    style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333333", marginBottom: "8px" }}>
                    Catatan Tambahan
                  </label>
                  <textarea
                    value={offeringForm.notes}
                    onChange={(e) => setOfferingForm({ ...offeringForm, notes: e.target.value })}
                    placeholder="Catatan tambahan untuk pelamar..."
                    rows={2}
                    style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                  />
                </div>

                {/* Info Notice */}
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <Send className="w-5 h-5" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    Offering letter akan dikirim dan ditampilkan kepada pelamar melalui portal karir. Pelamar dapat melihat detail penawaran ini di dashboard mereka.
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowOfferingModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: "#ffffff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#666666",
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOffering || !offeringForm.salary || !offeringForm.startDate}
                    style={{
                      flex: 2,
                      padding: "12px 20px",
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#ffffff",
                      cursor: isSubmittingOffering ? "not-allowed" : "pointer",
                      opacity: isSubmittingOffering ? 0.6 : 1,
                      boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Send className="w-5 h-5" />
                    {isSubmittingOffering ? "Memproses..." : "Kirim Offering Letter"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
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
        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
