import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ContactService } from '../services/contact.service';
import { validateRequest } from '../middleware/validation';
import { ApiError } from '../utils/errors';
import { contactSchema } from '../models/schemas';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  // Validation chains
  static createContactValidation = [
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('role').notEmpty().trim(),
    body('account_id').isUUID(),
    body('opt_out').optional().isBoolean(),
    body('preferences').optional().isObject(),
    validateRequest
  ];

  static getContactValidation = [
    param('id').isUUID().withMessage('Invalid contact ID'),
    validateRequest
  ];

  static listContactsValidation = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('account_id').optional().isUUID(),
    query('opt_out').optional().isBoolean(),
    query('search').optional().trim(),
    validateRequest
  ];

  static updateContactValidation = [
    param('id').isUUID().withMessage('Invalid contact ID'),
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('role').optional().notEmpty().trim(),
    body('account_id').optional().isUUID(),
    body('opt_out').optional().isBoolean(),
    body('preferences').optional().isObject(),
    validateRequest
  ];

  // Controller methods
  createContact = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const contactData = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const contact = await this.contactService.createContact(contactData);
      res.status(201).json({ success: true, data: contact });
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

  getContact = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const contact = await this.contactService.getContact(req.params.id, req.user.tenant_id);
      res.json({ success: true, data: contact });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'ContactNotFound' ? 404 : 400;
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

  listContacts = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const filters = {
        account_id: req.query.account_id as string,
        opt_out: req.query.opt_out === 'true',
        search: req.query.search as string
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const results = await this.contactService.listContacts(
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

  updateContact = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const updates = contactSchema.partial().parse(req.body);
      const contact = await this.contactService.updateContact(
        req.params.id,
        req.user.tenant_id,
        updates
      );

      res.json({ success: true, data: contact });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'ContactNotFound' ? 404 : 400;
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

  deleteContact = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      await this.contactService.deleteContact(req.params.id, req.user.tenant_id);
      res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'ContactNotFound' ? 404 : 400;
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

  updateContactPreferences = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const preferences = req.body.preferences;
      if (!preferences || typeof preferences !== 'object') {
        throw new ApiError('ValidationError', 'Invalid preferences object');
      }

      const contact = await this.contactService.updateContactPreferences(
        req.params.id,
        req.user.tenant_id,
        preferences
      );

      res.json({ success: true, data: contact });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'ContactNotFound' ? 404 : 400;
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

  updateOptOutStatus = async (req: Request, res: Response) => {
    try {
      if (!req.user?.tenant_id) {
        throw new ApiError('Unauthorized', 'Missing tenant context');
      }

      const optOut = req.body.opt_out;
      if (typeof optOut !== 'boolean') {
        throw new ApiError('ValidationError', 'Invalid opt-out value');
      }

      const contact = await this.contactService.updateOptOutStatus(
        req.params.id,
        req.user.tenant_id,
        optOut
      );

      res.json({ success: true, data: contact });
    } catch (error) {
      if (error instanceof ApiError) {
        const status = error.code === 'ContactNotFound' ? 404 : 400;
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
}