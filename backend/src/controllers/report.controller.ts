import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async createReport(req: Request, res: Response) {
    try {
      const report = await this.reportService.createReport({
        ...req.body,
        tenant_id: req.tenant.id,
      });

      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.reportService.updateReport(id, req.body);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReport(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listReports(req: Request, res: Response) {
    try {
      const reports = await this.reportService.listReports(req.tenant.id);
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.reportService.deleteReport(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async generateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await this.reportService.generateReport(id);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}