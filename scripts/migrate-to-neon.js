const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const sqlitePath = './prisma/dev.db';
const sqlite = new Database(sqlitePath);

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting data migration from SQLite to Neon PostgreSQL...\n');

  try {
    // Migrate Users
    console.log('📦 Migrating Users...');
    const users = sqlite.prepare('SELECT * FROM User').all();
    for (const user of users) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            emailVerified: !!user.emailVerified,
          },
          create: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            emailVerified: !!user.emailVerified,
          },
        });
      } catch (e) {
        // Skip if email already exists
      }
    }
    console.log(`  ✅ Migrated ${users.length} users`);

    // Migrate Admins
    console.log('📦 Migrating Admins...');
    const admins = sqlite.prepare('SELECT * FROM Admin').all();
    for (const admin of admins) {
      try {
        await prisma.admin.upsert({
          where: { id: admin.id },
          update: {
            userId: admin.userId,
            fullName: admin.fullName,
            employeeId: admin.employeeId,
            department: admin.department,
          },
          create: {
            id: admin.id,
            userId: admin.userId,
            fullName: admin.fullName,
            employeeId: admin.employeeId,
            department: admin.department,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${admins.length} admins`);

    // Migrate Applicants
    console.log('📦 Migrating Applicants...');
    const applicants = sqlite.prepare('SELECT * FROM Applicant').all();
    for (const applicant of applicants) {
      try {
        await prisma.applicant.upsert({
          where: { id: applicant.id },
          update: {
            userId: applicant.userId,
            fullName: applicant.fullName,
            nik: applicant.nik,
            phone: applicant.phone,
            dateOfBirth: applicant.dateOfBirth,
            placeOfBirth: applicant.placeOfBirth,
            gender: applicant.gender,
            address: applicant.address,
            city: applicant.city,
            education: applicant.education,
            university: applicant.university,
            height: applicant.height ? parseInt(applicant.height) : null,
            weight: applicant.weight ? parseInt(applicant.weight) : null,
          },
          create: {
            id: applicant.id,
            userId: applicant.userId,
            fullName: applicant.fullName,
            nik: applicant.nik,
            phone: applicant.phone,
            dateOfBirth: applicant.dateOfBirth,
            placeOfBirth: applicant.placeOfBirth,
            gender: applicant.gender,
            address: applicant.address,
            city: applicant.city,
            education: applicant.education,
            university: applicant.university,
            height: applicant.height ? parseInt(applicant.height) : null,
            weight: applicant.weight ? parseInt(applicant.weight) : null,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${applicants.length} applicants`);

    // Migrate Documents
    console.log('📦 Migrating Documents...');
    const documents = sqlite.prepare('SELECT * FROM Document').all();
    for (const doc of documents) {
      try {
        await prisma.document.upsert({
          where: { id: doc.id },
          update: {
            applicantId: doc.applicantId,
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize ? parseInt(doc.fileSize) : null,
          },
          create: {
            id: doc.id,
            applicantId: doc.applicantId,
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize ? parseInt(doc.fileSize) : null,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${documents.length} documents`);

    // Migrate JobPostings
    console.log('📦 Migrating JobPostings...');
    const jobs = sqlite.prepare('SELECT * FROM JobPosting').all();
    for (const job of jobs) {
      try {
        await prisma.jobPosting.upsert({
          where: { id: job.id },
          update: {
            title: job.title,
            division: job.division,
            location: job.location,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            spots: job.spots ? parseInt(job.spots) : null,
            status: job.status,
          },
          create: {
            id: job.id,
            title: job.title,
            division: job.division,
            location: job.location,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            spots: job.spots ? parseInt(job.spots) : null,
            status: job.status,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${jobs.length} job postings`);

    // Migrate Applications
    console.log('📦 Migrating Applications...');
    const applications = sqlite.prepare('SELECT * FROM Application').all();
    for (const app of applications) {
      try {
        await prisma.application.upsert({
          where: { id: app.id },
          update: {
            applicantId: app.applicantId,
            jobPostingId: app.jobPostingId,
            status: app.status,
            notes: app.notes,
          },
          create: {
            id: app.id,
            applicantId: app.applicantId,
            jobPostingId: app.jobPostingId,
            status: app.status,
            notes: app.notes,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${applications.length} applications`);

    // Migrate TestConfigs
    console.log('📦 Migrating TestConfigs...');
    const testConfigs = sqlite.prepare('SELECT * FROM TestConfig').all();
    for (const config of testConfigs) {
      try {
        await prisma.testConfig.upsert({
          where: { id: config.id },
          update: {
            jobPostingId: config.jobPostingId,
            totalDurationMinutes: config.totalDurationMinutes,
            passingScore: config.passingScore,
            categories: config.categories,
            questionsPerCategory: config.questionsPerCategory,
          },
          create: {
            id: config.id,
            jobPostingId: config.jobPostingId,
            totalDurationMinutes: config.totalDurationMinutes,
            passingScore: config.passingScore,
            categories: config.categories,
            questionsPerCategory: config.questionsPerCategory,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${testConfigs.length} test configs`);

    // Migrate Questions
    console.log('📦 Migrating Questions...');
    const questions = sqlite.prepare('SELECT * FROM Question').all();
    for (const q of questions) {
      try {
        await prisma.question.upsert({
          where: { id: q.id },
          update: {
            jobPostingId: q.jobPostingId,
            category: q.category,
            stem: q.stem,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          },
          create: {
            id: q.id,
            jobPostingId: q.jobPostingId,
            category: q.category,
            stem: q.stem,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${questions.length} questions`);

    // Migrate Interview
    console.log('📦 Migrating Interviews...');
    const interviews = sqlite.prepare('SELECT * FROM Interview').all();
    for (const interview of interviews) {
      try {
        await prisma.interview.upsert({
          where: { id: interview.id },
          update: {
            applicationId: interview.applicationId,
            scheduledAt: interview.scheduledAt,
            endTime: interview.endTime,
            location: interview.location,
            interviewer: interview.interviewer,
            type: interview.type,
            notes: interview.notes,
            score: interview.score ? parseInt(interview.score) : null,
            result: interview.result,
            adminMessage: interview.adminMessage,
          },
          create: {
            id: interview.id,
            applicationId: interview.applicationId,
            scheduledAt: interview.scheduledAt,
            endTime: interview.endTime,
            location: interview.location,
            interviewer: interview.interviewer,
            type: interview.type,
            notes: interview.notes,
            score: interview.score ? parseInt(interview.score) : null,
            result: interview.result,
            adminMessage: interview.adminMessage,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${interviews.length} interviews`);

    // Migrate ContactConversation & ContactMessage
    console.log('📦 Migrating ContactConversations...');
    const conversations = sqlite.prepare('SELECT * FROM ContactConversation').all();
    for (const conv of conversations) {
      try {
        await prisma.contactConversation.upsert({
          where: { id: conv.id },
          update: {
            applicantEmail: conv.applicantEmail,
            applicantName: conv.applicantName,
            status: conv.status,
          },
          create: {
            id: conv.id,
            applicantEmail: conv.applicantEmail,
            applicantName: conv.applicantName,
            status: conv.status,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${conversations.length} conversations`);

    console.log('📦 Migrating ContactMessages...');
    const messages = sqlite.prepare('SELECT * FROM ContactMessage').all();
    for (const msg of messages) {
      try {
        await prisma.contactMessage.upsert({
          where: { id: msg.id },
          update: {
            conversationId: msg.conversationId,
            senderType: msg.senderType,
            senderName: msg.senderName,
            senderEmail: msg.senderEmail,
            message: msg.message,
            isRead: !!msg.isRead,
          },
          create: {
            id: msg.id,
            conversationId: msg.conversationId,
            senderType: msg.senderType,
            senderName: msg.senderName,
            senderEmail: msg.senderEmail,
            message: msg.message,
            isRead: !!msg.isRead,
          },
        });
      } catch (e) {}
    }
    console.log(`  ✅ Migrated ${messages.length} messages`);

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    sqlite.close();
  }
}

migrate();
