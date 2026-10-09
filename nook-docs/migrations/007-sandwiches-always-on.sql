-- =====================================================================================
-- MIGRATION 007 - SANDWICHES ARE ALWAYS ON
-- =====================================================================================
-- Staff can no longer switch sandwiches off in the admin portal - they are always offered
-- on the website (unless a required step has nothing in stock). The sandwiches_enabled
-- setting added in migration 005 is no longer used, so it is removed.
-- =====================================================================================

BEGIN;

DELETE FROM public.order_config WHERE config_key = 'sandwiches_enabled';

COMMIT;
