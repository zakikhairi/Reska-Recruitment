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
  const email = 'admin@kai.co.id';
  const password = 'admin123';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { admin: true }
  });
  
  if (!user) {
    console.log('User NOT found!');
    return;
  }
  
  console.log('User found:', user.email);
  console.log('Role:', user.role);
  console.log('Password hash in DB:', user.passwordHash);
  console.log('Password hash computed:', simpleHash(password));
  console.log('Match:', simpleHash(password) === user.passwordHash);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
