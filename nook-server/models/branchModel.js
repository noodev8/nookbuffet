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
    SELECT id, name, address, latitude, longitude, delivery_radius_miles, is_active,
           TO_CHAR(delivery_time_start, 'HH24:MI') AS delivery_time_start,
           TO_CHAR(delivery_time_end, 'HH24:MI') AS delivery_time_end
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
    SELECT id, name, address, latitude, longitude, delivery_radius_miles, is_active,
           TO_CHAR(delivery_time_start, 'HH24:MI') AS delivery_time_start,
           TO_CHAR(delivery_time_end, 'HH24:MI') AS delivery_time_end
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
           TO_CHAR(delivery_time_start, 'HH24:MI') AS delivery_time_start,
           TO_CHAR(delivery_time_end, 'HH24:MI') AS delivery_time_end,
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

/**
 * Update a branch's delivery timeslot
 * @param {number} branchId - The branch ID
 * @param {string} deliveryTimeStart - Start time in HH:MM format
 * @param {string} deliveryTimeEnd - End time in HH:MM format
 * @returns {object} - Updated branch data or null
 */
const updateBranchTimeslot = async (branchId, deliveryTimeStart, deliveryTimeEnd) => {
  const sql = `
    UPDATE branches
    SET delivery_time_start = $1::TIME,
        delivery_time_end = $2::TIME
    WHERE id = $3
    RETURNING id, name,
              TO_CHAR(delivery_time_start, 'HH24:MI') AS delivery_time_start,
              TO_CHAR(delivery_time_end, 'HH24:MI') AS delivery_time_end
  `;

  const result = await query(sql, [deliveryTimeStart, deliveryTimeEnd, branchId]);
  return result.rows[0] || null;
};

/**
 * Update a branch's delivery radius
 * @param {number} branchId - The branch ID
 * @param {number} radiusMiles - Delivery radius in miles
 * @returns {object} - Updated branch data or null
 */
const updateDeliveryRadius = async (branchId, radiusMiles) => {
  const sql = `
    UPDATE branches
    SET delivery_radius_miles = $1
    WHERE id = $2
    RETURNING id, name, delivery_radius_miles
  `;
  const result = await query(sql, [radiusMiles, branchId]);
  return result.rows[0] || null;
};

module.exports = {
  getAllActiveBranches,
  getBranchById,
  findNearestBranch,
  updateBranchTimeslot,
  updateDeliveryRadius
};