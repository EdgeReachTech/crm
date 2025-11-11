import { Router, Request, Response } from 'express';
import { OpportunityController } from '../controllers/opportunity.controller';
import { authMiddleware, requireRole, requireSameTenant } from '../middleware/auth';

const router = Router();
const opportunityController = new OpportunityController();

// All routes require authentication
router.use(authMiddleware);

// Basic CRUD routes
router.post('/', 
  requireSameTenant,
  OpportunityController.createOpportunityValidation,
  (req: Request, res: Response) => opportunityController.createOpportunity(req, res)
);

router.get('/', 
  requireSameTenant,
  OpportunityController.listOpportunitiesValidation,
  (req: Request, res: Response) => opportunityController.listOpportunities(req, res)
);

router.get('/:id', 
  requireSameTenant,
  OpportunityController.getOpportunityValidation,
  (req: Request, res: Response) => opportunityController.getOpportunity(req, res)
);

router.put('/:id', 
  requireSameTenant,
  OpportunityController.updateOpportunityValidation,
  (req: Request, res: Response) => opportunityController.updateOpportunity(req, res)
);

router.delete('/:id', 
  requireSameTenant,
  requireRole(['admin', 'manager']),
  OpportunityController.getOpportunityValidation,
  (req: Request, res: Response) => opportunityController.deleteOpportunity(req, res)
);

// Special operations
router.patch('/:id/stage', 
  requireSameTenant,
  OpportunityController.updateStageValidation,
  (req: Request, res: Response) => opportunityController.updateStage(req, res)
);

router.get('/forecast',
  requireSameTenant,
  requireRole(['admin', 'manager']),
  (req: Request, res: Response) => opportunityController.getForecast(req, res)
);

export default router;