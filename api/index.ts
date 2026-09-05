import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db, { initDatabase } from '../server/src/db/index.js';

import authRoutes from '../server/src/routes/authRoutes.js';
import masterRoutes from '../server/src/routes/masterRoutes.js';
import itemRoutes from '../server/src/routes/itemRoutes.js';
import claimRoutes from '../server/src/routes/claimRoutes.js';
import notificationRoutes from '../server/src/routes/notificationRoutes.js';
import adminRoutes from '../server/src/routes/adminRoutes.js';

const app = express();

// Initialize Database Schema
try {
  initDatabase();
} catch (err) {
  console.error('⚠️ Database initialization warning:', err);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
      service: 'Smart College Lost & Found API (Vercel Serverless)',
      timestamp: new Date().toISOString(),
      stats: { users: userCount, items: itemCount }
    });
  } catch (error) {
    res.status(500).json({ status: 'UNHEALTHY', error: (error as Error).message });
  }
});

export default app;
