/**
 * Script untuk membuat/memperbaiki akun admin
 * Menggunakan libsql adapter untuk script standalone
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Konfigurasi database
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = `file:${dbPath}`;

// Buat adapter dan client
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// Simple hash function - HARUS SAMA dengan yang di login route
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return "demo_" + Math.abs(hash).toString(16);
}

async function main() {
  console.log("🔧 Fix Admin Account Script");
  console.log("============================\n");

  const adminPassword = "admin123";
  const passwordHash = simpleHash(adminPassword);

  console.log("Generated password hash for 'admin123':", passwordHash);
  console.log("Database URL:", dbUrl);

  // Hapus admin lama
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: "admin@kai.co.id" }
  });
  console.log("✅ Deleted old admin accounts\n");

  // Buat admin baru
  const admin = await prisma.user.create({
    data: {
      email: "admin@kai.co.id",
      passwordHash: passwordHash,
      role: "HR_ADMIN",
      emailVerified: true,
      admin: {
        create: {
          fullName: "Admin HR",
          employeeId: "EMP001",
          department: "Human Resources",
        },
      },
    },
    include: { admin: true },
  });

  console.log("✅ Admin created successfully!");
  console.log("\n📋 Admin Credentials:");
  console.log("   Email:    admin@kai.co.id");
  console.log(`   Password: ${adminPassword}`);
  console.log("   Role:     HR_ADMIN");
  console.log("\n💡 Note: Password hash yang digunakan:", passwordHash);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed.");
  });
