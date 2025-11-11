-- ===================================================================
-- SIMPLIFIED PRE-MIGRATION CHECK FOR YOUR SCENARIO
-- ===================================================================
-- Since you only have 5 users and no other data, let's focus on the key issue
-- ===================================================================

-- 1. Check what user roles currently exist (this is the main issue)
SELECT 'CURRENT USER ROLES:' as info, role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY count DESC;

-- 2. Show all user details to understand what we're working with
SELECT 'USER DETAILS:' as info, id, email, first_name, last_name, role, status 
FROM users 
ORDER BY email;

-- 3. Check for any problematic roles that need mapping
SELECT 'ROLES THAT NEED MAPPING:' as info, role, COUNT(*) as count 
FROM users 
WHERE role NOT IN ('manager', 'sales_rep')
GROUP BY role;

-- 4. Check if any users have NULL roles
SELECT 'USERS WITH NULL ROLES:' as info, COUNT(*) as count 
FROM users 
WHERE role IS NULL;