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
  const adminEmail = 'admin@kai.co.id';
  const adminPassword = 'admin123';
  const passwordHash = simpleHash(adminPassword);
  
  // Check if admin exists
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { admin: true }
  });
  
  if (admin) {
    console.log('Admin exists, updating password...');
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash }
    });
    console.log('Admin password updated!');
  } else {
    console.log('Creating new admin...');
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'HR_ADMIN',
        admin: {
          create: {
            fullName: 'Admin KAI',
            employeeId: 'ADM001',
            department: 'HR'
          }
        }
      }
    });
    console.log('Admin created!');
  }
  
  console.log('\n=== ADMIN CREDENTIALS ===');
  console.log('Email: ' + adminEmail);
  console.log('Password: ' + adminPassword);
  console.log('========================\n');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
