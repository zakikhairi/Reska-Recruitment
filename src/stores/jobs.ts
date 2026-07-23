import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Job {
  id: string;
  title: string;
  division: string;
  jobType: string;
  location: string;
  education: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  deadline: string;
  vacancies: string;
  status: string;
  applicants?: number;
}

// Initial mock data
const initialJobs: Job[] = [
  { id: "1", title: "Pramugara / Pramugari Kereta Api", division: "ON_TRAIN_SERVICE", jobType: "FULL_TIME", location: "Jakarta, Bandung, Surabaya", education: "SMA", salaryMin: "4.500.000", salaryMax: "6.000.000", description: "Bertanggung jawab memberikan layanan terbaik kepada penumpang kereta api.", responsibilities: "Menyambut penumpang saat boarding\nMembantu penumpang menemukan tempat duduk\nMemberikan informasi terkait perjalanan", requirements: "Usia maksimal 35 tahun\nSehat jasmani dan rohani\nTinggi badan minimal 160 cm", benefits: "BPJS Kesehatan & Ketenagakerjaan\nTHR\nCuti tahunan", deadline: "2026-08-15", vacancies: "20", status: "ACTIVE", applicants: 245 },
  { id: "2", title: "Steward Kereta Api", division: "ON_TRAIN_SERVICE", jobType: "FULL_TIME", location: "Bandung", education: "SMA", salaryMin: "4.000.000", salaryMax: "5.500.000", description: "Memberikan pelayanan prima kepada penumpang kereta api.", responsibilities: "Melayani kebutuhan penumpang\nMemastikan kebersihan kereta", requirements: "Usia maksimal 30 tahun\nSehat jasmani dan rohani", benefits: "BPJS Kesehatan\nTHR", deadline: "2026-08-20", vacancies: "15", status: "ACTIVE", applicants: 128 },
  { id: "3", title: "Staff IT Support", division: "IT_STAFF", jobType: "FULL_TIME", location: "Jakarta", education: "S1", salaryMin: "6.000.000", salaryMax: "8.500.000", description: "Mengelola dan mendukung infrastruktur IT perusahaan.", responsibilities: "Maintenance hardware & software\nTroubleshooting sistem", requirements: "S1 Teknik Informatika\nPengalaman min 2 tahun", benefits: "BPJS Kesehatan\nBonus kinerja", deadline: "2026-08-10", vacancies: "5", status: "ACTIVE", applicants: 89 },
  { id: "4", title: "Teknisi Maintenance Kereta", division: "LOGISTICS", jobType: "FULL_TIME", location: "Madiun", education: "D3", salaryMin: "5.000.000", salaryMax: "7.000.000", description: "Melakukan perawatan dan perbaikan kereta api.", responsibilities: "Inspeksi kereta api\nPerbaikan komponen", requirements: "D3 Teknik Mesin\nPengalaman di bidang maintenance", benefits: "BPJS Kesehatan\nTunjangan工具", deadline: "2026-08-25", vacancies: "10", status: "ACTIVE", applicants: 67 },
  { id: "5", title: "Cleaning Service - ResClean", division: "RES_CLEAN", jobType: "FULL_TIME", location: "Bandung, Jakarta", education: "SMA", salaryMin: "3.500.000", salaryMax: "4.500.000", description: "Membersihkan dan merawat kebersihan kereta api.", responsibilities: "Membersihkan interior kereta\nMenjaga kebersihan stasiun", requirements: "SMA/SMK\nSehat jasmani", benefits: "BPJS Kesehatan\nTunjangan makan", deadline: "2026-09-01", vacancies: "50", status: "ACTIVE", applicants: 312 },
  { id: "6", title: "Staff Administrasi", division: "ADMIN", jobType: "FULL_TIME", location: "Jakarta", education: "D3", salaryMin: "4.500.000", salaryMax: "6.000.000", description: "Mengelola administrasi kantor dan dokumentasi.", responsibilities: "Mengelola arsip\nMengurus surat masuk/keluar", requirements: "D3 administrasi\nMenguasai MS Office", benefits: "BPJS Kesehatan\nTHR\nBonus", deadline: "2026-08-18", vacancies: "8", status: "ACTIVE", applicants: 156 },
  { id: "7", title: "Supervisor ResClean", division: "RES_CLEAN", jobType: "FULL_TIME", location: "Surabaya", education: "D3", salaryMin: "6.000.000", salaryMax: "8.000.000", description: "Mengawasi tim cleaning service.", responsibilities: "Supervisi tim cleaning\nQuality control", requirements: "D3/S1\nPengalaman supervisor min 2 tahun", benefits: "BPJS\nTunjangan keluarga", deadline: "2026-07-30", vacancies: "3", status: "CLOSED", applicants: 45 },
];

interface JobsState {
  jobs: Job[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  updateJob: (id: string, data: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  addJob: (job: Job) => void;
  deleteJob: (id: string) => void;
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: initialJobs,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateJob: (id, data) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...data } : job
          ),
        })),
      getJob: (id) => get().jobs.find((job) => job.id === id),
      addJob: (job) =>
        set((state) => ({
          jobs: [...state.jobs, job],
        })),
      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),
    }),
    {
      name: "kai-jobs",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
