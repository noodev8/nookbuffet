-- Migration: Add upgrades tables
-- Date: 2025-12-04
-- Description: Creates tables for buffet upgrades - upgrades that can be added to buffets for an extra cost per person

-- ========================================
-- TABLE 1: upgrades
-- Defines all available upgrades (e.g., "Dessert Upgrade", "Premium Drinks")
-- ========================================
CREATE TABLE upgrades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_person NUMERIC(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE upgrades IS 'Available upgrade options that can be added to buffets';
COMMENT ON COLUMN upgrades.name IS 'Display name of the upgrade';
COMMENT ON COLUMN upgrades.price_per_person IS 'Additional cost per person for this upgrade';

-- ========================================
-- TABLE 2: buffet_upgrades
-- Links which upgrades are available for which buffet versions
-- Different buffets can have different upgrades available
-- ========================================
CREATE TABLE buffet_upgrades (
    id SERIAL PRIMARY KEY,
    buffet_version_id INTEGER NOT NULL REFERENCES buffet_versions(id) ON DELETE CASCADE,
    upgrade_id INTEGER NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buffet_version_id, upgrade_id)
);

COMMENT ON TABLE buffet_upgrades IS 'Links upgrades to specific buffet versions';
COMMENT ON COLUMN buffet_upgrades.buffet_version_id IS 'Which buffet this upgrade is available for';
COMMENT ON COLUMN buffet_upgrades.upgrade_id IS 'Which upgrade is available';

-- Index for faster lookups by buffet version
CREATE INDEX idx_buffet_upgrades_buffet_version ON buffet_upgrades(buffet_version_id);

-- ========================================
-- TABLE 3: order_buffet_upgrades
-- Tracks which upgrades were selected for each buffet in an order
-- Stores price at time of order for history (prices may change later)
-- ========================================
CREATE TABLE order_buffet_upgrades (
    id SERIAL PRIMARY KEY,
    order_buffet_id INTEGER NOT NULL REFERENCES order_buffets(id) ON DELETE CASCADE,
    upgrade_id INTEGER NOT NULL,
    upgrade_name VARCHAR(100) NOT NULL,
    price_per_person NUMERIC(8,2) NOT NULL,
    num_people INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_buffet_upgrades IS 'Upgrades selected for each buffet in an order';
COMMENT ON COLUMN order_buffet_upgrades.upgrade_name IS 'Stored for history - name at time of order';
COMMENT ON COLUMN order_buffet_upgrades.price_per_person IS 'Price at time of order';
COMMENT ON COLUMN order_buffet_upgrades.num_people IS 'Same as parent buffet num_people';
COMMENT ON COLUMN order_buffet_upgrades.subtotal IS 'price_per_person * num_people';

-- Index for faster lookups by order_buffet
CREATE INDEX idx_order_buffet_upgrades_order_buffet ON order_buffet_upgrades(order_buffet_id);

