-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table first (for multi-tenancy)
CREATE TABLE tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (Sales-focused: sales_rep, manager roles only)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('manager', 'sales_rep')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    profile_image TEXT,
    -- Sales performance tracking
    monthly_quota DECIMAL DEFAULT 0,
    yearly_quota DECIMAL DEFAULT 0,
    current_revenue DECIMAL DEFAULT 0,
    -- Sales preferences
    preferences JSONB DEFAULT '{
        "notification_settings": {
            "follow_ups": true,
            "deal_updates": true
        },
        "working_hours": {
            "start": "09:00",
            "end": "17:00",
            "timezone": "UTC"
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_stages table (configurable pipeline stages)
CREATE TABLE sales_stages (
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

-- Insert default sales stages
INSERT INTO sales_stages (tenant_id, name, stage_order, stage_type, probability_weight) VALUES
    ('00000000-0000-0000-0000-000000000000', 'New Lead', 1, 'lead', 5),
    ('00000000-0000-0000-0000-000000000000', 'Contacted', 2, 'lead', 10),
    ('00000000-0000-0000-0000-000000000000', 'Interested', 3, 'lead', 20),
    ('00000000-0000-0000-0000-000000000000', 'Qualified Prospect', 4, 'prospect', 30),
    ('00000000-0000-0000-0000-000000000000', 'Needs Analysis', 5, 'prospect', 45),
    ('00000000-0000-0000-0000-000000000000', 'Solution Proposed', 6, 'opportunity', 65),
    ('00000000-0000-0000-0000-000000000000', 'Negotiation', 7, 'opportunity', 85),
    ('00000000-0000-0000-0000-000000000000', 'Closed Won', 8, 'client', 100),
    ('00000000-0000-0000-0000-000000000000', 'Closed Lost', 9, 'client', 0);

-- Create accounts table (simplified for sales focus)
CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    annual_revenue DECIMAL,
    employee_count INTEGER,
    phone TEXT,
    address TEXT,
    owner_id UUID REFERENCES users(id),
    -- Sales tracking
    total_revenue DECIMAL DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    relationship_status TEXT CHECK (relationship_status IN ('prospect', 'client', 'partner', 'inactive')) DEFAULT 'prospect',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table (simplified for sales focus)
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    role TEXT CHECK (role IN ('decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'end_user')) DEFAULT 'end_user',
    account_id UUID REFERENCES accounts(id),
    -- Sales specific fields
    is_primary_contact BOOLEAN DEFAULT FALSE,
    authority_level TEXT CHECK (authority_level IN ('low', 'medium', 'high')) DEFAULT 'low',
    budget_influence BOOLEAN DEFAULT FALSE,
    last_contacted TIMESTAMP WITH TIME ZONE,
    contact_preference TEXT CHECK (contact_preference IN ('email', 'phone', 'meeting', 'no_contact')) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table (enhanced for sales workflow)
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    phone TEXT,
    title TEXT,
    -- Lead source and tracking
    source TEXT CHECK (source IN ('website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other')) NOT NULL,
    source_details TEXT, -- Additional context about the source
    -- Lead qualification and scoring
    score INTEGER CHECK (score >= 0 AND score <= 100) DEFAULT 0,
    interest_level TEXT CHECK (interest_level IN ('hot', 'warm', 'cold')) DEFAULT 'cold',
    qualification_status TEXT CHECK (qualification_status IN ('unqualified', 'marketing_qualified', 'sales_qualified')) DEFAULT 'unqualified',
    -- Sales process fields
    current_stage_id UUID REFERENCES sales_stages(id),
    owner_id UUID REFERENCES users(id),
    budget_range TEXT,
    timeline TEXT,
    pain_points TEXT,
    decision_maker_contact UUID REFERENCES contacts(id),
    -- Activity tracking
    last_contacted TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    -- Conversion tracking
    converted_to_opportunity BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunities table (enhanced for sales pipeline)
CREATE TABLE opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    value DECIMAL NOT NULL CHECK (value >= 0),
    -- Pipeline management
    current_stage_id UUID REFERENCES sales_stages(id),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
    expected_close_date DATE NOT NULL,
    actual_close_date DATE,
    -- Relationships
    lead_id UUID REFERENCES leads(id),
    account_id UUID REFERENCES accounts(id),
    primary_contact_id UUID REFERENCES contacts(id),
    owner_id UUID REFERENCES users(id) NOT NULL,
    -- Sales process details
    sales_process TEXT, -- BANT, MEDDIC, etc.
    budget_confirmed BOOLEAN DEFAULT FALSE,
    authority_identified BOOLEAN DEFAULT FALSE,
    need_established BOOLEAN DEFAULT FALSE,
    timeline_defined BOOLEAN DEFAULT FALSE,
    -- Competition and pricing
    competitors TEXT[],
    pricing_strategy TEXT,
    discount_percentage DECIMAL CHECK (discount_percentage >= 0 AND discount_percentage <= 100) DEFAULT 0,
    -- Outcome tracking
    outcome TEXT CHECK (outcome IN ('won', 'lost', 'no_decision')) NULL,
    lost_reason TEXT,
    lost_to_competitor TEXT,
    -- Activity tracking
    last_activity_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (all sales activities)
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT CHECK (activity_type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note')) NOT NULL,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'no_response')),
    -- Relationships
    owner_id UUID REFERENCES users(id) NOT NULL,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    contact_id UUID REFERENCES contacts(id),
    account_id UUID REFERENCES accounts(id),
    -- Activity details
    is_completed BOOLEAN DEFAULT FALSE,
    calendar_event_id TEXT, -- For calendar integration
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_action TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure at least one entity is linked
    CONSTRAINT at_least_one_entity CHECK (
        lead_id IS NOT NULL OR 
        opportunity_id IS NOT NULL OR 
        contact_id IS NOT NULL OR 
        account_id IS NOT NULL
    )
);

-- Create follow_ups table (reminders and scheduled tasks)
CREATE TABLE follow_ups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    -- Relationships
    owner_id UUID REFERENCES users(id) NOT NULL,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    contact_id UUID REFERENCES contacts(id),
    account_id UUID REFERENCES accounts(id),
    -- Integration
    calendar_event_id TEXT, -- For calendar sync
    reminder_minutes INTEGER DEFAULT 15,
    -- Completion tracking
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_activity_id UUID REFERENCES activities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure at least one entity is linked
    CONSTRAINT at_least_one_entity_followup CHECK (
        lead_id IS NOT NULL OR 
        opportunity_id IS NOT NULL OR 
        contact_id IS NOT NULL OR 
        account_id IS NOT NULL
    )
);

-- Create revenue_tracking table (detailed revenue analytics)
CREATE TABLE revenue_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    opportunity_id UUID REFERENCES opportunities(id) NOT NULL,
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    revenue_amount DECIMAL NOT NULL CHECK (revenue_amount >= 0),
    revenue_date DATE NOT NULL,
    revenue_type TEXT CHECK (revenue_type IN ('new_business', 'upsell', 'renewal', 'expansion')) DEFAULT 'new_business',
    commission_rate DECIMAL CHECK (commission_rate >= 0 AND commission_rate <= 1) DEFAULT 0,
    commission_amount DECIMAL DEFAULT 0,
    -- Period tracking
    revenue_month INTEGER CHECK (revenue_month >= 1 AND revenue_month <= 12),
    revenue_quarter INTEGER CHECK (revenue_quarter >= 1 AND revenue_quarter <= 4),
    revenue_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create manager_comments table (coaching and feedback)
CREATE TABLE manager_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    manager_id UUID REFERENCES users(id) NOT NULL,
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('coaching', 'feedback', 'approval', 'instruction')) NOT NULL,
    comment TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    -- Relationships
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    activity_id UUID REFERENCES activities(id),
    -- Status tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    requires_action BOOLEAN DEFAULT FALSE,
    action_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_targets table (quota and goal management)
CREATE TABLE sales_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    sales_rep_id UUID REFERENCES users(id) NOT NULL,
    target_period TEXT CHECK (target_period IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
    target_year INTEGER NOT NULL,
    target_month INTEGER CHECK (target_month >= 1 AND target_month <= 12), -- NULL for quarterly/yearly
    target_quarter INTEGER CHECK (target_quarter >= 1 AND target_quarter <= 4), -- NULL for monthly/yearly
    -- Targets
    revenue_target DECIMAL NOT NULL CHECK (revenue_target >= 0),
    deals_target INTEGER DEFAULT 0,
    activities_target INTEGER DEFAULT 0,
    -- Actual performance
    actual_revenue DECIMAL DEFAULT 0,
    actual_deals INTEGER DEFAULT 0,
    actual_activities INTEGER DEFAULT 0,
    -- Progress tracking
    target_progress DECIMAL DEFAULT 0 CHECK (target_progress >= 0 AND target_progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, sales_rep_id, target_period, target_year, target_month, target_quarter)
);

-- Create email_templates table (for consistent communication)
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('initial_contact', 'follow_up', 'proposal', 'thank_you', 'closing', 'lost_deal')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    -- Template variables like {{first_name}}, {{company}}, etc.
    variables JSONB DEFAULT '["first_name", "last_name", "company"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_interactions table (post-sale relationship management)
CREATE TABLE client_interactions (
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

-- Create updated_at triggers function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create lead scoring function
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    activity_count INTEGER;
    days_since_created INTEGER;
    lead_source TEXT;
BEGIN
    -- Get lead data
    SELECT source, EXTRACT(DAYS FROM NOW() - created_at) 
    INTO lead_source, days_since_created
    FROM leads WHERE id = lead_id;
    
    -- Source scoring
    score := CASE lead_source
        WHEN 'referral' THEN 30
        WHEN 'linkedin' THEN 25
        WHEN 'website' THEN 20
        WHEN 'event' THEN 20
        WHEN 'cold_outreach' THEN 10
        ELSE 5
    END;
    
    -- Activity scoring
    SELECT COUNT(*) INTO activity_count
    FROM activities 
    WHERE activities.lead_id = calculate_lead_score.lead_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    score := score + (activity_count * 5);
    
    -- Recency penalty
    IF days_since_created > 30 THEN
        score := score - (days_since_created - 30);
    END IF;
    
    -- Ensure score is within bounds
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_stages_updated_at BEFORE UPDATE ON sales_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_tracking_updated_at BEFORE UPDATE ON revenue_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manager_comments_updated_at BEFORE UPDATE ON manager_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON sales_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_interactions_updated_at BEFORE UPDATE ON client_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Tenants policies
CREATE POLICY "Users can view their own tenant"
    ON tenants
    FOR SELECT
    USING (id IN (
        SELECT tenant_id 
        FROM users 
        WHERE auth.uid() = id
    ));

-- Users policies
CREATE POLICY "Users can view users in their tenant"
    ON users
    FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id 
        FROM users 
        WHERE auth.uid() = id
    ));

CREATE POLICY "Users can update their own record"
    ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Sales-specific policies
CREATE POLICY "Sales reps can view their own leads"
    ON leads
    FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = leads.tenant_id
        )
    );

