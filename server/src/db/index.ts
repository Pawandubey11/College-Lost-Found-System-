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

  // Auto seed if empty
  autoSeedIfEmpty();
}

function autoSeedIfEmpty() {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) return;

  console.log('🌱 Empty database detected. Auto-seeding initial data...');
  const bcrypt = require('bcryptjs');

  const categories = [
    { name: 'ID Cards & Badges', slug: 'id-cards', description: 'Student ID cards, RFID access badges, library cards', icon_name: 'CreditCard' },
    { name: 'Electronics & Mobiles', slug: 'electronics', description: 'Phones, laptops, chargers, earphones, power banks', icon_name: 'Smartphone' },
    { name: 'Wallets & Purses', slug: 'wallets', description: 'Wallets, coin purses, card holders, money clips', icon_name: 'Wallet' },
    { name: 'Books & Stationery', slug: 'books-stationery', description: 'Textbooks, lab manuals, notebooks, pens, calculators', icon_name: 'BookOpen' },
    { name: 'Keys & Keychains', slug: 'keys', description: 'Hostel keys, bike keys, car keys, lockers keys', icon_name: 'Key' },
    { name: 'Bags & Backpacks', slug: 'bags', description: 'Backpacks, laptop bags, gym bags, totes', icon_name: 'Briefcase' },
    { name: 'Water Bottles & Flasks', slug: 'bottles', description: 'Steel bottles, thermoses, plastic shakers', icon_name: 'Droplet' },
    { name: 'Eyewear & Watches', slug: 'eyewear-watches', description: 'Spectacles, sunglasses, wristwatches, smartwatches', icon_name: 'Glasses' },
    { name: 'Clothing & Apparel', slug: 'clothing', description: 'Jackets, hoodies, lab coats, sports jerseys, caps', icon_name: 'Shirt' },
    { name: 'Documents & Certificates', slug: 'documents', description: 'Files, marksheets, project reports, certificates', icon_name: 'FileText' }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, icon_name) VALUES (?, ?, ?, ?)');
  categories.forEach(c => insertCategory.run(c.name, c.slug, c.description, c.icon_name));

  const locations = [
    { zone: 'Academic Zone', building: 'Central Library', floor: '2nd Floor Reading Room', description: 'Quiet study area near reference desk' },
    { zone: 'Student Activity Zone', building: 'Main Canteen & Food Court', floor: 'Ground Floor', description: 'Dining tables near counter #3' },
    { zone: 'Academic Zone', building: 'Science & Engineering Block', floor: '1st Floor Lab 104', description: 'Computer lab workstation area' },
    { zone: 'Administrative Zone', building: 'Admin Building & Reception', floor: 'Ground Floor Lobby', description: 'Visitor waiting desk near main security' },
    { zone: 'Sports & Amenities', building: 'Indoor Sports Complex', floor: 'Badminton Courts', description: 'Seating benches behind court 2' },
    { zone: 'Residential Zone', building: 'Hostel Block A', floor: 'Common Room', description: 'TV lounge area' },
    { zone: 'Campus Grounds', building: 'Main Entrance Security Gate', floor: 'Gate Guard House', description: 'Lost & Found physical drop desk' }
  ];

  const insertLocation = db.prepare('INSERT INTO locations (campus_zone, building_name, floor_level, description) VALUES (?, ?, ?, ?)');
  locations.forEach(l => insertLocation.run(l.zone, l.building, l.floor, l.description));

  const passwordHash = bcrypt.hashSync('Student@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  const users = [
    { full_name: 'Admin Desk Officer', email: 'admin@college.edu', password: adminPasswordHash, role: 'admin', department: 'Campus Safety & Administration', phone: '+91 98765 00001' },
    { full_name: 'Alex Rivera', email: 'alex.student@college.edu', password: passwordHash, role: 'student', department: 'Computer Science', phone: '+91 98765 11111' },
    { full_name: 'Priya Sharma', email: 'priya.student@college.edu', password: passwordHash, role: 'student', department: 'Electronics Engineering', phone: '+91 98765 22222' },
    { full_name: 'Dr. Rahul Verma', email: 'rahul.staff@college.edu', password: passwordHash, role: 'staff', department: 'Physics Faculty', phone: '+91 98765 33333' }
  ];

  const insertUser = db.prepare('INSERT INTO users (full_name, email, password_hash, role, department, phone_number) VALUES (?, ?, ?, ?, ?, ?)');
  users.forEach(u => insertUser.run(u.full_name, u.email, u.password, u.role, u.department, u.phone));

  const items = [
    { type: 'LOST', title: 'Black Leather Wallet with College ID', category_id: 3, location_id: 1, description: 'Lost my dark brown/black leather wallet somewhere in 2nd floor reading hall. Contains student ID card for Alex Rivera.', date: '2026-09-03', time: '14:30', color: 'Black', brand: 'WildHorn', features: 'Small silver metal logo on front bottom corner', hidden: 'Contains a 10 rupee coin and metro card ending in 4092', status: 'POSSIBLE_MATCH', reporter_id: 2 },
    { type: 'FOUND', title: 'Black Leather Wallet found near Library desk', category_id: 3, location_id: 1, description: 'Found a black leather wallet on table 14 in Central Library study room. Handed to librarian desk.', date: '2026-09-03', time: '15:10', color: 'Black', brand: 'WildHorn', features: 'Has a small silver logo on corner and cards inside', hidden: 'Student ID belongs to Computer Science student and metro card inside', status: 'POSSIBLE_MATCH', reporter_id: 3 },
    { type: 'LOST', title: 'Sony Noise Cancelling Headphones (Grey)', category_id: 2, location_id: 2, description: 'Over-ear wireless headphones in black carrying case. Left on canteen table during lunch.', date: '2026-09-04', time: '13:15', color: 'Grey', brand: 'Sony', features: 'Model WH-1000XM4, scratch near left ear-cup hinge', hidden: 'Serial number sticker ends with 881C', status: 'ACTIVE', reporter_id: 2 },
    { type: 'FOUND', title: 'College RFID Access ID Card - Priya Sharma', category_id: 1, location_id: 3, description: 'Found a student ID card near Lab 104 entrance door.', date: '2026-09-05', time: '10:00', color: 'White/Blue', brand: 'Institutional', features: 'Roll number 2024-ECE-042 printed on front', hidden: 'Lanyard has a red superhero sticker on badge clip', status: 'ACTIVE', reporter_id: 4 }
  ];

  const insertItem = db.prepare(`
    INSERT INTO items (report_type, title, category_id, location_id, description, incident_date, incident_time, primary_color, brand, distinguishing_features, hidden_details, status, reporter_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  items.forEach(i => insertItem.run(i.type, i.title, i.category_id, i.location_id, i.description, i.date, i.time, i.color, i.brand, i.features, i.hidden, i.status, i.reporter_id));

  db.prepare(`INSERT INTO matches (lost_item_id, found_item_id, match_score, status) VALUES (?, ?, ?, ?)`).run(1, 2, 92, 'SUGGESTED');
  db.prepare(`INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)`).run(2, 'Possible Match Found!', 'A found report matching your Black Leather Wallet was logged.', 'MATCH', 2);
  db.prepare(`INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`).run(1, 'DATABASE_SEED', 'SYSTEM', 0, 'Auto seed initialized successfully.');

  console.log('✅ Database auto-seeding finished.');
}

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default db;
