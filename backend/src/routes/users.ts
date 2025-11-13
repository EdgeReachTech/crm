import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireRole, requireSameTenant } from '../middleware/auth';

const router = Router();
const userController = new UserController();
 
// All routes require authentication
router.use(authMiddleware);

// Routes restricted to admin and manager roles
router.get('/', 
  requireSameTenant,
  requireRole(['manager']),
  UserController.listUsersValidation,
  (req: Request, res: Response) => userController.listUsers(req, res)
);

router.get('/search', 
  requireSameTenant,
  requireRole(['manager']),
  UserController.searchUsersValidation,
  (req: Request, res: Response) => userController.searchUsers(req, res)
);

// Individual user routes
router.get('/:id', 
  requireSameTenant,
  UserController.getUserValidation,
  (req: Request, res: Response) => userController.getUser(req, res)
);

router.put('/:id', 
  requireSameTenant,
  requireRole(['manager']),
  (req: Request, res: Response) => userController.updateUser(req, res)
);

router.delete('/:id', 
  requireSameTenant,
  requireRole(['manager']),
  UserController.getUserValidation,
  (req: Request, res: Response) => userController.deleteUser(req, res)
);

export default router;