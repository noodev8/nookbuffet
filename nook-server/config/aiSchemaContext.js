/**
 * Database schema and examples for AI-powered custom reports
 * This is sent to Ollama so it knows the table structure
 */

const DATABASE_SCHEMA = `
This is a buffet catering business database. Customers order buffets for events.

IMPORTANT RELATIONSHIPS:
- An ORDER can have multiple BUFFETS (order_buffets table)
- Each BUFFET has a TYPE defined in buffet_versions (e.g., "Kids Buffet", "Standard Buffet")
- Each BUFFET has MENU ITEMS selected (order_items table)
- Orders are assigned to a BRANCH location
- order_items has order_id column for direct access to orders
- Upgrades have their own categories (upgrade_categories) and items (upgrade_items)
- buffet_upgrades is the junction table linking which upgrades are available for which buffet versions

TABLE: orders - Customer orders
  - id (integer, primary key)
  - order_number (varchar, unique)
  - customer_email (varchar) - **USE THIS FOR GUEST ORDERS** (always populated)
  - customer_phone (varchar)
  - customer_id (integer, FK to customers, nullable) - set when the customer had an account at time of order
  - fulfillment_type (varchar) - 'delivery' or 'collection'
  - fulfillment_address (text)
  - total_price (numeric)
  - status (varchar) - 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  - payment_status (varchar) - 'pending', 'paid', 'refunded'
  - payment_method (varchar)
  - notes (text) - customer notes
  - staff_notes (text) - internal notes added by staff
  - created_at (timestamp)
  - updated_at (timestamp)
  - completed_at (timestamp)
  - fulfillment_date (date)
  - fulfillment_time (varchar)
  - branch_id (integer, FK to branches)

TABLE: customers - Registered customer accounts
  - id (integer, primary key)
  - email (varchar, unique)
  - first_name (varchar)
  - last_name (varchar)
  - phone (varchar)
  - default_address (text)
  - is_active (boolean)
  - is_verified (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)
  - last_login (timestamp)
NOTE: Guest orders (no account) still appear in orders.customer_email. Use customer_email for all order queries.
For registered-account queries, join orders.customer_id to customers.id.

TABLE: branches - Restaurant locations (e.g., "Welshpool", "Shrewsbury")
  - id (integer, primary key)
  - name (varchar)
  - address (text)
  - delivery_radius_miles (numeric)
  - is_active (boolean)
  - delivery_time_start (time)
  - delivery_time_end (time)

TABLE: buffet_versions - Types of buffets (e.g., "Standard Buffet", "Kids Buffet")
  - id (integer, primary key)
  - title (varchar) - THE BUFFET TYPE NAME
  - description (text)
  - price_per_person (numeric)
  - is_active (boolean)
  - branch_id (integer, FK to branches, nullable) - if set, this version is specific to that branch

TABLE: order_buffets - Links orders to buffet types
  - id (integer, primary key)
  - order_id (integer, FK to orders)
  - buffet_version_id (integer, FK to buffet_versions)
  - num_people (integer)
  - price_per_person (numeric)
  - subtotal (numeric)
  - dietary_info (text)
  - allergens (text)
  - notes (text)

TABLE: order_items - Menu items selected for each buffet (FOOD ITEMS ARE HERE)
  - id (integer, primary key)
  - order_buffet_id (integer, FK to order_buffets)
  - order_id (integer, FK to orders) - DIRECT LINK TO ORDER
  - menu_item_id (integer, FK to menu_items)
  - item_name (varchar) - e.g., "Egg Mayo", "Tuna Mayo", "Cheese & Onion", "Ham & Tomato", "Sausage Roll"
  - category_name (varchar) - e.g., "Sandwiches", "Wraps", "Savoury", "Fruit", "Cake"
  - quantity (integer)

IMPORTANT: When searching for food items like "cheese sandwiches", split into:
  - category_name for the type (e.g., ILIKE '%Sandwich%')
  - item_name for the ingredient (e.g., ILIKE '%Cheese%')
Example: "cheese sandwiches" = WHERE category_name ILIKE '%Sandwich%' AND item_name ILIKE '%Cheese%'
Example: "tuna wraps" = WHERE category_name ILIKE '%Wrap%' AND item_name ILIKE '%Tuna%'

TABLE: categories - Menu categories (e.g., "Sandwiches", "Wraps", "Savoury", "Dips and Sticks", "Fruit", "Cake")
  - id (integer, primary key)
  - name (varchar)
  - description (text)
  - buffet_version_id (integer, FK to buffet_versions)
  - position (integer)
  - is_required (boolean)
  - is_active (boolean)
  - image_url, image_url_2, image_url_3, image_url_4 (varchar) - display images for this category

TABLE: menu_items - Individual food items
  - id (integer, primary key)
  - category_id (integer, FK to categories)
  - name (varchar) - e.g., "Egg Mayo", "Tuna Mayo", "Cheese & Onion"
  - description (text)
  - dietary_info (varchar) - e.g., "Vegetarian", "Vegan"
  - allergens (text)
  - is_included_in_base (boolean)
  - is_active (boolean)
  - branch_id (integer, FK to branches, nullable) - if set, item is specific to that branch

TABLE: upgrades - Add-on packages available to attach to buffets (e.g., "Continental")
  - id (integer, primary key)
  - name (varchar)
  - description (text)
  - price_per_person (numeric)
  - is_active (boolean)

TABLE: buffet_upgrades - Junction table: which upgrades are linked to which buffet versions
  - id (integer, primary key)
  - buffet_version_id (integer, FK to buffet_versions)
  - upgrade_id (integer, FK to upgrades)
  - is_active (boolean)

TABLE: upgrade_categories - Categories within an upgrade (e.g., "Cold Meats", "Cheeses")
  - id (integer, primary key)
  - upgrade_id (integer, FK to upgrades)
  - name (varchar)
  - description (text)
  - num_choices (integer) - how many items the customer can pick from this category
  - is_required (boolean)
  - position (integer)
  - is_active (boolean)

TABLE: upgrade_items - Individual items within an upgrade category
  - id (integer, primary key)
  - upgrade_category_id (integer, FK to upgrade_categories)
  - name (varchar)
  - description (text)
  - is_active (boolean)

TABLE: order_buffet_upgrades - Upgrades added to a specific buffet in an order
  - id (integer, primary key)
  - order_buffet_id (integer, FK to order_buffets)
  - order_id (integer, FK to orders)
  - upgrade_id (integer, FK to upgrades)
  - upgrade_name (varchar)
  - price_per_person (numeric)
  - num_people (integer)
  - subtotal (numeric)

TABLE: order_buffet_upgrade_items - Specific upgrade items chosen by the customer
  - id (integer, primary key)
  - order_buffet_upgrade_id (integer, FK to order_buffet_upgrades)
  - order_id (integer, FK to orders)
  - upgrade_item_id (integer, FK to upgrade_items)
  - item_name (varchar)
  - category_name (varchar)

TABLE: order_config - System configuration settings (e.g., order cutoff time)
  - id (integer, primary key)
  - config_key (varchar, unique)
  - config_value (varchar)
  - description (text)
  - updated_at (timestamp)

TABLE: admin_users - Staff accounts
  - id (integer, primary key)
  - username (varchar)
  - email (varchar)
  - full_name (varchar)
  - role (varchar) - 'admin', 'manager', 'staff'
  - branch_id (integer, FK to branches)
  - is_active (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)
  - last_login (timestamp)
  - phone (varchar)
  - default_address (text)
`;

