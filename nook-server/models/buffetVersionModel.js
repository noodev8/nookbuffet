// Database functions for buffet versions

const { query } = require('../database');

/**
 * Get a specific buffet version by ID
 * @param {number} versionId - The ID of the buffet version
 * @returns {Promise<object>} The buffet version with its details
 * @throws {Error} If version not found
 */
const getBuffetVersionById = async (versionId) => {
  try {
    const result = await query(
      `SELECT id, title, description, price_per_person, is_active, created_at
       FROM buffet_versions
       WHERE id = $1 AND is_active = true`,
      [versionId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Buffet version not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Could not get buffet version:', error);
    throw error;
  }
};

/**
 * Get all active buffet versions
 * @returns {Promise<array>} Array of all active buffet versions
 */
const getAllBuffetVersions = async () => {
  try {
    const result = await query(
      `SELECT id, title, description, price_per_person, is_active, created_at
       FROM buffet_versions
       WHERE is_active = true
       ORDER BY id`
    );

    return result.rows;
  } catch (error) {
    console.error('Could not get buffet versions:', error);
    throw new Error('Failed to get buffet versions');
  }
};

module.exports = {
  getBuffetVersionById,
  getAllBuffetVersions
};

