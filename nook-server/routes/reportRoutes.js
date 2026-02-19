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

// ===== ROUTE: GET ACCOUNT REPORT (PROTECTED) =====
// GET /api/reports/accounts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns customer account performance data (orders and total spent) - manager only
router.get('/accounts', verifyToken, checkRole(['manager']), reportController.getAccountReport);

// ===== ROUTE: RUN CUSTOM REPORT (PROTECTED) =====
// POST /api/reports/custom
// Body: { prompt: "natural language question" }
// Uses Ollama to convert to SQL and execute - manager only
router.post('/custom', verifyToken, checkRole(['manager']), reportController.runCustomReport);

// ===== EXPORTS =====
module.exports = router;

