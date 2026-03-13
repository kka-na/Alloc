import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'alloc.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Migration: Add confirmed_amount column if it doesn't exist
try {
  db.exec('ALTER TABLE items ADD COLUMN confirmed_amount REAL DEFAULT 0');
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add is_per_person and person_count columns
try {
  db.exec('ALTER TABLE items ADD COLUMN is_per_person INTEGER DEFAULT 0');
} catch (e) {
  // Column already exists, ignore
}

try {
  db.exec('ALTER TABLE items ADD COLUMN person_count INTEGER DEFAULT 1');
} catch (e) {
  // Column already exists, ignore
}

export default db;
