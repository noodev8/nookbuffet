// This file gets menu data from your database

const { query } = require('../database');
const { withTransaction } = require('../utils/transaction');

// Get all menu sections (like "Sandwiches", "Wraps", etc.) with their items
const getAllMenuSections = async () => {
  try {

    // Database query to get menu sections and their items
    // Don't worry about understanding this SQL - it just gets your menu data
    const queryText = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.is_required,
        c.buffet_version_id,
        COALESCE(
          JSON_AGG(
            CASE
              WHEN mi.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'id', mi.id,
                  'name', mi.name,
                  'description', mi.description,
                  'is_included_in_base', mi.is_included_in_base,
                  'allergens', mi.allergens,
                  'dietary_info', mi.dietary_info,
                  'is_active', mi.is_active
                )
              ELSE NULL
            END
          ) FILTER (WHERE mi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM categories c
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.description, c.is_required, c.buffet_version_id
      ORDER BY c.id;
    `;

    // Run the query and get results
    const result = await query(queryText);
    return result.rows;

  } catch (error) {
    console.error('Could not get menu sections:', error);
    throw new Error('Failed to get menu sections');
  }
};

// Get one specific menu section by its ID number
const getMenuSectionById = async (sectionId) => {
  try {
    // Same query as above, but only get the section with this ID
    const queryText = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.is_required,
        c.buffet_version_id,
        COALESCE(
          JSON_AGG(
            CASE
              WHEN mi.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'id', mi.id,
                  'name', mi.name,
                  'description', mi.description,
                  'is_included_in_base', mi.is_included_in_base,
                  'allergens', mi.allergens,
                  'dietary_info', mi.dietary_info,
                  'is_active', mi.is_active
                )
              ELSE NULL
            END
          ) FILTER (WHERE mi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM categories c
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      WHERE c.is_active = true AND c.id = $1
      GROUP BY c.id, c.name, c.description, c.is_required, c.buffet_version_id;
    `;

    // Run the query with the specific ID
    const result = await query(queryText, [sectionId]);

    // Check if we found anything
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Section not found');
    }

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
