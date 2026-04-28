import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key_123!', (err, user) => {
      if (err) {
        return sendError(res, 403, 'Forbidden: Invalid token');
      }

      req.user = user as { id: number; role: string };
      next();
    });
  } else {
    // Need to explicitly return to satisfy the type/compiler
    sendError(res, 401, 'Unauthorized: Token missing');
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    sendError(res, 403, 'Forbidden: Admin access required');
  }
};
