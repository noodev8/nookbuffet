/*
=======================================================================================================================================
MENU MODEL - Database queries for menu data
=======================================================================================================================================
This file contains all the SQL queries for getting menu data from the database.

=======================================================================================================================================
*/

const { query } = require('../database');  // Import the database query function

// ===== HELPER FUNCTION: BUILD MENU QUERY =====
/**
 * Helper function that builds the SQL query for getting menu sections
 *
 * This function creates a reusable SQL query that can be used with or without filters.
 * It's used by multiple functions in this file to get different types of menu data.
 *
 * @param {string} whereClause - Optional WHERE clause to filter results
 *                               Example: "AND c.id = $1" to get only one section
 * @param {array} params - Query parameters to safely inject into the SQL
 *                         Example: [5] if you want section ID 5
 * @returns {object} Object with 'text' (SQL query) and 'params' (values)
 */
const getMenuSectionsQuery = (whereClause = '', params = []) => {
  return {
    text: `
      -- Get all active categories (menu sections) with their menu items
      SELECT
        c.id,                                    -- Category ID
        c.name,                                 -- Category name (like "Sandwiches")
        c.description,                          -- Category description
        c.is_required,                          -- Is this category required to order?
        c.buffet_version_id,                    -- Which buffet version this belongs to
        bv.price_per_person,                    -- Price per person for this buffet

        -- Convert all menu items for this category into a JSON array
        -- This makes it easy for the website to use the data
        COALESCE(
          JSON_AGG(
            -- Build a JSON object for each menu item with all its details
            JSON_BUILD_OBJECT(
              'id', mi.id,
              'name', mi.name,
              'description', mi.description,
              'is_included_in_base', mi.is_included_in_base,
              'allergens', mi.allergens,
              'dietary_info', mi.dietary_info,
              'is_active', mi.is_active
            ) ORDER BY mi.id
          ) FILTER (WHERE mi.id IS NOT NULL),  -- Only include items that exist (not null)
          '[]'::json  -- If no items, return empty array instead of null
        ) as items
      FROM categories c
      -- Join with buffet_versions to get pricing information
      LEFT JOIN buffet_versions bv ON c.buffet_version_id = bv.id AND bv.is_active = true
      -- Join with menu_items table, only get active items
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      -- Only get active categories, plus any additional filters passed in
      WHERE c.is_active = true ${whereClause}
      -- Group by category 
      GROUP BY c.id, c.name, c.description, c.is_required, c.buffet_version_id, bv.price_per_person
      -- Sort by category ID
      ORDER BY c.id;
    `,
    params
  };
};

// ===== GET ALL MENU SECTIONS =====
/**
 * Get ALL menu sections with their items
 *
 * This returns every menu section in the database (like Sandwiches, Wraps, Savoury, etc.)
 * along with all the items in each section.
 *
 * @returns {Promise<array>} Array of all menu sections with their items
 */
const getAllMenuSections = async () => {
  try {
    // Build query with no filters (gets everything)
    const { text, params } = getMenuSectionsQuery();

    // Run the query against the database
    const result = await query(text, params);

    // Return all rows (each row is one menu section)
    return result.rows;
  } catch (error) {
    console.error('Could not get menu sections:', error);
    throw new Error('Failed to get menu sections');
  }
};

// ===== GET MENU SECTIONS BY BUFFET VERSION =====
/**
 * Get menu sections filtered by buffet version ID
 *
 * This returns only the menu sections that belong to a specific buffet version.
 *
 * @param {number} buffetVersionId - The ID of the buffet version you want
 * @returns {Promise<array>} Array of menu sections for that buffet version
 */
const getMenuSectionsByBuffetVersion = async (buffetVersionId) => {
  try {
    // Build query with a filter for buffet_version_id
    // "AND c.buffet_version_id = $1" where $1 is the buffetVersionId
    const { text, params } = getMenuSectionsQuery('AND c.buffet_version_id = $1', [buffetVersionId]);

    // Run the query against the database
    const result = await query(text, params);

    // Return all rows (each row is one menu section for this buffet version)
    return result.rows;
  } catch (error) {
    console.error('Could not get menu sections for buffet version:', error);
    throw new Error('Failed to get menu sections for buffet version');
  }
};

// ===== GET ALL MENU ITEMS FOR MANAGEMENT =====
/**
 * Get ALL menu items across all categories for admin management
 *
 * This returns every menu item with its category and buffet version info,
 * regardless of is_active status. Used by the admin panel to manage stock status.
 * Items are grouped by buffet version for easy display.
 *
 * @returns {Promise<array>} Array of all menu items with category and buffet version info
 */
const getAllMenuItemsForManagement = async () => {
  try {
    const result = await query(`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.is_active,
        mi.allergens,
        mi.dietary_info,
        c.id as category_id,
        c.name as category_name,
        c.position as category_position,
        bv.id as buffet_version_id,
        bv.title as buffet_version_name
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      LEFT JOIN buffet_versions bv ON c.buffet_version_id = bv.id
      ORDER BY bv.id, c.position, c.name, mi.name
    `);

    return result.rows;
  } catch (error) {
    console.error('Could not get menu items for management:', error);
    throw new Error('Failed to get menu items for management');
  }
};

// ===== UPDATE MENU ITEM STOCK STATUS =====
/**
 * Update the is_active (stock status) of a menu item
 *
 * @param {number} itemId - The menu item ID to update
 * @param {boolean} isActive - The new stock status (true = in stock, false = out of stock)
 * @returns {Promise<object>} The updated menu item
 */
const updateMenuItemStockStatus = async (itemId, isActive) => {
  try {
    const result = await query(
      `UPDATE menu_items
       SET is_active = $1
       WHERE id = $2
       RETURNING id, name, is_active`,
      [isActive, itemId]
    );

    if (result.rows.length === 0) {
      throw new Error('Menu item not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Could not update menu item stock status:', error);
    throw error;
  }
};

// ===== GET MENU ITEMS BY IDS =====
/**
 * Get menu item details by an array of IDs
 * Used for getting item names/details for order confirmation emails
 *
 * @param {array} itemIds - Array of menu item IDs
 * @returns {Promise<array>} Array of menu items with name and category
 */
const getMenuItemsByIds = async (itemIds) => {
  if (!itemIds || itemIds.length === 0) {
    return [];
  }

  try {
    // Create placeholders for parameterized query ($1, $2, $3, etc.)
    const placeholders = itemIds.map((_, index) => `$${index + 1}`).join(', ');

    const result = await query(`
      SELECT
        mi.id,
        mi.name,
        c.name as category_name
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE mi.id IN (${placeholders})
      ORDER BY c.position, mi.name
    `, itemIds);

    return result.rows;
  } catch (error) {
    console.error('Could not get menu items by IDs:', error);
    return [];
  }
};

// ===== EXPORTS =====
// Make these functions available to the controller
module.exports = {
  getAllMenuSections,
  getMenuSectionsByBuffetVersion,
  getAllMenuItemsForManagement,
  updateMenuItemStockStatus,
  getMenuItemsByIds
};