const SQL_EXAMPLES = `
EXAMPLE SQL QUERIES (use these as patterns):

===== REVENUE & SALES =====

-- Total revenue:
SELECT SUM(total_price) as total_revenue FROM orders WHERE status != 'cancelled'

-- Total revenue this month:
SELECT SUM(total_price) as revenue
FROM orders
WHERE status != 'cancelled' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)

-- Total revenue this year:
SELECT SUM(total_price) as revenue
FROM orders
WHERE status != 'cancelled' AND created_at >= DATE_TRUNC('year', CURRENT_DATE)

-- Revenue by branch:
SELECT b.name as branch, SUM(o.total_price) as revenue
FROM orders o
JOIN branches b ON o.branch_id = b.id
WHERE o.status != 'cancelled'
GROUP BY b.name
ORDER BY revenue DESC

-- Revenue by buffet type:
SELECT bv.title as buffet_type, SUM(ob.subtotal) as revenue
FROM order_buffets ob
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
GROUP BY bv.title
ORDER BY revenue DESC

-- Revenue by month:
SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total_price) as revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC

-- Average order value:
SELECT ROUND(AVG(total_price), 2) as average_order_value
FROM orders
WHERE status != 'cancelled'

===== ORDERS =====

-- Total number of orders:
SELECT COUNT(*) as total_orders FROM orders

-- Orders by status:
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status
ORDER BY count DESC

-- Orders today:
SELECT COUNT(*) as orders_today
FROM orders
WHERE DATE(created_at) = CURRENT_DATE

-- Orders this week:
SELECT COUNT(*) as orders_this_week
FROM orders
WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)

-- Orders this month:
SELECT COUNT(*) as orders_this_month
FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)

-- Orders by branch:
SELECT b.name as branch, COUNT(o.id) as order_count
FROM orders o
JOIN branches b ON o.branch_id = b.id
GROUP BY b.name
ORDER BY order_count DESC

-- Orders by fulfillment type (delivery vs collection):
SELECT fulfillment_type, COUNT(*) as count
FROM orders
GROUP BY fulfillment_type

-- Orders by payment status:
SELECT payment_status, COUNT(*) as count
FROM orders
GROUP BY payment_status

-- Pending orders:
SELECT order_number, customer_email, total_price, fulfillment_date, fulfillment_time
FROM orders
WHERE status = 'pending'
ORDER BY fulfillment_date, fulfillment_time

-- Orders for a specific date (e.g., tomorrow):
SELECT order_number, customer_email, total_price, fulfillment_time
FROM orders
WHERE fulfillment_date = CURRENT_DATE + 1
ORDER BY fulfillment_time

-- Busiest days of the week:
SELECT TO_CHAR(created_at, 'Day') as day_of_week, COUNT(*) as order_count
FROM orders
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY EXTRACT(DOW FROM created_at)

-- Busiest fulfillment times:
SELECT fulfillment_time, COUNT(*) as order_count
FROM orders
WHERE fulfillment_time IS NOT NULL
GROUP BY fulfillment_time
ORDER BY order_count DESC

===== CUSTOMERS =====
NOTE: Customer info is in orders.customer_email - DO NOT join to customers table (it's empty)

-- Best customer (most orders):
SELECT customer_email, COUNT(*) as order_count
FROM orders
GROUP BY customer_email
ORDER BY order_count DESC
LIMIT 1

-- Best customer (highest spend):
SELECT customer_email, SUM(total_price) as total_spent
FROM orders
WHERE status != 'cancelled'
GROUP BY customer_email
ORDER BY total_spent DESC
LIMIT 1

-- Worst customer (fewest orders):
SELECT customer_email, COUNT(*) as order_count
FROM orders
GROUP BY customer_email
ORDER BY order_count ASC
LIMIT 1

-- Worst customer (lowest spend):
SELECT customer_email, SUM(total_price) as total_spent
FROM orders
WHERE status != 'cancelled'
GROUP BY customer_email
ORDER BY total_spent ASC
LIMIT 1

-- Top 10 customers by orders:
SELECT customer_email, COUNT(*) as order_count
FROM orders
GROUP BY customer_email
ORDER BY order_count DESC
LIMIT 10

-- Top 10 customers by spend:
SELECT customer_email, SUM(total_price) as total_spent, COUNT(*) as order_count
FROM orders
WHERE status != 'cancelled'
GROUP BY customer_email
ORDER BY total_spent DESC
LIMIT 10

-- All unique customers:
SELECT DISTINCT customer_email FROM orders ORDER BY customer_email

-- Customers who ordered kids buffet:
SELECT DISTINCT o.customer_email
FROM orders o
JOIN order_buffets ob ON o.id = ob.order_id
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
WHERE bv.title ILIKE '%Kids%'

-- Repeat customers (more than 1 order):
SELECT customer_email, COUNT(*) as order_count
FROM orders
GROUP BY customer_email
HAVING COUNT(*) > 1
ORDER BY order_count DESC

===== MENU ITEMS & FOOD =====

-- Most popular items (top 10):
SELECT oi.item_name, SUM(oi.quantity) as times_ordered
FROM order_items oi
GROUP BY oi.item_name
ORDER BY times_ordered DESC
LIMIT 10

-- Least popular items:
SELECT oi.item_name, SUM(oi.quantity) as times_ordered
FROM order_items oi
GROUP BY oi.item_name
ORDER BY times_ordered ASC
LIMIT 10

-- Most popular sandwiches:
SELECT oi.item_name, SUM(oi.quantity) as times_ordered
FROM order_items oi
WHERE oi.category_name ILIKE '%Sandwich%'
GROUP BY oi.item_name
ORDER BY times_ordered DESC

-- Most popular wraps:
SELECT oi.item_name, SUM(oi.quantity) as times_ordered
FROM order_items oi
WHERE oi.category_name ILIKE '%Wrap%'
GROUP BY oi.item_name
ORDER BY times_ordered DESC

-- Items by category:
SELECT oi.category_name, oi.item_name, SUM(oi.quantity) as times_ordered
FROM order_items oi
GROUP BY oi.category_name, oi.item_name
ORDER BY oi.category_name, times_ordered DESC

-- All unique item names:
SELECT DISTINCT item_name FROM order_items ORDER BY item_name

-- All categories:
SELECT DISTINCT category_name FROM order_items ORDER BY category_name

-- Count orders for "cheese sandwiches" (category + ingredient):
SELECT COUNT(DISTINCT oi.order_id) as order_count
FROM order_items oi
WHERE oi.category_name ILIKE '%Sandwich%' AND oi.item_name ILIKE '%Cheese%'

-- Count orders for "tuna wraps":
SELECT COUNT(DISTINCT oi.order_id) as order_count
FROM order_items oi
WHERE oi.category_name ILIKE '%Wrap%' AND oi.item_name ILIKE '%Tuna%'

===== BUFFETS =====

-- Most popular buffet types:
SELECT bv.title, COUNT(ob.id) as times_ordered
FROM order_buffets ob
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
GROUP BY bv.title
ORDER BY times_ordered DESC

-- Which branch sells the most standard buffets:
SELECT b.name as branch, COUNT(*) as buffet_count
FROM orders o
JOIN branches b ON o.branch_id = b.id
JOIN order_buffets ob ON o.id = ob.order_id
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
WHERE bv.title ILIKE '%Standard%'
GROUP BY b.name
ORDER BY buffet_count DESC
LIMIT 1

-- Which branch sells more kids buffets:
SELECT b.name as branch, COUNT(*) as buffet_count
FROM orders o
JOIN branches b ON o.branch_id = b.id
JOIN order_buffets ob ON o.id = ob.order_id
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
WHERE bv.title ILIKE '%Kids%'
GROUP BY b.name
ORDER BY buffet_count DESC
LIMIT 1

-- Average number of people per buffet:
SELECT ROUND(AVG(num_people), 1) as avg_people_per_buffet FROM order_buffets

-- Buffet types by branch:
SELECT b.name as branch, bv.title as buffet_type, COUNT(*) as count
FROM orders o
JOIN branches b ON o.branch_id = b.id
JOIN order_buffets ob ON o.id = ob.order_id
JOIN buffet_versions bv ON ob.buffet_version_id = bv.id
GROUP BY b.name, bv.title
ORDER BY b.name, count DESC

===== UPGRADES =====

NOTE: upgrade_name is stored directly on order_buffet_upgrades — do NOT join to upgrades table for order queries.

-- Most ordered upgrade (use upgrade_name, not upgrade_id):
SELECT upgrade_name, COUNT(*) as times_ordered
FROM order_buffet_upgrades
GROUP BY upgrade_name
ORDER BY times_ordered DESC
LIMIT 1

-- All upgrades ranked by times ordered:
SELECT upgrade_name, COUNT(*) as times_ordered, SUM(subtotal) as revenue
FROM order_buffet_upgrades
GROUP BY upgrade_name
ORDER BY times_ordered DESC

-- Total upgrade revenue:
SELECT SUM(subtotal) as upgrade_revenue FROM order_buffet_upgrades

-- Upgrade revenue by upgrade type:
SELECT upgrade_name, SUM(subtotal) as revenue
FROM order_buffet_upgrades
GROUP BY upgrade_name
ORDER BY revenue DESC

-- Most popular upgrade items chosen by customers:
SELECT item_name, category_name, COUNT(*) as times_chosen
FROM order_buffet_upgrade_items
GROUP BY item_name, category_name
ORDER BY times_chosen DESC
LIMIT 10

-- Upgrade items chosen for a specific upgrade (e.g., "Continental"):
SELECT obui.item_name, obui.category_name, COUNT(*) as times_chosen
FROM order_buffet_upgrade_items obui
JOIN order_buffet_upgrades obu ON obui.order_buffet_upgrade_id = obu.id
WHERE obu.upgrade_name ILIKE '%Continental%'
GROUP BY obui.item_name, obui.category_name
ORDER BY times_chosen DESC

===== DIETARY & ALLERGENS =====

-- Orders with dietary requirements:
SELECT o.order_number, o.customer_email, ob.dietary_info
FROM orders o
JOIN order_buffets ob ON o.id = ob.order_id
WHERE ob.dietary_info IS NOT NULL AND ob.dietary_info != ''

-- Orders with allergen information:
SELECT o.order_number, o.customer_email, ob.allergens
FROM orders o
JOIN order_buffets ob ON o.id = ob.order_id
WHERE ob.allergens IS NOT NULL AND ob.allergens != ''

===== STAFF & BRANCHES =====

-- All branches:
SELECT name, address, is_active FROM branches ORDER BY name

-- Staff members:
SELECT full_name, username, role, b.name as branch
FROM admin_users au
LEFT JOIN branches b ON au.branch_id = b.id
ORDER BY role, full_name

-- Staff by role:
SELECT role, COUNT(*) as count FROM admin_users GROUP BY role

===== TIME COMPARISONS =====

-- This week vs last week orders:
SELECT
  COUNT(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as this_week,
  COUNT(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
             AND created_at < DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as last_week
FROM orders

-- This month vs last month revenue:
SELECT
  SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN total_price ELSE 0 END) as this_month,
  SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
           AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN total_price ELSE 0 END) as last_month
FROM orders
WHERE status != 'cancelled'
`;

module.exports = {
  DATABASE_SCHEMA,
  SQL_EXAMPLES
};

