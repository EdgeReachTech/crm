import { Router } from 'express';
import { Request, Response } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/require-tenant';

const router = Router();
const controller = new ReportController();

// Report routes
router.post('/', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.createReport(req, res));
router.put('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.updateReport(req, res));
router.get('/', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.listReports(req, res));
router.get('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.getReport(req, res));
router.delete('/:id', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.deleteReport(req, res));
router.post('/:id/generate', [authMiddleware, requireTenant], (req: Request, res: Response) => controller.generateReport(req, res));

export default router;