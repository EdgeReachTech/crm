import { supabase } from '../config/supabase';
import { opportunitySchema, type Opportunity } from '../models/schemas';
import { ApiError } from '../utils/errors';

export class OpportunityService {
  async createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single();

      if (error) throw error;
      return opportunitySchema.parse(opportunity);
    } catch (error) {
      console.error('Error in createOpportunity:', error);
      throw new ApiError('OpportunityCreationError', 'Failed to create opportunity', error);
    }
  }

  async getOpportunity(opportunityId: string, tenantId: string) {
    try {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .select('*, leads!lead_id(*), users!owner_id(*)')
        .eq('id', opportunityId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      if (!opportunity) throw new ApiError('OpportunityNotFound', 'Opportunity not found');

      return opportunitySchema.parse(opportunity);
    } catch (error) {
      console.error('Error in getOpportunity:', error);
      throw new ApiError('OpportunityFetchError', 'Failed to fetch opportunity', error);
    }
  }

  async listOpportunities(tenantId: string, filters: {
    stage?: string[];
    owner_id?: string;
    lead_id?: string;
    minValue?: number;
    maxValue?: number;
    minProbability?: number;
    maxProbability?: number;
    search?: string;
  }, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('opportunities')
        .select('*, leads!lead_id(*), users!owner_id(*)', { count: 'exact' })
        .eq('tenant_id', tenantId);

      // Apply filters
      if (filters.stage?.length) {
        query = query.in('stage', filters.stage);
      }
      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }
      if (filters.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters.minValue !== undefined) {
        query = query.gte('value', filters.minValue);
      }
      if (filters.maxValue !== undefined) {
        query = query.lte('value', filters.maxValue);
      }
      if (filters.minProbability !== undefined) {
        query = query.gte('probability', filters.minProbability);
      }
      if (filters.maxProbability !== undefined) {
        query = query.lte('probability', filters.maxProbability);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data: opportunities, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        items: (opportunities ?? []).map((opportunity: unknown) => opportunitySchema.parse(opportunity)),
        total: count ?? 0,
        page,
        pageSize: limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      };
    } catch (error) {
      console.error('Error in listOpportunities:', error);
      throw new ApiError('OpportunityListError', 'Failed to list opportunities', error);
    }
  }

  async updateOpportunity(opportunityId: string, tenantId: string, updates: Partial<Opportunity>) {
    try {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', opportunityId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!opportunity) throw new ApiError('OpportunityNotFound', 'Opportunity not found');

      return opportunitySchema.parse(opportunity);
    } catch (error) {
      console.error('Error in updateOpportunity:', error);
      throw new ApiError('OpportunityUpdateError', 'Failed to update opportunity', error);
    }
  }

  async deleteOpportunity(opportunityId: string, tenantId: string) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteOpportunity:', error);
      throw new ApiError('OpportunityDeletionError', 'Failed to delete opportunity', error);
    }
  }

  async updateOpportunityStage(opportunityId: string, tenantId: string, stage: Opportunity['stage']) {
    try {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update({ 
          stage,
          last_activity_date: new Date(),
          // Update probability based on stage
          probability: this.calculateProbabilityForStage(stage)
        })
        .eq('id', opportunityId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!opportunity) throw new ApiError('OpportunityNotFound', 'Opportunity not found');

      return opportunitySchema.parse(opportunity);
    } catch (error) {
      console.error('Error in updateOpportunityStage:', error);
      throw new ApiError('OpportunityStageUpdateError', 'Failed to update opportunity stage', error);
    }
  }

  private calculateProbabilityForStage(stage: Opportunity['stage']): number {
    const probabilities: Record<Opportunity['stage'], number> = {
      qualified: 20,
      discovery: 40,
      proposal: 60,
      negotiation: 80,
      closed_won: 100,
      closed_lost: 0
    };
    return probabilities[stage];
  }

  async getForecast(tenantId: string, ownerId?: string) {
    try {
      let query = supabase
        .from('opportunities')
        .select('value, probability, stage, expected_close_date')
        .eq('tenant_id', tenantId)
        .not('stage', 'in', ['closed_won', 'closed_lost']);

      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data: opportunities, error } = await query;
      if (error) throw error;

      const forecast = {
        totalValue: 0,
        weightedValue: 0,
        byStage: {
          qualified: { count: 0, value: 0 },
          discovery: { count: 0, value: 0 },
          proposal: { count: 0, value: 0 },
          negotiation: { count: 0, value: 0 }
        }
      };

      (opportunities ?? []).forEach((opp: { stage: string; value: number; probability: number }) => {
        if (opp.stage in forecast.byStage) {
          forecast.byStage[opp.stage as keyof typeof forecast.byStage].count++;
          forecast.byStage[opp.stage as keyof typeof forecast.byStage].value += opp.value;
          forecast.totalValue += opp.value;
          forecast.weightedValue += (opp.value * (opp.probability / 100));
        }
      });

      return forecast;
    } catch (error) {
      console.error('Error in getForecast:', error);
      throw new ApiError('ForecastError', 'Failed to generate forecast', error);
    }
  }
}