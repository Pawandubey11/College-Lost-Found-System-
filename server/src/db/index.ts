import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable Foreign Keys & Write-Ahead Logging for performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'staff', 'admin')) NOT NULL DEFAULT 'student',
      department TEXT,
      phone_number TEXT,
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon_name TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campus_zone TEXT NOT NULL,
      building_name TEXT NOT NULL,
      floor_level TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT CHECK(report_type IN ('LOST', 'FOUND')) NOT NULL,
      title TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      location_id INTEGER NOT NULL REFERENCES locations(id),
      description TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      incident_time TEXT,
      primary_color TEXT NOT NULL,
      brand TEXT,
      distinguishing_features TEXT,
      hidden_details TEXT,
      status TEXT CHECK(status IN ('ACTIVE', 'POSSIBLE_MATCH', 'CLAIM_PENDING', 'RETURNED', 'CLOSED', 'EXPIRED', 'REJECTED')) NOT NULL DEFAULT 'ACTIVE',
      reporter_id INTEGER NOT NULL REFERENCES users(id),
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      claimant_id INTEGER NOT NULL REFERENCES users(id),
      verification_answers_json TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) NOT NULL DEFAULT 'PENDING',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lost_item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      found_item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      match_score INTEGER NOT NULL,
      status TEXT CHECK(status IN ('SUGGESTED', 'VERIFIED_MATCH', 'DISMISSED')) NOT NULL DEFAULT 'SUGGESTED',
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(lost_item_id, found_item_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('MATCH', 'CLAIM_UPDATE', 'MODERATION', 'SYSTEM')) NOT NULL,
      reference_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_items_type_status ON items(report_type, status);
    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
    CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id);
    CREATE INDEX IF NOT EXISTS idx_claims_item ON claims(item_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);
}

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default db;
