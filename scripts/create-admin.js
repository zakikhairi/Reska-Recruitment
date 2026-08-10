const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('Connected to:', dbPath);

// Simple hash function (same as used in login)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

console.log('\n📋 Current Admin Users:');
const admins = db.prepare("SELECT u.id, u.email, u.role, u.passwordHash FROM User u WHERE u.role IN ('HR_ADMIN', 'SUPER_ADMIN')").all();
admins.forEach(a => console.log(`  - ${a.email} (${a.role})`));

// Create admin user
const adminEmail = 'admin@kai.co.id';
const existingAdmin = db.prepare("SELECT id FROM User WHERE email = ?").get(adminEmail);

if (existingAdmin) {
  console.log(`\n⚠️  Admin ${adminEmail} already exists`);
} else {
  const passwordHash = simpleHash('admin123');
  const adminId = crypto.randomBytes(12).toString('hex');

  db.prepare(`
    INSERT INTO User (id, email, passwordHash, role, emailVerified, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
  `).run(adminId, adminEmail, passwordHash, 'HR_ADMIN');

  console.log(`\n✅ Created admin user: ${adminEmail}`);
  console.log(`   Password: admin123`);
}

console.log('\n📋 Updated Admin Users:');
const updatedAdmins = db.prepare("SELECT u.id, u.email, u.role FROM User u WHERE u.role IN ('HR_ADMIN', 'SUPER_ADMIN')").all();
updatedAdmins.forEach(a => console.log(`  - ${a.email} (${a.role})`));

db.close();
console.log('\n✅ Done!');
