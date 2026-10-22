-- =====================================================================================
-- MIGRATION 012 - NO LENGTH LIMIT ON CONFIG VALUES
-- =====================================================================================
-- Blocked sandwich slots are kept in order_config as one JSON value covering every day
-- staff have blocked times on. config_value was varchar(100), so saving failed after
-- only a handful of blocked slots. Make it text so any number of slots can be blocked.
-- =====================================================================================

BEGIN;

ALTER TABLE public.order_config ALTER COLUMN config_value TYPE text;

COMMIT;
