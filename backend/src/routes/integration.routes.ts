import { Router } from 'express';
import { Request, Response } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/require-tenant';

const router = Router();
const controller = new IntegrationController();

// Integration routes
router.post('/', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.createIntegration(req, res));
router.put('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.updateIntegration(req, res));
router.get('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.getIntegration(req, res));
router.delete('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.deleteIntegration(req, res));

export default router;