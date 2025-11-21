import { Router, Request, Response } from "express";
// import { Request, Response, NextFunction } from 'express';
import { LeadController } from "../controllers/lead.controller";
import {
  authMiddleware,
  requireRole,
  requireSameTenant,
} from "../middleware/auth";

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(authMiddleware);

// Basic CRUD routes
router.post("/create", leadController.createLead);

router.get("/", leadController.listLeads);

router.get("/:id", leadController.getLead);

router.put("/update/:id", leadController.updateLead);

router.delete("/delete/:id", leadController.deleteLead);

// Special operations
router.patch(
  "/:id/score",
  requireSameTenant,
  requireRole(["manager"]),
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.updateLeadScore(req, res)
);

router.patch(
  "/:id/status",
  requireSameTenant,
  LeadController.getLeadValidation,
  (req: Request, res: Response) => leadController.updateLeadStatus(req, res)
);

export default router;
