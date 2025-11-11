import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.tenant_id) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Tenant information is required'
    });
  }
  next();
};