-- =====================================================================================
-- MIGRATION 011 - STAFF DON'T NEED AN EMAIL
-- =====================================================================================
-- Staff log in to the admin portal with just a username and password, so new staff
-- accounts no longer need an email. Existing emails are kept. Emails stay unique when
-- set (Postgres allows any number of NULLs under a UNIQUE constraint).
-- =====================================================================================

BEGIN;

ALTER TABLE public.admin_users ALTER COLUMN email DROP NOT NULL;

COMMIT;
