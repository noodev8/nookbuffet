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
      `SELECT id, title, description, price_per_person, is_active, created_at, branch_id
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
const getAllBuffetVersions = async (branchId = null) => {
  try {
    const params = [];
    let whereClause = 'WHERE is_active = true';

    if (branchId) {
      params.push(branchId);
      whereClause += ` AND branch_id = $${params.length}`;
    }

    // Query the database for all active buffet versions
    const result = await query(
      `SELECT id, title, description, price_per_person, is_active, created_at, branch_id
       FROM buffet_versions
       ${whereClause}
       ORDER BY id`,
      params
    );

    // Return all rows (each row is one buffet version)
    return result.rows;
  } catch (error) {
    console.error('Could not get buffet versions:', error);
    throw new Error('Failed to get buffet versions');
  }
};

// ===== GET ALL BUFFET VERSIONS FOR MANAGEMENT =====
/**
 * Get all buffet versions (including inactive) for admin management.
 * Optionally filter by branch_id.
 * Joins branches table to include the branch name.
 *
 * @param {number|null} branchId - Optional branch ID to filter by
 * @returns {Promise<array>} Array of buffet versions with branch info
 */
const getAllBuffetVersionsForManagement = async (branchId = null) => {
  try {
    const params = [];
    let whereClause = '';

    if (branchId) {
      params.push(branchId);
      whereClause = `WHERE bv.branch_id = $1`;
    }

    const result = await query(
      `SELECT bv.id, bv.title, bv.description, bv.price_per_person,
              bv.is_active, bv.created_at, bv.branch_id, b.name as branch_name
       FROM buffet_versions bv
       LEFT JOIN branches b ON bv.branch_id = b.id
       ${whereClause}
       ORDER BY b.name NULLS LAST, bv.id`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Could not get buffet versions for management:', error);
    throw new Error('Failed to get buffet versions for management');
  }
};

// ===== UPDATE BUFFET VERSION =====
/**
 * Update the price_per_person and/or branch_id of a buffet version
 *
 * @param {number} id - The buffet version ID
 * @param {number} pricePerPerson - The new price per person
 * @param {number|null} branchId - The branch ID (or null for no branch)
 * @returns {Promise<object>} The updated buffet version
 */
const updateBuffetVersion = async (id, pricePerPerson, branchId) => {
  try {
    const result = await query(
      `UPDATE buffet_versions
       SET price_per_person = $1, branch_id = $2
       WHERE id = $3
       RETURNING id, title, description, price_per_person, is_active, branch_id`,
      [pricePerPerson, branchId ?? null, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Buffet version not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Could not update buffet version:', error);
    throw error;
  }
};

// ===== EXPORTS =====
// Make these functions available to the controller
module.exports = {
  getBuffetVersionById,
  getAllBuffetVersions,
  getAllBuffetVersionsForManagement,
  updateBuffetVersion
};

