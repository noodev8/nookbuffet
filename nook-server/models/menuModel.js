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
        c.position,                             -- Sort order position
        c.buffet_version_id,                    -- Which buffet version this belongs to
        c.image_url,                            -- Image slot 1
        c.image_url_2,                          -- Image slot 2
        c.image_url_3,                          -- Image slot 3
        c.image_url_4,                          -- Image slot 4
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
      GROUP BY c.id, c.name, c.description, c.is_required, c.position, c.buffet_version_id, c.image_url, c.image_url_2, c.image_url_3, c.image_url_4, bv.price_per_person
      -- Sort by position, then name alphabetically as a tiebreaker
      ORDER BY c.position, c.name;
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
 * Get menu sections filtered by buffet version ID.
 * Optionally filter items by branch_id so only that branch's active items are shown.
 *
 * @param {number} buffetVersionId - The ID of the buffet version you want
 * @param {number|null} branchId - Optional branch ID to filter menu items by
 * @returns {Promise<array>} Array of menu sections for that buffet version
 */
const getMenuSectionsByBuffetVersion = async (buffetVersionId) => {
  try {
    // The buffet version already determines the branch, so no item-level branch filter needed
    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.is_required,
        c.buffet_version_id,
        c.image_url,
        c.image_url_2,
        c.image_url_3,
        c.image_url_4,
        bv.price_per_person,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', mi.id,
              'name', mi.name,
              'description', mi.description,
              'is_included_in_base', mi.is_included_in_base,
              'allergens', mi.allergens,
              'dietary_info', mi.dietary_info,
              'is_active', mi.is_active
            ) ORDER BY mi.id
          ) FILTER (WHERE mi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM categories c
      LEFT JOIN buffet_versions bv ON c.buffet_version_id = bv.id AND bv.is_active = true
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      WHERE c.is_active = true AND c.buffet_version_id = $1
      GROUP BY c.id, c.name, c.description, c.is_required, c.buffet_version_id, c.image_url, c.image_url_2, c.image_url_3, c.image_url_4, bv.price_per_person
      ORDER BY c.position, c.name
    `, [buffetVersionId]);

    return result.rows;
  } catch (error) {
    console.error('Could not get menu sections for buffet version:', error);
    throw new Error('Failed to get menu sections for buffet version');
  }
};

// ===== GET ALL MENU ITEMS FOR MANAGEMENT =====
/**
 * Get ALL menu items across all categories for admin management.
 * Optionally filter by branch_id to show only items for a specific branch.
 *
 * @param {number|null} branchId - Optional branch ID to filter by
 * @returns {Promise<array>} Array of menu items with category, buffet version and branch info
 */
const getAllMenuItemsForManagement = async (branchId = null) => {
  try {
    const params = [];
    let whereClause = '';

    if (branchId) {
      params.push(branchId);
      // Filter by the buffet version's branch, not the item's branch_id
      whereClause = `WHERE bv.branch_id = $1`;
    }

    const result = await query(`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.is_active,
        mi.allergens,
        mi.dietary_info,
        bv.branch_id,
        b.name as branch_name,
        c.id as category_id,
        c.name as category_name,
        c.position as category_position,
        bv.id as buffet_version_id,
        bv.title as buffet_version_name
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      LEFT JOIN buffet_versions bv ON c.buffet_version_id = bv.id
      LEFT JOIN branches b ON bv.branch_id = b.id
      ${whereClause}
      ORDER BY b.name, bv.id, c.position, c.name, mi.name
    `, params);

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

// ===== GET CATEGORIES FOR MANAGEMENT =====
/**
 * Get all categories for a given buffet version (for management forms/dropdowns)
 *
 * @param {number} buffetVersionId - The buffet version ID
 * @returns {Promise<array>} Array of categories
 */
const getCategoriesForManagement = async (buffetVersionId) => {
  try {
    const result = await query(
      `SELECT id, name, description, position, is_required, is_active, buffet_version_id, image_url, image_url_2, image_url_3, image_url_4
       FROM categories
       WHERE buffet_version_id = $1 AND is_active = true
       ORDER BY position, name`,
      [buffetVersionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Could not get categories for management:', error);
    throw new Error('Failed to get categories');
  }
};

// ===== UPDATE CATEGORY =====
/**
 * Update an existing category's details
 *
 * @param {number} id - Category ID
 * @param {string} name - New name
 * @param {string|null} description - New description
 * @param {number} position - New sort position
 * @param {boolean} isRequired - Whether required
 * @returns {Promise<object>} The updated category
 */
const updateCategory = async (id, name, description, position, isRequired, imageUrl, imageUrl2, imageUrl3, imageUrl4) => {
  try {
    const result = await query(
      `UPDATE categories
       SET name = $1, description = $2, position = $3, is_required = $4, image_url = $5, image_url_2 = $6, image_url_3 = $7, image_url_4 = $8
       WHERE id = $9
       RETURNING id, name, description, buffet_version_id, position, is_required, is_active, image_url, image_url_2, image_url_3, image_url_4`,
      [name, description ?? null, position ?? 0, isRequired ?? false, imageUrl ?? null, imageUrl2 ?? null, imageUrl3 ?? null, imageUrl4 ?? null, id]
    );
    if (result.rows.length === 0) throw new Error('Category not found');
    return result.rows[0];
  } catch (error) {
    console.error('Could not update category:', error);
    throw error;
  }
};

// ===== UPDATE MENU ITEM =====
/**
 * Update an existing menu item's details
 *
 * @param {number} id - Menu item ID
 * @param {string} name - New name
 * @param {string|null} description - New description
 * @param {number} categoryId - Category this item belongs to
 * @param {string|null} dietaryInfo - Dietary info
 * @param {string|null} allergens - Allergen info
 * @param {boolean} isIncludedInBase - Whether included in base price
 * @returns {Promise<object>} The updated menu item
 */
const updateMenuItem = async (id, name, description, categoryId, dietaryInfo, allergens, isIncludedInBase) => {
  try {
    const result = await query(
      `UPDATE menu_items
       SET name = $1, description = $2, category_id = $3, dietary_info = $4, allergens = $5, is_included_in_base = $6
       WHERE id = $7
       RETURNING id, name, description, category_id, dietary_info, allergens, is_included_in_base, is_active, branch_id`,
      [name, description ?? null, categoryId, dietaryInfo ?? null, allergens ?? null, isIncludedInBase ?? true, id]
    );
    if (result.rows.length === 0) throw new Error('Menu item not found');
    return result.rows[0];
  } catch (error) {
    console.error('Could not update menu item:', error);
    throw error;
  }
};

// ===== CREATE CATEGORY =====
/**
 * Create a new menu category under a buffet version
 *
 * @param {string} name - Category name
 * @param {string|null} description - Category description
 * @param {number} buffetVersionId - The buffet version this belongs to
 * @param {number} position - Sort order position
 * @param {boolean} isRequired - Whether this category is required
 * @returns {Promise<object>} The newly created category
 */
const createCategory = async (name, description, buffetVersionId, position, isRequired, imageUrl, imageUrl2, imageUrl3, imageUrl4) => {
  try {
    const result = await query(
      `INSERT INTO categories (name, description, buffet_version_id, position, is_required, is_active, image_url, image_url_2, image_url_3, image_url_4)
       VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9)
       RETURNING id, name, description, buffet_version_id, position, is_required, is_active, image_url, image_url_2, image_url_3, image_url_4`,
      [name, description ?? null, buffetVersionId, position ?? 0, isRequired ?? false, imageUrl ?? null, imageUrl2 ?? null, imageUrl3 ?? null, imageUrl4 ?? null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Could not create category:', error);
    throw new Error('Failed to create category');
  }
};

// ===== CREATE MENU ITEM =====
/**
 * Create a new menu item under a category
 *
 * @param {string} name - Item name
 * @param {string|null} description - Item description
 * @param {number} categoryId - The category this item belongs to
 * @param {string|null} dietaryInfo - Dietary info (e.g., "Vegetarian")
 * @param {string|null} allergens - Allergen info
 * @param {boolean} isIncludedInBase - Whether included in base price
 * @param {number|null} branchId - Optional branch restriction
 * @returns {Promise<object>} The newly created menu item
 */
const createMenuItem = async (name, description, categoryId, dietaryInfo, allergens, isIncludedInBase, branchId) => {
  try {
    const result = await query(
      `INSERT INTO menu_items (name, description, category_id, dietary_info, allergens, is_included_in_base, branch_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, name, description, category_id, dietary_info, allergens, is_included_in_base, branch_id, is_active`,
      [name, description ?? null, categoryId, dietaryInfo ?? null, allergens ?? null, isIncludedInBase ?? true, branchId ?? null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Could not create menu item:', error);
    throw new Error('Failed to create menu item');
  }
};

// ===== BULK UPDATE CATEGORY POSITIONS =====
/**
 * Update the position of multiple categories at once (used for drag-to-reorder)
 * @param {Array<{id: number, position: number}>} updates
 */
const updateCategoryPositions = async (updates) => {
  try {
    for (const { id, position } of updates) {
      await query('UPDATE categories SET position = $1 WHERE id = $2', [position, id]);
    }
  } catch (error) {
    console.error('Could not update category positions:', error);
    throw new Error('Failed to update category positions');
  }
};

// ===== EXPORTS =====
// Make these functions available to the controller
module.exports = {
  getAllMenuSections,
  getMenuSectionsByBuffetVersion,
  getAllMenuItemsForManagement,
  updateMenuItemStockStatus,
  getMenuItemsByIds,
  getCategoriesForManagement,
  createCategory,
  createMenuItem,
  updateCategory,
  updateMenuItem,
  updateCategoryPositions
};
