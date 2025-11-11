import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';
import { body, param, query, validationResult } from 'express-validator';

const campaignService = new CampaignService();

export class CampaignController {
  // Validation chains
  createValidation = [
    body('name').notEmpty().trim(),
    body('type').isIn(['email', 'newsletter', 'nurture', 'webinar']),
    body('status').isIn(['draft', 'scheduled', 'active', 'paused', 'completed']),
    body('owner_id').isUUID(),
    body('start_date').isISO8601(),
    body('end_date').optional().isISO8601(),
    body('segment').isObject(),
    body('segment.filters').isArray(),
    body('template').isObject(),
    body('template.subject').notEmpty(),
    body('template.content').notEmpty(),
    body('settings').optional().isObject(),
    body('utm').optional().isObject(),
  ];

  updateValidation = [
    param('id').isUUID(),
    body('name').optional().notEmpty().trim(),
    body('type').optional().isIn(['email', 'newsletter', 'nurture', 'webinar']),
    body('status').optional().isIn(['draft', 'scheduled', 'active', 'paused', 'completed']),
    body('owner_id').optional().isUUID(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('segment').optional().isObject(),
    body('template').optional().isObject(),
    body('settings').optional().isObject(),
    body('utm').optional().isObject(),
  ];

  listValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'scheduled', 'active', 'paused', 'completed']),
    query('type').optional().isIn(['email', 'newsletter', 'nurture', 'webinar']),
    query('owner_id').optional().isUUID(),
  ];

  create = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const campaign = await campaignService.create({
        ...req.body,
        tenant_id: req.user!.tenant_id!,
      });

      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const campaign = await campaignService.get(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({
        error: 'Failed to get campaign',
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

      const result = await campaignService.list({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        status: req.query.status as any,
        type: req.query.type as any,
        owner_id: req.query.owner_id as string,
      });

      res.json(result);
    } catch (error) {
      console.error('Error listing campaigns:', error);
      res.status(500).json({
        error: 'Failed to list campaigns',
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

      const campaign = await campaignService.update(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        error: 'Failed to update campaign',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await campaignService.delete(req.params.id);
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        error: 'Failed to delete campaign',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  sendTest = async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;
      const { email, firstName, lastName } = req.body;

      const result = await campaignService.sendCampaignEmail(campaignId, {
        email,
        firstName,
        lastName,
      });

      res.json({ message: 'Test email sent successfully', result });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  trackOpen = async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;
      await campaignService.trackOpen(campaignId);
      
      // Return a 1x1 transparent pixel
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': '43',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      });
      res.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    } catch (error) {
      console.error('Error tracking open:', error);
      res.status(500).json({
        error: 'Failed to track open',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  trackClick = async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;
      const { url } = req.query;

      await campaignService.trackClick(campaignId);
      
      // Redirect to the original URL
      res.redirect(url as string);
    } catch (error) {
      console.error('Error tracking click:', error);
      res.status(500).json({
        error: 'Failed to track click',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };

  trackConversion = async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;
      const { revenue } = req.body;

      await campaignService.trackConversion(campaignId, revenue);
      res.json({ message: 'Conversion tracked successfully' });
    } catch (error) {
      console.error('Error tracking conversion:', error);
      res.status(500).json({
        error: 'Failed to track conversion',
        details: error instanceof Error ? error.message : undefined
      });
    }
  };
}