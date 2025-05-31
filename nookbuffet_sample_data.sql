-- =====================================================
-- NOOK BUFFET SAMPLE DATA
-- Insert initial data for the application
-- Run this after creating the database schema
-- =====================================================

-- =====================================================
-- 1. INSERT BUFFET OPTIONS
-- =====================================================
INSERT INTO buffet_options (id, name, description, price, image_path, is_popular, is_available, display_order) VALUES
('buffet_1', 'Classic Buffet', 'Perfect for casual gatherings with essential favorites', 9.90, 'assets/images/buffet-example-1.jpg', FALSE, TRUE, 1),
('buffet_2', 'Enhanced Buffet', 'Everything from Classic Buffet plus premium additions', 10.90, 'assets/images/buffet-example-1.jpg', TRUE, TRUE, 2),
('buffet_3', 'Deluxe Buffet', 'Our premium offering with gourmet selections', 13.90, 'assets/images/buffet-example-1.jpg', FALSE, TRUE, 3);

-- =====================================================
-- 2. INSERT MENU ITEMS
-- =====================================================

-- Sandwiches for Classic Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Egg Mayo & Cress', 'sandwich', TRUE, FALSE, 'Fresh egg mayonnaise with cress on soft bread'),
('Ham Salad', 'sandwich', FALSE, FALSE, 'Sliced ham with fresh salad vegetables'),
('Cheese & Onion', 'sandwich', TRUE, FALSE, 'Mature cheese with caramelized onions'),
('Tuna Mayo', 'sandwich', FALSE, FALSE, 'Tuna mayonnaise with fresh herbs'),
('Beef Salad', 'sandwich', FALSE, FALSE, 'Tender beef with mixed salad leaves');

-- Additional sandwiches for Enhanced Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Coronation Chicken', 'sandwich', FALSE, FALSE, 'Classic coronation chicken with mild curry flavor');

-- Sandwiches for Deluxe Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Ham & Mustard', 'sandwich', FALSE, FALSE, 'Premium ham with wholegrain mustard'),
('Coronation Chicken & Baby Gem', 'sandwich', FALSE, FALSE, 'Coronation chicken with crisp baby gem lettuce'),
('Egg & Cress', 'sandwich', TRUE, FALSE, 'Free-range egg with fresh watercress'),
('Beef, Horseradish, Tomato and Rocket', 'sandwich', FALSE, FALSE, 'Premium beef with horseradish cream and rocket'),
('Turkey & Cranberry', 'sandwich', FALSE, FALSE, 'Roasted turkey with cranberry sauce'),
('Chicken, Bacon & Chive Mayo', 'sandwich', FALSE, FALSE, 'Chicken and bacon with chive mayonnaise');

-- Sides for Classic Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Selection of Quiche', 'side', TRUE, FALSE, 'Assorted quiches with various fillings'),
('Cocktail Sausages', 'side', FALSE, FALSE, 'Mini sausages perfect for sharing'),
('Sausage Rolls', 'side', FALSE, FALSE, 'Flaky pastry sausage rolls'),
('Cheese & Onion Rolls', 'side', TRUE, FALSE, 'Vegetarian rolls with cheese and onion'),
('Pork Pies', 'side', FALSE, FALSE, 'Traditional British pork pies'),
('Scotch Eggs', 'side', FALSE, FALSE, 'Hard-boiled eggs wrapped in sausage meat'),
('Tortillas/Dips', 'side', TRUE, TRUE, 'Tortilla chips with various dips'),
('Assortment of Cakes', 'dessert', TRUE, FALSE, 'Selection of homemade cakes');

-- Additional sides for Enhanced Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Vegetable sticks & Dips', 'side', TRUE, TRUE, 'Fresh vegetable crudités with dips'),
('Cheese / Pineapple / Grapes', 'side', TRUE, FALSE, 'Classic cheese and fruit platter'),
('Bread Sticks', 'side', TRUE, TRUE, 'Crispy bread sticks'),
('Pickles', 'side', TRUE, TRUE, 'Assorted pickled vegetables'),
('Coleslaw', 'side', TRUE, FALSE, 'Fresh homemade coleslaw');

-- Sides for Deluxe Buffet
INSERT INTO menu_items (name, category, is_vegetarian, is_vegan, description) VALUES
('Greek Salad', 'side', TRUE, FALSE, 'Traditional Greek salad with feta cheese'),
('Potato Salad', 'side', TRUE, FALSE, 'Creamy potato salad with herbs'),
('Tomato & Mozzarella Skewers', 'side', TRUE, FALSE, 'Cherry tomatoes with mozzarella balls'),
('Vegetables', 'side', TRUE, TRUE, 'Seasonal fresh vegetables'),
('Dips', 'side', TRUE, TRUE, 'Assorted dips and spreads'),
('Celery', 'side', TRUE, TRUE, 'Fresh celery sticks'),
('Cucumber', 'side', TRUE, TRUE, 'Fresh cucumber slices'),
('Carrots', 'side', TRUE, TRUE, 'Fresh carrot sticks'),
('Red/Green Pepper', 'side', TRUE, TRUE, 'Fresh pepper strips'),
('Avocado', 'side', TRUE, TRUE, 'Fresh avocado slices'),
('Cheese / Chives', 'side', TRUE, FALSE, 'Cheese spread with fresh chives'),
('Hummus', 'side', TRUE, TRUE, 'Traditional chickpea hummus'),
('Breadsticks', 'side', TRUE, TRUE, 'Artisan breadsticks');

