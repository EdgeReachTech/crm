import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async createDashboard(req: Request, res: Response) {
    try {
      const dashboard = await this.dashboardService.createDashboard({
        ...req.body,
        tenant_id: req.tenant.id,
      });

      res.status(201).json(dashboard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dashboard = await this.dashboardService.updateDashboard(id, req.body);
      res.json(dashboard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dashboard = await this.dashboardService.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      res.json(dashboard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listDashboards(req: Request, res: Response) {
    try {
      const dashboards = await this.dashboardService.listDashboards(req.tenant.id);
      res.json(dashboards);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.dashboardService.deleteDashboard(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async refreshDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await this.dashboardService.refreshDashboard(id);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}