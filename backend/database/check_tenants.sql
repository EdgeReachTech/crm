-- Check if tenants table exists and what data it contains
SELECT 'TENANTS TABLE CHECK:' as info, COUNT(*) as tenant_count FROM tenants;

-- If tenants table exists, show the structure
SELECT 'TENANT DATA:' as info, id, name FROM tenants LIMIT 5;