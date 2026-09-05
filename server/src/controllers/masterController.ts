import { Request, Response } from 'express';
import db from '../db/index.js';

export function getCategories(req: Request, res: Response): void {
  try {
    const categories = db.prepare('SELECT id, name, slug, description, icon_name FROM categories ORDER BY name ASC').all();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

export function getLocations(req: Request, res: Response): void {
  try {
    const locations = db.prepare('SELECT id, campus_zone, building_name, floor_level, description FROM locations ORDER BY campus_zone, building_name ASC').all();
    res.json({ locations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
}
