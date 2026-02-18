/*
=======================================================================================================================================
REPORT CONTROLLER
=======================================================================================================================================
Handles report-related API requests.
=======================================================================================================================================
*/

const reportModel = require('../models/reportModel');

// ===== GET STOCK REPORT =====
/**
 * Get menu item sales data sorted by times ordered
 *
 * GET /api/reports/stock
 * Query params:
 *   - startDate: Optional start date (YYYY-MM-DD)
 *   - endDate: Optional end date (YYYY-MM-DD)
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await reportModel.getStockReport(startDate, endDate);

    // Return flat list with parsed integers
    const items = data.map(item => ({
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      category_name: item.category_name,
      times_ordered: parseInt(item.times_ordered)
    }));

    return res.json({
      return_code: 'SUCCESS',
      data: items
    });

  } catch (error) {
    console.error('Error getting stock report:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get stock report'
    });
  }
};

// ===== GET CATEGORIES =====
/**
 * Get list of categories for filter dropdown
 *
 * GET /api/reports/categories
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getCategories = async (req, res) => {
  try {
    const categories = await reportModel.getOrderedCategories();

    return res.json({
      return_code: 'SUCCESS',
      data: categories
    });

  } catch (error) {
    console.error('Error getting categories:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get categories'
    });
  }
};

// ===== GET BRANCH REPORT =====
/**
 * Get branch performance data showing order count and revenue
 *
 * GET /api/reports/branches
 * Query params:
 *   - startDate: Optional start date (YYYY-MM-DD)
 *   - endDate: Optional end date (YYYY-MM-DD)
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getBranchReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await reportModel.getBranchReport(startDate, endDate);

    // Return with parsed numbers
    const branches = data.map(branch => ({
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      total_orders: parseInt(branch.total_orders),
      total_revenue: parseFloat(branch.total_revenue)
    }));

    return res.json({
      return_code: 'SUCCESS',
      data: branches
    });

  } catch (error) {
    console.error('Error getting branch report:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get branch report'
    });
  }
};

// ===== GET ACCOUNT REPORT =====
/**
 * Get customer account performance data showing order count and total spent
 *
 * GET /api/reports/accounts
 * Query params:
 *   - startDate: Optional start date (YYYY-MM-DD)
 *   - endDate: Optional end date (YYYY-MM-DD)
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAccountReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await reportModel.getAccountReport(startDate, endDate);

    // Return with parsed numbers
    const accounts = data.map(account => ({
      customer_email: account.customer_email,
      total_orders: parseInt(account.total_orders),
      total_spent: parseFloat(account.total_spent),
      first_order_date: account.first_order_date,
      last_order_date: account.last_order_date
    }));

    return res.json({
      return_code: 'SUCCESS',
      data: accounts
    });

  } catch (error) {
    console.error('Error getting account report:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get account report'
    });
  }
};

// ===== EXPORTS =====
module.exports = {
  getStockReport,
  getCategories,
  getBranchReport,
  getAccountReport
};

