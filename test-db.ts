/**
 * Test koneksi database via API endpoint style
 */
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

async function test() {
  console.log("🔍 Testing database connection...\n");

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  console.log("DB Path:", dbPath);
  console.log("DB Exists:", require('fs').existsSync(dbPath));

  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    // Test query
    const users = await prisma.user.findMany();
    console.log("\n📊 All users in database:");
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`));

    // Test login
    const email = "admin@kai.co.id";
    const password = "admin123";
    const passwordHash = simpleHash(password);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true }
    });

    if (!user) {
      console.log("\n❌ User not found!");
    } else {
      console.log("\n✅ User found:", user.email);
      console.log("   Hash in DB:", user.passwordHash);
      console.log("   Hash computed:", passwordHash);
      console.log("   Match:", user.passwordHash === passwordHash);
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
