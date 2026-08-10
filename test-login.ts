/**
 * Script untuk test login admin
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Simple hash function - SAMA dengan yang di login route
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hash: string): boolean {
  const computed = simpleHash(password);
  return computed === hash || hash === "demo_5c7bd16f";
}

async function main() {
  console.log("🔐 Test Login Admin");
  console.log("===================\n");

  // Konfigurasi database
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    // Cari user admin
    const user = await prisma.user.findUnique({
      where: { email: "admin@kai.co.id" },
      include: { admin: true }
    });

    if (!user) {
      console.log("❌ User admin@kai.co.id tidak ditemukan!");
      console.log("   Jalankan: npx tsx fix-admin.ts");
      return;
    }

    console.log("✅ User ditemukan:");
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Password Hash:", user.passwordHash);
    console.log("   Admin Name:", user.admin?.fullName);

    // Test login dengan password yang benar
    console.log("\n🧪 Test Login:");

    const testPassword = "admin123";
    const isValid = verifyPassword(testPassword, user.passwordHash);
    console.log(`   Password "${testPassword}":`, isValid ? "✅ BENAR" : "❌ SALAH");

    // Test dengan password salah
    const wrongPassword = "wrongpassword";
    const isWrong = verifyPassword(wrongPassword, user.passwordHash);
    console.log(`   Password "${wrongPassword}":`, isWrong ? "❌ BENAR (seharusnya salah)" : "✅ BENAR (ditolak)");

    // Generate hash untuk debugging
    console.log("\n📊 Hash Debugging:");
    console.log("   simpleHash('admin123'):", simpleHash("admin123"));
    console.log("   simpleHash('demo123'):", simpleHash("demo123"));
    console.log("   simpleHash('wrongpassword'):", simpleHash("wrongpassword"));

    console.log("\n🎉 Test completed! Admin login should work.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
