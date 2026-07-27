// LocalStorage Database Layer
// Simulates a database using browser's localStorage

const DB_KEY = "kai_recruitment_db";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
  createdAt: string;
  // Applicant fields
  nik?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  height?: number;
  weight?: number;
  education?: string;
  university?: string;
  // Admin fields
  employeeId?: string;
  department?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  division: string;
  location: string;
  description: string;
  requirements: string;
  minHeight?: number;
  minEducation: string;
  minAge?: number;
  maxAge?: number;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "FILLED";
  deadline: string;
  applicantCount?: number;
  createdAt: string;
}

export interface Application {
  id: string;
  applicantId: string;
  jobPostingId: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  category: string;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: string;
}

interface Database {
  users: User[];
  jobs: JobPosting[];
  applications: Application[];
  questions: Question[];
}

function getDB(): Database {
  if (typeof window === "undefined") {
    return { users: [], jobs: [], applications: [], questions: [] };
  }

  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default data
  const db: Database = {
    users: [
      {
        id: "admin-001",
        email: "admin@admin.co.id",
        passwordHash: "demo_demo123",
        role: "HR_ADMIN",
        emailVerified: true,
        createdAt: new Date().toISOString(),
        fullName: "Admin HR",
        employeeId: "EMP001",
        department: "Human Resources",
      },
    ],
    jobs: [
      {
        id: "job-001",
        title: "Pramugara / Pramugari Kereta Api",
        division: "ON_TRAIN_SERVICE",
        location: "Jakarta, Bandung, Surabaya",
        description: "Melayani penumpang kereta api dengan ramah dan profesional.",
        requirements: "SMA/SMK, tinggi minimal 160cm (wanita) / 165cm (pria)",
        minHeight: 160,
        minEducation: "SMA",
        minAge: 18,
        maxAge: 25,
        status: "ACTIVE",
        deadline: "2026-08-15",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-002",
        title: "Steward Kereta Api",
        division: "ON_TRAIN_SERVICE",
        location: "Bandung, Jakarta",
        description: "Membantu kelancaran layanan di dalam kereta.",
        requirements: "SMA/SMK pariwisata atau perhotelan",
        minHeight: 158,
        minEducation: "SMA",
        minAge: 20,
        maxAge: 30,
        status: "ACTIVE",
        deadline: "2026-08-20",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-003",
        title: "Staff IT Support",
        division: "IT_STAFF",
        location: "Jakarta",
        description: "Mengelola sistem IT dan jaringan.",
        requirements: "S1 Teknik Informatika / Sistem Informasi",
        minEducation: "S1",
        minAge: 22,
        maxAge: 35,
        status: "ACTIVE",
        deadline: "2026-08-10",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-004",
        title: "Teknisi Maintenance Kereta",
        division: "LOGISTICS",
        location: "Madiun, Bandung",
        description: "Merawat dan memperbaiki komponen kereta api.",
        requirements: "D3/S1 Teknik Mesin atau Elektro",
        minEducation: "D3",
        minAge: 20,
        maxAge: 35,
        status: "ACTIVE",
        deadline: "2026-08-25",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-005",
        title: "Cleaning Service - ResClean",
        division: "RES_CLEAN",
        location: "Bandung, Jakarta, Surabaya",
        description: "Membersihkan dan menjaga kebersihan stasiun.",
        requirements: "SMA/SMK, pengalaman cleaning service diutamakan",
        minHeight: 155,
        minEducation: "SMA",
        minAge: 18,
        maxAge: 35,
        status: "ACTIVE",
        deadline: "2026-09-01",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-006",
        title: "Staff Administrasi",
        division: "ADMIN",
        location: "Jakarta",
        description: "Mengelola administrasi perkantoran.",
        requirements: "D3/S1 Administrasi Bisnis atau Komunikasi",
        minEducation: "D3",
        minAge: 20,
        maxAge: 30,
        status: "ACTIVE",
        deadline: "2026-08-18",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-007",
        title: "Pengelola Parkir - ResParking",
        division: "RES_PARKING",
        location: "Bandung, Jakarta",
        description: "Mengelola area parkir di stasiun.",
        requirements: "SMA/SMK, pengalaman di bidang parkir atau keamanan",
        minHeight: 160,
        minEducation: "SMA",
        minAge: 20,
        maxAge: 40,
        status: "ACTIVE",
        deadline: "2026-09-10",
        createdAt: new Date().toISOString(),
      },
    ],
    applications: [],
    questions: [
      { id: "q1", category: "AKHLAK", stem: "Apa singkatan dari AKHLAK?", optionA: "Amanah, Kompeten, Harmonis, Loyal, Akhir", optionB: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", optionC: "Amanah, Kuat, Harmonis, Loyal, Akhlak", optionD: "Amanah, Kreatif, Harmonis, Loyal, Akhlak", correctAnswer: "B", difficulty: "EASY" },
      { id: "q2", category: "AKHLAK", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" adalah definisi nilai...", optionA: "Kompeten", optionB: "Harmonis", optionC: "Amanah", optionD: "Loyal", correctAnswer: "C", difficulty: "MEDIUM" },
      { id: "q3", category: "AKHLAK", stem: "Nilai \"Loyal\" berarti...", optionA: "Hanya bekerja sesuai jam kerja", optionB: "Setia pada perusahaan dan memberikan yang terbaik", optionC: "Tidak pernah mengajukan kritik", optionD: "Menghindari tanggung jawab", correctAnswer: "B", difficulty: "EASY" },
      { id: "q4", category: "AKHLAK", stem: "\"Kompeten\" berarti memiliki kemampuan untuk...", optionA: "Bekerja sama dengan tim", optionB: "Menyelesaikan tugas dengan baik sesuai standar", optionC: "Mengikuti semua peraturan", optionD: "Mengambil keputusan sendiri", correctAnswer: "B", difficulty: "MEDIUM" },
      { id: "q5", category: "AKHLAK", stem: "Dalam konflik dengan rekan kerja, AKHLAK menganjurkan...", optionA: "Menghindar sepenuhnya", optionB: "Membicarakan secara terbuka dan mencari solusi", optionC: "Melaporkan ke atasan langsung", optionD: "Mengabaikan masalah", correctAnswer: "B", difficulty: "MEDIUM" },
      { id: "q6", category: "HOSPITALITY", stem: "\"Service excellence\" berarti...", optionA: "Layanan standar sesuai prosedur", optionB: "Layanan terbaik yang melebihi ekspektasi pelanggan", optionC: "Layanan tercepat yang tersedia", optionD: "Layanan termurah", correctAnswer: "B", difficulty: "EASY" },
      { id: "q7", category: "HOSPITALITY", stem: "Langkah pertama saat penumpang mengeluh adalah...", optionA: "Mengabaikan keluhannya", optionB: "Mendengarkan dengan penuh perhatian", optionC: "Menyalahkan penumpang lain", optionD: "Langsung memberikan solusi", correctAnswer: "B", difficulty: "EASY" },
      { id: "q8", category: "HOSPITALITY", stem: "Saat kereta akan berangkat, pramugara sebaiknya...", optionA: "Duduk dan bersantai", optionB: "Memastikan semua penumpang sudah duduk dengan aman", optionC: "Makan bersama kru", optionD: "Berbincang dengan teman", correctAnswer: "B", difficulty: "EASY" },
      { id: "q9", category: "HOSPITALITY", stem: "Saat menghadapi penumpang marah, pendekatan terbaik adalah...", optionA: "Membalas kemarahan", optionB: "Tetap tenang, empati, dan cari solusi", optionC: "Menghindari penumpang tersebut", optionD: "Meminta maaf tanpa alasan", correctAnswer: "B", difficulty: "MEDIUM" },
      { id: "q10", category: "HOSPITALITY", stem: "Attitude positif dalam bekerja meliputi...", optionA: "Menyalahkan sistem", optionB: "Proaktif membantu dan ramah", optionC: "Bekerja sesuai instruksi saja", optionD: "Menghindari tanggung jawab", correctAnswer: "B", difficulty: "EASY" },
      { id: "q11", category: "TECHNICAL", stem: "KVL pada kereta berfungsi untuk...", optionA: "Pendingin ruangan", optionB: "Penghubung listrik antar gerbong", optionC: "Sistem keamanan", optionD: "Pengukur kecepatan", correctAnswer: "B", difficulty: "HARD" },
      { id: "q12", category: "TECHNICAL", stem: "Apa kepanjangan dari KAI?", optionA: "Kereta Api Indonesia", optionB: "KAI Services", optionC: "Komersial Angle Indonesia", optionD: "Koneksi Angkutan Intermoda", correctAnswer: "A", difficulty: "EASY" },
      { id: "q13", category: "TECHNICAL", stem: "PT Reska Multi Usaha adalah anak perusahaan dari...", optionA: "PT MRT Jakarta", optionB: "PT KAI", optionC: "PT Garuda Indonesia", optionD: "PT Transportasi Jakarta", correctAnswer: "B", difficulty: "EASY" },
      { id: "q14", category: "TECHNICAL", stem: "AC pada kereta api singkatan dari...", optionA: "Air Conditioner", optionB: "Automatic Control", optionC: "Alternating Current", optionD: "Air Compressor", correctAnswer: "A", difficulty: "EASY" },
      { id: "q15", category: "TECHNICAL", stem: "Sinyal kereta api berfungsi untuk...", optionA: "Menghias stasiun", optionB: "Mengatur dan menjaga keselamatan perjalanan", optionC: "Memberi peringatan suara", optionD: "Menghitung penumpang", correctAnswer: "B", difficulty: "EASY" },
      { id: "q16", category: "APTITUDE", stem: "Jika 3x + 7 = 22, maka x = ?", optionA: "3", optionB: "5", optionC: "7", optionD: "15", correctAnswer: "B", difficulty: "EASY" },
      { id: "q17", category: "APTITUDE", stem: "Hitung: 15% dari 200 = ?", optionA: "25", optionB: "30", optionC: "35", optionD: "40", correctAnswer: "B", difficulty: "EASY" },
      { id: "q18", category: "APTITUDE", stem: "Deret: 2, 6, 12, 20, 30, ...下一个是?", optionA: "40", optionB: "42", optionC: "44", optionD: "46", correctAnswer: "B", difficulty: "HARD" },
      { id: "q19", category: "APTITUDE", stem: "10, 8, 11, 9, 12, 10, 13, ...下一个是?", optionA: "11", optionB: "14", optionC: "12", optionD: "15", correctAnswer: "A", difficulty: "MEDIUM" },
      { id: "q20", category: "APTITUDE", stem: "Kamus : Kata = Perpustakaan : ...", optionA: "Buku", optionB: "Rak", optionC: "Mahasiswa", optionD: "Pengunjung", correctAnswer: "A", difficulty: "MEDIUM" },
      { id: "q21", category: "FACILITY", stem: "Area stasiun untuk menunggu kereta disebut...", optionA: "Peron", optionB: "Hall", optionC: "Kantin", optionD: "Ruang tunggu VIP", correctAnswer: "A", difficulty: "EASY" },
      { id: "q22", category: "FACILITY", stem: "Fasilitas untuk disabilitas meliputi...", optionA: "Hanya lift", optionB: "Lift, ramp, dan guiding block", optionC: "Hanya ramp", optionD: "Tidak ada", correctAnswer: "B", difficulty: "EASY" },
      { id: "q23", category: "FACILITY", stem: "Sistem informasi yang menampilkan jadwal kereta disebut...", optionA: "Papan informasi", optionB: "Tiket elektronik", optionC: "Loker bagasi", optionD: "Ruang menyusui", correctAnswer: "A", difficulty: "EASY" },
      { id: "q24", category: "FACILITY", stem: "Kelistrikan di kereta api dihasilkan oleh...", optionA: "Baterai saja", optionB: "Generator atau rel listrik", optionC: "Panel surya", optionD: "Tidak ada listrik", correctAnswer: "B", difficulty: "MEDIUM" },
      { id: "q25", category: "FACILITY", stem: "Toilet di kereta api harus dalam kondisi...", optionA: "Bebas digunakan kapan saja", optionB: "Bersih dan berfungsi dengan baik", optionC: "Dikunci setiap saat", optionD: "Tidak perlu perawatan", correctAnswer: "B", difficulty: "EASY" },
    ],
  };

  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function saveDB(db: Database): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
}

function simpleHash(str: string): string {
  return "demo_" + str;
}

// ============ USER OPERATIONS ============

export function findUserByEmail(email: string): User | null {
  const db = getDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(id: string): User | null {
  const db = getDB();
  return db.users.find(u => u.id === id) || null;
}

export function verifyPassword(user: User, password: string): boolean {
  return user.passwordHash === simpleHash(password);
}

export function createUser(data: {
  email: string;
  password: string;
  role: "APPLICANT" | "HR_ADMIN";
  fullName: string;
  nik?: string;
  phone?: string;
}): User {
  const db = getDB();

  // Check if email exists
  if (db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Email sudah terdaftar");
  }

  const newUser: User = {
    id: "user-" + Date.now(),
    email: data.email.toLowerCase(),
    passwordHash: simpleHash(data.password),
    role: data.role,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    fullName: data.fullName,
    ...(data.role === "APPLICANT" && {
      nik: data.nik || "",
      phone: data.phone || "",
    }),
  };

  db.users.push(newUser);
  saveDB(db);
  return newUser;
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...data };
  saveDB(db);
  return db.users[index];
}

export function getAllUsers(): User[] {
  return getDB().users;
}

export function deleteUser(id: string): boolean {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return false;

  db.users.splice(index, 1);
  saveDB(db);
  return true;
}

// ============ JOB OPERATIONS ============

export function getAllJobs(): JobPosting[] {
  return getDB().jobs.filter(j => j.status === "ACTIVE");
}

export function getJobById(id: string): JobPosting | null {
  const db = getDB();
  const job = db.jobs.find(j => j.id === id);
  if (!job) return null;

  // Add applicant count
  const applicantCount = db.applications.filter(a => a.jobPostingId === id).length;
  return { ...job, applicantCount };
}

export function createJob(data: Omit<JobPosting, "id" | "createdAt" | "applicantCount">): JobPosting {
  const db = getDB();
  const newJob: JobPosting = {
    ...data,
    id: "job-" + Date.now(),
    createdAt: new Date().toISOString(),
  };
  db.jobs.push(newJob);
  saveDB(db);
  return newJob;
}

export function updateJob(id: string, data: Partial<JobPosting>): JobPosting | null {
  const db = getDB();
  const index = db.jobs.findIndex(j => j.id === id);
  if (index === -1) return null;

  db.jobs[index] = { ...db.jobs[index], ...data };
  saveDB(db);
  return db.jobs[index];
}

export function deleteJob(id: string): boolean {
  const db = getDB();
  const index = db.jobs.findIndex(j => j.id === id);
  if (index === -1) return false;

  db.jobs.splice(index, 1);
  saveDB(db);
  return true;
}

// ============ APPLICATION OPERATIONS ============

export function getApplicationsByApplicant(applicantId: string): Application[] {
  return getDB().applications.filter(a => a.applicantId === applicantId);
}

export function getAllApplications(): Application[] {
  return getDB().applications;
}

export function createApplication(data: { applicantId: string; jobPostingId: string }): Application {
  const db = getDB();

  // Check if already applied
  const existing = db.applications.find(
    a => a.applicantId === data.applicantId && a.jobPostingId === data.jobPostingId
  );
  if (existing) {
    throw new Error("Anda sudah melamar posisi ini");
  }

  const newApp: Application = {
    id: "app-" + Date.now(),
    applicantId: data.applicantId,
    jobPostingId: data.jobPostingId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  db.applications.push(newApp);
  saveDB(db);
  return newApp;
}

export function updateApplicationStatus(id: string, status: string): Application | null {
  const db = getDB();
  const index = db.applications.findIndex(a => a.id === id);
  if (index === -1) return null;

  db.applications[index].status = status;
  saveDB(db);
  return db.applications[index];
}

// ============ QUESTION OPERATIONS ============

export function getQuestionsByCategory(category: string): Question[] {
  return getDB().questions.filter(q => q.category === category);
}

export function getAllQuestions(): Question[] {
  return getDB().questions;
}

// ============ RESET DATABASE ============

export function resetDatabase(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DB_KEY);
    getDB(); // Re-initialize
  }
}

export function clearAllData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DB_KEY);
  }
}
