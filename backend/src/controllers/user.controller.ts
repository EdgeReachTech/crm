import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { UserService } from '../services/user.service';
import { validateRequest } from '../middleware/validation';
import { ApiError } from '../utils/errors';
import { userSchema } from '../models/schemas';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Validation chains
  static getUserValidation = [
    param('id').isUUID().withMessage('Invalid user ID'),
    validateRequest
  ];

  static listUsersValidation = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest
  ];

  static searchUsersValidation = [
    query('q').isString().trim().notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest
  ];

  // Controller methods
  getUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const user = await this.userService.getUser(req.params.id, req.user.tenant_id);
      res.json({ success: true, data: user });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'UserNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  listUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const results = await this.userService.listUsers(req.user.tenant_id, page, limit);
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const updates = userSchema.partial().parse(req.body);
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.user.tenant_id,
        updates
      );

      res.json({ success: true, data: updatedUser });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'UserNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      await this.userService.deleteUser(req.params.id, req.user.tenant_id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'UserNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  searchUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await this.userService.searchUsers(req.user.tenant_id, query, limit);
      res.json({ success: true, data: users });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };
}