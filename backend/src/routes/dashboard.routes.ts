import { Router } from 'express';
import { Request, Response } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/require-tenant';

const router = Router();
const controller = new DashboardController();

// Dashboard routes
router.post('/', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.createDashboard(req, res));
router.put('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.updateDashboard(req, res));
router.get('/', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.listDashboards(req, res));
router.get('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.getDashboard(req, res));
router.delete('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.deleteDashboard(req, res));
router.post('/:id/refresh', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.refreshDashboard(req, res));

export default router;