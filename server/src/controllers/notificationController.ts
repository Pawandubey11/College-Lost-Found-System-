import { Response } from 'express';
import db from '../db/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export function getNotifications(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const notifications = db.prepare(`
      SELECT id, title, message, type, reference_id, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(req.user.id);

    const unreadCount = (db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user.id) as { count: number }).count;

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
}

export function markAsRead(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const notificationIdStr = req.params.id as string;
  const notificationId = parseInt(notificationIdStr, 10);
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(notificationId, req.user.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
}

export function markAllAsRead(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
}
