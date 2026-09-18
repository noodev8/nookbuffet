-- =====================================================================================
-- MIGRATION 001 - REMOVE BRANCHES
-- =====================================================================================
-- The business now runs from a single location, so everything that scoped data to a
-- branch is gone: per-branch menus, per-branch buffet versions and prices, branch
-- assignment for staff, and the branch a given order belonged to.
--
-- Delivery was dropped at the same time. The branches table was the only place the
-- delivery radius and delivery timeslot lived, so those go with it.
--
-- NOT YET APPLIED — review, back up, then run against the database.
-- This drops columns and a table; the data in them cannot be recovered afterwards.
-- =====================================================================================

BEGIN;

-- ===== DROP FOREIGN KEYS POINTING AT branches =====
ALTER TABLE public.admin_users     DROP CONSTRAINT IF EXISTS admin_users_branch_id_fkey;
ALTER TABLE public.buffet_versions DROP CONSTRAINT IF EXISTS buffet_versions_branch_id_fkey;
ALTER TABLE public.menu_items      DROP CONSTRAINT IF EXISTS menu_items_branch_id_fkey;
ALTER TABLE public.orders          DROP CONSTRAINT IF EXISTS orders_branch_id_fkey;

-- ===== DROP INDEXES ON branch_id =====
DROP INDEX IF EXISTS public.idx_admin_users_branch_id;
DROP INDEX IF EXISTS public.idx_orders_branch_id;

-- ===== DROP THE branch_id COLUMNS =====
ALTER TABLE public.admin_users     DROP COLUMN IF EXISTS branch_id;
ALTER TABLE public.buffet_versions DROP COLUMN IF EXISTS branch_id;
ALTER TABLE public.menu_items      DROP COLUMN IF EXISTS branch_id;
ALTER TABLE public.orders          DROP COLUMN IF EXISTS branch_id;

-- ===== DROP THE branches TABLE =====
-- Takes branches_id_seq with it, since the sequence is owned by branches.id
DROP TABLE IF EXISTS public.branches;

-- ===== REFRESH COLUMN COMMENTS (orders are collection only now) =====
COMMENT ON COLUMN public.orders.fulfillment_date IS 'The date when the order should be collected';
COMMENT ON COLUMN public.orders.fulfillment_time IS 'The time when the order should be collected (format: HH:MM)';

COMMIT;
