-- Migration: Add upgrade categories and items tables
-- Date: 2025-12-04
-- Description: Adds tables for upgrade categories (sections) and items within upgrades
--              Upgrades can have selectable items like "choose 3 cheeses from this list"

-- ========================================
-- TABLE 1: upgrade_categories
-- Sections within an upgrade (e.g., "Cheeses", "Salads", "Meats")
-- ========================================
CREATE TABLE upgrade_categories (
    id SERIAL PRIMARY KEY,
    upgrade_id INTEGER NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    num_choices INTEGER,              -- How many items to pick (NULL = all items included automatically)
    is_required BOOLEAN DEFAULT false,
    position INTEGER,                 -- Display order
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE upgrade_categories IS 'Categories/sections within an upgrade';
COMMENT ON COLUMN upgrade_categories.num_choices IS 'Number of items customer must choose. NULL means all items are included automatically';
COMMENT ON COLUMN upgrade_categories.position IS 'Display order for categories';

CREATE INDEX idx_upgrade_categories_upgrade ON upgrade_categories(upgrade_id);

-- ========================================
-- TABLE 2: upgrade_items
-- Individual items within each upgrade category
-- ========================================
CREATE TABLE upgrade_items (
    id SERIAL PRIMARY KEY,
    upgrade_category_id INTEGER NOT NULL REFERENCES upgrade_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE upgrade_items IS 'Items within upgrade categories';

CREATE INDEX idx_upgrade_items_category ON upgrade_items(upgrade_category_id);

-- ========================================
-- TABLE 3: order_buffet_upgrade_items
-- Stores which items were selected for each upgrade in an order
-- ========================================
CREATE TABLE order_buffet_upgrade_items (
    id SERIAL PRIMARY KEY,
    order_buffet_upgrade_id INTEGER NOT NULL REFERENCES order_buffet_upgrades(id) ON DELETE CASCADE,
    upgrade_item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,      -- Stored for history
    category_name VARCHAR(100) NOT NULL,  -- Stored for history
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_buffet_upgrade_items IS 'Selected items for each upgrade in an order';
COMMENT ON COLUMN order_buffet_upgrade_items.item_name IS 'Name at time of order (prices/names may change)';
COMMENT ON COLUMN order_buffet_upgrade_items.category_name IS 'Category name at time of order';

CREATE INDEX idx_order_buffet_upgrade_items_upgrade ON order_buffet_upgrade_items(order_buffet_upgrade_id);

