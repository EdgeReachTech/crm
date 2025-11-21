import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import { LeadService } from "../services/lead.service";
import { validateRequest } from "../middleware/validation";
import { ApiError } from "../utils/errors";
import { leadSchema, updateLeadSchema } from "../models/schemas";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

function normalizeEmptyStrings(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])
  );
}

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  // Validation chains
  static createLeadValidation = [
    body("firstName").notEmpty().trim(),
    body("lastName").notEmpty().trim(),
    body("email").isEmail().normalizeEmail(),
    body("company").notEmpty().trim(),
    body("phone").optional().trim(),
    body("source").isIn(["website", "linkedin", "referral", "other"]),
    body("status").isIn(["new", "contacted", "qualified", "unqualified"]),
    body("score").isInt({ min: 0, max: 100 }).optional(),
    body("owner_id").isUUID(),
    body("notes").optional().trim(),
    validateRequest,
  ];

  static getLeadValidation = [
    param("id").isUUID().withMessage("Invalid lead ID"),
    validateRequest,
  ];

  static listLeadsValidation = [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status").optional().isArray(),
    query("source").optional().isArray(),
    query("owner_id").optional().isUUID(),
    query("search").optional().trim(),
    validateRequest,
  ];

  static updateLeadValidation = [
    param("id").isUUID().withMessage("Invalid lead ID"),
    body("firstName").optional().notEmpty().trim(),
    body("lastName").optional().notEmpty().trim(),
    body("email").optional().isEmail().normalizeEmail(),
    body("company").optional().notEmpty().trim(),
    body("phone").optional().trim(),
    body("source")
      .optional()
      .isIn(["website", "linkedin", "referral", "other"]),
    body("status")
      .optional()
      .isIn(["new", "contacted", "qualified", "unqualified"]),
    body("score").optional().isInt({ min: 0, max: 100 }),
    body("owner_id").optional().isUUID(),
    body("notes").optional().trim(),
    validateRequest,
  ];

  // Controller methods
  createLead = async (req: Request, res: Response) => {

    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      const result = leadSchema.safeParse(
        normalizeEmptyStrings({
          ...req.body,
          tenant_id: req.user.tenant_id,
          score: Number(req.body.score),
          tags: req.body.tags
            ? req.body.tags.split(",").map((tag: any) => tag.trim())
            : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          team_id: req.body.team_id || undefined,
          id: uuidv4(),
          owner_id: req.user.uid,
          first_name: req.body.firstName,
          last_name: req.body.lastName,
        })
      );

      if (!result.success) {
        const validationErrors = result.error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
          received: e.received,
          code: e.code,
        }));

        res.status(400).json({
          status: 'error',
          code: 'ValidationError',
          message: 'Invalid input data',
          details: validationErrors,
        });
        return;
      }

      const leadData = result.data;
      const lead = await this.leadService.createLead(leadData);

      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  getLead = async (req: Request, res: Response) => {

    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      const lead = await this.leadService.getLead(
        req.params.id,
        req.user.tenant_id
      );
      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === "LeadNotFound" ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  listLeads = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      const filters = {
        status: req.query.status as string[],
        source: req.query.source as string[],
        owner_id: req.query.owner_id as string,
        search: req.query.search as string,
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;

      const results = await this.leadService.listLeads(
        req.user.tenant_id,
        filters,
        page,
        limit
      );

      const resultObject = {
        items: results.items,
        pagination: {
          total: results.total,
          page: results.page,
          pageSize: results.pageSize,
          totalPages: results.totalPages
        }
      }

      res.json({ success: true, data: resultObject });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  updateLead = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }
      
     const result = updateLeadSchema.safeParse(
        normalizeEmptyStrings({
          ...req.body,
          first_name: req.body.firstName,
          last_name: req.body.lastName,
        })
      );

      if (!result.success) {
        const validationErrors = result.error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
          received: e.received,
          code: e.code,
        }));

        res.status(400).json({
          status: 'error',
          code: 'ValidationError',
          message: 'Invalid input data',
          details: validationErrors,
        });
        return;
      }

      const leadData = result.data;

      const lead = await this.leadService.updateLead(
        req.params.id,
        req.user.tenant_id,
        leadData
      );

      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === "LeadNotFound" ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  deleteLead = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      await this.leadService.deleteLead(req.params.id, req.user.tenant_id);
      res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === "LeadNotFound" ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  updateLeadScore = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      const score = parseInt(req.body.score);
      if (isNaN(score) || score < 0 || score > 100) {
        throw new ApiError(
          "ValidationError",
          "Score must be between 0 and 100"
        );
      }

      const lead = await this.leadService.updateLeadScore(
        req.params.id,
        req.user.tenant_id,
        score
      );

      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === "LeadNotFound" ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };

  updateLeadStatus = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError("Unauthorized", "Missing tenant context");
      }

      const status = req.body.status;
      if (!["new", "contacted", "qualified", "unqualified"].includes(status)) {
        throw new ApiError("ValidationError", "Invalid lead status");
      }

      const lead = await this.leadService.updateLeadStatus(
        req.params.id,
        req.user.tenant_id,
        status
      );

      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === "LeadNotFound" ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "InternalServerError",
          message: "An unexpected error occurred",
        });
      }
    }
  };
}
