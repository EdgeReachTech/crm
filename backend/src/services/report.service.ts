import { Report, reportSchema, commonFields } from '../models/schemas';
import { supabase } from '../config/supabase';

export class ReportService {
  async createReport(data: Omit<Report, keyof typeof commonFields>): Promise<Report> {
    const report = await supabase
      .from('reports')
      .insert(reportSchema.parse(data))
      .select('*')
      .single();
    
    return report.data;
  }

  async updateReport(id: string, data: Partial<Report>): Promise<Report> {
    const report = await supabase
      .from('reports')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    return report.data;
  }

  async getReport(id: string): Promise<Report> {
    const report = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    return report.data;
  }

  async listReports(tenantId: string): Promise<Report[]> {
    const reports = await supabase
      .from('reports')
      .select('*')
      .eq('tenant_id', tenantId);
    
    return reports.data || [];
  }

  async deleteReport(id: string): Promise<void> {
    await supabase
      .from('reports')
      .delete()
      .eq('id', id);
  }

  async generateReport(id: string): Promise<any> {
    const report = await this.getReport(id);
    if (!report) throw new Error('Report not found');

    // Execute the report query based on type
    const result = await this.executeReportQuery(report);

    // Update last run time
    await this.updateReport(id, {
      last_run_at: new Date(),
    });

    return result;
  }

  private async executeReportQuery(report: Report): Promise<any> {
    const { query } = report;
    let queryBuilder = supabase
      .from(this.getTableForReportType(report.type))
      .select(this.buildSelectClause(query.metrics, query.dimensions));

    // Apply filters
    if (query.filters) {
      for (const filter of query.filters) {
        queryBuilder = this.applyFilter(queryBuilder, filter);
      }
    }

    // Apply sorting
    if (query.sort) {
      for (const sort of query.sort) {
        queryBuilder = queryBuilder.order(sort.field, {
          ascending: sort.direction === 'asc',
        });
      }
    }

    // Apply limit
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    const result = await queryBuilder;
    return this.transformReportResult(result.data, query.metrics, query.dimensions);
  }

  private getTableForReportType(type: Report['type']): string {
    switch (type) {
      case 'sales':
        return 'opportunities';
      case 'leads':
        return 'leads';
      case 'activities':
        return 'activities';
      case 'performance':
        return 'tasks';
      case 'custom':
        // Custom reports might need more complex logic
        throw new Error('Custom reports not implemented yet');
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  private buildSelectClause(metrics: string[], dimensions: string[]): string {
    return [...metrics, ...dimensions].join(',');
  }

  private applyFilter(queryBuilder: ReturnType<typeof supabase.from>, filter: NonNullable<Report['query']['filters']>[number]) {
    switch (filter.operator) {
      case 'equals':
        return queryBuilder.eq(filter.field, filter.value);
      case 'not_equals':
        return queryBuilder.neq(filter.field, filter.value);
      case 'greater_than':
        return queryBuilder.gt(filter.field, filter.value);
      case 'less_than':
        return queryBuilder.lt(filter.field, filter.value);
      case 'contains':
        return queryBuilder.ilike(filter.field, `%${filter.value}%`);
      case 'not_contains':
        return queryBuilder.not('ilike', filter.field, `%${filter.value}%`);
      default:
        throw new Error(`Unknown filter operator: ${filter.operator}`);
    }
  }

  private transformReportResult(data: Record<string, any>[], metrics: string[], dimensions: string[]) {
    // Group by dimensions if any
    if (dimensions.length > 0) {
      return this.groupDataByDimensions(data, dimensions, metrics);
    }

    // Otherwise just aggregate metrics
    return this.aggregateMetrics(data, metrics);
  }

  private groupDataByDimensions(data: Record<string, any>[], dimensions: string[], metrics: string[]) {
    const groups = new Map();

    for (const row of data) {
      const key = dimensions.map(d => row[d]).join('|');
      if (!groups.has(key)) {
        groups.set(key, {
          dimensions: Object.fromEntries(dimensions.map(d => [d, row[d]])),
          metrics: {},
        });
      }

      const group = groups.get(key);
      for (const metric of metrics) {
        if (!group.metrics[metric]) {
          group.metrics[metric] = [];
        }
        group.metrics[metric].push(row[metric]);
      }
    }

    // Aggregate metrics for each group
    return Array.from(groups.values()).map(group => ({
      ...group.dimensions,
      ...this.aggregateMetrics(group.metrics, metrics),
    }));
  }

  private aggregateMetrics(data: any[], metrics: string[]) {
    const result: Record<string, number> = {};

    for (const metric of metrics) {
      const values = data.map(row => row[metric]).filter(v => v != null);
      
      if (values.length === 0) continue;

      result[metric] = values.reduce((a, b) => a + b, 0);
      result[`${metric}_avg`] = result[metric] / values.length;
      result[`${metric}_min`] = Math.min(...values);
      result[`${metric}_max`] = Math.max(...values);
    }

    return result;
  }
}