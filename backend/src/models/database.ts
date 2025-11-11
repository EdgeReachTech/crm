import { SupabaseClient as Database } from '@supabase/supabase-js';
import { Lead, Contact, Opportunity, Account, Campaign, User, Tenant } from './schemas';

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
  };
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
}

export type DatabaseSchema = {
  public: PublicSchema;
};

export type DbClient = Database<DatabaseSchema>;