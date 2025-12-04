-- Seed Data: Grazing Board Upgrade
-- Date: 2025-12-04
-- Description: Inserts the Grazing Board upgrade with all categories and items
-- NOTE: Update the price_per_person and num_choices for salads as needed

-- ========================================
-- CREATE THE UPGRADE
-- ========================================
INSERT INTO upgrades (name, description, price_per_person)
VALUES ('Continental', 'Selection of meats, cheeses, fruits, and more', 5.00)
RETURNING id;
-- Note the ID returned (probably 1) and use it below, or use a variable

-- For convenience, using a DO block with variables
DO $$
DECLARE
    upgrade_id INTEGER;
    cat_pickles INTEGER;
    cat_meats INTEGER;
    cat_cheeses INTEGER;
    cat_bread INTEGER;
    cat_fruit INTEGER;
    cat_cakes INTEGER;
    cat_salads INTEGER;
BEGIN
    -- Get the upgrade ID (or insert if not exists)
    SELECT id INTO upgrade_id FROM upgrades WHERE name = 'Continental';
    
    IF upgrade_id IS NULL THEN
        INSERT INTO upgrades (name, description, price_per_person)
        VALUES ('Continental', 'Selection of meats, cheeses, fruits, and more', 5.00)
        RETURNING id INTO upgrade_id;
    END IF;

    -- ========================================
    -- CATEGORY 1: Pickles & Olives (all included)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Pickles & Olives', 'All included', NULL, false, 1)
    RETURNING id INTO cat_pickles;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_pickles, 'Pickled Onions'),
    (cat_pickles, 'Gherkins'),
    (cat_pickles, 'Olives');

    -- ========================================
    -- CATEGORY 2: Meats (all included)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Meats', '3 premium meats included', NULL, false, 2)
    RETURNING id INTO cat_meats;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_meats, 'Pepperoni'),
    (cat_meats, 'Salami'),
    (cat_meats, 'Chorizo');

    -- ========================================
    -- CATEGORY 3: Cheeses (choose 3)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Cheeses', 'Choose 3 cheeses', 3, true, 3)
    RETURNING id INTO cat_cheeses;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_cheeses, 'Brie'),
    (cat_cheeses, 'Red Leicester'),
    (cat_cheeses, 'Cheddar'),
    (cat_cheeses, 'Gouda'),
    (cat_cheeses, 'Halloumi'),
    (cat_cheeses, 'Mozzarella'),
    (cat_cheeses, 'Roule');

    -- ========================================
    -- CATEGORY 4: Bread (all included)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Bread', 'All included', NULL, false, 4)
    RETURNING id INTO cat_bread;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_bread, 'Breadsticks'),
    (cat_bread, 'Bruschetta');

    -- ========================================
    -- CATEGORY 5: Fruit Selection (all included)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Fruit Selection', 'Fresh seasonal fruits', NULL, false, 5)
    RETURNING id INTO cat_fruit;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_fruit, 'Kiwi'),
    (cat_fruit, 'Watermelon'),
    (cat_fruit, 'Grapes'),
    (cat_fruit, 'Strawberries'),
    (cat_fruit, 'Apricots');

    -- ========================================
    -- CATEGORY 6: Cakes (all included)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Cakes', 'Selection of cakes', NULL, false, 6)
    RETURNING id INTO cat_cakes;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_cakes, 'Selection of Cakes');

    -- ========================================
    -- CATEGORY 7: Salads (choose - update num_choices as needed)
    -- ========================================
    INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position)
    VALUES (upgrade_id, 'Salads', 'Choose your salads', 2, true, 7)
    RETURNING id INTO cat_salads;

    INSERT INTO upgrade_items (upgrade_category_id, name) VALUES
    (cat_salads, 'Coleslaw'),
    (cat_salads, 'Potato Salad'),
    (cat_salads, 'Greek Salad');

    RAISE NOTICE 'Continental upgrade created with ID: %', upgrade_id;
END $$;

-- ========================================
-- LINK TO BUFFET VERSION(S)
-- Update the buffet_version_id as needed
-- ========================================
-- INSERT INTO buffet_upgrades (buffet_version_id, upgrade_id)
-- SELECT 1, id FROM upgrades WHERE name = 'Continental';

