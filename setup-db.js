const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Setup Database ===\n');
  
  // Delete all applications
  await prisma.application.deleteMany({});
  console.log('Deleted all applications');
  
  // Delete all job postings
  await prisma.jobPosting.deleteMany({});
  console.log('Deleted all job postings');
  
  // Delete all password resets
  await prisma.passwordReset.deleteMany({});
  console.log('Deleted all password resets');
  
  // Delete all applicants
  await prisma.applicant.deleteMany({});
  console.log('Deleted all applicants');
  
  // Delete all admin users (keep only applicants)
  await prisma.admin.deleteMany({});
  console.log('Deleted all admins');
  
  // Delete all non-applicant users
  await prisma.user.deleteMany({
    where: { role: { not: 'APPLICANT' } }
  });
  console.log('Deleted all non-applicant users');
  
  // Get the test applicant
  const applicantUser = await prisma.user.findFirst({
    where: { role: 'APPLICANT' },
    include: { applicant: true }
  });
  
  if (!applicantUser) {
    console.log('\nNo applicant found! Creating new one...');
    const newUser = await prisma.user.create({
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
    console.log('Created applicant:', newUser.email);
  } else {
    console.log('\nFound applicant:', applicantUser.email);
  }
  
  // Create 3 job postings
  const jobs = [
    {
      title: 'Pramugara / Pramugari Kereta Api',
      division: 'ON_TRAIN_SERVICE',
      location: 'Jakarta, Bandung, Surabaya',
      description: 'Melayani penumpang kereta api dengan ramah dan profesional.',
      requirements: 'SMA/SMK semua jurusan, tinggi minimal 160cm',
      minEducation: 'SMA',
      minHeight: 160,
      minAge: 18,
      maxAge: 25,
      status: 'ACTIVE',
      deadline: new Date('2026-08-15')
    },
    {
      title: 'Staff IT Support',
      division: 'IT_STAFF',
      location: 'Jakarta',
      description: 'Mengelola sistem IT dan jaringan di seluruh cabang.',
      requirements: 'S1 Teknik Informatika, IPK minimal 3.0',
      minEducation: 'S1',
      minAge: 22,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date('2026-08-10')
    },
    {
      title: 'Staff Administrasi',
      division: 'ADMIN',
      location: 'Jakarta',
      description: 'Mengelola administrasi perkantoran.',
      requirements: 'D3/S1 Administrasi Bisnis',
      minEducation: 'D3',
      minAge: 20,
      maxAge: 30,
      status: 'ACTIVE',
      deadline: new Date('2026-08-18')
    }
  ];
  
  console.log('\nCreating 3 jobs...');
  const createdJobs = [];
  for (const job of jobs) {
    const created = await prisma.jobPosting.create({ data: job });
    createdJobs.push(created);
    console.log('Created:', created.title);
  }
  
  // Get fresh applicant
  const freshApplicant = await prisma.user.findFirst({
    where: { role: 'APPLICANT' },
    include: { applicant: true }
  });
  
  if (freshApplicant?.applicant) {
    console.log('\nCreating 3 applications for', freshApplicant.email);
    
    for (let i = 0; i < createdJobs.length; i++) {
      const app = await prisma.application.create({
        data: {
          applicantId: freshApplicant.applicant.id,
          jobPostingId: createdJobs[i].id,
          status: 'ADMIN_CHECK',
          statusHistory: {
            create: {
              toStatus: 'ADMIN_CHECK',
              notes: 'Lamaran baru diajukan'
            }
          }
        }
      });
      console.log('Created application for:', createdJobs[i].title, '(Status: ADMIN_CHECK)');
    }
  }
  
  // Keep only the test applicant user
  await prisma.user.deleteMany({
    where: {
      AND: [
        { role: 'APPLICANT' },
        { email: { not: 'pelamar@test.com' } }
      ]
    }
  });
  
  console.log('\n=== Database Cleaned ===');
  console.log('- Admin users: 0');
  console.log('- Applicant users: 1 (pelamar@test.com)');
  console.log('- Jobs: 3');
  console.log('- Applications: 3 (all ADMIN_CHECK)');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
