import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const requireRole = (...allowedRoles: Array<'admin' | 'user'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
