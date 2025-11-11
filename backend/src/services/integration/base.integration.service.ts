import { Integration, integrationSchema, IntegrationSyncLog, integrationSyncLogSchema, commonFields } from '../../models/schemas';
import { supabase } from '../../config/supabase';

export abstract class BaseIntegrationService {
  protected abstract provider: string;
  
  async createIntegration(data: Omit<Integration, keyof typeof commonFields>): Promise<Integration> {
    const integration = await supabase
      .from('integrations')
      .insert(integrationSchema.parse(data))
      .select('*')
      .single();
    
    return integration.data;
  }

  async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
    const integration = await supabase
      .from('integrations')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    return integration.data;
  }

  async getIntegration(id: string): Promise<Integration> {
    const integration = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();
    
    return integration.data;
  }

  async deleteIntegration(id: string): Promise<void> {
    await supabase
      .from('integrations')
      .delete()
      .eq('id', id);
  }

  async logSync(data: Omit<IntegrationSyncLog, keyof typeof commonFields>): Promise<IntegrationSyncLog> {
    const log = await supabase
      .from('integration_sync_logs')
      .insert(integrationSyncLogSchema.parse(data))
      .select('*')
      .single();
    
    return log.data;
  }

  protected abstract refreshToken(integration: Integration): Promise<Integration>;
  protected abstract sync(integration: Integration): Promise<void>;
}