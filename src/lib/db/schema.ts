import { pgTable, varchar, boolean, timestamp, text, real, integer, pgEnum } from 'drizzle-orm/pg-core';

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['APPLICANT', 'HR_ADMIN', 'SUPER_ADMIN']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE']);
export const educationEnum = pgEnum('education', ['SMA', 'D3', 'S1', 'S2']);
export const jobDivisionEnum = pgEnum('job_division', ['ON_TRAIN_SERVICE', 'RES_CLEAN', 'RES_PARKING', 'LOGISTICS', 'IT_STAFF', 'ADMIN']);
export const jobStatusEnum = pgEnum('job_status', ['DRAFT', 'ACTIVE', 'CLOSED', 'FILLED']);
export const applicationStatusEnum = pgEnum('application_status', [
  'PENDING', 'ADMIN_CHECK', 'TEST_SCHEDULED', 'IN_TEST', 'TEST_COMPLETED',
  'INTERVIEW', 'MCU', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
]);
export const interviewTypeEnum = pgEnum('interview_type', ['RECORDING', 'FACE_TO_FACE', 'HYBRID']);
export const interviewResultEnum = pgEnum('interview_result', ['PASSED', 'FAILED', 'RESCHEDULE']);
export const mcuResultEnum = pgEnum('mcu_result', ['FIT', 'UNFIT', 'CONDITIONAL']);
export const questionCategoryEnum = pgEnum('question_category', ['AKHLAK', 'HOSPITALITY', 'TECHNICAL', 'FACILITY', 'APTITUDE']);
export const questionDifficultyEnum = pgEnum('question_difficulty', ['EASY', 'MEDIUM', 'HARD']);
export const documentTypeEnum = pgEnum('document_type', ['PHOTO', 'CV', 'IJAZAH', 'TRANSCRIPT', 'CERTIFICATE', 'OTHER']);
export const testStatusEnum = pgEnum('test_status', ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'SCORED', 'EXPIRED']);

// ============================================
// USER & AUTHENTICATION
// ============================================

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('APPLICANT').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const admins = pgTable('admins', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  employeeId: varchar('employee_id', { length: 255 }).notNull().unique(),
  department: varchar('department', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const passwordResets = pgTable('password_resets', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// APPLICANT PROFILE
// ============================================

export const applicants = pgTable('applicants', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 255 }).notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

  nik: varchar('nik', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  placeOfBirth: varchar('place_of_birth', { length: 255 }).notNull(),
  gender: genderEnum('gender').notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 255 }).notNull(),
  height: real('height'),
  weight: real('weight'),
  education: educationEnum('education').notNull(),
  university: varchar('university', { length: 255 }),

  photoUrl: varchar('photo_url', { length: 500 }),
  cvUrl: varchar('cv_url', { length: 500 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicantId: varchar('applicant_id', { length: 255 }).notNull().references(() => applicants.id, { onDelete: 'cascade' }),
  type: documentTypeEnum('type').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// ============================================
// JOB POSTINGS
// ============================================

export const jobPostings = pgTable('job_postings', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  division: jobDivisionEnum('division').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),

  minHeight: real('min_height'),
  minEducation: educationEnum('min_education').notNull(),
  minAge: integer('min_age'),
  maxAge: integer('max_age'),

  status: jobStatusEnum('status').default('ACTIVE').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  deadline: timestamp('deadline').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// APPLICATIONS
// ============================================

export const applications = pgTable('applications', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicantId: varchar('applicant_id', { length: 255 }).notNull().references(() => applicants.id, { onDelete: 'cascade' }),
  jobPostingId: varchar('job_posting_id', { length: 255 }).notNull().references(() => jobPostings.id, { onDelete: 'cascade' }),

  status: applicationStatusEnum('status').default('PENDING').notNull(),
  notes: text('notes'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const statusHistory = pgTable('status_history', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: varchar('application_id', { length: 255 }).notNull().references(() => applications.id, { onDelete: 'cascade' }),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// INTERVIEW & MCU
// ============================================

export const interviews = pgTable('interviews', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: varchar('application_id', { length: 255 }).notNull().references(() => applications.id, { onDelete: 'cascade' }).unique(),

  scheduledAt: timestamp('scheduled_at').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  interviewer: varchar('interviewer', { length: 255 }).notNull(),
  type: interviewTypeEnum('type').default('RECORDING').notNull(),
  zoomLink: varchar('zoom_link', { length: 500 }),
  notes: text('notes'),
  score: integer('score'),
  result: interviewResultEnum('result'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const medicalCheckups = pgTable('medical_checkups', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: varchar('application_id', { length: 255 }).notNull().references(() => applications.id, { onDelete: 'cascade' }).unique(),

  scheduledAt: timestamp('scheduled_at').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  result: mcuResultEnum('result'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// TEST CONFIGURATION
// ============================================

export const testConfigs = pgTable('test_configs', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobPostingId: varchar('job_posting_id', { length: 255 }).notNull().references(() => jobPostings.id, { onDelete: 'cascade' }).unique(),

  categories: text('categories').notNull(),
  categoryWeights: text('category_weights').notNull(),
  passingGrades: text('passing_grades').notNull(),

  overallPassingGrade: integer('overall_passing_grade').default(65).notNull(),

  totalDurationMinutes: integer('total_duration_minutes').default(90).notNull(),
  timePerQuestionSeconds: integer('time_per_question_seconds').default(90),

  questionsPerCategory: integer('questions_per_category').default(10).notNull(),
  shuffleQuestions: boolean('shuffle_questions').default(true).notNull(),
  shuffleAnswers: boolean('shuffle_answers').default(true).notNull(),

  allowTabSwitch: boolean('allow_tab_switch').default(false).notNull(),
  maxTabSwitches: integer('max_tab_switches').default(5).notNull(),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// QUESTION BANK
// ============================================

export const questions = pgTable('questions', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: questionCategoryEnum('category').notNull(),
  jobDivision: jobDivisionEnum('job_division'),

  stem: text('stem').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionC: text('option_c').notNull(),
  optionD: text('option_d').notNull(),
  correctAnswer: varchar('correct_answer', { length: 1 }).notNull(),

  difficulty: questionDifficultyEnum('difficulty').default('MEDIUM').notNull(),
  points: integer('points').default(1).notNull(),

  explanation: text('explanation'),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// TEST SESSIONS & ANSWERS
// ============================================

export const testSessions = pgTable('test_sessions', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: varchar('application_id', { length: 255 }).notNull().references(() => applications.id, { onDelete: 'cascade' }).unique(),

  status: testStatusEnum('status').default('NOT_STARTED').notNull(),

  startedAt: timestamp('started_at'),
  submittedAt: timestamp('submitted_at'),

  questions: text('questions'),
  tabSwitchCount: integer('tab_switch_count').default(0).notNull(),
  tabSwitchLogs: text('tab_switch_logs'),

  rawScores: text('raw_scores'),
  weightedScores: text('weighted_scores'),
  totalScore: integer('total_score'),
  passed: boolean('passed'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicantAnswers = pgTable('applicant_answers', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  testSessionId: varchar('test_session_id', { length: 255 }).notNull().references(() => testSessions.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 255 }).notNull(),
  selectedAnswer: varchar('selected_answer', { length: 1 }),
  isCorrect: boolean('is_correct'),
  pointsEarned: integer('points_earned').default(0).notNull(),
  answeredAt: timestamp('answered_at'),
});
