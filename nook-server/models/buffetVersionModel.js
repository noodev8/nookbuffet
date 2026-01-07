/*
=======================================================================================================================================
BUFFET VERSION MODEL - Database queries for buffet versions
=======================================================================================================================================
This file contains all the SQL queries for getting buffet version data from the database.

A buffet version is a package/tier that customers can choose from.
Each version has a name, description, and price per person.

=======================================================================================================================================
*/

const { query } = require('../database');  // Import the database query function

// ===== GET ONE SPECIFIC BUFFET VERSION =====
/**
 * Get a specific buffet version by its ID
 *
 * This returns one buffet version (like "Standard Buffet" or "Premium Buffet")
 * with all its details including price.
 *
 * Example: getBuffetVersionById(1) returns:
 * { id: 1, title: "Standard Buffet", description: "...", price_per_person: 15.99, ... }
 *
 * @param {number} versionId - The ID of the buffet version you want
 * @returns {Promise<object>} The buffet version with its details
 * @throws {Error} If version not found
 */
const getBuffetVersionById = async (versionId) => {
  try {
    // Query the database for this specific buffet version
    // $1 is a placeholder for the versionId (prevents SQL injection)
    const result = await query(
      `SELECT id, title, description, price_per_person, is_active, created_at
       FROM buffet_versions
       WHERE id = $1 AND is_active = true`,
      [versionId]
    );

    // Check if we found the version
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Buffet version not found');
    }

    // Return the first (and only) result
    return result.rows[0];
  } catch (error) {
    console.error('Could not get buffet version:', error);
    throw error;
  }
};

// ===== GET ALL BUFFET VERSIONS =====
/**
 * Get all active buffet versions
 *
 * This returns every buffet version that's currently active.
 * These are the different packages customers can choose from.
 *
 * @returns {Promise<array>} Array of all active buffet versions
 */
const getAllBuffetVersions = async () => {
  try {
    // Query the database for all active buffet versions
    const result = await query(
      `SELECT id, title, description, price_per_person, is_active, created_at
       FROM buffet_versions
       WHERE is_active = true
       ORDER BY id`
    );

    // Return all rows (each row is one buffet version)
    return result.rows;
  } catch (error) {
    console.error('Could not get buffet versions:', error);
    throw new Error('Failed to get buffet versions');
  }
};

// ===== EXPORTS =====
// Make these functions available to the controller
module.exports = {
  getBuffetVersionById,
  getAllBuffetVersions
};

