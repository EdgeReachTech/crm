import { Router, Request, Response } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authMiddleware, requireRole, requireSameTenant } from '../middleware/auth';

const router = Router();
const contactController = new ContactController();

// All routes require authentication
router.use(authMiddleware);

// Basic CRUD routes
router.post('/', 
  requireSameTenant,
  ContactController.createContactValidation,
  (req: Request, res: Response) => contactController.createContact(req, res)
);

router.get('/', 
  requireSameTenant,
  ContactController.listContactsValidation,
  (req: Request, res: Response) => contactController.listContacts(req, res)
);

router.get('/:id', 
  requireSameTenant,
  ContactController.getContactValidation,
  (req: Request, res: Response) => contactController.getContact(req, res)
);

router.put('/:id', 
  requireSameTenant,
  ContactController.updateContactValidation,
  (req: Request, res: Response) => contactController.updateContact(req, res)
);

router.delete('/:id', 
  requireSameTenant,
  requireRole(['admin', 'manager']),
  ContactController.getContactValidation,
  (req: Request, res: Response) => contactController.deleteContact(req, res)
);

// Special operations
router.patch('/:id/preferences', 
  requireSameTenant,
  ContactController.getContactValidation,
  (req: Request, res: Response) => contactController.updateContactPreferences(req, res)
);

router.patch('/:id/opt-out', 
  requireSameTenant,
  ContactController.getContactValidation,
  (req: Request, res: Response) => contactController.updateOptOutStatus(req, res)
);

export default router;