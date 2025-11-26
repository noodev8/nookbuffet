-- Menu Items for The Little Nook Buffet - BUFFET VERSION 2
-- This creates all new categories and menu items for a second buffet option

-- First, make sure buffet_version 2 exists
-- If not, create it:
-- INSERT INTO buffet_versions (title, description, price_per_person, is_active)
-- VALUES ('Kids Buffet', 'Perfect for children''s parties', 8.50, true);

-- ========================================
-- CREATE CATEGORIES FOR BUFFET VERSION 2
-- ========================================

-- Category 1: Sandwiches
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Sandwiches', 'Freshly made sandwiches with a variety of fillings', false, true, 2, 1);

-- Category 2: Savoury
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Savoury', 'Hot and cold savoury items', false, true, 2, 2);

-- Category 3: Vegetable Sticks & Dips
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Vegetable Sticks & Dips', 'Fresh vegetables with dips', false, true, 2, 3);

-- Category 4: Biscuits & Cakes
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Biscuits & Cakes', 'Sweet treats', false, true, 2, 4);

-- Category 5: Fruit
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Fruit', 'Fresh fruit selection', false, true, 2, 5);

-- Category 6: Crisps
INSERT INTO categories (name, description, is_required, is_active, buffet_version_id, position)
VALUES ('Crisps', 'Crisps and snacks', false, true, 2, 6);

-- ========================================
-- ADD MENU ITEMS FOR BUFFET VERSION 2
-- ========================================

-- SANDWICHES (7 items)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Egg and Cress', NULL, 'Eggs, Gluten', 'Vegetarian', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Cheese', NULL, 'Dairy, Gluten', 'Vegetarian', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Cheese and Ham', NULL, 'Dairy, Gluten', 'Contains meat', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Tuna and Sweetcorn', NULL, 'Fish, Gluten', 'Contains fish', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Ham', NULL, 'Gluten', 'Contains meat', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Jam', NULL, 'Gluten', 'Vegetarian', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Peanut Butter', NULL, 'Peanuts, Gluten', 'Vegetarian, Contains nuts', true
FROM categories WHERE name = 'Sandwiches' AND buffet_version_id = 2;

-- SAVOURY (3 items)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Sausage Rolls', NULL, 'Gluten', 'Contains meat', true
FROM categories WHERE name = 'Savoury' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Cocktail Sausages', NULL, NULL, 'Contains meat', true
FROM categories WHERE name = 'Savoury' AND buffet_version_id = 2;

INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Chicken Nuggets', NULL, 'Gluten', 'Contains meat', true
FROM categories WHERE name = 'Savoury' AND buffet_version_id = 2;

-- VEGETABLE STICKS & DIPS (1 item)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Vegetable Sticks with Selection of Dips', 'Fresh vegetable sticks with a variety of dips', 'May contain dairy', 'Vegetarian', true
FROM categories WHERE name = 'Vegetable Sticks & Dips' AND buffet_version_id = 2;

-- BISCUITS & CAKES (1 item)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Selection of Chocolate Biscuits and Cakes', 'Assorted chocolate biscuits and cakes', 'Gluten, Dairy, Eggs', 'Vegetarian', true
FROM categories WHERE name = 'Biscuits & Cakes' AND buffet_version_id = 2;

-- FRUIT (1 item)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Selection of Fruit', 'Fresh seasonal fruit', NULL, 'Vegan, Vegetarian', true
FROM categories WHERE name = 'Fruit' AND buffet_version_id = 2;

-- CRISPS (1 item)
INSERT INTO menu_items (category_id, name, description, allergens, dietary_info, is_active)
SELECT id, 'Crisps', 'Selection of crisps', 'May contain gluten', 'Vegetarian', true
FROM categories WHERE name = 'Crisps' AND buffet_version_id = 2;

-- ========================================
-- SUMMARY
-- ========================================
-- This SQL will create for BUFFET VERSION 2:
--
-- 6 new categories:
--   1. Sandwiches (7 items)
--   2. Savoury (3 items)
--   3. Vegetable Sticks & Dips (1 item)
--   4. Biscuits & Cakes (1 item)
--   5. Fruit (1 item)
--   6. Crisps (1 item)
--
-- Total: 14 menu items for the new buffet version
--
-- All items are set to is_active = true by default
-- You can manage stock status from the admin panel after inserting

