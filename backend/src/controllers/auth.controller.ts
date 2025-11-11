import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/errors';
import { registerSchema, loginSchema, updateProfileSchema, User } from '../models/schemas';
import { z } from 'zod';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Additional validation schema
  private static resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8)
  });

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if this is Firebase-based registration (has idToken)
      const { email, password, first_name, last_name, role, tenant_id, idToken } = req.body;
      
      if (idToken) {
        // New Firebase-based registration flow
        try {
          // Verify the Firebase ID token (reuse existing method)
          const decodedToken = await this.authService.verifyFirebaseTokenOnly(idToken);
          
          // Ensure the email matches
          if (decodedToken.email !== email) {
            res.status(400).json({
              status: 'error',
              code: 'EMAIL_MISMATCH',
              message: 'Email in token does not match provided email'
            });
            return;
          }
          
          // Create user profile in Supabase
          const user = await this.authService.createUserProfile(decodedToken.uid, {
            email,
            first_name,
            last_name,
            role,
            tenant_id
          });
          
          res.status(201).json({ 
            status: 'success',
            data: user 
          });
          return;
        } catch (tokenError) {
          res.status(400).json({
            status: 'error',
            code: 'INVALID_TOKEN',
            message: 'Invalid Firebase token'
          });
          return;
        }
      }
      
      // Legacy registration flow (for backward compatibility)
      const user = await this.authService.registerUser(email, password, {
        first_name,
        last_name,
        role,
        tenant_id
      });
      
      res.status(201).json({ 
        status: 'success',
        data: user 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else if (error instanceof ApiError) {
        res.status(400).json({
          status: 'error',
          code: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  };

  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        res.status(400).json({
          status: 'error',
          code: 'MISSING_TOKEN',
          message: 'Firebase ID token is required'
        });
        return;
      }

      const result = await this.authService.verifyFirebaseToken(idToken);
      
      res.status(200).json({ 
        status: 'success',
        data: result 
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(401).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(401).json({
          status: 'error',
          code: 'TOKEN_VERIFICATION_FAILED',
          message: 'Failed to verify authentication token'
        });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Data is already validated by middleware, so we can use it directly
      const { email, password } = req.body;
      const result = await this.authService.loginUser(email, password);
      
      res.status(200).json({ 
        status: 'success',
        data: result 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else if (error instanceof ApiError) {
        res.status(401).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // req.user is set by the auth middleware
      const userId = req.user?.uid;
      if (!userId) {
        throw new ApiError('AuthenticationError', 'User not authenticated');
      }

      const profile = await this.authService.getUserProfile(userId);
      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.code === 'USER_NOT_FOUND' ? 404 : 400).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        console.error('Profile error:', error);
        res.status(500).json({
          status: 'error',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        throw new ApiError('AuthenticationError', 'User not authenticated');
      }

      // Data is already validated by middleware, so we can use it directly
      const body = req.body;
      
      // Extract only the allowed fields for update
      const updates: Partial<User> = {};
      if (body.first_name) updates.first_name = body.first_name;
      if (body.last_name) updates.last_name = body.last_name;
      if (body.avatar_url) updates.profile_image = body.avatar_url;
      if (body.role) updates.role = body.role; // Add role update support
      if (body.preferences) {
        updates.preferences = {
          theme: body.preferences.theme ?? 'system',
          notification_settings: body.preferences.notification_settings && {
            email: body.preferences.notification_settings.email ?? true,
            push: body.preferences.notification_settings.push ?? true,
            digest_frequency: body.preferences.notification_settings.digest_frequency ?? 'daily'
          },
          default_dashboard: body.preferences.default_dashboard
        };
      }
      
      const updatedProfile = await this.authService.updateUserProfile(userId, updates);

      res.status(200).json({
        status: 'success',
        data: updatedProfile
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          error: 'ValidationError',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else if (error instanceof ApiError) {
        res.status(400).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          error: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  };

  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      // Data is already validated by middleware, so we can use it directly
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          error: 'ValidationError',
          message: 'Invalid email address',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else if (error instanceof ApiError && error.code === 'USER_NOT_FOUND') {
        res.status(404).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          error: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        throw new ApiError('AuthenticationError', 'User not authenticated');
      }

      await this.authService.deleteUser(userId);
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Data is already validated by middleware, so we can use it directly
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          error: 'ValidationError',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else if (error instanceof ApiError) {
        res.status(400).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(400).json({
          status: 'error',
          code: 'TOKEN_INVALID',
          message: 'Invalid or expired reset token'
        });
      }
    }
  };

  // Admin-only methods for user management
  approveUser = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const { userId } = req.params;
      const { role } = req.body;

      const user = await this.authService.approveUser(adminUid, userId, role);
      
      res.status(200).json({ 
        status: 'success',
        data: user,
        message: 'User approved successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'APPROVAL_ERROR',
          message: 'Failed to approve user'
        });
      }
    }
  };

  getPendingUsers = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const pendingUsers = await this.authService.getPendingUsers(adminUid);
      
      res.status(200).json({ 
        status: 'success',
        data: pendingUsers
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'PENDING_USERS_ERROR',
          message: 'Failed to fetch pending users'
        });
      }
    }
  };

  rejectUser = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const { userId } = req.params;
      const { reason } = req.body;

      const result = await this.authService.rejectUser(adminUid, userId, reason);
      
      res.status(200).json({ 
        status: 'success',
        data: result,
        message: 'User registration rejected successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'REJECTION_ERROR',
          message: 'Failed to reject user'
        });
      }
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const allUsers = await this.authService.getAllUsers(adminUid);
      
      res.status(200).json({
        status: 'success',
        data: allUsers
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'ALL_USERS_ERROR',
          message: 'Failed to fetch all users'
        });
      }
    }
  };

  getUsersByStatus = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const { status } = req.query;
      
      if (!status || !['active', 'inactive', 'pending'].includes(status as string)) {
        res.status(400).json({
          status: 'error',
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be one of: active, inactive, pending'
        });
        return;
      }
      
      const users = await this.authService.getUsersByStatus(adminUid, status as string);
      
      res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'USERS_BY_STATUS_ERROR',
          message: 'Failed to fetch users by status'
        });
      }
    }
  };

  updateUserStatus = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const { userId } = req.params;
      const { status } = req.body;
      
      if (!status || !['active', 'inactive'].includes(status)) {
        res.status(400).json({
          status: 'error',
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be either active or inactive'
        });
        return;
      }
      
      const user = await this.authService.updateUserStatus(adminUid, userId, status);
      
      res.status(200).json({
        status: 'success',
        data: user,
        message: `User status updated to ${status} successfully`
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'UPDATE_STATUS_ERROR',
          message: 'Failed to update user status'
        });
      }
    }
  };

  updateUserRole = async (req: Request, res: Response) => {
    try {
      const adminUid = (req as any).user?.uid;
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!role || !['admin', 'manager', 'sales_rep', 'marketer'].includes(role)) {
        res.status(400).json({
          status: 'error',
          code: 'INVALID_ROLE',
          message: 'Invalid role. Must be one of: admin, manager, sales_rep, marketer'
        });
        return;
      }
      
      const user = await this.authService.updateUserRole(adminUid, userId, role);
      
      res.status(200).json({
        status: 'success',
        data: user,
        message: `User role updated to ${role} successfully`
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        const statusCode = error.code === 'UNAUTHORIZED' ? 403 : 400;
        res.status(statusCode).json({
          status: 'error',
          code: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          code: 'UPDATE_ROLE_ERROR',
          message: 'Failed to update user role'
        });
      }
    }
  };
}