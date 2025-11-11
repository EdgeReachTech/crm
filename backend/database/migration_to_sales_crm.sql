-- ===================================================================
-- SUPABASE MIGRATION SCRIPT - SALES CRM REFACTOR
-- ===================================================================
-- IMPORTANT: This script updates existing tables and adds new ones
-- Run in Supabase SQL Editor step by step, NOT all at once
-- ===================================================================

-- ===================================================================
-- STEP 1: PRE-MIGRATION CHECKS (Run these first to see current state)
-- ===================================================================
-- Check current user roles (uncomment to run):
-- SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role;
-- 
-- Check current lead statuses:
-- SELECT DISTINCT status, COUNT(*) as count FROM leads GROUP BY status;
-- 
-- Check current opportunity stages:
-- SELECT DISTINCT stage, COUNT(*) as count FROM opportunities GROUP BY stage;

-- ===================================================================
-- STEP 2: UPDATE USERS TABLE (Sales-focused roles)
-- ===================================================================
-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS monthly_quota DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS yearly_quota DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_revenue DECIMAL DEFAULT 0;

-- Update existing roles to match new constraints
-- Map common admin roles to manager
UPDATE users SET role = 'manager' 
WHERE role IN ('admin', 'administrator', 'manager', 'supervisor', 'lead', 'marketer', 'marketing');

-- Map other roles to sales_rep
UPDATE users SET role = 'sales_rep' 
WHERE role NOT IN ('manager');

-- Now safely add the role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('manager', 'sales_rep'));

-- Update preferences structure (preserve existing data)
UPDATE users SET preferences = COALESCE(preferences, '{}'::jsonb) || '{
    "notification_settings": {
        "follow_ups": true,
        "deal_updates": true
    },
    "working_hours": {
        "start": "09:00",
        "end": "17:00", 
        "timezone": "UTC"
    }
}'::jsonb;

-- ===================================================================
-- STEP 3: CREATE NEW SALES STAGES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS sales_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    stage_type TEXT CHECK (stage_type IN ('lead', 'prospect', 'opportunity', 'client')) NOT NULL,
    probability_weight INTEGER CHECK (probability_weight >= 0 AND probability_weight <= 100) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name),
    UNIQUE(tenant_id, stage_order)
);

-- Insert default stages for existing tenants
-- First check if tenants exist, if not create stages without tenant_id for now
DO $$
DECLARE
    tenant_count INTEGER;
    tenant_rec RECORD;
BEGIN
    -- Check if tenants table has data
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    
    IF tenant_count > 0 THEN
        -- Insert stages for each existing tenant
        FOR tenant_rec IN SELECT id FROM tenants LOOP
            INSERT INTO sales_stages (tenant_id, name, stage_order, stage_type, probability_weight) VALUES
            (tenant_rec.id, 'New Lead', 1, 'lead', 5),
            (tenant_rec.id, 'Contacted', 2, 'lead', 10),
            (tenant_rec.id, 'Interested', 3, 'lead', 20),
            (tenant_rec.id, 'Qualified Prospect', 4, 'prospect', 30),
            (tenant_rec.id, 'Needs Analysis', 5, 'prospect', 45),
            (tenant_rec.id, 'Solution Proposed', 6, 'opportunity', 65),
            (tenant_rec.id, 'Negotiation', 7, 'opportunity', 85),
            (tenant_rec.id, 'Closed Won', 8, 'client', 100),
            (tenant_rec.id, 'Closed Lost', 9, 'client', 0)
            ON CONFLICT (tenant_id, name) DO NOTHING;
        END LOOP;
    ELSE
        -- If no tenants exist, create a default tenant first
        INSERT INTO tenants (id, name) VALUES 
        ('00000000-0000-0000-0000-000000000000', 'Default Organization')
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert default stages for the default tenant
        INSERT INTO sales_stages (tenant_id, name, stage_order, stage_type, probability_weight) VALUES
        ('00000000-0000-0000-0000-000000000000', 'New Lead', 1, 'lead', 5),
        ('00000000-0000-0000-0000-000000000000', 'Contacted', 2, 'lead', 10),
        ('00000000-0000-0000-0000-000000000000', 'Interested', 3, 'lead', 20),
        ('00000000-0000-0000-0000-000000000000', 'Qualified Prospect', 4, 'prospect', 30),
        ('00000000-0000-0000-0000-000000000000', 'Needs Analysis', 5, 'prospect', 45),
        ('00000000-0000-0000-0000-000000000000', 'Solution Proposed', 6, 'opportunity', 65),
        ('00000000-0000-0000-0000-000000000000', 'Negotiation', 7, 'opportunity', 85),
        ('00000000-0000-0000-0000-000000000000', 'Closed Won', 8, 'client', 100),
        ('00000000-0000-0000-0000-000000000000', 'Closed Lost', 9, 'client', 0)
        ON CONFLICT (tenant_id, name) DO NOTHING;
    END IF;
