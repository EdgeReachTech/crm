import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/errors';
import { DecodedIdToken } from 'firebase-admin/auth';
import { JwtPayload } from 'jsonwebtoken';

// Extend the Express Request type to include auth properties
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;
      email: string;
      role: 'manager' | 'sales_rep';
      tenant_id: string;
    };
  }
}

const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError('AUTH_HEADER_INVALID', 'Authorization header must start with "Bearer"');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new ApiError('TOKEN_MISSING', 'Token not provided in authorization header');
    }
    
    try {
      // Verify token using AuthService (handles both Firebase and JWT tokens)
      const decodedToken = await authService.verifyToken(token) as (DecodedIdToken | JwtPayload);
      
      // Get user profile from Supabase using the uid from token
      const uid = 'uid' in decodedToken ? decodedToken.uid : decodedToken.sub;
      if (!uid) {
        throw new ApiError('TOKEN_INVALID', 'Invalid token: missing user ID');
      }

      const user = await authService.getUserProfile(uid);
      if (!user) {
        throw new ApiError('USER_NOT_FOUND', 'User profile not found');
      }
      
      // Add user to request object
      req.user = {
        uid: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      };

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(401).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        // Log unexpected errors
        console.error('Auth middleware error:', error);
        res.status(401).json({
          status: 'error',
          code: 'AUTH_FAILED',
          message: 'Authentication failed'
        });
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(401).json({
        status: 'error',
        code: error.code,
        message: error.message
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        status: 'error',
        code: 'AUTH_ERROR',
        message: 'Internal authentication error'
      });
    }
  }
};

export const requireRole = (allowedRoles: Array<'manager' | 'sales_rep'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireSameTenant = (paramName = 'tenant_id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.tenant_id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated or missing tenant'
      });
    }

    const resourceTenantId = req.params[paramName] || req.body[paramName];
    if (!resourceTenantId) {
      return res.status(400).json({
        success: false,
        error: 'BadRequest',
        message: 'Missing tenant ID in request'
      });
    }

    if (resourceTenantId !== req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access to different tenant resources is forbidden'
      });
    }

    next();
  };
};