import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}

// Middleware to authenticate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  // Add user info to request object
  req.user = { userId: decoded.userId };
  next();
};