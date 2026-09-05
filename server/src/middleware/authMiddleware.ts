import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

export interface AuthenticatedUser {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  department: string | null;
  phone_number: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_college_lost_found_jwt_key_2026';
    const decoded = jwt.verify(token, secret) as { id: number; email: string; role: 'student' | 'staff' | 'admin' };

    const user = db.prepare('SELECT id, full_name, email, role, department, phone_number FROM users WHERE id = ?').get(decoded.id) as AuthenticatedUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'User account not found or has been disabled.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(allowedRoles: ('student' | 'staff' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.` });
      return;
    }

    next();
  };
}
