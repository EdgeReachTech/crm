import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '../models/schemas';
import { z } from 'zod';

const router = Router();
const authController = new AuthController();

// Request validation schemas
const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(8)
  })
});

/**
 * Authentication Routes
 */
// Registration and login
router.post('/register', 
  validateRequest(registerSchema), 
  authController.register
);

router.post('/login', 
  validateRequest(loginSchema), 
  authController.login
);

// Firebase token verification
router.post('/verify-token', 
  authController.verifyToken
);

// Password reset
router.post('/reset-password-request', 
  validateRequest(requestPasswordResetSchema), 
  authController.requestPasswordReset
);

router.post('/reset-password', 
  validateRequest(resetPasswordSchema), 
  authController.resetPassword
);

/**
 * Profile Management Routes (Protected)
 */
// Get current user profile
router.get('/profile', 
  authMiddleware, 
  authController.getProfile
);

// Update user profile
router.patch('/profile', 
  authMiddleware, 
  validateRequest(updateProfileSchema), 
  authController.updateProfile
);

// Delete account
router.delete('/account', 
  authMiddleware, 
  authController.deleteAccount
);

// Admin-only routes for user management
router.get('/admin/pending-users',
  authMiddleware,
  authController.getPendingUsers
);

router.get('/admin/all-users',
  authMiddleware,
  authController.getAllUsers
);

router.get('/admin/users',
  authMiddleware,
  authController.getUsersByStatus
);

router.patch('/admin/approve-user/:userId',
  authMiddleware,
  authController.approveUser
);

router.delete('/admin/reject-user/:userId',
  authMiddleware,
  authController.rejectUser
);

router.patch('/admin/user-status/:userId',
  authMiddleware,
  authController.updateUserStatus
);

router.patch('/admin/user-role/:userId',
  authMiddleware,
  authController.updateUserRole
);

export default router;