/*
=======================================================================================================================================
REPORT ROUTES
=======================================================================================================================================
API routes for generating reports. Manager only access.

Endpoints:
  GET /api/reports/stock - Get menu item sales data sorted by times ordered
  GET /api/reports/categories - Get list of categories for filter dropdown
  GET /api/reports/branches - Get branch performance data (orders and revenue)
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ===== ROUTE: GET STOCK REPORT (PROTECTED) =====
// GET /api/reports/stock?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns menu item sales data - manager only
router.get('/stock', verifyToken, checkRole(['manager']), reportController.getStockReport);

// ===== ROUTE: GET CATEGORIES (PROTECTED) =====
// GET /api/reports/categories
// Returns list of categories for filter - manager only
router.get('/categories', verifyToken, checkRole(['manager']), reportController.getCategories);

// ===== ROUTE: GET BRANCH REPORT (PROTECTED) =====
// GET /api/reports/branches?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns branch performance data (orders and revenue) - manager only
router.get('/branches', verifyToken, checkRole(['manager']), reportController.getBranchReport);

// ===== EXPORTS =====
module.exports = router;

