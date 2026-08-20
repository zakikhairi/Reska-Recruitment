const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('Connected to database at:', dbPath);

// Create ContactConversation table
db.exec(`
  CREATE TABLE IF NOT EXISTS ContactConversation (
    id TEXT PRIMARY KEY,
    applicantId TEXT,
    applicantEmail TEXT NOT NULL,
    applicantName TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    lastMessageAt TEXT DEFAULT CURRENT_TIMESTAMP,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('ContactConversation table created');

// Create ContactMessage table
db.exec(`
  CREATE TABLE IF NOT EXISTS ContactMessage (
    id TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    senderType TEXT NOT NULL,
    senderName TEXT NOT NULL,
    senderEmail TEXT NOT NULL,
    message TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId) REFERENCES ContactConversation(id) ON DELETE CASCADE
  )
`);

console.log('ContactMessage table created');

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:', tables);

db.close();
console.log('Done!');
