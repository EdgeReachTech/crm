-- ===================================================================
-- PRE-MIGRATION DATABASE STATE CHECK
-- ===================================================================
-- Run this script BEFORE running the migration to understand current data
-- ===================================================================

-- Check current user roles and counts
SELECT 'USER ROLES:' as check_type, role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY count DESC;

-- Check for users with roles that won't be supported
SELECT 'USERS WITH UNSUPPORTED ROLES:' as check_type, role, COUNT(*) as count 
FROM users 
WHERE role NOT IN ('manager', 'sales_rep', 'admin', 'marketer')
GROUP BY role;

-- Check current lead statuses
SELECT 'LEAD STATUSES:' as check_type, status, COUNT(*) as count 
FROM leads 
GROUP BY status 
ORDER BY count DESC;

-- Check lead sources that might not be supported
SELECT 'LEAD SOURCES:' as check_type, source, COUNT(*) as count 
FROM leads 
WHERE source NOT IN ('website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other')
   OR source IS NULL
GROUP BY source;

-- Check current opportunity stages
SELECT 'OPPORTUNITY STAGES:' as check_type, stage, COUNT(*) as count 
FROM opportunities 
GROUP BY stage 
ORDER BY count DESC;

-- Check for opportunities with NULL values
SELECT 'OPPORTUNITIES WITH NULL VALUES:' as check_type, COUNT(*) as count 
FROM opportunities 
WHERE value IS NULL;

-- Check current contact roles
SELECT 'CONTACT ROLES:' as check_type, role, COUNT(*) as count 
FROM contacts 
GROUP BY role 
ORDER BY count DESC;

-- Check contact roles that might not be supported
SELECT 'CONTACTS WITH UNSUPPORTED ROLES:' as check_type, role, COUNT(*) as count 
FROM contacts 
WHERE role NOT IN ('decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'end_user')
   OR role IS NULL
GROUP BY role;

-- Check account sizes
SELECT 'ACCOUNT SIZES:' as check_type, size, COUNT(*) as count 
FROM accounts 
GROUP BY size 
ORDER BY count DESC;

-- Check account sizes that might not be supported
SELECT 'ACCOUNTS WITH UNSUPPORTED SIZES:' as check_type, size, COUNT(*) as count 
FROM accounts 
WHERE size NOT IN ('startup', 'small', 'medium', 'large', 'enterprise')
   OR size IS NULL
GROUP BY size;

-- Check for any NULL values that might cause issues
SELECT 'NULL VALUES CHECK:' as check_type, 
       'users.role' as field, 
       COUNT(*) as null_count 
FROM users 
WHERE role IS NULL
UNION ALL
SELECT 'NULL VALUES CHECK:' as check_type, 
       'leads.status' as field, 
       COUNT(*) as null_count 
FROM leads 
WHERE status IS NULL
UNION ALL
SELECT 'NULL VALUES CHECK:' as check_type, 
       'opportunities.stage' as field, 
       COUNT(*) as null_count 
FROM opportunities 
WHERE stage IS NULL;

-- Check table sizes
SELECT 'TABLE SIZES:' as check_type, 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'TABLE SIZES:' as check_type, 'leads' as table_name, COUNT(*) as record_count FROM leads
UNION ALL
SELECT 'TABLE SIZES:' as check_type, 'opportunities' as table_name, COUNT(*) as record_count FROM opportunities
UNION ALL
SELECT 'TABLE SIZES:' as check_type, 'contacts' as table_name, COUNT(*) as record_count FROM contacts
UNION ALL
SELECT 'TABLE SIZES:' as check_type, 'accounts' as table_name, COUNT(*) as record_count FROM accounts;