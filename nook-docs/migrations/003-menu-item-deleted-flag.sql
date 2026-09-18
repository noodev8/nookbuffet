-- =====================================================================================
-- MIGRATION 003 - SEPARATE "DELETED" FROM "OUT OF STOCK" ON MENU ITEMS
-- =====================================================================================
-- menu_items.is_active was used for two things: "out of stock" and "deleted". A deleted
-- item therefore came back in the admin portal as "Out of stock", and one click on its
-- stock button put it back on the website.
--
-- is_active now only means in/out of stock. Deleting an item sets is_deleted = true.
-- Rows are never removed because past orders reference them.
--
-- The server works without it (a deleted item then just shows as out of stock, as
-- before). Restart nook-server after running it so it picks up the new column.
--
-- Items that were deleted before this migration cannot be told apart from items that
-- are out of stock, so they stay as "Out of stock". Delete them again from the Menu page.
-- =====================================================================================

BEGIN;

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

COMMIT;
