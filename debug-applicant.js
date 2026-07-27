const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

async function main() {
  console.log('=== ALL USERS IN DATABASE ===\n');
  
  const users = await prisma.user.findMany({
    include: { applicant: true, admin: true }
  });
  
  if (users.length === 0) {
    console.log('No users found!');
    return;
  }
  
  for (const user of users) {
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password Hash: ${user.passwordHash}`);
    
    if (user.applicant) {
      console.log(`Applicant Name: ${user.applicant.fullName}`);
    }
    if (user.admin) {
      console.log(`Admin Name: ${user.admin.fullName}`);
    }
    console.log('---');
  }
  
  console.log('\n=== CREATE NEW APPLICANT ACCOUNT ===\n');
  
  const testEmail = 'pelamar@test.com';
  const testPassword = 'test123';
  
  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email: testEmail } });
  
  if (existing) {
    console.log(`User ${testEmail} already exists`);
  } else {
    const passwordHash = simpleHash(testPassword);
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
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
      }
    });
    console.log(`Created: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
