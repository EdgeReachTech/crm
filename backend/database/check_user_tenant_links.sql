-- Check if users are linked to the existing tenant
SELECT 'USER-TENANT RELATIONSHIP:' as info, 
       tenant_id,
       COUNT(*) as user_count,
       CASE 
         WHEN tenant_id = '4ab5d82b-30e2-4e42-b369-47d88ffe4f3c' THEN 'Linked to Default Organization'
         WHEN tenant_id IS NULL THEN 'No tenant assigned'
         ELSE 'Linked to different tenant'
       END as status
FROM users 
GROUP BY tenant_id;

-- Show all user details with tenant info
SELECT 'USER DETAILS WITH TENANT:' as info, 
       email, 
       role, 
       tenant_id,
       CASE 
         WHEN tenant_id = '4ab5d82b-30e2-4e42-b369-47d88ffe4f3c' THEN 'OK'
         WHEN tenant_id IS NULL THEN 'NEEDS TENANT'
         ELSE 'DIFFERENT TENANT'
       END as tenant_status
FROM users 
ORDER BY email;