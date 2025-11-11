# 🚀 SUPABASE MIGRATION GUIDE - SALES CRM REFACTOR

## ⚠️ **CRITICAL: READ BEFORE MIGRATING**

### **Pre-Migration Checklist**
- [ ] **Backup your database** using Supabase dashboard
- [ ] Test migration on a staging/copy database first
- [ ] **Run pre-migration check** to see current data state
- [ ] Inform users of potential downtime
- [ ] Have rollback plan ready

---

## 📋 **MIGRATION PROCESS**

### **Step 0: Check Current Database State**
```bash
# Run this first to understand your current data
# Copy and paste pre_migration_check.sql in Supabase SQL Editor
```
This will show you current user roles, lead statuses, and other important data that will be migrated.

### **Step 1: Create Database Backup**
```sql
-- Run in Supabase SQL Editor to create backup tables
CREATE TABLE leads_backup AS SELECT * FROM leads;
CREATE TABLE opportunities_backup AS SELECT * FROM opportunities;
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE accounts_backup AS SELECT * FROM accounts;
CREATE TABLE contacts_backup AS SELECT * FROM contacts;
```

### **Step 2: Run Main Migration**
1. Open Supabase SQL Editor
2. Copy and paste `migration_to_sales_crm.sql`
3. **Run sections individually** (not all at once)
4. Monitor for errors after each step
5. If you get role constraint errors, the migration script now handles role mapping automatically

**Common Issues:**
- **Role constraint errors**: The script now maps existing roles (admin→manager, others→sales_rep)
- **Missing columns**: Use `IF NOT EXISTS` clauses are included to prevent errors

### **Step 3: Run Security Migration**
1. After main migration completes successfully
2. Copy and paste `migration_rls_security.sql`
3. Run the entire script
4. Verify RLS policies are working

### **Step 4: Verify Migration**
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sales_stages', 'activities', 'follow_ups', 'revenue_tracking');

-- Check data migration
SELECT COUNT(*) as lead_count FROM leads;
SELECT COUNT(*) as opportunity_count FROM opportunities;

-- Check stages are populated
SELECT tenant_id, COUNT(*) as stage_count FROM sales_stages GROUP BY tenant_id;

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM leads LIMIT 1;
```

---

## 🔄 **WHAT THE MIGRATION DOES**

### **Preserves Existing Data**
✅ All existing leads, opportunities, users, accounts, contacts  
✅ Existing relationships and foreign keys  
✅ Historical timestamps and metadata  

### **Adds New Features**
✅ **Sales stages** - Configurable pipeline stages  
✅ **Enhanced lead scoring** - Automatic calculation  
✅ **Activity tracking** - All touchpoints logged  
✅ **Follow-up system** - Reminders and tasks  
✅ **Revenue analytics** - Detailed tracking  
✅ **Manager tools** - Coaching and oversight  
✅ **Email templates** - Standardized communication  
✅ **Client management** - Post-sale interactions  

### **Updates Existing Tables**
- **Users**: Added quota fields, updated role constraints
- **Leads**: Added qualification, scoring, stage tracking
- **Opportunities**: Added sales process fields, outcome tracking
- **Accounts**: Added revenue tracking, relationship status
- **Contacts**: Added authority levels, contact preferences

---

## ⚠️ **POTENTIAL ISSUES & SOLUTIONS**

### **Issue 1: Role Constraint Violations**
If you have users with roles other than 'sales_rep' or 'manager':
```sql
-- Before migration, update roles:
UPDATE users SET role = 'manager' WHERE role IN ('admin', 'marketer');
-- Or create custom mapping based on your needs
```

### **Issue 2: Missing Source Values**
If leads have source values not in new constraints:
```sql
-- Check existing source values
SELECT DISTINCT source FROM leads;
-- Update invalid sources:
UPDATE leads SET source = 'other' WHERE source NOT IN 
    ('website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other');
```

### **Issue 3: Null Opportunity Values**
```sql
-- Check for null values
SELECT COUNT(*) FROM opportunities WHERE value IS NULL;
-- Update null values before migration:
UPDATE opportunities SET value = 0 WHERE value IS NULL;
```

### **Issue 4: Foreign Key Issues**
```sql
-- Check for orphaned records before migration
SELECT COUNT(*) FROM leads WHERE owner_id NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM opportunities WHERE owner_id NOT IN (SELECT id FROM users);
```

---

## 🔙 **ROLLBACK PROCEDURE**

If migration fails or you need to rollback:

### **Option 1: Restore from Backup Tables**
```sql
-- Drop new tables if created
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS revenue_tracking CASCADE;
DROP TABLE IF EXISTS sales_targets CASCADE;
DROP TABLE IF EXISTS manager_comments CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS client_interactions CASCADE;
DROP TABLE IF EXISTS sales_stages CASCADE;

