# Migration Fix Summary

## Problem Fixed
The original migration script was failing with the error:
```
ERROR: 23514: check constraint "users_role_check" of relation "users" is violated by some row
```

## Root Cause
The migration script tried to add new role constraints to the `users` table before updating existing user roles to match the new allowed values. This caused a constraint violation if users had roles like 'admin', 'marketer', or other values not in the new constraint.

## Solutions Implemented

### 1. Fixed User Role Migration Order
**Before:** 
- Drop existing constraint
- Add new constraint (FAILED here if data didn't match)
- Update user roles

**After:**
- Update user roles first (admin/marketer → manager, others → sales_rep)  
- Drop existing constraint
- Add new constraint safely

### 2. Added Data Cleanup for All Constraints
- **Users:** Map existing roles properly before constraint
- **Leads:** Set invalid source values to 'other' before constraint
- **Accounts:** Set invalid size values to 'small' before constraint
- **Contacts:** Set invalid roles to 'end_user' before constraint

### 3. Created Supporting Scripts

#### `pre_migration_check.sql`
- Run BEFORE migration to see current data state
- Shows what roles, sources, sizes exist
- Identifies potential constraint violations

#### `rollback_migration.sql`
- Emergency rollback script if migration fails
- Drops new tables and columns
- Provides template for restoring original constraints

### 4. Updated Migration Guide
- Added step-by-step pre-migration checking
- Documented common issues and solutions
- Added rollback procedures

## Key Changes in Migration Script

```sql
-- OLD (problematic):
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('manager', 'sales_rep'));
UPDATE users SET role = 'manager' WHERE role IN ('admin', 'marketer');

-- NEW (fixed):
UPDATE users SET role = 'manager' WHERE role IN ('admin', 'administrator', 'manager', 'supervisor', 'lead', 'marketer', 'marketing');
UPDATE users SET role = 'sales_rep' WHERE role NOT IN ('manager');
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('manager', 'sales_rep'));
```

## Migration Process Now
1. Run `pre_migration_check.sql` to see current state
2. Create backups
3. Run `migration_to_sales_crm.sql` step by step
4. If issues arise, use `rollback_migration.sql`

## Files Modified
- `migration_to_sales_crm.sql` - Main migration script (fixed constraint order)
- `MIGRATION_GUIDE.md` - Updated with new process
- `pre_migration_check.sql` - New diagnostic script
- `rollback_migration.sql` - New emergency rollback script

The migration should now run successfully without constraint violations.