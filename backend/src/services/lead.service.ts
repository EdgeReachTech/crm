import { supabase } from "../config/supabase";
import { leadSchema, type Lead } from "../models/schemas";
import { ApiError } from "../utils/errors";

export class LeadService {
  async createLead(leadData: Omit<Lead, "id" | "created_at" | "updated_at">) {
    try {
      const { data: lead, error } = await supabase
        .from("leads")
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;

      return leadSchema.parse(lead);
    } catch (error: any) {
      console.error("Error in createLead:", error);
      throw new ApiError("LeadCreationError", "Failed to create lead", error);
    }
  }

  async getLead(leadId: string, tenantId: string) {
    try {
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*, users!owner_id(*)")
        .eq("id", leadId)
        .eq("tenant_id", tenantId)
        .single();

      if (error) throw error;
      if (!lead) throw new ApiError("LeadNotFound", "Lead not found");

      return leadSchema.parse(lead);
    } catch (error) {
      console.error("Error in getLead:", error);
      throw new ApiError("LeadFetchError", "Failed to fetch lead", error);
    }
  }

  async listLeads(
    tenantId: string,
    filters: {
      status?: string[];
      source?: string[];
      owner_id?: string;
      search?: string;
    },
    page = 1,
    limit = 15
  ) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from("leads")
        .select("*, users!owner_id(*)", { count: "exact" })
        .eq("tenant_id", tenantId);

        const statusFilter = Array.isArray(filters.status)
          ? filters.status          // already array
          : filters.status
          ? [filters.status]       // wrap string into array
          : [];

      // Apply filters
      if (filters.status?.length) {
        query = query.in("status", statusFilter);
      }

      const sourceFilter = Array.isArray(filters.source) 
        ? filters.source 
        : filters.source 
        ? [filters.source] 
        : [];

      if (filters.source?.length) {
        query = query.in("source", sourceFilter);
      }

      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,` +
          `last_name.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%,` +
          `company.ilike.%${filters.search}%`
        );
      }
                        
      if((filters as any).interest_level){
        const { min, max } = (filters as any).interest_level;
        query = query.gte("score", min).lte("score", max);
      }

      const {
        data: leads,
        error,
        count,
      } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        items: (leads ?? []).map((lead: unknown) => leadSchema.parse(lead)),
        total: count ?? 0,
        page,
        pageSize: limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      };
    } catch (error) {
      console.error("Error in listLeads:", error);
      throw new ApiError("LeadListError", "Failed to list leads", error);
    }
  }

  async updateLead(leadId: string, tenantId: string, updates: Partial<Lead>) {

    try {
     const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", leadId)
      .eq("tenant_id", tenantId)
      .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new ApiError("LeadNotFound", "Lead not found");
      }

      const lead = data[0]; // safe because we checked length

      return leadSchema.parse(lead);
    } catch (error) {
      console.error("Error in updateLead:", error);
      throw new ApiError("LeadUpdateError", "Failed to update lead", error);
    }
  }

  async deleteLead(leadId: string, tenantId: string) {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId)
        .eq("tenant_id", tenantId);

      if (error) throw error;
    } catch (error) {
      console.error("Error in deleteLead:", error);
      throw new ApiError("LeadDeletionError", "Failed to delete lead", error);
    }
  }

  async updateLeadScore(leadId: string, tenantId: string, score: number) {
    try {
      const { data: lead, error } = await supabase
        .from("leads")
        .update({ score })
        .eq("id", leadId)
        .eq("tenant_id", tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!lead) throw new ApiError("LeadNotFound", "Lead not found");

      return leadSchema.parse(lead);
    } catch (error) {
      console.error("Error in updateLeadScore:", error);
      throw new ApiError(
        "LeadScoreUpdateError",
        "Failed to update lead score",
        error
      );
    }
  }

  async updateLeadStatus(
    leadId: string,
    tenantId: string,
    status: Lead["status"]
  ) {
    try {
      const { data: lead, error } = await supabase
        .from("leads")
        .update({
          status,
          last_contacted: status === "contacted" ? new Date() : undefined,
        })
        .eq("id", leadId)
        .eq("tenant_id", tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!lead) throw new ApiError("LeadNotFound", "Lead not found");

      return leadSchema.parse(lead);
    } catch (error) {
      console.error("Error in updateLeadStatus:", error);
      throw new ApiError(
        "LeadStatusUpdateError",
        "Failed to update lead status",
        error
      );
    }
  }
}
