import { Router } from 'express';
import integrationRoutes from './integration.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/integrations', integrationRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboards', dashboardRoutes);

export default router;