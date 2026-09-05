import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const require = createRequire(import.meta.url);
let db: any;

try {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DATABASE_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/database.sqlite' : path.resolve(process.cwd(), 'database.sqlite'));
  db = new Database(dbPath);
  try { db.pragma('foreign_keys = ON'); } catch (e) {}
  try { db.pragma('journal_mode = WAL'); } catch (e) {}
} catch (err) {
  console.warn('⚠️ Native better-sqlite3 module unavailable, using stateful memory database engine:', err);
  db = createMemoryFallbackDb();
}

function createMemoryFallbackDb() {
  const passwordHash = bcrypt.hashSync('Student@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  const users: any[] = [
    { id: 1, full_name: 'Admin Desk Officer', email: 'admin@college.edu', password_hash: adminPasswordHash, role: 'admin', department: 'Campus Safety & Administration', phone_number: '+91 98765 00001', created_at: '2026-09-01 10:00:00' },
    { id: 2, full_name: 'Alex Rivera', email: 'alex.student@college.edu', password_hash: passwordHash, role: 'student', department: 'Computer Science', phone_number: '+91 98765 11111', created_at: '2026-09-01 10:00:00' },
    { id: 3, full_name: 'Priya Sharma', email: 'priya.student@college.edu', password_hash: passwordHash, role: 'student', department: 'Electronics Engineering', phone_number: '+91 98765 22222', created_at: '2026-09-01 10:00:00' },
    { id: 4, full_name: 'Dr. Rahul Verma', email: 'rahul.staff@college.edu', password_hash: passwordHash, role: 'staff', department: 'Physics Faculty', phone_number: '+91 98765 33333', created_at: '2026-09-01 10:00:00' }
  ];

  const categories: any[] = [
    { id: 1, name: 'ID Cards & Badges', slug: 'id-cards', description: 'Student ID cards, RFID access badges, library cards', icon_name: 'CreditCard' },
    { id: 2, name: 'Electronics & Mobiles', slug: 'electronics', description: 'Phones, laptops, chargers, earphones, power banks', icon_name: 'Smartphone' },
    { id: 3, name: 'Wallets & Purses', slug: 'wallets', description: 'Wallets, coin purses, card holders, money clips', icon_name: 'Wallet' },
    { id: 4, name: 'Books & Stationery', slug: 'books-stationery', description: 'Textbooks, lab manuals, notebooks, pens, calculators', icon_name: 'BookOpen' },
    { id: 5, name: 'Keys & Keychains', slug: 'keys', description: 'Hostel keys, bike keys, car keys, lockers keys', icon_name: 'Key' },
    { id: 6, name: 'Bags & Backpacks', slug: 'bags', description: 'Backpacks, laptop bags, gym bags, totes', icon_name: 'Briefcase' },
    { id: 7, name: 'Water Bottles & Flasks', slug: 'bottles', description: 'Steel bottles, thermoses, plastic shakers', icon_name: 'Droplet' },
    { id: 8, name: 'Eyewear & Watches', slug: 'eyewear-watches', description: 'Spectacles, sunglasses, wristwatches, smartwatches', icon_name: 'Glasses' },
    { id: 9, name: 'Clothing & Apparel', slug: 'clothing', description: 'Jackets, hoodies, lab coats, sports jerseys, caps', icon_name: 'Shirt' },
    { id: 10, name: 'Documents & Certificates', slug: 'documents', description: 'Files, marksheets, project reports, certificates', icon_name: 'FileText' }
  ];

  const locations: any[] = [
    { id: 1, campus_zone: 'Academic Zone', building_name: 'Central Library', floor_level: '2nd Floor Reading Room', description: 'Quiet study area near reference desk' },
    { id: 2, campus_zone: 'Student Activity Zone', building_name: 'Main Canteen & Food Court', floor_level: 'Ground Floor', description: 'Dining tables near counter #3' },
    { id: 3, campus_zone: 'Academic Zone', building_name: 'Science & Engineering Block', floor_level: '1st Floor Lab 104', description: 'Computer lab workstation area' },
    { id: 4, campus_zone: 'Administrative Zone', building_name: 'Admin Building & Reception', floor_level: 'Ground Floor Lobby', description: 'Visitor waiting desk near main security' },
    { id: 5, campus_zone: 'Sports & Amenities', building_name: 'Indoor Sports Complex', floor_level: 'Badminton Courts', description: 'Seating benches behind court 2' },
    { id: 6, campus_zone: 'Residential Zone', building: 'Hostel Block A', floor_level: 'Common Room', description: 'TV lounge area' },
    { id: 7, campus_zone: 'Campus Grounds', building_name: 'Main Entrance Security Gate', floor_level: 'Gate Guard House', description: 'Lost & Found physical drop desk' }
  ];

  const items: any[] = [
    {
      id: 1, report_type: 'LOST', title: 'Black Leather Wallet with College ID', category_id: 3, location_id: 1, description: 'Lost my dark brown/black leather wallet somewhere in 2nd floor reading hall. Contains student ID card for Alex Rivera.', incident_date: '2026-09-03', incident_time: '14:30', primary_color: 'Black', brand: 'WildHorn', distinguishing_features: 'Small silver metal logo on front bottom corner', hidden_details: 'Contains a 10 rupee coin and metro card ending in 4092', status: 'POSSIBLE_MATCH', reporter_id: 2, created_at: '2026-09-03 14:30:00',
      category_name: 'Wallets & Purses', category_icon: 'Wallet', campus_zone: 'Academic Zone', building_name: 'Central Library', floor_level: '2nd Floor Reading Room', reporter_name: 'Alex Rivera', reporter_role: 'student', reporter_department: 'Computer Science'
    },
    {
      id: 2, report_type: 'FOUND', title: 'Black Leather Wallet found near Library desk', category_id: 3, location_id: 1, description: 'Found a black leather wallet on table 14 in Central Library study room. Handed to librarian desk.', incident_date: '2026-09-03', incident_time: '15:10', primary_color: 'Black', brand: 'WildHorn', distinguishing_features: 'Has a small silver logo on corner and cards inside', hidden_details: 'Student ID belongs to Computer Science student and metro card inside', status: 'POSSIBLE_MATCH', reporter_id: 3, created_at: '2026-09-03 15:10:00',
      category_name: 'Wallets & Purses', category_icon: 'Wallet', campus_zone: 'Academic Zone', building_name: 'Central Library', floor_level: '2nd Floor Reading Room', reporter_name: 'Priya Sharma', reporter_role: 'student', reporter_department: 'Electronics Engineering'
    },
    {
      id: 3, report_type: 'LOST', title: 'Sony Noise Cancelling Headphones (Grey)', category_id: 2, location_id: 2, description: 'Over-ear wireless headphones in black carrying case. Left on canteen table during lunch.', incident_date: '2026-09-04', incident_time: '13:15', primary_color: 'Grey', brand: 'Sony', distinguishing_features: 'Model WH-1000XM4, scratch near left ear-cup hinge', hidden_details: 'Serial number sticker ends with 881C', status: 'ACTIVE', reporter_id: 2, created_at: '2026-09-04 13:15:00',
      category_name: 'Electronics & Mobiles', category_icon: 'Smartphone', campus_zone: 'Student Activity Zone', building_name: 'Main Canteen & Food Court', floor_level: 'Ground Floor', reporter_name: 'Alex Rivera', reporter_role: 'student', reporter_department: 'Computer Science'
    },
    {
      id: 4, report_type: 'FOUND', title: 'College RFID Access ID Card - Priya Sharma', category_id: 1, location_id: 3, description: 'Found a student ID card near Lab 104 entrance door.', incident_date: '2026-09-05', incident_time: '10:00', primary_color: 'White/Blue', brand: 'Institutional', distinguishing_features: 'Roll number 2024-ECE-042 printed on front', hidden_details: 'Lanyard has a red superhero sticker on badge clip', status: 'ACTIVE', reporter_id: 4, created_at: '2026-09-05 10:00:00',
      category_name: 'ID Cards & Badges', category_icon: 'CreditCard', campus_zone: 'Academic Zone', building_name: 'Science & Engineering Block', floor_level: '1st Floor Lab 104', reporter_name: 'Dr. Rahul Verma', reporter_role: 'staff', reporter_department: 'Physics Faculty'
    }
  ];

  const claims: any[] = [];
  const matches: any[] = [{ id: 1, lost_item_id: 1, found_item_id: 2, match_score: 92, status: 'SUGGESTED', detected_at: '2026-09-03 15:15:00' }];
  const notifications: any[] = [
    { id: 1, user_id: 2, title: 'Possible Match Found!', message: 'A found report matching your Black Leather Wallet was logged.', type: 'MATCH', reference_id: 2, is_read: 0, created_at: '2026-09-03 15:15:00' }
  ];
  const audit_logs: any[] = [
    { id: 1, user_id: 1, action: 'DATABASE_SEED', target_type: 'SYSTEM', target_id: 0, details: 'In-memory stateful database initialized.', created_at: '2026-09-05 00:00:00' }
  ];

  return {
    exec: (sql: string) => {},
    pragma: (sql: string) => {},
    prepare: (sql: string) => ({
      run: (...params: any[]) => {
        if (sql.includes('INSERT INTO users')) {
          const newUser = { id: users.length + 1, full_name: params[0], email: params[1], password_hash: params[2], role: params[3], department: params[4], phone_number: params[5], created_at: new Date().toISOString() };
          users.push(newUser);
          return { lastInsertRowid: newUser.id, changes: 1 };
        }
        if (sql.includes('INSERT INTO items')) {
          const newItem: Record<string, any> = { id: items.length + 1, report_type: params[0], title: params[1], category_id: params[2], location_id: params[3], description: params[4], incident_date: params[5], incident_time: params[6], primary_color: params[7], brand: params[8], distinguishing_features: params[9], hidden_details: params[10], status: params[11], reporter_id: params[12], created_at: new Date().toISOString() };
          const cat = categories.find(c => c.id === Number(params[2]));
          const loc = locations.find(l => l.id === Number(params[3]));
          const rep = users.find(u => u.id === Number(params[12]));
          if (cat) { newItem.category_name = cat.name; newItem.category_icon = cat.icon_name; }
          if (loc) { newItem.campus_zone = loc.campus_zone; newItem.building_name = loc.building_name; newItem.floor_level = loc.floor_level; }
          if (rep) { newItem.reporter_name = rep.full_name; newItem.reporter_role = rep.role; newItem.reporter_department = rep.department; }
          items.unshift(newItem);
          return { lastInsertRowid: newItem.id, changes: 1 };
        }
        if (sql.includes('INSERT INTO claims')) {
          const newClaim = { id: claims.length + 1, item_id: params[0], claimant_id: params[1], verification_answers_json: params[2], status: 'PENDING', created_at: new Date().toISOString() };
          claims.unshift(newClaim);
          return { lastInsertRowid: newClaim.id, changes: 1 };
        }
        if (sql.includes('UPDATE notifications')) {
          notifications.forEach(n => n.is_read = 1);
          return { changes: notifications.length };
        }
        return { lastInsertRowid: Date.now(), changes: 1 };
      },
      get: (...params: any[]) => {
        if (sql.includes('FROM users WHERE email =')) {
          const email = String(params[0]).toLowerCase();
          return users.find(u => u.email.toLowerCase() === email);
        }
        if (sql.includes('FROM users WHERE id =')) {
          const id = Number(params[0]);
          return users.find(u => u.id === id);
        }
        if (sql.includes('FROM items WHERE id =')) {
          const id = Number(params[0]);
          return items.find(i => i.id === id);
        }
        if (sql.includes('COUNT(*)')) {
          if (sql.includes('users')) return { count: users.length, c: users.length };
          if (sql.includes('items')) return { count: items.length, c: items.length };
          if (sql.includes('claims')) return { count: claims.length, c: claims.length };
          if (sql.includes('notifications')) return { count: notifications.filter(n => !n.is_read).length, c: notifications.filter(n => !n.is_read).length };
          return { count: 0, c: 0 };
        }
        return undefined;
      },
      all: (...params: any[]) => {
        if (sql.includes('categories')) return categories;
        if (sql.includes('locations')) return locations;
        if (sql.includes('items')) return items;
        if (sql.includes('claims')) return claims;
        if (sql.includes('users')) return users;
        if (sql.includes('notifications')) return notifications;
        if (sql.includes('audit_logs')) return audit_logs;
        return [];
      }
    })
  };
}

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
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default db;