END $$;

-- ===================================================================
-- STEP 4: UPDATE LEADS TABLE
-- ===================================================================
-- Add new columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS source_details TEXT,
ADD COLUMN IF NOT EXISTS interest_level TEXT CHECK (interest_level IN ('hot', 'warm', 'cold')) DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS qualification_status TEXT CHECK (qualification_status IN ('unqualified', 'marketing_qualified', 'sales_qualified')) DEFAULT 'unqualified',
ADD COLUMN IF NOT EXISTS current_stage_id UUID REFERENCES sales_stages(id),
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS pain_points TEXT,
ADD COLUMN IF NOT EXISTS decision_maker_contact UUID REFERENCES contacts(id),
ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS converted_to_opportunity BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMP WITH TIME ZONE;

-- Clean up invalid source values before adding constraint
UPDATE leads SET source = 'other' WHERE source NOT IN ('website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other') OR source IS NULL;

-- Update source constraints
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE leads ADD CONSTRAINT leads_source_check 
    CHECK (source IN ('website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other'));

-- Map existing status to new fields
UPDATE leads SET 
    qualification_status = CASE 
        WHEN status = 'qualified' THEN 'sales_qualified'
        WHEN status = 'contacted' THEN 'marketing_qualified'
        ELSE 'unqualified'
    END,
    interest_level = CASE 
        WHEN score > 70 THEN 'hot'
        WHEN score > 40 THEN 'warm'
        ELSE 'cold'
    END;

-- Set current_stage_id based on existing status
UPDATE leads SET current_stage_id = (
    SELECT s.id FROM sales_stages s 
    WHERE s.tenant_id = leads.tenant_id 
    AND s.name = CASE 
        WHEN leads.status = 'new' THEN 'New Lead'
        WHEN leads.status = 'contacted' THEN 'Contacted'
        WHEN leads.status = 'qualified' THEN 'Qualified Prospect'
        ELSE 'New Lead'
    END
    LIMIT 1
);

-- ===================================================================
-- STEP 5: UPDATE OPPORTUNITIES TABLE
-- ===================================================================
-- Add new columns to opportunities table
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS current_stage_id UUID REFERENCES sales_stages(id),
ADD COLUMN IF NOT EXISTS actual_close_date DATE,
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES contacts(id),
ADD COLUMN IF NOT EXISTS sales_process TEXT,
ADD COLUMN IF NOT EXISTS budget_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS authority_identified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS need_established BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS timeline_defined BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS competitors TEXT[],
ADD COLUMN IF NOT EXISTS pricing_strategy TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL CHECK (discount_percentage >= 0 AND discount_percentage <= 100) DEFAULT 0,
ADD COLUMN IF NOT EXISTS outcome TEXT CHECK (outcome IN ('won', 'lost', 'no_decision')) NULL,
ADD COLUMN IF NOT EXISTS lost_reason TEXT,
ADD COLUMN IF NOT EXISTS lost_to_competitor TEXT,
ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMP WITH TIME ZONE;

