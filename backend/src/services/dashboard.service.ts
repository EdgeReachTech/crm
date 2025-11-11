import { Dashboard, dashboardSchema } from '../models/schemas';
import type { commonFields } from '../models/schemas';
import { supabase } from '../config/supabase';
import { ReportService } from './report.service';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  config: {
    data_source?: string;
    metrics?: string[];
    filters?: Array<{ field: string; operator: string; value?: any }>;
    refresh_interval?: number;
  };
}

export class DashboardService {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async createDashboard(data: Omit<Dashboard, keyof typeof commonFields>): Promise<Dashboard> {
    const dashboard = await supabase
      .from('dashboards')
      .insert(dashboardSchema.parse(data))
      .select('*')
      .single();
    
    return dashboard.data;
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard> {
    const dashboard = await supabase
      .from('dashboards')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    return dashboard.data;
  }

  async getDashboard(id: string): Promise<Dashboard> {
    const dashboard = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .single();
    
    return dashboard.data;
  }

  async listDashboards(tenantId: string): Promise<Dashboard[]> {
    const dashboards = await supabase
      .from('dashboards')
      .select('*')
      .eq('tenant_id', tenantId);
    
    return dashboards.data || [];
  }

  async deleteDashboard(id: string): Promise<void> {
    await supabase
      .from('dashboards')
      .delete()
      .eq('id', id);
  }

  async refreshDashboard(id: string): Promise<Record<string, any>> {
    const dashboard = await this.getDashboard(id);
    if (!dashboard) throw new Error('Dashboard not found');

    const widgetData: Record<string, any> = {};

    // Refresh each widget in parallel
    await Promise.all(
      (dashboard.layout || []).map(async (widget: DashboardWidget) => {
        if (!widget.type || !widget.config) {
          widgetData[widget.id] = { error: 'Invalid widget configuration' };
          return;
        }
        try {
          const data = await this.refreshWidget(widget);
          widgetData[widget.id] = data;
        } catch (error: any) {
          widgetData[widget.id] = { error: error.message };
        }
      })
    );

    return widgetData;
  }

  private async refreshWidget(widget: DashboardWidget): Promise<any> {
    const { type, config } = widget;

    switch (type) {
      case 'chart':
      case 'table':
        if (!config.data_source) {
          throw new Error('Data source is required for chart and table widgets');
        }
        return this.reportService.generateReport(config.data_source);

      case 'metric':
        if (!config.metrics || config.metrics.length === 0) {
          throw new Error('At least one metric is required for metric widgets');
        }
        return this.executeMetricQuery(config);

      case 'list':
        if (!config.data_source) {
          throw new Error('Data source is required for list widgets');
        }
        const limit = config.refresh_interval || 10; // Default to 10 items if not specified
        return this.fetchEntityList(config.data_source, limit);

      default:
        throw new Error(`Unknown widget type: ${type}`);
    }
  }

  private async executeMetricQuery(config: Dashboard['layout'][0]['config']): Promise<number> {
    const result = await supabase.rpc('calculate_metric', {
      metrics: config.metrics,
      filters: config.filters || [],
      data_source: config.data_source
    });
    return result.data;
  }

  private async fetchEntityList(dataSource: string, limit: number): Promise<any[]> {
    const result = await supabase
      .from(dataSource)
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    return result.data || [];
  }
}