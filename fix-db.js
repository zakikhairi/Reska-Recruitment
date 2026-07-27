const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete pelamar@test.com if exists (with relations)
  await prisma.user.deleteMany({ where: { email: 'pelamar@test.com' } });
  console.log('Deleted old pelamar@test.com');
  
  // Delete wubisonodhanu888@gmail.com if exists
  await prisma.user.deleteMany({ where: { email: 'wubisonodhanu888@gmail.com' } });
  console.log('Deleted old wubisonodhanu888@gmail.com');
  
  // Create fresh pelamar user with applicant profile
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
  
  console.log('Created:', user.email, '(ApplicantID:', user.applicant.id + ')');
  
  // Delete old jobs
  await prisma.jobPosting.deleteMany({});
  console.log('\nDeleted old jobs');
  
  // Create 3 jobs
  const jobs = [
    { title: 'Pramugara Kereta Api', division: 'ON_TRAIN_SERVICE', location: 'Jakarta, Bandung, Surabaya', description: 'Melayani penumpang kereta api', requirements: 'SMA/SMK', minEducation: 'SMA', minHeight: 160, minAge: 18, maxAge: 25, status: 'ACTIVE', deadline: new Date('2026-08-15') },
    { title: 'Staff IT Support', division: 'IT_STAFF', location: 'Jakarta', description: 'IT support', requirements: 'S1 Teknik Informatika', minEducation: 'S1', minAge: 22, maxAge: 35, status: 'ACTIVE', deadline: new Date('2026-08-10') },
    { title: 'Staff Administrasi', division: 'ADMIN', location: 'Jakarta', description: 'Admin kantor', requirements: 'D3/S1', minEducation: 'D3', minAge: 20, maxAge: 30, status: 'ACTIVE', deadline: new Date('2026-08-18') }
  ];
  
  for (const job of jobs) {
    const created = await prisma.jobPosting.create({ data: job });
    console.log('Job:', created.title);
  }
  
  // Get jobs back
  const freshJobs = await prisma.jobPosting.findMany({ take: 3 });
  
  console.log('\nCreating 3 applications...');
  for (const job of freshJobs) {
    await prisma.application.create({
      data: {
        applicantId: user.applicant.id,
        jobPostingId: job.id,
        status: 'ADMIN_CHECK',
        statusHistory: { create: { toStatus: 'ADMIN_CHECK', notes: 'Lamaran baru' } }
      }
    });
    console.log('✓', job.title, '-> ADMIN_CHECK');
  }
  
  console.log('\n=== DONE ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
