import { supabase } from '../config/supabase';
import { resend } from '../config/resend';
import { Campaign } from '../models/schemas';
import { DatabaseError } from '../utils/errors';

export class CampaignService {
  async create(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'metrics'>) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaign,
          metrics: {
            sent: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            revenue: 0,
          },
        })
        .select()
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get(id: string) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select()
        .eq('id', id)
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async list(params: {
    page?: number;
    limit?: number;
    status?: Campaign['status'];
    type?: Campaign['type'];
    owner_id?: string;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        owner_id,
      } = params;

      let query = supabase.from('campaigns').select('*', { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (type) {
        query = query.eq('type', type);
      }
      if (owner_id) {
        query = query.eq('owner_id', owner_id);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError(error.message);

      return {
        data,
        count: count || 0,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, campaign: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError(error.message);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendCampaignEmail(campaignId: string, recipient: { email: string; firstName?: string; lastName?: string }) {
    try {
      const campaign = await this.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Replace variables in template
      let content = campaign.template.content;
      if (recipient.firstName) {
        content = content.replace(/{{first_name}}/g, recipient.firstName);
      }
      if (recipient.lastName) {
        content = content.replace(/{{last_name}}/g, recipient.lastName);
      }

      // Add UTM parameters to links
      if (campaign.utm) {
        content = this.addUtmToLinks(content, campaign.utm);
      }

      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: 'noreply@edgereach.com',
        to: recipient.email,
        subject: campaign.template.subject,
        html: content,
        tags: [
          { name: 'campaign_id', value: campaignId },
          { name: 'type', value: campaign.type },
        ],
      });

      if (error) throw error;

      // Update metrics
      await this.incrementMetric(campaignId, 'sent');

      return data;
    } catch (error) {
      throw error;
    }
  }

  async trackOpen(campaignId: string) {
    try {
      await this.incrementMetric(campaignId, 'opened');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async trackClick(campaignId: string) {
    try {
      await this.incrementMetric(campaignId, 'clicked');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async trackConversion(campaignId: string, revenue: number = 0) {
    try {
      const campaign = await this.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const { error } = await supabase
        .from('campaigns')
        .update({
          metrics: {
            ...campaign.metrics,
            converted: (campaign.metrics?.converted || 0) + 1,
            revenue: (campaign.metrics?.revenue || 0) + revenue,
          },
        })
        .eq('id', campaignId);

      if (error) throw new DatabaseError(error.message);
      return true;
    } catch (error) {
      throw error;
    }
  }

  private async incrementMetric(campaignId: string, metric: 'sent' | 'opened' | 'clicked') {
    const { error } = await supabase.rpc('increment_campaign_metric', {
      campaign_id: campaignId,
      metric_name: metric,
    });

    if (error) throw new DatabaseError(error.message);
  }

  private addUtmToLinks(content: string, utm: Campaign['utm']) {
    if (!utm) return content;

    return content.replace(
      /href="([^"]+)"/g,
      (match, url) => {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set('utm_source', utm.source);
        parsedUrl.searchParams.set('utm_medium', utm.medium);
        parsedUrl.searchParams.set('utm_campaign', utm.campaign);
        if (utm.term) parsedUrl.searchParams.set('utm_term', utm.term);
        if (utm.content) parsedUrl.searchParams.set('utm_content', utm.content);
        return `href="${parsedUrl.toString()}"`;
      }
    );
  }
}