-- Map existing stage to new stage_id
UPDATE opportunities SET current_stage_id = (
    SELECT s.id FROM sales_stages s 
    WHERE s.tenant_id = opportunities.tenant_id 
    AND s.name = CASE 
        WHEN opportunities.stage = 'qualified' THEN 'Qualified Prospect'
        WHEN opportunities.stage = 'discovery' THEN 'Needs Analysis'
        WHEN opportunities.stage = 'proposal' THEN 'Solution Proposed'
        WHEN opportunities.stage = 'negotiation' THEN 'Negotiation'
        WHEN opportunities.stage = 'closed_won' THEN 'Closed Won'
        WHEN opportunities.stage = 'closed_lost' THEN 'Closed Lost'
        ELSE 'Qualified Prospect'
    END
    LIMIT 1
);

-- Set outcome based on existing stage
UPDATE opportunities SET 
    outcome = CASE 
        WHEN stage = 'closed_won' THEN 'won'
        WHEN stage = 'closed_lost' THEN 'lost'
        ELSE NULL
    END,
    actual_close_date = CASE 
        WHEN stage IN ('closed_won', 'closed_lost') THEN expected_close_date
        ELSE NULL
    END;

-- Ensure value is not null
UPDATE opportunities SET value = 0 WHERE value IS NULL;
ALTER TABLE opportunities ALTER COLUMN value SET NOT NULL;

-- ===================================================================
-- STEP 6: UPDATE ACCOUNTS TABLE
-- ===================================================================
-- Add new columns to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS relationship_status TEXT CHECK (relationship_status IN ('prospect', 'client', 'partner', 'inactive')) DEFAULT 'prospect';

-- Clean up invalid size values before adding constraint
UPDATE accounts SET size = 'small' WHERE size NOT IN ('startup', 'small', 'medium', 'large', 'enterprise') OR size IS NULL;

-- Update size constraints
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_size_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_size_check 
    CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise'));

-- ===================================================================
-- STEP 7: UPDATE CONTACTS TABLE  
-- ===================================================================
-- Add new columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS authority_level TEXT CHECK (authority_level IN ('low', 'medium', 'high')) DEFAULT 'low',
ADD COLUMN IF NOT EXISTS budget_influence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_preference TEXT CHECK (contact_preference IN ('email', 'phone', 'meeting', 'no_contact')) DEFAULT 'email';

