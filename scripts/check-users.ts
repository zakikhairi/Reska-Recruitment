import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  const users = await sql`SELECT id, email, role, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 20`;
  console.log(`Total Users: ${users.length}`);
  users.forEach(u => {
    console.log(`- ${u.email} | ${u.role} | verified: ${u.email_verified} | ${u.created_at}`);
  });
}
check().catch(console.error);
