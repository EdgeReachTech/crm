import { Request, Response } from 'express';
import { LinkedInIntegrationService } from '../services/integration/linkedin.integration.service';
import { Integration } from '../models/schemas';

export class IntegrationController {
  private linkedInService: LinkedInIntegrationService;

  constructor() {
    this.linkedInService = new LinkedInIntegrationService();
  }

  async createIntegration(req: Request, res: Response) {
    try {
      const { provider } = req.body;
      let service;

      switch (provider) {
        case 'linkedin':
          service = this.linkedInService;
          break;
        // Add other providers here
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const integration = await service.createIntegration({
        ...req.body,
        tenant_id: req.tenant.id,
      });

      res.status(201).json(integration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateIntegration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = this.getServiceForIntegration(req.body.provider);
      
      const integration = await service.updateIntegration(id, req.body);
      res.json(integration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getIntegration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const integration = await this.linkedInService.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      res.json(integration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteIntegration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.linkedInService.deleteIntegration(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private getServiceForIntegration(provider: Integration['provider']) {
    switch (provider) {
      case 'linkedin':
        return this.linkedInService;
      // Add other providers here
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}