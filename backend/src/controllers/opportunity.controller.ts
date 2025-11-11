import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { OpportunityService } from '../services/opportunity.service';
import { validateRequest } from '../middleware/validation';
import { ApiError } from '../utils/errors';
import { opportunitySchema } from '../models/schemas';

export class OpportunityController {
  private opportunityService: OpportunityService;

  constructor() {
    this.opportunityService = new OpportunityService();
  }

  // Validation chains
  static createOpportunityValidation = [
    body('name').notEmpty().trim(),
    body('value').isFloat({ min: 0 }),
    body('stage').isIn(['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    body('probability').isInt({ min: 0, max: 100 }),
    body('expected_close_date').isISO8601(),
    body('lead_id').isUUID(),
    body('owner_id').isUUID(),
    body('notes').optional().trim(),
    validateRequest
  ];

  static getOpportunityValidation = [
    param('id').isUUID().withMessage('Invalid opportunity ID'),
    validateRequest
  ];

  static listOpportunitiesValidation = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('stage').optional().isArray(),
    query('owner_id').optional().isUUID(),
    query('lead_id').optional().isUUID(),
    query('minValue').optional().isFloat({ min: 0 }),
    query('maxValue').optional().isFloat({ min: 0 }),
    query('minProbability').optional().isInt({ min: 0, max: 100 }),
    query('maxProbability').optional().isInt({ min: 0, max: 100 }),
    query('search').optional().trim(),
    validateRequest
  ];

  static updateOpportunityValidation = [
    param('id').isUUID().withMessage('Invalid opportunity ID'),
    body('name').optional().notEmpty().trim(),
    body('value').optional().isFloat({ min: 0 }),
    body('stage').optional().isIn(['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    body('probability').optional().isInt({ min: 0, max: 100 }),
    body('expected_close_date').optional().isISO8601(),
    body('lead_id').optional().isUUID(),
    body('owner_id').optional().isUUID(),
    body('notes').optional().trim(),
    validateRequest
  ];

  static updateStageValidation = [
    param('id').isUUID().withMessage('Invalid opportunity ID'),
    body('stage').isIn(['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    validateRequest
  ];

  // Controller methods
  createOpportunity = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const opportunityData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
        expected_close_date: new Date(req.body.expected_close_date)
      };

      const opportunity = await this.opportunityService.createOpportunity(opportunityData);
      res.status(201).json({ success: true, data: opportunity });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  getOpportunity = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const opportunity = await this.opportunityService.getOpportunity(req.params.id, req.user.tenant_id);
      res.json({ success: true, data: opportunity });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'OpportunityNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  listOpportunities = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const filters = {
        stage: req.query.stage as string[],
        owner_id: req.query.owner_id as string,
        lead_id: req.query.lead_id as string,
        minValue: req.query.minValue ? parseFloat(req.query.minValue as string) : undefined,
        maxValue: req.query.maxValue ? parseFloat(req.query.maxValue as string) : undefined,
        minProbability: req.query.minProbability ? parseInt(req.query.minProbability as string) : undefined,
        maxProbability: req.query.maxProbability ? parseInt(req.query.maxProbability as string) : undefined,
        search: req.query.search as string
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const results = await this.opportunityService.listOpportunities(
        req.user.tenant_id,
        filters,
        page,
        limit
      );

      res.json({ success: true, data: results });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  updateOpportunity = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const updates = opportunitySchema.partial().parse({
        ...req.body,
        expected_close_date: req.body.expected_close_date ? new Date(req.body.expected_close_date) : undefined
      });

      const opportunity = await this.opportunityService.updateOpportunity(
        req.params.id,
        req.user.tenant_id,
        updates
      );

      res.json({ success: true, data: opportunity });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'OpportunityNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  deleteOpportunity = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      await this.opportunityService.deleteOpportunity(req.params.id, req.user.tenant_id);
      res.json({ success: true, message: 'Opportunity deleted successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'OpportunityNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  updateStage = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const stage = req.body.stage;
      if (!['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(stage)) {
        throw new ApiError('ValidationError', 'Invalid opportunity stage');
      }

      const opportunity = await this.opportunityService.updateOpportunityStage(
        req.params.id,
        req.user.tenant_id,
        stage
      );

      res.json({ success: true, data: opportunity });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'OpportunityNotFound' ? 404 : 400;
        res.status(status).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };

  getForecast = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const forecast = await this.opportunityService.getForecast(
        req.user.tenant_id,
        req.query.owner_id as string
      );

      res.json({ success: true, data: forecast });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred'
        });
      }
    }
  };
}