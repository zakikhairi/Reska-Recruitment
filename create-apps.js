const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get pelamar@test.com user
  const user = await prisma.user.findUnique({
    where: { email: 'pelamar@test.com' },
    include: { applicant: true }
  });
  
  if (!user) {
    console.log('User pelamar@test.com not found!');
    return;
  }
  
  console.log('User:', user.email);
  console.log('Applicant ID:', user.applicant?.id);
  
  // Delete existing applications
  await prisma.application.deleteMany({ where: { applicantId: user.applicant.id } });
  console.log('\nDeleted old applications');
  
  // Get 3 jobs
  const jobs = await prisma.jobPosting.findMany({ take: 3 });
  console.log('\nCreating 3 applications...');
  
  for (const job of jobs) {
    const app = await prisma.application.create({
      data: {
        applicantId: user.applicant.id,
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
    console.log('✓', job.title, '->', app.status);
  }
  
  console.log('\nDone!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
