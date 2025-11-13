import { SupabaseClient as Database } from '@supabase/supabase-js';
import { 
  Lead, Contact, Opportunity, Account, Campaign, User, Tenant,
  SalesStage, Activity, FollowUp, RevenueTracking, SalesTarget,
  ManagerComment, EmailTemplate, ClientInteraction
} from './schemas';

// Supabase `Database` generic expects a schema object describing tables, views, functions, and enums.
// Each table should include Row, Insert and Update shapes. Provide a minimal compatible shape here.
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>; 
  Update: Partial<Row>;
};

interface PublicSchema {
  Tables: {
    leads: Table<Lead>;
    contacts: Table<Contact>;
    opportunities: Table<Opportunity>;
    accounts: Table<Account>;
    campaigns: Table<Campaign>;
    users: Table<User>;
    tenants: Table<Tenant>;
    sales_stages: Table<SalesStage>;
    activities: Table<Activity>;
    follow_ups: Table<FollowUp>;
    revenue_tracking: Table<RevenueTracking>;
    sales_targets: Table<SalesTarget>;
    manager_comments: Table<ManagerComment>;
    email_templates: Table<EmailTemplate>;
    client_interactions: Table<ClientInteraction>;
  };
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
}

export type DatabaseSchema = {
  public: PublicSchema;
};

export type DbClient = Database<DatabaseSchema>;