-- =====================================================
-- NOOK BUFFET USEFUL DATABASE QUERIES
-- Common queries for managing the application
-- =====================================================

-- =====================================================
-- BOOKING MANAGEMENT QUERIES
-- =====================================================

-- Get all pending bookings
SELECT 
    b.id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.buffet_name,
    b.booking_date,
    b.booking_time,
    b.number_of_people,
    b.total_price,
    b.dietary_preference,
    b.special_requests,
    b.created_at
FROM bookings b 
WHERE b.status = 'pending' 
ORDER BY b.booking_date ASC, b.booking_time ASC;

-- Get bookings for a specific date
SELECT 
    b.id,
    b.customer_name,
    b.buffet_name,
    b.booking_time,
    b.number_of_people,
    b.status,
    b.dietary_preference
FROM bookings b 
WHERE b.booking_date = '2024-06-01'  -- Replace with desired date
ORDER BY b.booking_time ASC;

-- Get booking details with customer info
SELECT 
    b.*,
    u.first_name,
    u.last_name,
    u.email as user_email
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
WHERE b.id = 'booking-id-here';  -- Replace with actual booking ID

-- Update booking status
UPDATE bookings 
SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
WHERE id = 'booking-id-here';  -- Replace with actual booking ID

-- Get revenue summary by date range
SELECT 
    DATE(booking_date) as date,
    COUNT(*) as total_bookings,
    SUM(number_of_people) as total_people,
    SUM(total_price) as total_revenue
FROM bookings 
WHERE status = 'confirmed' 
    AND booking_date BETWEEN '2024-06-01' AND '2024-06-30'  -- Replace dates
GROUP BY DATE(booking_date)
ORDER BY date ASC;

-- =====================================================
-- BUFFET MANAGEMENT QUERIES
-- =====================================================

-- Get complete buffet information with menu items
SELECT 
    bo.id,
    bo.name,
    bo.description,
    bo.price,
    bo.is_popular,
    bo.is_available,
    GROUP_CONCAT(
        CONCAT(mi.name, ' (', mi.category, ')')
        ORDER BY mi.category, mi.name
        SEPARATOR ', '
    ) as menu_items
FROM buffet_options bo
LEFT JOIN buffet_menu_items bmi ON bo.id = bmi.buffet_id
LEFT JOIN menu_items mi ON bmi.menu_item_id = mi.id
GROUP BY bo.id, bo.name, bo.description, bo.price, bo.is_popular, bo.is_available
ORDER BY bo.display_order;

-- Get vegetarian items for a specific buffet
SELECT 
    mi.name,
    mi.category,
    mi.description
FROM buffet_options bo
JOIN buffet_menu_items bmi ON bo.id = bmi.buffet_id
JOIN menu_items mi ON bmi.menu_item_id = mi.id
WHERE bo.id = 'buffet_1'  -- Replace with buffet ID
    AND mi.is_vegetarian = TRUE
ORDER BY mi.category, mi.name;

-- Get dietary options for all buffets
SELECT 
    bo.name as buffet_name,
    GROUP_CONCAT(do.option_name SEPARATOR ', ') as dietary_options
FROM buffet_options bo
LEFT JOIN dietary_options do ON bo.id = do.buffet_id
GROUP BY bo.id, bo.name
ORDER BY bo.display_order;

-- =====================================================
-- USER MANAGEMENT QUERIES
-- =====================================================

-- Get all registered users
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    subscribe_newsletter,
    is_active,
    created_at
FROM users 
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- Get user booking history
SELECT 
    b.id,
    b.buffet_name,
    b.booking_date,
    b.booking_time,
    b.number_of_people,
    b.total_price,
    b.status,
    b.created_at
FROM bookings b
WHERE b.user_id = 'user-id-here'  -- Replace with actual user ID
ORDER BY b.booking_date DESC;

-- =====================================================
-- ANALYTICS QUERIES
-- =====================================================

-- Most popular buffet options
SELECT 
    bo.name,
    COUNT(b.id) as booking_count,
    SUM(b.number_of_people) as total_people,
    SUM(b.total_price) as total_revenue
FROM buffet_options bo
LEFT JOIN bookings b ON bo.id = b.buffet_id AND b.status = 'confirmed'
GROUP BY bo.id, bo.name
ORDER BY booking_count DESC;

-- Booking trends by month
SELECT 
    YEAR(booking_date) as year,
    MONTH(booking_date) as month,
    COUNT(*) as total_bookings,
    SUM(number_of_people) as total_people,
    AVG(number_of_people) as avg_party_size,
    SUM(total_price) as total_revenue
FROM bookings 
WHERE status = 'confirmed'
GROUP BY YEAR(booking_date), MONTH(booking_date)
ORDER BY year DESC, month DESC;

-- Peak booking times
SELECT 
    booking_time,
    COUNT(*) as booking_count
FROM bookings 
WHERE status IN ('confirmed', 'pending')
GROUP BY booking_time
ORDER BY booking_count DESC;

-- Dietary preference statistics
SELECT 
    dietary_preference,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings), 2) as percentage
FROM bookings
GROUP BY dietary_preference
ORDER BY count DESC;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Clean up old cancelled bookings (older than 6 months)
DELETE FROM bookings 
WHERE status = 'cancelled' 
    AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Update menu item availability
UPDATE menu_items 
SET is_available = FALSE 
WHERE name = 'Item Name Here';  -- Replace with actual item name

-- Add new time slot
INSERT INTO available_time_slots (time_slot, is_active, display_order) 
VALUES ('7:00 PM', TRUE, 17);

-- Disable a time slot
UPDATE available_time_slots 
SET is_active = FALSE 
WHERE time_slot = '6:30 PM';

-- =====================================================
-- BACKUP AND RESTORE HELPERS
-- =====================================================

-- Export bookings for backup
SELECT * FROM bookings 
WHERE created_at >= '2024-01-01'  -- Replace with desired date
ORDER BY created_at;

-- Get database statistics
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'buffet_options', COUNT(*) FROM buffet_options
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'buffet_menu_items', COUNT(*) FROM buffet_menu_items
UNION ALL
SELECT 'dietary_options', COUNT(*) FROM dietary_options
UNION ALL
SELECT 'available_time_slots', COUNT(*) FROM available_time_slots
UNION ALL
SELECT 'business_settings', COUNT(*) FROM business_settings
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Add additional indexes for better performance (run if needed)
-- CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
-- CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
-- CREATE INDEX idx_menu_items_category_vegetarian ON menu_items(category, is_vegetarian);

-- Analyze table performance
-- ANALYZE TABLE bookings, buffet_options, menu_items, users;
