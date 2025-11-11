-- ===================================================================
-- SUPABASE RLS & SECURITY MIGRATION - SALES CRM
-- ===================================================================
-- Run this AFTER the main migration script
-- This updates Row Level Security policies for the new schema
-- ===================================================================

-- ===================================================================
-- STEP 1: ENABLE RLS ON NEW TABLES
-- ===================================================================
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 2: UPDATE EXISTING POLICIES FOR LEADS
-- ===================================================================

-- Drop old lead policies if they exist
DROP POLICY IF EXISTS "Users can view records in their tenant" ON leads;
DROP POLICY IF EXISTS "Users can insert records in their tenant" ON leads;
DROP POLICY IF EXISTS "Users can update records in their tenant" ON leads;
DROP POLICY IF EXISTS "Users can delete records in their tenant" ON leads;

-- Create sales-specific lead policies
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

CREATE POLICY "Sales reps can create leads in their tenant"
    ON leads
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE auth.uid() = id
        )
    );

CREATE POLICY "Sales reps can update their own leads"
    ON leads
    FOR UPDATE
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = leads.tenant_id
        )
    );

CREATE POLICY "Sales reps can delete their own leads"
    ON leads
    FOR DELETE
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = leads.tenant_id
        )
    );

-- ===================================================================
-- STEP 3: UPDATE EXISTING POLICIES FOR OPPORTUNITIES
-- ===================================================================

-- Drop old opportunity policies if they exist
DROP POLICY IF EXISTS "Users can view records in their tenant" ON opportunities;
DROP POLICY IF EXISTS "Users can insert records in their tenant" ON opportunities;
DROP POLICY IF EXISTS "Users can update records in their tenant" ON opportunities;
DROP POLICY IF EXISTS "Users can delete records in their tenant" ON opportunities;

-- Create sales-specific opportunity policies
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

-- ===================================================================
-- STEP 4: CREATE POLICIES FOR ACTIVITIES
-- ===================================================================

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

CREATE POLICY "Users can create activities in their tenant"
    ON activities
    FOR INSERT
    WITH CHECK (
        owner_id = auth.uid() AND
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE auth.uid() = id
        )
    );

CREATE POLICY "Users can update their own activities"
    ON activities
    FOR UPDATE
    USING (
        owner_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'manager' 
            AND tenant_id = activities.tenant_id
        )
    );

-- ===================================================================
-- STEP 5: CREATE POLICIES FOR MANAGER COMMENTS
-- ===================================================================

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

CREATE POLICY "Managers can update their own comments"
    ON manager_comments
    FOR UPDATE
    USING (manager_id = auth.uid());

CREATE POLICY "Sales reps can mark comments as read"
    ON manager_comments
    FOR UPDATE
    USING (sales_rep_id = auth.uid())
    WITH CHECK (sales_rep_id = auth.uid());

-- ===================================================================
-- STEP 6: CREATE TENANT-BASED POLICIES FOR OTHER TABLES
-- ===================================================================

