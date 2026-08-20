const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create applicant user
  const user = await prisma.user.create({
    data: {
      email: 'pelamar@test.com',
      passwordHash: 'demo_test',
      role: 'APPLICANT',
      applicant: {
        create: {
          nik: '1234567890123456',
          fullName: 'Test Pelamar',
          phone: '081234567890',
          dateOfBirth: new Date('1995-01-01'),
          placeOfBirth: 'Jakarta',
          gender: 'MALE',
          address: 'Jl Test No 1',
          city: 'Jakarta',
          postalCode: '12345',
          education: 'SMA',
        }
      }
    },
    include: { applicant: true }
  });
  
  console.log('Created user:', user.email);
  console.log('Applicant ID:', user.applicant.id);
  
  // Get jobs
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
