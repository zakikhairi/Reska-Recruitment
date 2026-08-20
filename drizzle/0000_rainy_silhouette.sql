CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'ADMIN_CHECK', 'TEST_SCHEDULED', 'IN_TEST', 'TEST_COMPLETED', 'INTERVIEW', 'MCU', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('PHOTO', 'CV', 'IJAZAH', 'TRANSCRIPT', 'CERTIFICATE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."education" AS ENUM('SMA', 'D3', 'S1', 'S2');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."interview_result" AS ENUM('PASSED', 'FAILED', 'RESCHEDULE');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('RECORDING', 'FACE_TO_FACE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."job_division" AS ENUM('ON_TRAIN_SERVICE', 'RES_CLEAN', 'RES_PARKING', 'LOGISTICS', 'IT_STAFF', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('DRAFT', 'ACTIVE', 'CLOSED', 'FILLED');--> statement-breakpoint
CREATE TYPE "public"."mcu_result" AS ENUM('FIT', 'UNFIT', 'CONDITIONAL');--> statement-breakpoint
CREATE TYPE "public"."question_category" AS ENUM('AKHLAK', 'HOSPITALITY', 'TECHNICAL', 'FACILITY', 'APTITUDE');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'SCORED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('APPLICANT', 'HR_ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"employee_id" varchar(255) NOT NULL,
	"department" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "applicant_answers" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"test_session_id" varchar(255) NOT NULL,
	"question_id" varchar(255) NOT NULL,
	"selected_answer" varchar(1),
	"is_correct" boolean,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"nik" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"place_of_birth" varchar(255) NOT NULL,
	"gender" "gender" NOT NULL,
	"address" text NOT NULL,
	"city" varchar(255) NOT NULL,
	"postal_code" varchar(255) NOT NULL,
	"height" real,
	"weight" real,
	"education" "education" NOT NULL,
	"university" varchar(255),
	"photo_url" varchar(500),
	"cv_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applicants_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "applicants_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"applicant_id" varchar(255) NOT NULL,
	"job_posting_id" varchar(255) NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"applicant_id" varchar(255) NOT NULL,
	"type" "document_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"application_id" varchar(255) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"location" varchar(255) NOT NULL,
	"interviewer" varchar(255) NOT NULL,
	"type" "interview_type" DEFAULT 'RECORDING' NOT NULL,
	"notes" text,
	"score" integer,
	"result" "interview_result",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviews_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"division" "job_division" NOT NULL,
	"location" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"min_height" real,
	"min_education" "education" NOT NULL,
	"min_age" integer,
	"max_age" integer,
	"status" "job_status" DEFAULT 'ACTIVE' NOT NULL,
	"deadline" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_checkups" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"application_id" varchar(255) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"location" varchar(255) NOT NULL,
	"result" "mcu_result",
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medical_checkups_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"category" "question_category" NOT NULL,
	"job_division" "job_division",
	"stem" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text NOT NULL,
	"correct_answer" varchar(1) NOT NULL,
	"difficulty" "question_difficulty" DEFAULT 'MEDIUM' NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"explanation" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"application_id" varchar(255) NOT NULL,
	"from_status" varchar(50),
	"to_status" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_configs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"job_posting_id" varchar(255) NOT NULL,
	"categories" text NOT NULL,
	"category_weights" text NOT NULL,
	"passing_grades" text NOT NULL,
	"overall_passing_grade" integer DEFAULT 65 NOT NULL,
	"total_duration_minutes" integer DEFAULT 90 NOT NULL,
	"time_per_question_seconds" integer DEFAULT 90,
	"questions_per_category" integer DEFAULT 10 NOT NULL,
	"shuffle_questions" boolean DEFAULT true NOT NULL,
	"shuffle_answers" boolean DEFAULT true NOT NULL,
	"allow_tab_switch" boolean DEFAULT false NOT NULL,
	"max_tab_switches" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_configs_job_posting_id_unique" UNIQUE("job_posting_id")
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"application_id" varchar(255) NOT NULL,
	"status" "test_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"started_at" timestamp,
	"submitted_at" timestamp,
	"questions" text,
	"tab_switch_count" integer DEFAULT 0 NOT NULL,
	"tab_switch_logs" text,
	"raw_scores" text,
	"weighted_scores" text,
	"total_score" integer,
	"passed" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_sessions_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'APPLICANT' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_answers" ADD CONSTRAINT "applicant_answers_test_session_id_test_sessions_id_fk" FOREIGN KEY ("test_session_id") REFERENCES "public"."test_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_checkups" ADD CONSTRAINT "medical_checkups_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_configs" ADD CONSTRAINT "test_configs_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;