import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_college_lost_found_jwt_key_2026';

// ----------------------------------------------------
// STATEFUL IN-MEMORY DATABASE ENGINE
// ----------------------------------------------------
const passwordHash = bcrypt.hashSync('Student@123', 10);
const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

const users = [
  { id: 1, full_name: 'Admin Desk Officer', email: 'admin@college.edu', password_hash: adminPasswordHash, role: 'admin', department: 'Campus Safety & Administration', phone_number: '+91 98765 00001', created_at: '2026-09-01 10:00:00' },
  { id: 2, full_name: 'Alex Rivera', email: 'alex.student@college.edu', password_hash: passwordHash, role: 'student', department: 'Computer Science', phone_number: '+91 98765 11111', created_at: '2026-09-01 10:00:00' },
  { id: 3, full_name: 'Priya Sharma', email: 'priya.student@college.edu', password_hash: passwordHash, role: 'student', department: 'Electronics Engineering', phone_number: '+91 98765 22222', created_at: '2026-09-01 10:00:00' },
  { id: 4, full_name: 'Dr. Rahul Verma', email: 'rahul.staff@college.edu', password_hash: passwordHash, role: 'staff', department: 'Physics Faculty', phone_number: '+91 98765 33333', created_at: '2026-09-01 10:00:00' }
];

const categories = [
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

const locations = [
  { id: 1, campus_zone: 'Academic Zone', building_name: 'Central Library', floor_level: '2nd Floor Reading Room', description: 'Quiet study area near reference desk' },
  { id: 2, campus_zone: 'Student Activity Zone', building_name: 'Main Canteen & Food Court', floor_level: 'Ground Floor', description: 'Dining tables near counter #3' },
  { id: 3, campus_zone: 'Academic Zone', building_name: 'Science & Engineering Block', floor_level: '1st Floor Lab 104', description: 'Computer lab workstation area' },
  { id: 4, campus_zone: 'Administrative Zone', building_name: 'Admin Building & Reception', floor_level: 'Ground Floor Lobby', description: 'Visitor waiting desk near main security' },
  { id: 5, campus_zone: 'Sports & Amenities', building_name: 'Indoor Sports Complex', floor_level: 'Badminton Courts', description: 'Seating benches behind court 2' },
  { id: 6, campus_zone: 'Residential Zone', building: 'Hostel Block A', floor_level: 'Common Room', description: 'TV lounge area' },
  { id: 7, campus_zone: 'Campus Grounds', building_name: 'Main Entrance Security Gate', floor_level: 'Gate Guard House', description: 'Lost & Found physical drop desk' }
];

const items = [
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

const claims = [];
const matches = [{ id: 1, lost_item_id: 1, found_item_id: 2, match_score: 92, status: 'SUGGESTED', detected_at: '2026-09-03 15:15:00' }];
const notifications = [
  { id: 1, user_id: 2, title: 'Possible Match Found!', message: 'A found report matching your Black Leather Wallet was logged.', type: 'MATCH', reference_id: 2, is_read: 0, created_at: '2026-09-03 15:15:00' }
];
const audit_logs = [
  { id: 1, user_id: 1, action: 'DATABASE_SEED', target_type: 'SYSTEM', target_id: 0, details: 'Vercel serverless JavaScript API initialized.', created_at: '2026-09-05 00:00:00' }
];

// ----------------------------------------------------
// EXPRESS MIDDLEWARE
// ----------------------------------------------------
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Smart College Lost & Found API (Vercel Serverless JS)',
    timestamp: new Date().toISOString(),
    stats: { users: users.length, items: items.length }
  });
});

app.get('/api/master/categories', (req, res) => {
  res.json({ categories });
});

app.get('/api/master/locations', (req, res) => {
  res.json({ locations });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const passwordValid = bcrypt.compareSync(password, user.password_hash);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userWithoutPassword } = user;

  res.json({ message: 'Login successful.', token, user: userWithoutPassword });
});

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, role = 'student', department, phone_number } = req.body;
  if (!full_name || !email || !password) return res.status(400).json({ error: 'Full name, email, and password are required.' });

  const existing = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) return res.status(400).json({ error: 'Email already registered.' });

  const newUser = {
    id: users.length + 1,
    full_name,
    email: email.toLowerCase(),
    password_hash: bcrypt.hashSync(password, 10),
    role,
    department: department || null,
    phone_number: phone_number || null,
    created_at: new Date().toISOString()
  };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userWithoutPassword } = newUser;

  res.status(201).json({ message: 'Registration successful.', token, user: userWithoutPassword });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password_hash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/items', (req, res) => {
  let filtered = [...items];
  const { type, category_id, location_id, search } = req.query;

  if (type) filtered = filtered.filter(i => i.report_type === String(type).toUpperCase());
  if (category_id) filtered = filtered.filter(i => i.category_id === Number(category_id));
  if (location_id) filtered = filtered.filter(i => i.location_id === Number(location_id));
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }

  res.json({
    items: filtered,
    pagination: { total: filtered.length, page: 1, limit: 50, totalPages: 1 }
  });
});

app.get('/api/items/my-reports', authenticateToken, (req, res) => {
  const myReports = items.filter(i => i.reporter_id === req.user.id);
  res.json({ reports: myReports });
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found.' });
  const itemMatches = matches.filter(m => m.lost_item_id === item.id || m.found_item_id === item.id);
  res.json({ item, matches: itemMatches });
});