CREATE POLICY "Sales reps can manage their own opportunities"
    ON opportunities
    FOR ALL
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = opportunities.tenant_id
        )
    );

CREATE POLICY "Activity visibility based on ownership"
    ON activities
    FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = activities.tenant_id
        )
    );

-- Manager comment policies
CREATE POLICY "Managers can create comments"
    ON manager_comments
    FOR INSERT
    WITH CHECK (
        manager_id = auth.uid() AND
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager'
        )
    );

CREATE POLICY "Users can view their relevant comments"
    ON manager_comments
    FOR SELECT
    USING (
        sales_rep_id = auth.uid() OR 
        manager_id = auth.uid()
    );

-- Common tenant-based policies (applied to remaining tables)
DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('sales_stages', 'accounts', 'contacts', 'follow_ups', 'revenue_tracking', 'sales_targets', 'email_templates', 'client_interactions')
    LOOP
        EXECUTE format('CREATE POLICY "Users can view records in their tenant" ON %I FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can insert records in their tenant" ON %I FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can update records in their tenant" ON %I FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can delete records in their tenant" ON %I FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
    END LOOP;
END $$;

-- Create indexes for performance
CREATE INDEX idx_leads_owner_tenant ON leads(owner_id, tenant_id);
CREATE INDEX idx_leads_stage ON leads(current_stage_id);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_opportunities_owner_tenant ON opportunities(owner_id, tenant_id);
CREATE INDEX idx_opportunities_stage ON opportunities(current_stage_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_owner ON activities(owner_id);
CREATE INDEX idx_follow_ups_due ON follow_ups(due_date);
CREATE INDEX idx_follow_ups_owner ON follow_ups(owner_id);
CREATE INDEX idx_revenue_date ON revenue_tracking(revenue_date DESC);
CREATE INDEX idx_revenue_rep ON revenue_tracking(sales_rep_id);
CREATE INDEX idx_sales_targets_period ON sales_targets(sales_rep_id, target_period, target_year);
CREATE INDEX idx_client_interactions_account ON client_interactions(client_account_id, interaction_date DESC);