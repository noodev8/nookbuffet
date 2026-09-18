-- =====================================================================================
-- MIGRATION 002 - REMOVE STRIPE
-- =====================================================================================
-- Payments are no longer taken online. Every order is created as 'unpaid' and staff
-- mark it 'paid' from the admin portal once the customer has paid.
--
-- Older orders keep whatever payment_status they had ('paid', 'waived' for staff
-- skips). 'pending' was the old default and never meant anything was paid, so it
-- becomes 'unpaid'. payment_method is left in place so older orders keep their history.
--
-- NOT YET APPLIED - review, back up, then run against the database.
-- The server works whether or not this has been run.
-- =====================================================================================

BEGIN;

UPDATE public.orders SET payment_status = 'unpaid' WHERE payment_status = 'pending' OR payment_status IS NULL;

ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'unpaid';

-- Never read or written by the code
ALTER TABLE public.orders DROP COLUMN IF EXISTS stripe_payment_intent_id;

COMMIT;