app.post('/api/items/report', authenticateToken, (req, res) => {
  const { report_type, title, category_id, location_id, description, incident_date, incident_time, primary_color, brand, distinguishing_features, hidden_details } = req.body;

  const newItem = {
    id: items.length + 1,
    report_type: report_type || 'LOST',
    title: title || 'Reported Item',
    category_id: Number(category_id) || 1,
    location_id: Number(location_id) || 1,
    description: description || '',
    incident_date: incident_date || new Date().toISOString().split('T')[0],
    incident_time: incident_time || '12:00',
    primary_color: primary_color || 'Black',
    brand: brand || '',
    distinguishing_features: distinguishing_features || '',
    hidden_details: hidden_details || '',
    status: 'ACTIVE',
    reporter_id: req.user.id,
    created_at: new Date().toISOString()
  };

  const cat = categories.find(c => c.id === newItem.category_id);
  const loc = locations.find(l => l.id === newItem.location_id);
  const rep = users.find(u => u.id === newItem.reporter_id);

  if (cat) { newItem.category_name = cat.name; newItem.category_icon = cat.icon_name; }
  if (loc) { newItem.campus_zone = loc.campus_zone; newItem.building_name = loc.building_name; newItem.floor_level = loc.floor_level; }
  if (rep) { newItem.reporter_name = rep.full_name; newItem.reporter_role = rep.role; newItem.reporter_department = rep.department; }

  items.unshift(newItem);
  res.status(201).json({ message: 'Report created successfully.', itemId: newItem.id, matchesDetected: 0 });
});

app.put('/api/items/:id/status', authenticateToken, (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found.' });
  if (item.reporter_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });

  item.status = req.body.status || item.status;
  res.json({ message: 'Item status updated.' });
});

app.post('/api/claims/item/:itemId', authenticateToken, (req, res) => {
  const itemId = Number(req.params.itemId);
  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found.' });

  const newClaim = {
    id: claims.length + 1,
    item_id: itemId,
    claimant_id: req.user.id,
    verification_answers_json: JSON.stringify(req.body.verification_answers || {}),
    status: 'PENDING',
    created_at: new Date().toISOString(),
    item_title: item.title,
    report_type: item.report_type,
    primary_color: item.primary_color,
    category_name: item.category_name,
    building_name: item.building_name
  };

  claims.unshift(newClaim);
  res.status(201).json({ message: 'Claim submitted successfully.', claimId: newClaim.id });
});

app.get('/api/claims/my-claims', authenticateToken, (req, res) => {
  const myClaims = claims.filter(c => c.claimant_id === req.user.id);
  res.json({ claims: myClaims });
});

app.get('/api/claims/received', authenticateToken, (req, res) => {
  const myItemIds = items.filter(i => i.reporter_id === req.user.id).map(i => i.id);
  const received = claims.filter(c => myItemIds.includes(c.item_id));
  res.json({ claims: received });
});

app.put('/api/claims/:claimId/decision', authenticateToken, (req, res) => {
  const claim = claims.find(c => c.id === Number(req.params.claimId));
  if (!claim) return res.status(404).json({ error: 'Claim not found.' });

  claim.status = req.body.decision || claim.status;
  claim.admin_notes = req.body.admin_notes || '';

  if (req.body.decision === 'APPROVED') {
    const item = items.find(i => i.id === claim.item_id);
    if (item) item.status = 'RETURNED';
  }

  res.json({ message: 'Claim decision processed.' });
});

app.get('/api/notifications', authenticateToken, (req, res) => {
  const userNotifs = notifications.filter(n => n.user_id === req.user.id);
  const unreadCount = userNotifs.filter(n => !n.is_read).length;
  res.json({ notifications: userNotifs, unreadCount });
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  notifications.filter(n => n.user_id === req.user.id).forEach(n => n.is_read = 1);
  res.json({ message: 'All notifications marked as read.' });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = notifications.find(n => n.id === Number(req.params.id) && n.user_id === req.user.id);
  if (notif) notif.is_read = 1;
  res.json({ message: 'Notification marked as read.' });
});

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

  const stats = {
    totalUsers: users.length,
    activeLost: items.filter(i => i.report_type === 'LOST' && i.status === 'ACTIVE').length,
    activeFound: items.filter(i => i.report_type === 'FOUND' && i.status === 'ACTIVE').length,
    returnedCount: items.filter(i => i.status === 'RETURNED').length,
    pendingClaims: claims.filter(c => c.status === 'PENDING').length,
    matchesCount: matches.length,
    recoveryRate: Math.round((items.filter(i => i.status === 'RETURNED').length / Math.max(1, items.length)) * 100)
  };

  const hotspots = [
    { building_name: 'Central Library', item_count: items.filter(i => i.building_name === 'Central Library').length },
    { building_name: 'Main Canteen & Food Court', item_count: items.filter(i => i.building_name === 'Main Canteen & Food Court').length },
    { building_name: 'Science & Engineering Block', item_count: items.filter(i => i.building_name === 'Science & Engineering Block').length }
  ];

  res.json({ stats, hotspots });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  const safeUsers = users.map(({ password_hash, ...u }) => u);
  res.json({ users: safeUsers });
});

app.put('/api/admin/users/:userId/role', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  const u = users.find(u => u.id === Number(req.params.userId));
  if (!u) return res.status(404).json({ error: 'User not found.' });
  u.role = req.body.role || u.role;
  res.json({ message: 'User role updated.' });
});

app.get('/api/admin/reports', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  res.json({ reports: items });
});

app.get('/api/admin/claims', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  res.json({ claims });
});

app.get('/api/admin/audit', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  res.json({ logs: audit_logs });
});

export default app;
