import db, { initDatabase } from './index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding...');
  initDatabase();

  // Clear existing data
  db.exec('DELETE FROM audit_logs;');
  db.exec('DELETE FROM notifications;');
  db.exec('DELETE FROM matches;');
  db.exec('DELETE FROM claims;');
  db.exec('DELETE FROM items;');
  db.exec('DELETE FROM locations;');
  db.exec('DELETE FROM categories;');
  db.exec('DELETE FROM users;');

  // Reset sqlite sequences
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'categories', 'locations', 'items', 'claims', 'matches', 'notifications', 'audit_logs');");

  // 1. Seed Categories
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
  console.log('✅ Categories seeded');

  // 2. Seed Locations
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
  console.log('✅ Locations seeded');

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('Student@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  const users = [
    { full_name: 'Admin Desk Officer', email: 'admin@college.edu', password: adminPasswordHash, role: 'admin', department: 'Campus Safety & Administration', phone: '+91 98765 00001' },
    { full_name: 'Alex Rivera', email: 'alex.student@college.edu', password: passwordHash, role: 'student', department: 'Computer Science', phone: '+91 98765 11111' },
    { full_name: 'Priya Sharma', email: 'priya.student@college.edu', password: passwordHash, role: 'student', department: 'Electronics Engineering', phone: '+91 98765 22222' },
    { full_name: 'Dr. Rahul Verma', email: 'rahul.staff@college.edu', password: passwordHash, role: 'staff', department: 'Physics Faculty', phone: '+91 98765 33333' }
  ];

  const insertUser = db.prepare('INSERT INTO users (full_name, email, password_hash, role, department, phone_number) VALUES (?, ?, ?, ?, ?, ?)');
  users.forEach(u => insertUser.run(u.full_name, u.email, u.password, u.role, u.department, u.phone));
  console.log('✅ Users seeded (Admin: admin@college.edu / Admin@123, Student: alex.student@college.edu / Student@123)');

  // 4. Seed Items (Lost and Found)
  const items = [
    {
      type: 'LOST',
      title: 'Black Leather Wallet with College ID',
      category_id: 3, // Wallets
      location_id: 1, // Central Library
      description: 'Lost my dark brown/black leather wallet somewhere in 2nd floor reading hall. Contains student ID card for Alex Rivera and Metro card.',
      date: '2026-09-03',
      time: '14:30',
      color: 'Black',
      brand: 'WildHorn',
      features: 'Small silver metal logo on front bottom corner',
      hidden: 'Contains a 10 rupee coin and metro card ending in 4092',
      status: 'POSSIBLE_MATCH',
      reporter_id: 2 // Alex
    },
    {
      type: 'FOUND',
      title: 'Black Leather Wallet found near Library desk',
      category_id: 3, // Wallets
      location_id: 1, // Central Library
      description: 'Found a black leather wallet on table 14 in Central Library study room. Handed to librarian desk.',
      date: '2026-09-03',
      time: '15:10',
      color: 'Black',
      brand: 'WildHorn',
      features: 'Has a small silver logo on corner and cards inside',
      hidden: 'Student ID belongs to Computer Science student and metro card inside',
      status: 'POSSIBLE_MATCH',
      reporter_id: 3 // Priya
    },
    {
      type: 'LOST',
      title: 'Sony Noise Cancelling Headphones (Grey)',
      category_id: 2, // Electronics
      location_id: 2, // Main Canteen
      description: 'Over-ear wireless headphones in black carrying case. Left on canteen table during lunch.',
      date: '2026-09-04',
      time: '13:15',
      color: 'Grey',
      brand: 'Sony',
      features: 'Model WH-1000XM4, scratch near left ear-cup hinge',
      hidden: 'Serial number sticker ends with 881C, custom initials AR scratched on zipper',
      status: 'ACTIVE',
      reporter_id: 2 // Alex
    },
    {
      type: 'FOUND',
      title: 'College RFID Access ID Card - Priya Sharma',
      category_id: 1, // ID Cards
      location_id: 3, // Science Block
      description: 'Found a student ID card near Lab 104 entrance door.',
      date: '2026-09-05',
      time: '10:00',
      color: 'White/Blue',
      brand: 'Institutional',
      features: 'Roll number 2024-ECE-042 printed on front',
      hidden: 'Lanyard has a red superhero sticker on badge clip',
      status: 'ACTIVE',
      reporter_id: 4 // Dr Rahul (Staff)
    },
    {
      type: 'LOST',
      title: 'Stainless Steel Milton Water Bottle (Blue 1L)',
      category_id: 7, // Bottles
      location_id: 5, // Sports Complex
      description: 'Left 1 Litre blue vacuum insulated flask near badminton court benches during evening practice.',
      date: '2026-09-02',
      time: '18:00',
      color: 'Blue',
      brand: 'Milton',
      features: 'Yellow gym sticker on lid',
      hidden: 'Small dent at bottom rim',
      status: 'RETURNED',
      reporter_id: 3 // Priya
    }
  ];

  const insertItem = db.prepare(`
    INSERT INTO items (report_type, title, category_id, location_id, description, incident_date, incident_time, primary_color, brand, distinguishing_features, hidden_details, status, reporter_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  items.forEach(i => insertItem.run(i.type, i.title, i.category_id, i.location_id, i.description, i.date, i.time, i.color, i.brand, i.features, i.hidden, i.status, i.reporter_id));
  console.log('✅ Sample Lost & Found Items seeded');

  // 5. Seed Matches
  const insertMatch = db.prepare(`
    INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
    VALUES (?, ?, ?, ?)
  `);
  insertMatch.run(1, 2, 92, 'SUGGESTED');
  console.log('✅ Rule-based Matches seeded');

  // 6. Seed Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertNotification.run(2, 'Possible Match Found!', 'A found report matching your "Black Leather Wallet" was logged by Priya Sharma at Central Library.', 'MATCH', 2);
  insertNotification.run(3, 'Thank You for Reporting', 'Your found report for "Black Leather Wallet" is actively helping locate its owner.', 'SYSTEM', 2);
  console.log('✅ Notifications seeded');

  // 7. Seed Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAudit.run(1, 'DATABASE_SEED', 'SYSTEM', 0, 'Initial production seed data applied successfully.');
  console.log('✅ Audit Log seeded');

  console.log('🎉 Seeding completed successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
