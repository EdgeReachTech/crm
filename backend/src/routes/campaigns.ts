import { Router, Request, Response } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authMiddleware, requireRole, requireSameTenant } from '../middleware/auth';
import { requireTenant } from '../middleware/require-tenant';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();
const campaignController = new CampaignController();

// Get campaign list with optional filtering and pagination
router.get(
  '/',
  [authMiddleware, requireTenant],
  campaignController.listValidation,
  validateRequest,
  campaignController.list
);

// Create new campaign
router.post(
  '/',
  [authMiddleware, requireTenant, requireRole(['admin', 'manager', 'sales_rep'])],
  campaignController.createValidation,
  validateRequest,
  campaignController.create
);

// Get single campaign
router.get(
  '/:id',
  [authMiddleware, requireTenant],
  campaignController.get
);

// Update campaign
router.patch(
  '/:id',
  [authMiddleware, requireTenant, requireRole(['admin', 'manager', 'sales_rep'])],
  campaignController.updateValidation,
  validateRequest,
  campaignController.update
);

// Delete campaign
router.delete(
  '/:id',
  [authMiddleware, requireTenant, requireRole(['admin', 'manager'])],
  campaignController.delete
);

// Send test email
router.post(
  '/:campaignId/test',
  authMiddleware,
  requireRole(['admin', 'manager', 'sales_rep']),
  [
    validateRequest,
    body('email').isEmail(),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
  ],
  campaignController.sendTest
);

// Track email open
router.get(
  '/:campaignId/track/open',
  campaignController.trackOpen
);

// Track link click
router.get(
  '/:campaignId/track/click',
  campaignController.trackClick
);

// Track conversion
router.post(
  '/:campaignId/track/conversion',
  authMiddleware,
  [
    validateRequest,
    body('revenue').optional().isNumeric(),
  ],
  campaignController.trackConversion
);

export default router;