/*
=======================================================================================================================================
REPORT CONTROLLER
=======================================================================================================================================
Handles report-related API requests.
=======================================================================================================================================
*/

const reportModel = require('../models/reportModel');
const axios = require('axios');
const { query } = require('../database');
const { DATABASE_SCHEMA, SQL_EXAMPLES } = require('../config/aiSchemaContext');

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

// ===== RUN CUSTOM REPORT =====
/**
 * Convert natural language to SQL using Ollama and execute it
 *
 * POST /api/reports/custom
 * Body: { prompt: "your natural language question" }
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const runCustomReport = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate prompt exists
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.json({
        return_code: 'INVALID_PROMPT',
        message: 'Please provide a question for the report'
      });
    }

    // Build the prompt for Ollama - minimal but with key examples
    const ollamaPrompt = `${DATABASE_SCHEMA}

KEY EXAMPLES:
-- Customer who ordered the most:
SELECT customer_email, COUNT(*) as order_count FROM orders GROUP BY customer_email ORDER BY order_count DESC LIMIT 1

-- Total revenue:
SELECT SUM(total_price) as revenue FROM orders WHERE status != 'cancelled'

-- Orders by branch:
SELECT b.name, COUNT(*) as orders FROM orders o JOIN branches b ON o.branch_id = b.id GROUP BY b.name

-- Most popular items:
SELECT item_name, SUM(quantity) as total FROM order_items GROUP BY item_name ORDER BY total DESC LIMIT 10

-- Cheese sandwiches (category + ingredient):
SELECT COUNT(DISTINCT order_id) FROM order_items WHERE category_name ILIKE '%Sandwich%' AND item_name ILIKE '%Cheese%'

-- Branch selling most of a buffet type:
SELECT b.name, COUNT(*) as cnt FROM orders o JOIN branches b ON o.branch_id = b.id JOIN order_buffets ob ON o.id = ob.order_id JOIN buffet_versions bv ON ob.buffet_version_id = bv.id WHERE bv.title ILIKE '%Standard%' GROUP BY b.name ORDER BY cnt DESC LIMIT 1

Rules: Return ONLY the SQL query. No explanations. No semicolons.

Question: ${prompt.trim()}

SQL:`;

    // Call Ollama API - using mistral (fast) or sqlcoder (accurate but slower)
    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: ollamaPrompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 500  // Limit response length for speed
      }
    });

    let generatedSQL = ollamaResponse.data.response.trim();

    // Remove markdown code blocks if present
    generatedSQL = generatedSQL.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();

    // Extract just the SQL - from SELECT to semicolon or end of query
    const sqlMatch = generatedSQL.match(/\bSELECT\s[\s\S]*?(?:;|$)/i);
    if (sqlMatch) {
      generatedSQL = sqlMatch[0];
    }

    // Remove semicolon and any text after it
    const semicolonIndex = generatedSQL.indexOf(';');
    if (semicolonIndex > 0) {
      generatedSQL = generatedSQL.substring(0, semicolonIndex);
    }

    generatedSQL = generatedSQL.trim();

    // Check if Ollama couldn't answer
    if (generatedSQL.includes('CANNOT_ANSWER')) {
      return res.json({
        return_code: 'CANNOT_ANSWER',
        message: 'Sorry, I cannot answer that question with the available data'
      });
    }

    // Security check: Only allow SELECT statements
    const sqlUpper = generatedSQL.toUpperCase().trim();
    if (!sqlUpper.startsWith('SELECT')) {
      return res.json({
        return_code: 'INVALID_SQL',
        message: 'Only SELECT queries are allowed for security reasons'
      });
    }

    // Check for dangerous keywords
    const dangerousKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE'];
    for (const keyword of dangerousKeywords) {
      // Check if keyword appears as a standalone word (not part of column name)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(generatedSQL)) {
        return res.json({
          return_code: 'INVALID_SQL',
          message: 'Only SELECT queries are allowed for security reasons'
        });
      }
    }

    // Log the generated SQL for debugging
    console.log('\n===== CUSTOM REPORT =====');
    console.log('Prompt:', prompt);
    console.log('Generated SQL:', generatedSQL);
    console.log('=========================\n');

    // Execute the query
    const result = await query(generatedSQL);

    return res.json({
      return_code: 'SUCCESS',
      data: {
        rows: result.rows,
        rowCount: result.rowCount
      }
    });

  } catch (error) {
    console.error('===== CUSTOM REPORT ERROR =====');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    console.error('================================');

    // Check if it's an Ollama connection error
    if (error.code === 'ECONNREFUSED') {
      return res.json({
        return_code: 'OLLAMA_UNAVAILABLE',
        message: 'AI service is not available. Make sure Ollama is running.'
      });
    }

    // Check if it's a database query error
    if (error.code) {
      return res.json({
        return_code: 'QUERY_ERROR',
        message: "Couldn't get results for that question. Please try a different question or add more details."
      });
    }

    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to run custom report'
    });
  }
};

// ===== EXPORTS =====
module.exports = {
  getStockReport,
  getCategories,
  getBranchReport,
  getAccountReport,
  runCustomReport
};

