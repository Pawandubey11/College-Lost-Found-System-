import { Response } from 'express';
import db from '../db/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export function getAdminStats(req: AuthRequest, res: Response): void {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    const activeLost = (db.prepare("SELECT COUNT(*) as c FROM items WHERE report_type = 'LOST' AND status IN ('ACTIVE', 'POSSIBLE_MATCH')").get() as { c: number }).c;
    const activeFound = (db.prepare("SELECT COUNT(*) as c FROM items WHERE report_type = 'FOUND' AND status IN ('ACTIVE', 'POSSIBLE_MATCH')").get() as { c: number }).c;
    const returnedCount = (db.prepare("SELECT COUNT(*) as c FROM items WHERE status = 'RETURNED'").get() as { c: number }).c;
    const pendingClaims = (db.prepare("SELECT COUNT(*) as c FROM claims WHERE status = 'PENDING'").get() as { c: number }).c;
    const matchesCount = (db.prepare('SELECT COUNT(*) as c FROM matches').get() as { c: number }).c;

    // Loss hotspots by building location
    const hotspots = db.prepare(`
      SELECT l.building_name, COUNT(i.id) as item_count
      FROM items i
      JOIN locations l ON i.location_id = l.id
      GROUP BY l.building_name
      ORDER BY item_count DESC
      LIMIT 5
    `).all();

    res.json({
      stats: {
        totalUsers,
        activeLost,
        activeFound,
        returnedCount,
        pendingClaims,
        matchesCount,
        recoveryRate: totalUsers > 0 && (activeLost + activeFound + returnedCount) > 0 ? Math.round((returnedCount / (activeLost + activeFound + returnedCount)) * 100) : 0
      },
      hotspots
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ error: 'Failed to fetch administrative metrics.' });
  }
}

export function getAdminUsers(req: AuthRequest, res: Response): void {
  try {
    const users = db.prepare(`
      SELECT id, full_name, email, role, department, phone_number, is_verified, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user list.' });
  }
}

export function updateUserRole(req: AuthRequest, res: Response): void {
  const userIdStr = req.params.id as string;
  const userId = parseInt(userIdStr, 10);
  const { role } = req.body;

  if (!['student', 'staff', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }

  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES (?, 'UPDATE_USER_ROLE', 'USER', ?, ?)
    `).run(req.user?.id, userId, `User role changed to ${role}`);

    res.json({ message: `User role updated to ${role}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
}

export function getAdminReports(req: AuthRequest, res: Response): void {
  try {
    const reports = db.prepare(`
      SELECT 
        items.*,
        c.name as category_name,
        l.building_name, l.campus_zone,
        u.full_name as reporter_name, u.email as reporter_email
      FROM items
      JOIN categories c ON items.category_id = c.id
      JOIN locations l ON items.location_id = l.id
      JOIN users u ON items.reporter_id = u.id
      ORDER BY items.created_at DESC
    `).all();

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin reports.' });
  }
}

export function getAdminClaims(req: AuthRequest, res: Response): void {
  try {
    const claims = db.prepare(`
      SELECT 
        claims.*,
        items.title as item_title, items.report_type, items.primary_color,
        claimant.full_name as claimant_name, claimant.email as claimant_email,
        reporter.full_name as reporter_name
      FROM claims
      JOIN items ON claims.item_id = items.id
      JOIN users claimant ON claims.claimant_id = claimant.id
      JOIN users reporter ON items.reporter_id = reporter.id
      ORDER BY claims.created_at DESC
    `).all();

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin claims.' });
  }
}

export function getAdminAuditLogs(req: AuthRequest, res: Response): void {
  try {
    const logs = db.prepare(`
      SELECT 
        audit_logs.*,
        users.full_name as user_name, users.email as user_email
      FROM audit_logs
      LEFT JOIN users ON audit_logs.user_id = users.id
      ORDER BY audit_logs.created_at DESC
      LIMIT 100
    `).all();

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}
