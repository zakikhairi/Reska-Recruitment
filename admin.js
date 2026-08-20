const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const path = require("path");

const dbPath = path.join(__dirname, "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "HR_ADMIN" } });
  console.log("Deleted old admins");

  const user = await prisma.user.create({
    data: {
      email: "admin@kai.co.id",
      passwordHash: "demo_39c43b7d",
      role: "HR_ADMIN",
      admin: {
        create: {
          fullName: "Admin KAI",
          employeeId: "ADM001",
          department: "HRD",
        },
      },
    },
  });

  console.log("Created: " + user.email);
  console.log("Password: admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
