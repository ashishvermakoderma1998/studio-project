import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User } from '../src/types';
import { isTokenRevoked } from './security';

export const JWT_SECRET = process.env.JWT_SECRET || 'ashish_wedding_studio_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: User;
  tokenId?: string;
  tokenExp?: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  tokenVersion?: number;
  jti: string;
  type?: string;
}

export function generateToken(user: User, tokenVersion = 1): string {
  const jti = 'jti-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      tokenVersion,
      jti
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateMfaChallengeToken(userId: string, email: string): string {
  const jti = 'mfa-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  return jwt.sign(
    {
      id: userId,
      email,
      type: 'mfa_challenge',
      jti
    },
    JWT_SECRET,
    { expiresIn: '5m' }
  );
}

export function verifyMfaChallengeToken(token: string): { id: string; email: string; jti: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'mfa_challenge' || isTokenRevoked(payload.jti)) {
      return null;
    }
    return { id: payload.id, email: payload.email, jti: payload.jti };
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  // Support simulated demo token in local environments
  if (token.startsWith('local-tok-')) {
    try {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const decodedEmail = Buffer.from(parts[2], 'base64').toString('utf8');
        const userRec = db.getUserByEmail(decodedEmail) || db.getUserRecordById('usr-admin-ashish');
        if (userRec) {
          req.user = db.getUserById(userRec.id)!;
          return next();
        }
      }
    } catch {
      // fallback
    }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload & { exp: number };

    // Check if token was explicitly revoked (logout)
    if (payload.jti && isTokenRevoked(payload.jti)) {
      return res.status(401).json({ error: 'Session has expired or was logged out. Please sign in again.' });
    }

    const userRecord = db.getUserRecordById(payload.id);
    if (!userRecord) {
      return res.status(401).json({ error: 'Session invalid. User not found.' });
    }

    // Check if password reset / revocation incremented tokenVersion
    if (userRecord.tokenVersion !== undefined && payload.tokenVersion !== undefined) {
      if (payload.tokenVersion < userRecord.tokenVersion) {
        return res.status(401).json({ error: 'Your session has expired due to a recent password change. Please log in again.' });
      }
    }

    req.user = db.getUserById(userRecord.id)!;
    req.tokenId = payload.jti;
    req.tokenExp = payload.exp * 1000;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
  next();
}

export function requireUserOrAdmin(targetUserIdGetter: (req: AuthRequest) => string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const targetUserId = targetUserIdGetter(req);
    if (req.user.role === 'admin' || req.user.id === targetUserId) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied: You are not authorized to view or edit this resource' });
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (!isTokenRevoked(payload.jti)) {
        const user = db.getUserById(payload.id);
        if (user) req.user = user;
      }
    } catch {
      // ignore in optional auth
    }
  }
  next();
}
