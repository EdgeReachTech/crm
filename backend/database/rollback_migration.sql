-- ===================================================================
-- ROLLBACK SCRIPT FOR SALES CRM MIGRATION
-- ===================================================================
-- Use this script to rollback changes if the migration fails
-- CAUTION: This will drop new tables and columns
-- ===================================================================

-- Drop new tables (in reverse dependency order)
DROP TABLE IF EXISTS client_interactions CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS manager_comments CASCADE;
DROP TABLE IF EXISTS sales_targets CASCADE;
DROP TABLE IF EXISTS revenue_tracking CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS sales_stages CASCADE;

-- Remove new columns from existing tables
-- Opportunities table
ALTER TABLE opportunities DROP COLUMN IF EXISTS next_follow_up;
ALTER TABLE opportunities DROP COLUMN IF EXISTS lost_to_competitor;
ALTER TABLE opportunities DROP COLUMN IF EXISTS lost_reason;
ALTER TABLE opportunities DROP COLUMN IF EXISTS outcome;
ALTER TABLE opportunities DROP COLUMN IF EXISTS discount_percentage;
ALTER TABLE opportunities DROP COLUMN IF EXISTS pricing_strategy;
ALTER TABLE opportunities DROP COLUMN IF EXISTS competitors;
ALTER TABLE opportunities DROP COLUMN IF EXISTS timeline_defined;
ALTER TABLE opportunities DROP COLUMN IF EXISTS need_established;
ALTER TABLE opportunities DROP COLUMN IF EXISTS authority_identified;
ALTER TABLE opportunities DROP COLUMN IF EXISTS budget_confirmed;
ALTER TABLE opportunities DROP COLUMN IF EXISTS sales_process;
ALTER TABLE opportunities DROP COLUMN IF EXISTS primary_contact_id;
ALTER TABLE opportunities DROP COLUMN IF EXISTS account_id;
ALTER TABLE opportunities DROP COLUMN IF EXISTS actual_close_date;
ALTER TABLE opportunities DROP COLUMN IF EXISTS current_stage_id;
ALTER TABLE opportunities DROP COLUMN IF EXISTS description;

-- Leads table
ALTER TABLE leads DROP COLUMN IF EXISTS conversion_date;
ALTER TABLE leads DROP COLUMN IF EXISTS converted_to_opportunity;
ALTER TABLE leads DROP COLUMN IF EXISTS next_follow_up;
ALTER TABLE leads DROP COLUMN IF EXISTS decision_maker_contact;
ALTER TABLE leads DROP COLUMN IF EXISTS pain_points;
ALTER TABLE leads DROP COLUMN IF EXISTS timeline;
ALTER TABLE leads DROP COLUMN IF EXISTS budget_range;
ALTER TABLE leads DROP COLUMN IF EXISTS current_stage_id;
ALTER TABLE leads DROP COLUMN IF EXISTS qualification_status;
ALTER TABLE leads DROP COLUMN IF EXISTS interest_level;
ALTER TABLE leads DROP COLUMN IF EXISTS source_details;
ALTER TABLE leads DROP COLUMN IF EXISTS title;

-- Contacts table
ALTER TABLE contacts DROP COLUMN IF EXISTS contact_preference;
ALTER TABLE contacts DROP COLUMN IF EXISTS last_contacted;
ALTER TABLE contacts DROP COLUMN IF EXISTS budget_influence;
ALTER TABLE contacts DROP COLUMN IF EXISTS authority_level;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_primary_contact;

-- Accounts table
ALTER TABLE accounts DROP COLUMN IF EXISTS relationship_status;
ALTER TABLE accounts DROP COLUMN IF EXISTS last_activity_date;
ALTER TABLE accounts DROP COLUMN IF EXISTS total_revenue;
ALTER TABLE accounts DROP COLUMN IF EXISTS address;
ALTER TABLE accounts DROP COLUMN IF EXISTS phone;
ALTER TABLE accounts DROP COLUMN IF EXISTS employee_count;

-- Users table
ALTER TABLE users DROP COLUMN IF EXISTS current_revenue;
ALTER TABLE users DROP COLUMN IF EXISTS yearly_quota;
ALTER TABLE users DROP COLUMN IF EXISTS monthly_quota;

-- Restore original constraints (adjust as needed based on your original schema)
-- Note: You'll need to manually adjust these based on your original role values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'marketer')); -- Uncomment and adjust as needed

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
-- ALTER TABLE leads ADD CONSTRAINT leads_source_check CHECK (source IN ('original', 'values')); -- Uncomment and adjust as needed

ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_size_check;
-- ALTER TABLE accounts ADD CONSTRAINT accounts_size_check CHECK (size IN ('original', 'values')); -- Uncomment and adjust as needed

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_role_check;
-- ALTER TABLE contacts ADD CONSTRAINT contacts_role_check CHECK (role IN ('original', 'values')); -- Uncomment and adjust as needed

-- Drop the lead scoring function
DROP FUNCTION IF EXISTS calculate_lead_score(UUID);

-- Drop update trigger function if it was created
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

PRINT 'Rollback completed. Please verify your data and constraints are restored correctly.';