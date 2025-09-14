import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authorization header required' 
        } 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Bearer token required' 
        } 
      });
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    // Support tokens that use either { userId } or { sub } properties
    const userId = payload.userId || payload.sub;
    if (!userId) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Invalid token payload' 
        } 
      });
    }

    req.userId = Number(userId);
    req.user = {
      id: Number(userId),
      email: payload.email || '',
      name: payload.name || '',
      isAdmin: payload.isAdmin || false
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'Invalid or expired token' 
      } 
    });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Admin access required' 
      } 
    });
  }
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId || payload.sub;
      if (userId) {
        req.userId = Number(userId);
        req.user = {
          id: Number(userId),
          email: payload.email || '',
          name: payload.name || '',
          isAdmin: payload.isAdmin || false
        };
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
    logger.debug('Optional auth failed:', error);
  }

  next();
}