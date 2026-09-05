import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'staff', 'admin']).default('student'),
  department: z.string().optional(),
  phone_number: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const secret = process.env.JWT_SECRET || 'super_secret_college_lost_found_jwt_key_2026';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check existing user
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(validatedData.email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(validatedData.password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, department, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      validatedData.full_name,
      validatedData.email.toLowerCase(),
      password_hash,
      validatedData.role,
      validatedData.department || null,
      validatedData.phone_number || null
    );

    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ id: userId, email: validatedData.email.toLowerCase(), role: validatedData.role }, secret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        full_name: validatedData.full_name,
        email: validatedData.email.toLowerCase(),
        role: validatedData.role,
        department: validatedData.department || null,
        phone_number: validatedData.phone_number || null
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register account.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = db.prepare(`
      SELECT id, full_name, email, password_hash, role, department, phone_number
      FROM users WHERE email = ?
    `).get(validatedData.email.toLowerCase()) as {
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: 'student' | 'staff' | 'admin';
      department: string | null;
      phone_number: string | null;
    } | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in.' });
  }
}

export function logout(req: Request, res: Response): void {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
}

export function getMe(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({ user: req.user });
}

export function updateProfile(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const { full_name, department, phone_number } = req.body;

  try {
    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          department = COALESCE(?, department),
          phone_number = COALESCE(?, phone_number)
      WHERE id = ?
    `).run(full_name || null, department || null, phone_number || null, req.user.id);

    const updatedUser = db.prepare('SELECT id, full_name, email, role, department, phone_number FROM users WHERE id = ?').get(req.user.id);

    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}
