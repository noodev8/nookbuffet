-- Migration: Add delivery date and time fields to orders table
-- Date: 2025-01-20
-- Description: Adds fulfillment_date and fulfillment_time columns to track when orders should be delivered/collected

-- Add the new columns
ALTER TABLE orders 
ADD COLUMN fulfillment_date DATE,
ADD COLUMN fulfillment_time VARCHAR(10);

-- Add comments to document what these fields are for
COMMENT ON COLUMN orders.fulfillment_date IS 'The date when the order should be delivered or collected';
COMMENT ON COLUMN orders.fulfillment_time IS 'The time when the order should be delivered or collected (format: HH:MM)';

