const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete old applications
  await prisma.application.deleteMany({});
  
  // Get actual applicant
  const applicant = await prisma.user.findFirst({
    where: { role: 'APPLICANT' },
    include: { applicant: true }
  });
  
  if (!applicant?.applicant) {
    console.log('No applicant found!');
    return;
  }
  
  console.log('Applicant:', applicant.email, '(ID:', applicant.applicant.id + ')');
  
  // Get jobs
  const jobs = await prisma.jobPosting.findMany({ take: 3 });
  
  console.log('\nCreating 3 applications...');
  for (const job of jobs) {
    const app = await prisma.application.create({
      data: {
        applicantId: applicant.applicant.id,
        jobPostingId: job.id,
        status: 'ADMIN_CHECK',
        statusHistory: {
          create: {
            toStatus: 'ADMIN_CHECK',
            notes: 'Lamaran baru'
          }
        }
      }
    });
    console.log('✓', job.title);
  }
  
  console.log('\nDone!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
