import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  try {
    // Drop old table if exists
    await sql`DROP TABLE IF EXISTS "ContactMessage" CASCADE`;

    // Create ContactConversation table
    await sql`
      CREATE TABLE IF NOT EXISTS "ContactConversation" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "applicantId" TEXT,
        "applicantEmail" TEXT NOT NULL,
        "applicantName" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "lastMessageAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create ContactMessage table
    await sql`
      CREATE TABLE IF NOT EXISTS "ContactMessage" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "conversationId" TEXT NOT NULL REFERENCES "ContactConversation"("id") ON DELETE CASCADE,
        "senderType" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "senderEmail" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('✅ Chat tables created successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrate();
