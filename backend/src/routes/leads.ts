import { Router, Request, Response } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { authMiddleware, requireRole, requireSameTenant } from '../middleware/auth';

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(authMiddleware);

// Basic CRUD routes
router.post('/', 
  requireSameTenant,
  LeadController.createLeadValidation,
  (req: Request, res: Response) => leadController.createLead(req, res)
);

router.get('/', 
  requireSameTenant,
  LeadController.listLeadsValidation,
  (req: Request, res: Response) => leadController.listLeads(req, res)
);

router.get('/:id', 
  requireSameTenant,
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.getLead(req, res)
);

router.put('/:id', 
  requireSameTenant,
  LeadController.updateLeadValidation,
  (req: Request, res: Response) => leadController.updateLead(req, res)
);

router.delete('/:id', 
  requireSameTenant,
  requireRole(['manager']),
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.deleteLead(req, res)
);

// Special operations
router.patch('/:id/score', 
  requireSameTenant,
  requireRole(['manager']),
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.updateLeadScore(req, res)
);

router.patch('/:id/status', 
  requireSameTenant,
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.updateLeadStatus(req, res)
);

export default router;