-- =====================================================
-- 3. LINK BUFFET OPTIONS TO MENU ITEMS
-- =====================================================

-- Classic Buffet (buffet_1) - Sandwiches
INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_1', id FROM menu_items 
WHERE name IN ('Egg Mayo & Cress', 'Ham Salad', 'Cheese & Onion', 'Tuna Mayo', 'Beef Salad');

-- Classic Buffet (buffet_1) - Sides
INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_1', id FROM menu_items 
WHERE name IN ('Selection of Quiche', 'Cocktail Sausages', 'Sausage Rolls', 'Cheese & Onion Rolls', 'Pork Pies', 'Scotch Eggs', 'Tortillas/Dips', 'Assortment of Cakes');

-- Enhanced Buffet (buffet_2) - All Classic items plus additional
INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_2', id FROM menu_items 
WHERE name IN ('Egg Mayo & Cress', 'Ham Salad', 'Cheese & Onion', 'Tuna Mayo', 'Beef Salad', 'Coronation Chicken');

INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_2', id FROM menu_items 
WHERE name IN ('Selection of Quiche', 'Cocktail Sausages', 'Sausage Rolls', 'Cheese & Onion Rolls', 'Pork Pies', 'Scotch Eggs', 'Tortillas/Dips', 'Assortment of Cakes', 'Vegetable sticks & Dips', 'Cheese / Pineapple / Grapes', 'Bread Sticks', 'Pickles', 'Coleslaw');

-- Deluxe Buffet (buffet_3) - Premium selections
INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_3', id FROM menu_items 
WHERE name IN ('Ham & Mustard', 'Coronation Chicken & Baby Gem', 'Egg & Cress', 'Beef, Horseradish, Tomato and Rocket', 'Cheese & Onion', 'Turkey & Cranberry', 'Chicken, Bacon & Chive Mayo');

INSERT INTO buffet_menu_items (buffet_id, menu_item_id) 
SELECT 'buffet_3', id FROM menu_items 
WHERE name IN ('Selection of Quiche', 'Sausage Rolls', 'Scotch Eggs', 'Cheese / Pineapple / Grapes', 'Pork Pies', 'Cocktail Sausages', 'Greek Salad', 'Potato Salad', 'Tomato & Mozzarella Skewers', 'Vegetables', 'Dips', 'Celery', 'Cucumber', 'Carrots', 'Red/Green Pepper', 'Avocado', 'Cheese / Chives', 'Hummus', 'Breadsticks');

-- =====================================================
-- 4. INSERT DIETARY OPTIONS
-- =====================================================
INSERT INTO dietary_options (buffet_id, option_name, description) VALUES
('buffet_1', 'Vegetarian options available', 'Several vegetarian sandwiches and sides included'),
('buffet_2', 'Vegetarian options available', 'Multiple vegetarian choices throughout the menu'),
('buffet_2', 'Fresh vegetables', 'Fresh vegetable sticks and salads included'),
('buffet_3', 'Vegetarian options available', 'Wide variety of vegetarian selections'),
('buffet_3', 'Fresh vegetables', 'Extensive fresh vegetable selection'),
('buffet_3', 'Mediterranean options', 'Greek salad and Mediterranean-style items'),
('buffet_3', 'Vegan-friendly items', 'Several vegan options available');

-- =====================================================
-- 5. INSERT AVAILABLE TIME SLOTS
-- =====================================================
INSERT INTO available_time_slots (time_slot, is_active, display_order) VALUES
('11:00 AM', TRUE, 1),
('11:30 AM', TRUE, 2),
('12:00 PM', TRUE, 3),
('12:30 PM', TRUE, 4),
('1:00 PM', TRUE, 5),
('1:30 PM', TRUE, 6),
('2:00 PM', TRUE, 7),
('2:30 PM', TRUE, 8),
('3:00 PM', TRUE, 9),
('3:30 PM', TRUE, 10),
('4:00 PM', TRUE, 11),
('4:30 PM', TRUE, 12),
('5:00 PM', TRUE, 13),
('5:30 PM', TRUE, 14),
('6:00 PM', TRUE, 15),
('6:30 PM', TRUE, 16);

-- =====================================================
-- 6. INSERT BUSINESS SETTINGS
-- =====================================================
INSERT INTO business_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('business_name', 'The Nook Buffet', 'string', 'Business name', TRUE),
('business_email', 'NOOKBUFFET@GMAIL.COM', 'string', 'Business contact email', TRUE),
('business_phone', '07551428162', 'string', 'Business contact phone', TRUE),
('business_address', '42 High Street, Welshpool, SY21 7JQ', 'string', 'Business address', TRUE),
('max_booking_days_ahead', '90', 'number', 'Maximum days ahead customers can book', FALSE),
('min_booking_days_ahead', '1', 'number', 'Minimum days ahead customers can book', FALSE),
('max_party_size', '50', 'number', 'Maximum number of people per booking', FALSE),
('booking_confirmation_email', 'true', 'boolean', 'Send confirmation emails', FALSE),
('app_version', '1.0.0', 'string', 'Current app version', TRUE);

-- =====================================================
-- 7. INSERT SAMPLE ADMIN USER
-- =====================================================
INSERT INTO admin_users (id, username, email, password_hash, full_name, role, is_active) VALUES
('admin-001', 'admin', 'admin@nookbuffet.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'System Administrator', 'admin', TRUE);
-- Note: Password hash is for 'admin123' - change in production!
