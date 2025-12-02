/*
=======================================================================================================================================
BRANCH MODEL - Database queries for branch management
=======================================================================================================================================
This model handles all database operations related to branches including:
- Getting all active branches
- Finding branches by ID
- Managing branch delivery areas
=======================================================================================================================================
*/

const { query } = require('../database');

/**
 * Get all active branches
 * @returns {array} - Array of active branches
 */
const getAllActiveBranches = async () => {
  const sql = `
    SELECT id, name, address, latitude, longitude, delivery_radius_miles, is_active
    FROM branches 
    WHERE is_active = true 
    ORDER BY name
  `;
  
  const result = await query(sql);
  return result.rows;
};

/**
 * Get branch by ID
 * @param {number} branchId - The branch ID
 * @returns {object} - Branch data or null
 */
const getBranchById = async (branchId) => {
  const sql = `
    SELECT id, name, address, latitude, longitude, delivery_radius_miles, is_active
    FROM branches 
    WHERE id = $1 AND is_active = true
  `;
  
  const result = await query(sql, [branchId]);
  return result.rows[0] || null;
};

/**
 * Find nearest branch using straight-line distance (for initial filtering)
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLng - Customer longitude
 * @returns {object} - Nearest branch
 */
const findNearestBranch = async (customerLat, customerLng) => {
  const sql = `
    SELECT id, name, address, latitude, longitude, delivery_radius_miles,
    (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
    cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
    sin(radians(latitude)))) AS straight_line_distance_km
    FROM branches 
    WHERE is_active = true 
    ORDER BY straight_line_distance_km 
    LIMIT 1
  `;
  
  const result = await query(sql, [customerLat, customerLng]);
  return result.rows[0] || null;
};

module.exports = {
  getAllActiveBranches,
  getBranchById,
  findNearestBranch
};