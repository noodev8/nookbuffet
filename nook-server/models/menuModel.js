/*
=======================================================================================================================================
MENU MODEL - Database queries for menu data
=======================================================================================================================================
This file contains all the SQL queries for getting menu data from the database.

Models are the "data layer" - they talk to the database and return data.
Controllers use models to get data, then format it and send it to the website.

Think of it like this:
- Website asks controller for menu
- Controller asks model for menu data
- Model queries the database
- Model returns data to controller
- Controller formats it and sends it to website
=======================================================================================================================================
*/

const { query } = require('../database');  // Import the database query function

// ===== HELPER FUNCTION: BUILD MENU QUERY =====
/**
 * Helper function that builds the SQL query for getting menu sections
 *
 * This function creates a reusable SQL query that can be used with or without filters.
 * It's a helper because we use it in multiple places (get all, get by ID, etc.)
 *
 * The query does a lot of work:
 * 1. Gets all active categories (menu sections)
 * 2. Joins with buffet_versions to get pricing
 * 3. Joins with menu_items to get all items in each category
 * 4. Converts all items into a JSON array for easy use in the website
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
      -- Group by category so we get one row per category with all its items combined
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
 * Example: Returns [
 *   { id: 1, name: "Sandwiches", items: [...] },
 *   { id: 2, name: "Wraps", items: [...] },
 *   { id: 3, name: "Savoury", items: [...] }
 * ]
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
 * For example, if you want only the "Standard Buffet" menu items, pass in that buffet version's ID.
 *
 * Example: getMenuSectionsByBuffetVersion(1) returns:
 * [
 *   { id: 1, name: "Sandwiches", buffet_version_id: 1, items: [...] },
 *   { id: 2, name: "Wraps", buffet_version_id: 1, items: [...] }
 * ]
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

// ===== EXPORTS =====
// Make these functions available to the controller
module.exports = {
  getAllMenuSections,
  getMenuSectionsByBuffetVersion
};
