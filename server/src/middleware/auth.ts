import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Payload encoded inside every JWT.
 */
export interface JwtPayload {
  userId: string;
  role: 'student' | 'mentor' | 'admin';
}

/**
 * Augment the Express Request type so `req.user` is available after
 * the auth middleware runs.
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware that verifies the JWT token from the Authorization header.
 * Adds `req.user` with { userId, role }.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided, authorization denied' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

/**
 * Middleware that restricts access to specific roles.
 * Must be used AFTER authMiddleware.
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
};
