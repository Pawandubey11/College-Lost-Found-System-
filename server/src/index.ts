import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import db, { initDatabase } from './db/index.js';

import authRoutes from './routes/authRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Schema
initDatabase();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploaded files safely
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const itemCount = (db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }).count;
    res.json({
      status: 'HEALTHY',
      service: 'Smart College Lost & Found API',
      timestamp: new Date().toISOString(),
      database: 'SQLite connected',
      stats: { users: userCount, items: itemCount }
    });
  } catch (error) {
    res.status(500).json({ status: 'UNHEALTHY', error: (error as Error).message });
  }
});

// Serve React build in production
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
const altClientDistPath = path.resolve(process.cwd(), 'client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else if (fs.existsSync(altClientDistPath)) {
  app.use(express.static(altClientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(altClientDistPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Smart College Lost & Found Server running on http://localhost:${PORT}`);
});

export default app;
