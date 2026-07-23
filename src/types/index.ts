// User & Auth Types
export type Role = "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Gender Types
export type Gender = "MALE" | "FEMALE";

// Education Types
export type Education = "SMA" | "D3" | "S1" | "S2";

// Division Types
export type Division =
  | "ON_TRAIN_SERVICE"
  | "RES_CLEAN"
  | "RES_PARKING"
  | "LOGISTICS"
  | "IT_STAFF"
  | "ADMIN";

// Document Types
export type DocumentType =
  | "PHOTO"
  | "CV"
  | "IJAZAH"
  | "TRANSCRIPT"
  | "CERTIFICATE"
  | "OTHER";

// Job Status Types
export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "FILLED";

// Application Status Types
export type ApplicationStatus =
  | "PENDING"
  | "ADMIN_CHECK"
  | "TEST_SCHEDULED"
  | "IN_TEST"
  | "TEST_COMPLETED"
  | "INTERVIEW"
  | "MCU"
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

// Interview Types
export type InterviewType = "RECORDING" | "face_to_face" | "HYBRID";
export type InterviewResult = "PASSED" | "FAILED" | "RESCHEDULE";

// MCU Types
export type McuResult = "FIT" | "UNFIT" | "CONDITIONAL";

// Test Category Types
export type TestCategory =
  | "AKHLAK"
  | "HOSPITALITY"
  | "TECHNICAL"
  | "FACILITY"
  | "APTITUDE";

// Difficulty Types
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Answer Key Types
export type AnswerKey = "A" | "B" | "C" | "D";

// Test Status Types
export type TestStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "SUBMITTED"
  | "SCORED"
  | "EXPIRED";

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Form Types
// ============================================

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  nik: string;
  phone: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProfileFormData {
  nik: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: Gender;
  address: string;
  city: string;
  postalCode: string;
  height?: number;
  weight?: number;
  education: Education;
  university?: string;
}

// ============================================
// Job Types
// ============================================

export interface JobPosting {
  id: string;
  title: string;
  division: Division;
  location: string;
  description: string;
  requirements: string;
  minHeight?: number;
  minEducation: Education;
  minAge?: number;
  maxAge?: number;
  status: JobStatus;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    applications: number;
  };
}

// ============================================
// Application Types
// ============================================

export interface Application {
  id: string;
  applicantId: string;
  jobPostingId: string;
  status: ApplicationStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  applicant?: {
    id: string;
    fullName: string;
    nik: string;
    phone: string;
    education: Education;
  };
  jobPosting?: JobPosting;
  testSession?: TestSession;
}

// ============================================
// Test Types
// ============================================

export interface TestConfig {
  id: string;
  jobPostingId: string;
  categories: TestCategory[];
  categoryWeights: Record<TestCategory, number>;
  passingGrades: Record<TestCategory, number>;
  overallPassingGrade: number;
  totalDurationMinutes: number;
  timePerQuestionSeconds?: number;
  questionsPerCategory: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  allowTabSwitch: boolean;
  maxTabSwitches: number;
  isActive: boolean;
}

export interface Question {
  id: string;
  category: TestCategory;
  jobDivision?: string | null;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerKey;
  difficulty: Difficulty;
  points: number;
  explanation?: string | null;
  isActive: boolean;
}

export interface TestSession {
  id: string;
  applicationId: string;
  status: TestStatus;
  startedAt?: Date;
  submittedAt?: Date;
  questions?: string[];
  tabSwitchCount: number;
  tabSwitchLogs?: string[];
  rawScores?: Record<TestCategory, number>;
  weightedScores?: Record<TestCategory, number>;
  totalScore?: number;
  passed?: boolean;
  answers?: ApplicantAnswer[];
}

export interface ApplicantAnswer {
  id: string;
  testSessionId: string;
  questionId: string;
  selectedAnswer?: AnswerKey;
  isCorrect?: boolean;
  pointsEarned: number;
  answeredAt?: Date;
}

export interface TestResult {
  totalScore: number;
  categoryResults: CategoryResult[];
  passed: boolean;
  breakdown: CategoryScore[];
}

export interface CategoryResult {
  category: TestCategory;
  percentage: number;
  passed: boolean;
}

export interface CategoryScore {
  category: TestCategory;
  rawScore: number;
  totalQuestions: number;
  percentage: number;
  weightedScore: number;
}

// ============================================
// Dashboard Analytics Types
// ============================================

export interface DashboardStats {
  totalApplicants: number;
  applicantsThisMonth: number;
  applicantsLastMonth: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  testsCompleted: number;
  passingRate: number;
  hiredCount: number;
}

// ============================================
// Ranking Types
// ============================================

export interface ApplicantRanking {
  rank: number;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  division: Division;
  totalScore: number;
  passed: boolean;
  testDate: Date;
}
