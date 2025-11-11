-- Check users table structure and tenant references
SELECT 'USER TENANT CHECK:' as info, 
       COUNT(*) as total_users,
       COUNT(tenant_id) as users_with_tenant_id,
       COUNT(*) - COUNT(tenant_id) as users_without_tenant_id
FROM users;

-- Show sample user data
SELECT 'USER SAMPLE:' as info, id, email, role, tenant_id FROM users LIMIT 3;