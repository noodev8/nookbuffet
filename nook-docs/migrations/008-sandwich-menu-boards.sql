-- =====================================================================================
-- MIGRATION 008 - SANDWICH MENU MATCHES THE SHOP BOARDS
-- =====================================================================================
-- Replaces the starter sandwich menu with what is on the boards in the shop:
-- Bread, Meat, Cheese, Salad, Sauce, then Toasted or not.
--
-- The old steps and options are soft-deleted (not removed) so past orders can still show
-- what was picked. Ciabatta and Brie keep their 50p extra; everything else is included
-- in the base price. Prices and limits can be changed in the admin portal afterwards.
-- =====================================================================================

BEGIN;

UPDATE public.sandwich_options SET is_deleted = true WHERE is_deleted = false;
UPDATE public.sandwich_steps SET is_deleted = true WHERE is_deleted = false;

-- min_choices 0 = optional, max_choices NULL = no limit
INSERT INTO public.sandwich_steps (name, min_choices, max_choices, "position") VALUES
    ('Bread',    1, 1,    0),
    ('Meat',     0, 2,    1),
    ('Cheese',   0, 2,    2),
    ('Salad',    0, NULL, 3),
    ('Sauce',    0, 3,    4),
    ('Toasted?', 1, 1,    5);

INSERT INTO public.sandwich_options (step_id, name, extra_price)
SELECT st.id, o.name, o.extra_price
FROM (VALUES
    ('Bread', 'White bread', 0.00, 1),
    ('Bread', 'Brown bread', 0.00, 2),
    ('Bread', 'Ciabatta',    0.50, 3),
    ('Bread', 'Bread roll',  0.00, 4),

    ('Meat', 'Beef',          0.00, 1),
    ('Meat', 'Ham',           0.00, 2),
    ('Meat', 'Chicken',       0.00, 3),
    ('Meat', 'Turkey',        0.00, 4),
    ('Meat', 'BBQ pulled pork', 0.00, 5),
    ('Meat', 'Tuna',          0.00, 6),
    ('Meat', 'Chicken tikka', 0.00, 7),
    ('Meat', 'Corned beef',   0.00, 8),
    ('Meat', 'Salami',        0.00, 9),
    ('Meat', 'Pepperami',     0.00, 10),
    ('Meat', 'Chorizo',       0.00, 11),

    ('Cheese', 'Cheese slice',  0.00, 1),
    ('Cheese', 'Grated cheese', 0.00, 2),
    ('Cheese', 'Mozzarella',    0.00, 3),
    ('Cheese', 'Feta',          0.00, 4),
    ('Cheese', 'Brie',          0.50, 5),
    ('Cheese', 'Halloumi',      0.00, 6),
    ('Cheese', 'Nacho cheese',  0.00, 7),
    ('Cheese', 'Cream cheese',  0.00, 8),

    ('Salad', 'Lettuce',      0.00, 1),
    ('Salad', 'Tomato',       0.00, 2),
    ('Salad', 'Onion',        0.00, 3),
    ('Salad', 'Red onion',    0.00, 4),
    ('Salad', 'Spring onion', 0.00, 5),
    ('Salad', 'Cucumber',     0.00, 6),
    ('Salad', 'Celery',       0.00, 7),
    ('Salad', 'Gherkins',     0.00, 8),
    ('Salad', 'Sweetcorn',    0.00, 9),
    ('Salad', 'Jalapeño',     0.00, 10),
    ('Salad', 'Beetroot',     0.00, 11),
    ('Salad', 'Avocado',      0.00, 12),
    ('Salad', 'Peppers',      0.00, 13),

    ('Sauce', 'Mayo',               0.00, 1),
    ('Sauce', 'Mustard',            0.00, 2),
    ('Sauce', 'Mustard mayo',       0.00, 3),
    ('Sauce', 'French mustard',     0.00, 4),
    ('Sauce', 'Wholegrain mustard', 0.00, 5),
    ('Sauce', 'BBQ sauce',          0.00, 6),
    ('Sauce', 'Sweet chilli',       0.00, 7),
    ('Sauce', 'Pickle sauce',       0.00, 8),
    ('Sauce', 'Horseradish',        0.00, 9),
    ('Sauce', 'Apple sauce',        0.00, 10),
    ('Sauce', 'Cranberry',          0.00, 11),
    ('Sauce', 'Stuffing',           0.00, 12),
    ('Sauce', 'Yoghurt & mint',     0.00, 13),

    ('Toasted?', 'Toasted',     0.00, 1),
    ('Toasted?', 'Not toasted', 0.00, 2)
) AS o(step_name, name, extra_price, sort)
JOIN public.sandwich_steps st ON st.name = o.step_name AND st.is_deleted = false
ORDER BY st."position", o.sort;  -- options are listed by id, so insert them in menu order

COMMIT;
