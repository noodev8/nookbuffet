-- =====================================================================================
-- MIGRATION 009 - SANDWICH PRICING BY STEP
-- =====================================================================================
-- The base price now covers any bread, 1 meat and 3 salad. Each step says how many picks
-- are included in the base price and what each pick after that costs:
--
--   included_choices    - picks included in the base price (NULL = all of them)
--   extra_choice_price  - what each pick after those costs
--
-- So Cheese (0 included, 40p) is 40p a cheese, and a second meat or a fourth salad is 40p.
-- Sauce and toasted stay free. Ciabatta and Brie lose their own 50p extra - any bread is
-- included, and Brie is priced like any other cheese. Staff can change all of this in the
-- admin portal afterwards.
--
-- Safe to run before deploying the new server code - it only adds columns.
-- =====================================================================================

BEGIN;

ALTER TABLE public.sandwich_steps ADD COLUMN IF NOT EXISTS included_choices integer CHECK (included_choices >= 0);
ALTER TABLE public.sandwich_steps ADD COLUMN IF NOT EXISTS extra_choice_price numeric(8,2) NOT NULL DEFAULT 0 CHECK (extra_choice_price >= 0);

COMMENT ON COLUMN public.sandwich_steps.included_choices IS 'Picks included in the base price (NULL = all of them)';
COMMENT ON COLUMN public.sandwich_steps.extra_choice_price IS 'What each pick after the included ones costs';

UPDATE public.sandwich_steps SET included_choices = 1, extra_choice_price = 0.40 WHERE name = 'Meat'   AND is_deleted = false;
UPDATE public.sandwich_steps SET included_choices = 0, extra_choice_price = 0.40 WHERE name = 'Cheese' AND is_deleted = false;
UPDATE public.sandwich_steps SET included_choices = 3, extra_choice_price = 0.40 WHERE name = 'Salad'  AND is_deleted = false;

UPDATE public.sandwich_options SET extra_price = 0 WHERE is_deleted = false AND extra_price <> 0;

COMMIT;
