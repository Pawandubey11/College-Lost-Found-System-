import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { runMatchEngineForItem } from '../services/matchEngine.js';

const reportSchema = z.object({
  report_type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category_id: z.coerce.number().int().positive('Category is required'),
  location_id: z.coerce.number().int().positive('Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incident_date: z.string().min(1, 'Date is required'),
  incident_time: z.string().optional(),
  primary_color: z.string().min(1, 'Primary color is required'),
  brand: z.string().optional(),
  distinguishing_features: z.string().optional(),
  hidden_details: z.string().optional(),
});

export function getItems(req: Request, res: Response): void {
  try {
    const { report_type, category_id, location_id, search, status, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    let whereClauses: string[] = ["items.status NOT IN ('EXPIRED', 'REJECTED')"];
    let params: any[] = [];

    if (report_type && (report_type === 'LOST' || report_type === 'FOUND')) {
      whereClauses.push('items.report_type = ?');
      params.push(report_type);
    }

    if (category_id && !isNaN(Number(category_id))) {
      whereClauses.push('items.category_id = ?');
      params.push(Number(category_id));
    }

    if (location_id && !isNaN(Number(location_id))) {
      whereClauses.push('items.location_id = ?');
      params.push(Number(location_id));
    }

    if (status) {
      whereClauses.push('items.status = ?');
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const queryStr = `%${search.trim()}%`;
      whereClauses.push('(items.title LIKE ? OR items.description LIKE ? OR items.brand LIKE ? OR items.primary_color LIKE ?)');
      params.push(queryStr, queryStr, queryStr, queryStr);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = db.prepare(`
      SELECT COUNT(*) as total FROM items ${whereSql}
    `).get(...params) as { total: number };

    const items = db.prepare(`
      SELECT 
        items.id, items.report_type, items.title, items.category_id, items.location_id,
        items.description, items.incident_date, items.incident_time, items.primary_color,
        items.brand, items.distinguishing_features, items.status, items.reporter_id,
        items.image_url, items.created_at,
        c.name as category_name, c.icon_name as category_icon,
        l.campus_zone, l.building_name, l.floor_level,
        u.full_name as reporter_name, u.role as reporter_role
      FROM items
      JOIN categories c ON items.category_id = c.id
      JOIN locations l ON items.location_id = l.id
      JOIN users u ON items.reporter_id = u.id
      ${whereSql}
      ORDER BY items.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    res.json({
      items,
      pagination: {
        total: countRow.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRow.total / limitNum)
      }
    });
  } catch (error) {
    console.error('getItems error:', error);
    res.status(500).json({ error: 'Failed to fetch item reports.' });
  }
}

export function getItemById(req: AuthRequest, res: Response): void {
  try {
    const itemIdStr = req.params.id as string;
    const itemId = parseInt(itemIdStr, 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: 'Invalid item ID.' });
      return;
    }

    const item = db.prepare(`
      SELECT 
        items.*,
        c.name as category_name, c.icon_name as category_icon,
        l.campus_zone, l.building_name, l.floor_level, l.description as location_description,
        u.full_name as reporter_name, u.role as reporter_role, u.department as reporter_department
      FROM items
      JOIN categories c ON items.category_id = c.id
      JOIN locations l ON items.location_id = l.id
      JOIN users u ON items.reporter_id = u.id
      WHERE items.id = ?
    `).get(itemId) as any;

    if (!item) {
      res.status(404).json({ error: 'Item report not found.' });
      return;
    }

    // PRIVACY ENFORCEMENT:
    // Only the reporter or an admin can see the hidden_details field
    const isOwnerOrAdmin = req.user && (req.user.id === item.reporter_id || req.user.role === 'admin');
    if (!isOwnerOrAdmin) {
      delete item.hidden_details;
    }

    // Retrieve suggested matches if logged in as owner
    let suggestedMatches: any[] = [];
    if (isOwnerOrAdmin) {
      suggestedMatches = db.prepare(`
        SELECT 
          m.id as match_id, m.match_score, m.status as match_status,
          i.id as matched_item_id, i.title, i.report_type, i.incident_date, i.primary_color, i.image_url,
          c.name as category_name, l.building_name
        FROM matches m
        JOIN items i ON (m.lost_item_id = i.id OR m.found_item_id = i.id) AND i.id != ?
        JOIN categories c ON i.category_id = c.id
        JOIN locations l ON i.location_id = l.id
        WHERE m.lost_item_id = ? OR m.found_item_id = ?
        ORDER BY m.match_score DESC
      `).all(item.id, item.id, item.id);
    }

    res.json({ item, matches: suggestedMatches });
  } catch (error) {
    console.error('getItemById error:', error);
    res.status(500).json({ error: 'Failed to fetch item details.' });
  }
}

export function createItemReport(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const validatedData = reportSchema.parse(req.body);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO items (
        report_type, title, category_id, location_id, description,
        incident_date, incident_time, primary_color, brand,
        distinguishing_features, hidden_details, status, reporter_id, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `).run(
      validatedData.report_type,
      validatedData.title,
      validatedData.category_id,
      validatedData.location_id,
      validatedData.description,
      validatedData.incident_date,
      validatedData.incident_time || null,
      validatedData.primary_color,
      validatedData.brand || null,
      validatedData.distinguishing_features || null,
      validatedData.hidden_details || null,
      req.user.id,
      imageUrl
    );

    const newItemId = Number(result.lastInsertRowid);

    // Trigger Rule-Based Match Engine asynchronously
    const matchesFound = runMatchEngineForItem(newItemId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES (?, ?, 'ITEM', ?, ?)
    `).run(req.user.id, `CREATE_${validatedData.report_type}_REPORT`, newItemId, `Item "${validatedData.title}" reported.`);

    res.status(201).json({
      message: `${validatedData.report_type === 'LOST' ? 'Lost' : 'Found'} item reported successfully.`,
      itemId: newItemId,
      matchesDetected: matchesFound
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('createItemReport error:', error);
    res.status(500).json({ error: 'Failed to create item report.' });
  }
}

export function getMyReports(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const reports = db.prepare(`
      SELECT 
        items.*,
        c.name as category_name,
        l.building_name, l.campus_zone
      FROM items
      JOIN categories c ON items.category_id = c.id
      JOIN locations l ON items.location_id = l.id
      WHERE items.reporter_id = ?
      ORDER BY items.created_at DESC
    `).all(req.user.id);

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user reports.' });
  }
}

export function updateItemStatus(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const itemIdStr = req.params.id as string;
  const itemId = parseInt(itemIdStr, 10);
  const { status } = req.body;

  const validStatuses = ['ACTIVE', 'POSSIBLE_MATCH', 'CLAIM_PENDING', 'RETURNED', 'CLOSED', 'EXPIRED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value.' });
    return;
  }

  try {
    const item = db.prepare('SELECT id, reporter_id FROM items WHERE id = ?').get(itemId) as { id: number; reporter_id: number } | undefined;

    if (!item) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (item.reporter_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to update this report.' });
      return;
    }

    db.prepare('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, itemId);

    res.json({ message: `Item status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item status.' });
  }
}
