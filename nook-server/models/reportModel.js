/*
=======================================================================================================================================
REPORT MODEL
=======================================================================================================================================
Database queries for generating reports.
=======================================================================================================================================
*/

const { query } = require('../database');

// ===== GET STOCK REPORT =====
/**
 * Get menu item sales data sorted by times ordered
 * Supports filtering by date range
 *
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 * @returns {Promise<array>} Array of items with order counts, sorted by times ordered
 */
const getStockReport = async (startDate = null, endDate = null) => {
  try {
    let queryText = `
      SELECT
        oi.menu_item_id,
        oi.item_name,
        oi.category_name,
        SUM(oi.quantity) as times_ordered
      FROM order_items oi
      JOIN order_buffets ob ON oi.order_buffet_id = ob.id
      JOIN orders o ON ob.order_id = o.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND o.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND o.created_at < ($${params.length}::date + interval '1 day')`;
    }

    queryText += `
      GROUP BY oi.menu_item_id, oi.item_name, oi.category_name
      ORDER BY times_ordered DESC, oi.item_name ASC
    `;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Could not get stock report:', error);
    throw new Error('Failed to get stock report');
  }
};

// ===== GET CATEGORIES FOR FILTER =====
/**
 * Get list of all categories that have been ordered
 * Used for the filter dropdown
 *
 * @returns {Promise<array>} Array of category names
 */
const getOrderedCategories = async () => {
  try {
    const result = await query(`
      SELECT DISTINCT oi.category_name
      FROM order_items oi
      ORDER BY oi.category_name
    `);
    return result.rows.map(row => row.category_name);
  } catch (error) {
    console.error('Could not get categories:', error);
    throw new Error('Failed to get categories');
  }
};

// ===== GET BRANCH REPORT =====
/**
 * Get branch performance data showing order count and revenue
 * Supports filtering by date range
 *
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 * @returns {Promise<array>} Array of branches with order counts and revenue, sorted by revenue
 */
const getBranchReport = async (startDate = null, endDate = null) => {
  try {
    let queryText = `
      SELECT
        b.id as branch_id,
        b.name as branch_name,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_revenue
      FROM branches b
      LEFT JOIN orders o ON b.id = o.branch_id
    `;

    const params = [];
    let whereClause = ' WHERE b.is_active = true';

    if (startDate) {
      params.push(startDate);
      whereClause += ` AND o.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      whereClause += ` AND o.created_at < ($${params.length}::date + interval '1 day')`;
    }

    queryText += whereClause;
    queryText += `
      GROUP BY b.id, b.name
      ORDER BY total_revenue DESC, total_orders DESC, b.name ASC
    `;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Could not get branch report:', error);
    throw new Error('Failed to get branch report');
  }
};

// ===== EXPORTS =====
module.exports = {
  getStockReport,
  getOrderedCategories,
  getBranchReport
};

