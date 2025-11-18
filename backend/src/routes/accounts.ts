import express, { Request, Response } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware, requireRole } from '../middleware/auth';
import { requireTenant } from '../middleware/require-tenant';
import { validateRequest } from '../middleware/validation';

const router = express.Router();
const accountController = new AccountController();

// Get account list with optional filtering and pagination
router.get(
  '/',
  [authMiddleware, requireTenant],
  accountController.listValidation,
  validateRequest,
  (req: Request, res: Response) => accountController.list(req, res)
);

// Create new account
router.post(
  '/',
  [authMiddleware, requireTenant, requireRole(['manager', 'sales_rep'])],
  accountController.createValidation,
  validateRequest,
  (req: Request, res: Response) => accountController.create(req, res)
);

// Get single account with optional related data
router.get(
  '/:id',
  [authMiddleware, requireTenant],
  (req: Request, res: Response) => accountController.get(req, res)
);

// Get account hierarchy (parent/child relationships)
router.get(
  '/:id/hierarchy',
  [authMiddleware, requireTenant],
  (req: Request, res: Response) => accountController.getHierarchy(req, res)
);

// Update account
router.patch(
  '/:id',
  [authMiddleware, requireTenant, requireRole(['manager', 'sales_rep'])],
  accountController.updateValidation,
  validateRequest,
  (req: Request, res: Response) => accountController.update(req, res)
);

// Delete account
router.delete(
  '/:id',
  [authMiddleware, requireTenant, requireRole(['manager'])],
  (req: Request, res: Response) => accountController.delete(req, res)
);

export default router;