-- Standard tenant-based policies for remaining tables
DO $$ 
DECLARE
    table_name text;
    policy_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'sales_stages', 'accounts', 'contacts', 'follow_ups', 
            'revenue_tracking', 'sales_targets', 'email_templates', 'client_interactions'
        )
    LOOP
        -- Drop existing policies if they exist
        FOR policy_name IN 
            SELECT policyname FROM pg_policies WHERE tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS "%s" ON %I', policy_name, table_name);
        END LOOP;
        
        -- Create new policies
        EXECUTE format('CREATE POLICY "Users can view records in their tenant" ON %I FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can insert records in their tenant" ON %I FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can update records in their tenant" ON %I FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
        EXECUTE format('CREATE POLICY "Users can delete records in their tenant" ON %I FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE auth.uid() = id))', table_name);
    END LOOP;
END $$;

-- ===================================================================
-- STEP 7: CREATE PERFORMANCE INDEXES
-- ===================================================================

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_owner_tenant ON leads(owner_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_qualification ON leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_leads_interest ON leads(interest_level);

-- Indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_tenant ON opportunities(owner_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_value ON opportunities(value DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_outcome ON opportunities(outcome);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);

-- Indexes for follow-ups
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_owner ON follow_ups(owner_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_priority ON follow_ups(priority);

-- Indexes for revenue tracking
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_tracking(revenue_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_rep ON revenue_tracking(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_revenue_opportunity ON revenue_tracking(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_revenue_period ON revenue_tracking(revenue_year, revenue_quarter, revenue_month);

-- Indexes for sales targets
CREATE INDEX IF NOT EXISTS idx_sales_targets_period ON sales_targets(sales_rep_id, target_period, target_year);
CREATE INDEX IF NOT EXISTS idx_sales_targets_progress ON sales_targets(target_progress);

-- Indexes for sales stages
CREATE INDEX IF NOT EXISTS idx_sales_stages_type ON sales_stages(stage_type);
CREATE INDEX IF NOT EXISTS idx_sales_stages_order ON sales_stages(tenant_id, stage_order);

-- Indexes for manager comments
CREATE INDEX IF NOT EXISTS idx_manager_comments_rep ON manager_comments(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_manager_comments_manager ON manager_comments(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_comments_unread ON manager_comments(is_read) WHERE is_read = FALSE;

-- Indexes for client interactions
CREATE INDEX IF NOT EXISTS idx_client_interactions_account ON client_interactions(client_account_id, interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON client_interactions(interaction_type);

-- ===================================================================
-- STEP 8: CREATE USEFUL VIEWS FOR ANALYTICS
-- ===================================================================

-- Pipeline health view
CREATE OR REPLACE VIEW pipeline_health AS
SELECT 
    s.tenant_id,
    s.id as stage_id,
    s.name as stage_name,
    s.stage_type,
    s.probability_weight,
    COUNT(CASE WHEN l.current_stage_id = s.id THEN 1 END) as lead_count,
    COUNT(CASE WHEN o.current_stage_id = s.id THEN 1 END) as opportunity_count,
    COALESCE(SUM(CASE WHEN o.current_stage_id = s.id THEN o.value END), 0) as total_value,
    COALESCE(SUM(CASE WHEN o.current_stage_id = s.id THEN o.value * o.probability / 100.0 END), 0) as weighted_value
FROM sales_stages s
LEFT JOIN leads l ON s.id = l.current_stage_id
LEFT JOIN opportunities o ON s.id = o.current_stage_id
GROUP BY s.tenant_id, s.id, s.name, s.stage_type, s.probability_weight
ORDER BY s.stage_order;

-- Sales rep performance view
CREATE OR REPLACE VIEW sales_rep_performance AS
SELECT 
    u.id as user_id,
    u.tenant_id,
    u.first_name,
    u.last_name,
    u.monthly_quota,
    u.yearly_quota,
    u.current_revenue,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT o.id) as total_opportunities,
    COUNT(DISTINCT CASE WHEN o.outcome = 'won' THEN o.id END) as won_deals,
    COUNT(DISTINCT CASE WHEN o.outcome = 'lost' THEN o.id END) as lost_deals,
    COALESCE(SUM(CASE WHEN o.outcome = 'won' THEN o.value END), 0) as total_revenue,
    COUNT(DISTINCT a.id) as total_activities,
    ROUND(
        COUNT(DISTINCT CASE WHEN o.outcome = 'won' THEN o.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT CASE WHEN o.outcome IN ('won', 'lost') THEN o.id END), 0), 
        2
    ) as win_rate
FROM users u
LEFT JOIN leads l ON u.id = l.owner_id
LEFT JOIN opportunities o ON u.id = o.owner_id
LEFT JOIN activities a ON u.id = a.owner_id
WHERE u.role = 'sales_rep'
GROUP BY u.id, u.tenant_id, u.first_name, u.last_name, u.monthly_quota, u.yearly_quota, u.current_revenue;

-- Recent activities view
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    a.*,
    u.first_name || ' ' || u.last_name as owner_name,
    CASE 
        WHEN a.lead_id IS NOT NULL THEN 'Lead: ' || l.first_name || ' ' || l.last_name
        WHEN a.opportunity_id IS NOT NULL THEN 'Opportunity: ' || o.name
        WHEN a.contact_id IS NOT NULL THEN 'Contact: ' || c.first_name || ' ' || c.last_name
        WHEN a.account_id IS NOT NULL THEN 'Account: ' || acc.name
    END as entity_description
FROM activities a
JOIN users u ON a.owner_id = u.id
LEFT JOIN leads l ON a.lead_id = l.id
LEFT JOIN opportunities o ON a.opportunity_id = o.id
LEFT JOIN contacts c ON a.contact_id = c.id
LEFT JOIN accounts acc ON a.account_id = acc.id
ORDER BY a.activity_date DESC;

-- ===================================================================
-- RLS & SECURITY MIGRATION COMPLETE
-- ===================================================================