-- =====================================================================================
-- MIGRATION 004 - TWO ADMIN ROLES: GENERAL AND ADMIN
-- =====================================================================================
-- The admin portal used to have three roles (staff, admin, manager). It now has two:
--
--   general - orders and prep summary
--   admin   - everything, including the menu and staff accounts
--
-- staff becomes general. admin and manager both become admin.
--
-- Run this before restarting nook-server with the new code, otherwise staff and
-- manager accounts are refused. Everyone then needs to log out and back in, because
-- their current login still carries the old role.
-- =====================================================================================

BEGIN;

UPDATE public.admin_users SET role = 'general' WHERE role = 'staff';
UPDATE public.admin_users SET role = 'admin'   WHERE role = 'manager';

ALTER TABLE public.admin_users ALTER COLUMN role SET DEFAULT 'general';

COMMENT ON COLUMN public.admin_users.role IS 'User role: admin, general';

COMMIT;