-- Restore original tables
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ... continue for other tables

-- Recreate from backup
CREATE TABLE leads AS SELECT * FROM leads_backup;
CREATE TABLE opportunities AS SELECT * FROM opportunities_backup;
CREATE TABLE users AS SELECT * FROM users_backup;
-- ... continue for other tables

-- Recreate constraints and relationships (you'll need your original schema)
```

### **Option 2: Full Database Restore**
Use Supabase's point-in-time recovery or restore from full backup taken before migration.

---

## 🧪 **TESTING AFTER MIGRATION**

### **Basic Functionality Tests**
```sql
-- Test lead creation
INSERT INTO leads (tenant_id, first_name, last_name, company, source, owner_id) 
VALUES ('your-tenant-id', 'Test', 'Lead', 'Test Company', 'website', 'your-user-id');

-- Test opportunity creation
INSERT INTO opportunities (tenant_id, name, value, current_stage_id, expected_close_date, owner_id)
VALUES ('your-tenant-id', 'Test Deal', 1000, 
    (SELECT id FROM sales_stages WHERE name = 'Qualified Prospect' LIMIT 1),
    '2024-12-31', 'your-user-id');

-- Test activity creation
INSERT INTO activities (tenant_id, title, activity_type, activity_date, owner_id, lead_id)
VALUES ('your-tenant-id', 'Test Call', 'call', NOW(), 'your-user-id', 
    (SELECT id FROM leads WHERE first_name = 'Test' LIMIT 1));
```

### **RLS Testing**
```sql
-- Test as sales rep (should only see own records)
SELECT COUNT(*) FROM leads WHERE owner_id != 'current-user-id'; -- Should be 0

-- Test as manager (should see all team records)
SELECT COUNT(*) FROM leads; -- Should see all leads in tenant
```

---

## 📊 **POST-MIGRATION TASKS**

### **1. Update Application Code**
- Update API endpoints to use new fields
- Modify frontend components for new schema
- Update validation rules

### **2. Data Population**
```sql
-- Set default sales stages for existing data
UPDATE leads SET current_stage_id = (
    SELECT id FROM sales_stages 
    WHERE name = 'New Lead' 
    AND tenant_id = leads.tenant_id 
    LIMIT 1
) WHERE current_stage_id IS NULL;

-- Calculate initial lead scores
UPDATE leads SET score = calculate_lead_score(id);

-- Set initial quotas for sales reps
UPDATE users SET monthly_quota = 10000, yearly_quota = 120000 
WHERE role = 'sales_rep' AND monthly_quota = 0;
```

### **3. Create Initial Templates**
```sql
-- Insert default email templates
INSERT INTO email_templates (tenant_id, name, subject, body, template_type, created_by)
SELECT DISTINCT 
    tenant_id,
    'Initial Contact',
    'Great to connect, {{first_name}}!',
    'Hi {{first_name}},\n\nThanks for your interest in our services...',
    'initial_contact',
    (SELECT id FROM users WHERE role = 'manager' AND tenant_id = tenants.id LIMIT 1)
FROM tenants;
```

---

## � **ROLLBACK PROCEDURE**

If something goes wrong during migration, you can rollback:

### **Emergency Rollback**
```sql
-- Use rollback_migration.sql
-- This will drop new tables and columns added by the migration
-- ⚠️ WARNING: This will lose any new data created after migration
```

### **Manual Data Restoration**
```sql
-- If you have backup tables, restore them:
DROP TABLE leads CASCADE;
CREATE TABLE leads AS SELECT * FROM leads_backup;
-- Repeat for other tables

-- Restore original constraints (adjust for your original schema)
```

---

## �🚨 **EMERGENCY CONTACTS**

If migration fails:
1. **Stop immediately** - Don't continue with failed migration
2. **Document the error** - Copy error messages
3. **Check backup integrity** - Ensure backups are valid
4. **Contact your DBA/DevOps team**
5. **Consider rollback** - Use procedures above

---

## ✅ **MIGRATION SUCCESS CHECKLIST**

- [ ] All existing data preserved
- [ ] New tables created successfully
- [ ] Default sales stages populated
- [ ] RLS policies working correctly
- [ ] Indexes created for performance
- [ ] Views created for analytics
- [ ] Test data operations working
- [ ] Application connects successfully
- [ ] No foreign key violations
- [ ] Performance is acceptable

---

**🎯 Ready to transform your CRM into a sales powerhouse!**