// Menu Model - Handles all database operations for menu items
// This file contains functions to get menu data from the database

// Import the PostgreSQL database connection
const { pool } = require('../config/database');

/**
 * Get all menu sections with their items
 * This function will return all sections like "Sandwiches", "Wraps", etc.
 * with all the menu items in each section
 */
const getAllMenuSections = async () => {
  try {
    console.log('Fetching all menu sections from database...');

    // Query to get all categories (sections) with their menu items
    // This uses PostgreSQL's JSON aggregation to group items by category
    const query = `
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

    // Execute the query
    const result = await pool.query(query);

    console.log(`Found ${result.rows.length} menu sections`);

    return result.rows;

  

  } catch (error) {
    console.error('Error fetching menu sections:', error);
    throw new Error('Failed to fetch menu sections');
  }
};

/**
 * Get a specific menu section by ID
 * @param {number} sectionId - The ID of the section to get
 */
const getMenuSectionById = async (sectionId) => {
  try {
    console.log(`Fetching menu section with ID: ${sectionId}`);

    // Query to get a specific category (section) with its menu items
    const query = `
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

    // Execute the query with the section ID parameter
    const result = await pool.query(query, [sectionId]);

    // Check if section was found
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Section not found');
    }

    console.log(`Found section: ${result.rows[0].name}`);

    return result.rows[0];

  } catch (error) {
    console.error('Error fetching menu section:', error);
    throw error;
  }
};

// Export the functions so other files can use them
module.exports = {
  getAllMenuSections,
  getMenuSectionById
};
