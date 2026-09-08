import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User } from '../src/types';

export const JWT_SECRET = process.env.JWT_SECRET || 'ashish_wedding_studio_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUserById(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid or user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = db.getUserById(payload.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