-- Set default role for existing contacts with invalid or missing roles
UPDATE contacts SET role = 'end_user' WHERE role IS NULL OR role NOT IN ('decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'end_user');

-- Update role constraints
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_role_check;
ALTER TABLE contacts ADD CONSTRAINT contacts_role_check 
    CHECK (role IN ('decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'end_user'));

-- ===================================================================
-- STEP 8: CREATE NEW TABLES
-- ===================================================================

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT CHECK (activity_type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note')) NOT NULL,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'no_response')),
    owner_id UUID REFERENCES users(id) NOT NULL,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    contact_id UUID REFERENCES contacts(id),
    account_id UUID REFERENCES accounts(id),
    is_completed BOOLEAN DEFAULT FALSE,
    calendar_event_id TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_action TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT at_least_one_entity CHECK (
        lead_id IS NOT NULL OR 
        opportunity_id IS NOT NULL OR 
        contact_id IS NOT NULL OR 
        account_id IS NOT NULL
    )
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    owner_id UUID REFERENCES users(id) NOT NULL,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    contact_id UUID REFERENCES contacts(id),
    account_id UUID REFERENCES accounts(id),
    calendar_event_id TEXT,
    reminder_minutes INTEGER DEFAULT 15,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_activity_id UUID REFERENCES activities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT at_least_one_entity_followup CHECK (
        lead_id IS NOT NULL OR 
        opportunity_id IS NOT NULL OR 
        contact_id IS NOT NULL OR 
        account_id IS NOT NULL
    )
);

-- Revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    opportunity_id UUID REFERENCES opportunities(id) NOT NULL,
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    revenue_amount DECIMAL NOT NULL CHECK (revenue_amount >= 0),
    revenue_date DATE NOT NULL,
    revenue_type TEXT CHECK (revenue_type IN ('new_business', 'upsell', 'renewal', 'expansion')) DEFAULT 'new_business',
    commission_rate DECIMAL CHECK (commission_rate >= 0 AND commission_rate <= 1) DEFAULT 0,
    commission_amount DECIMAL DEFAULT 0,
    revenue_month INTEGER CHECK (revenue_month >= 1 AND revenue_month <= 12),
    revenue_quarter INTEGER CHECK (revenue_quarter >= 1 AND revenue_quarter <= 4),
    revenue_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales targets table
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    target_period TEXT CHECK (target_period IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
    target_year INTEGER NOT NULL,
    target_month INTEGER CHECK (target_month >= 1 AND target_month <= 12),
    target_quarter INTEGER CHECK (target_quarter >= 1 AND target_quarter <= 4),
    revenue_target DECIMAL NOT NULL CHECK (revenue_target >= 0),
    deals_target INTEGER DEFAULT 0,
    activities_target INTEGER DEFAULT 0,
    actual_revenue DECIMAL DEFAULT 0,
    actual_deals INTEGER DEFAULT 0,
    actual_activities INTEGER DEFAULT 0,
    target_progress DECIMAL DEFAULT 0 CHECK (target_progress >= 0 AND target_progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, sales_rep_id, target_period, target_year, target_month, target_quarter)
);

-- Manager comments table
CREATE TABLE IF NOT EXISTS manager_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    manager_id UUID REFERENCES users(id) NOT NULL,
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('coaching', 'feedback', 'approval', 'instruction')) NOT NULL,
    comment TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    activity_id UUID REFERENCES activities(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    requires_action BOOLEAN DEFAULT FALSE,
    action_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('initial_contact', 'follow_up', 'proposal', 'thank_you', 'closing', 'lost_deal')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    variables JSONB DEFAULT '["first_name", "last_name", "company"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client interactions table
CREATE TABLE IF NOT EXISTS client_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    client_account_id UUID REFERENCES accounts(id) NOT NULL,
    interaction_type TEXT CHECK (interaction_type IN ('onboarding', 'support', 'upsell', 'renewal', 'feedback', 'complaint')) NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'pending')),
    owner_id UUID REFERENCES users(id) NOT NULL,
    follow_up_required BOOLEAN DEFAULT FALSE,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- STEP 9: ADD TRIGGERS AND FUNCTIONS
-- ===================================================================

-- Lead scoring function
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    activity_count INTEGER;
    days_since_created INTEGER;
    lead_source TEXT;
BEGIN
    SELECT source, EXTRACT(DAYS FROM NOW() - created_at) 
    INTO lead_source, days_since_created
    FROM leads WHERE id = lead_id;
    
    score := CASE lead_source
        WHEN 'referral' THEN 30
        WHEN 'linkedin' THEN 25
        WHEN 'website' THEN 20
        WHEN 'event' THEN 20
        WHEN 'cold_outreach' THEN 10
        ELSE 5
    END;
    
    SELECT COUNT(*) INTO activity_count
    FROM activities 
    WHERE activities.lead_id = calculate_lead_score.lead_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    score := score + (activity_count * 5);
    
    IF days_since_created > 30 THEN
        score := score - (days_since_created - 30);
    END IF;
    
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for new tables
CREATE TRIGGER update_sales_stages_updated_at BEFORE UPDATE ON sales_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_tracking_updated_at BEFORE UPDATE ON revenue_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON sales_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manager_comments_updated_at BEFORE UPDATE ON manager_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_interactions_updated_at BEFORE UPDATE ON client_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================