-- =====================================================================================
-- MIGRATION 010 - NO LIMIT ON SANDWICH FILLINGS
-- =====================================================================================
-- Customers can pick as much meat, cheese, salad and sauce as they like - anything past
-- what is included in the base price just costs extra (see migration 009).
-- Bread and Toasted? stay at one choice.
-- =====================================================================================

BEGIN;

UPDATE public.sandwich_steps SET max_choices = NULL
WHERE name IN ('Meat', 'Cheese', 'Salad', 'Sauce') AND is_deleted = false;

COMMIT;
