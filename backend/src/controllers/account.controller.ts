import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { body, param, query, validationResult } from 'express-validator';
import { accountSchema } from '../models/schemas';

const accountService = new AccountService();

export class AccountController {
  // Validation chains
  createValidation = [
    body('name').notEmpty().trim(),
    body('industry').notEmpty().trim(),
    body('website').optional().isURL(),
    body('size').isIn(['small', 'medium', 'large', 'enterprise']),
    body('parent_account_id').optional().isUUID(),
    body('annual_revenue').optional().isNumeric(),
    body('owner_id').isUUID()
  ];

  updateValidation = [
    param('id').isUUID(),
    body('name').optional().notEmpty().trim(),
    body('industry').optional().notEmpty().trim(),
    body('website').optional().isURL(),
    body('size').optional().isIn(['small', 'medium', 'large', 'enterprise']),
    body('parent_account_id').optional().isUUID(),
    body('annual_revenue').optional().isNumeric(),
    body('owner_id').optional().isUUID()
  ];

  listValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('owner_id').optional().isUUID(),
    query('industry').optional().trim(),
    query('size').optional().isIn(['small', 'medium', 'large', 'enterprise']),
    query('includeRelations').optional().isBoolean()
  ];

  create = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // ensure authenticated user and tenant are present
      if (!req.user || !req.user.tenant_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const account = await accountService.create({
        ...req.body,
        tenant_id: req.user!.tenant_id
      });

      res.status(201).json(account);
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const includeRelations = req.query.includeRelations === 'true';

      const account = await accountService.get(id, includeRelations);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(account);
    } catch (error) {
      console.error('Error getting account:', error);
      res.status(500).json({
        error: 'Failed to get account',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await accountService.list({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string,
        owner_id: req.query.owner_id as string,
        industry: req.query.industry as string,
        size: req.query.size as any,
        includeRelations: req.query.includeRelations === 'true'
      });

      res.json(result);
    } catch (error) {
      console.error('Error listing accounts:', error);
      res.status(500).json({
        error: 'Failed to list accounts',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;
      const account = await accountService.update(id, req.body);

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(account);
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({
        error: 'Failed to update account',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await accountService.delete(id);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  getHierarchy = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const hierarchy = await accountService.getHierarchy(id);
      res.json(hierarchy);
    } catch (error) {
      console.error('Error getting account hierarchy:', error);
      res.status(500).json({
        error: 'Failed to get account hierarchy',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };
}