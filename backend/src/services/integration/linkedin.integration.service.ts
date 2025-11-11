import { Integration, IntegrationSyncLog, commonFields } from '../../models/schemas';
import { BaseIntegrationService } from './base.integration.service';
import { LinkedInClient } from '../../lib/linkedin';

export class LinkedInIntegrationService extends BaseIntegrationService {
  protected provider = 'linkedin';
  private client: LinkedInClient;

  constructor() {
    super();
    this.client = new LinkedInClient();
  }

  protected async refreshToken(integration: Integration): Promise<Integration> {
    if (!integration.config.credentials.refresh_token) {
      throw new Error('No refresh token available');
    }

    const newTokens = await this.client.refreshAccessToken(
      integration.config.credentials.refresh_token
    );

    return this.updateIntegration(integration.id, {
      config: {
        ...integration.config,
        credentials: {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000),
        },
      },
    });
  }

  protected async sync(integration: Integration): Promise<void> {
    try {
      // Check if token needs refresh
      if (new Date(integration.config.credentials.expires_at) <= new Date()) {
        integration = await this.refreshToken(integration);
      }

      const startTime = Date.now();
      let itemsProcessed = 0;
      let itemsSucceeded = 0;
      let itemsFailed = 0;
      const errors: string[] = [];

      // Sync Lead Gen Forms
      try {
        const forms = await this.client.getLeadGenForms(
          integration.config.credentials.access_token
        );
        itemsProcessed += forms.length;

        for (const form of forms) {
          try {
            const responses = await this.client.getFormResponses(
              integration.config.credentials.access_token,
              form.id
            );

            // Convert responses to leads
            for (const response of responses) {
              try {
                await this.createLeadFromResponse(response, integration.tenant_id);
                itemsSucceeded++;
              } catch (error) {
                itemsFailed++;
                errors.push(`Failed to create lead from response ${response.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          } catch (error) {
            itemsFailed++;
            errors.push(`Failed to get responses for form ${form.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to get lead gen forms: ${errorMessage}`);
      }

      // Log sync results
      await this.logSync({
        integration_id: integration.id,
        status: errors.length > 0 ? 'partial' : 'success',
        items_processed: itemsProcessed,
        items_succeeded: itemsSucceeded,
        items_failed: itemsFailed,
        error: errors.length > 0 ? errors.join('\n') : undefined,
        details: {
          duration_ms: Date.now() - startTime,
        }
      });

    } catch (error: any) {
      await this.logSync({
        integration_id: integration.id,
        status: 'error',
        items_processed: 0,
        items_succeeded: 0,
        items_failed: 0,
        error: error?.message || 'Unknown error'
      });

      throw error;
    }
  }

  private async createLeadFromResponse(response: Record<string, any>, tenantId: string) {
    const { firstName, lastName, email, company } = this.extractLeadData(response);
    
    const lead = {
      firstName,
      lastName,
      email,
      company,
      source: 'linkedin' as const,
      status: 'new' as const,
      score: 0,
      owner_id: process.env.DEFAULT_OWNER_ID || '', // You should set this to a valid owner_id
      notes: `Generated from LinkedIn Lead Gen Form: ${response.formId}`
    };

    // Here you would typically call your lead service
    // For now we'll just log it
    console.log('Creating lead:', lead);
    return lead;
  }

  private extractLeadData(response: Record<string, any>): {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  } {
    // Extract fields from LinkedIn form response
    // You'll need to adjust this based on your form fields
    return {
      firstName: String(response.firstName || ''),
      lastName: String(response.lastName || ''),
      email: String(response.emailAddress || ''),
      company: String(response.companyName || '')
    };
  }
}