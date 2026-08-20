const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

// Simple hash function - SAMA dengan yang di login route
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return "demo_" + Math.abs(hash).toString(16);
}

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Hapus admin lama
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { in: ['HR_ADMIN', 'SUPER_ADMIN'] } } });
  console.log('Deleted old admins');

  // Password untuk admin
  const adminPassword = 'admin123';
  const passwordHash = simpleHash(adminPassword);
  console.log('Generated password hash:', passwordHash);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email: 'admin@kai.co.id',
      passwordHash: passwordHash,
      role: 'HR_ADMIN',
      admin: {
        create: {
          fullName: 'Admin KAI',
          employeeId: 'ADM001',
          department: 'HRD'
        }
      }
    }
  });

  console.log('Created:', user.email);
  console.log('Password:', adminPassword);
  console.log('Password Hash:', passwordHash);
}

main().catch(console.error).finally(() => prisma.$disconnect());
