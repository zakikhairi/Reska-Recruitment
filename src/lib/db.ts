import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Try multiple possible locations for dev.db
  const possiblePaths = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "prisma", "dev.db"),
  ];

  let dbPath = possiblePaths[0];
  const fs = require('fs');
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p;
      break;
    }
  }

  console.log("[DB] Using database at:", dbPath);
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
