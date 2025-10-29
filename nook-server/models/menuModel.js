// This file gets menu data from your database

const { query } = require('../database');
const { withTransaction } = require('../utils/transaction');

/**
 * Helper function that builds the SQL query for getting menu sections
 *
 * @param {string} whereClause - Optional WHERE clause to filter results (e.g., "AND c.id = $1")
 * @param {array} params - Query parameters to safely inject into the SQL
 * @returns {object} Object with 'text' (SQL query) and 'params' (values)
 */
const getMenuSectionsQuery = (whereClause = '', params = []) => {
  return {
    text: `
      -- Get all active categories (menu sections) with their menu items
      SELECT
        c.id,
        c.name,
        c.description,
        c.is_required,
        c.buffet_version_id,
        bv.price_per_person,
        -- Convert all menu items for this category into a JSON array
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
      -- Join with buffet_versions to get pricing
      LEFT JOIN buffet_versions bv ON c.buffet_version_id = bv.id AND bv.is_active = true
      -- Join with menu_items table, only get active items
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      -- Only get active categories, plus any additional filters passed in
      WHERE c.is_active = true ${whereClause}
      -- Group by category so we get one row per category with all its items
      GROUP BY c.id, c.name, c.description, c.is_required, c.buffet_version_id, bv.price_per_person
      -- Sort by category ID
      ORDER BY c.id;
    `,
    params
  };
};

/**
 * Get ALL menu sections with their items
 * Example: Returns Sandwiches, Wraps, Savoury, etc. - all at once
 *
 * @returns {Promise<array>} Array of all menu sections with their items
 */
const getAllMenuSections = async () => {
  try {
    // Build query with no filters (gets everything)
    const { text, params } = getMenuSectionsQuery();

    // Run the query against the database
    const result = await query(text, params);

    // Return all rows
    return result.rows;
  } catch (error) {
    console.error('Could not get menu sections:', error);
    throw new Error('Failed to get menu sections');
  }
};

/**
 * Get ONE specific menu section by its ID
 * Example: Get only the "Sandwiches" section (id = 5)
 *
 * @param {number} sectionId - The ID of the section you want
 * @returns {Promise<object>} Single menu section with its items
 * @throws {Error} If section not found
 */
const getMenuSectionById = async (sectionId) => {
  try {
    // Build query with a filter: "AND c.id = $1" where $1 is the sectionId
    const { text, params } = getMenuSectionsQuery('AND c.id = $1', [sectionId]);

    // Run the query against the database
    const result = await query(text, params);

    // Check if we got any results back
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Section not found');
    }

    // Return just the first (and only) row
    return result.rows[0];
  } catch (error) {
    console.error('Could not get menu section:', error);
    throw error;
  }
};

// Make these functions available to other files
module.exports = {
  getAllMenuSections,
  getMenuSectionById
};
