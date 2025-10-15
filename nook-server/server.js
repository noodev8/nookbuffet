const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ===== IMPORT ROUTE FILES =====
// Import all your route files here
// Each route file handles a specific part of your API
const menuRoutes = require('./routes/menuRoutes');

// ===== IMPORT DATABASE CONNECTION =====
// Import database connection for testing
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3013;

// ===== MIDDLEWARE SETUP =====
// Middleware runs before your routes and can modify requests/responses
app.use(cors()); // Allows frontend to make requests to this server
app.use(express.json()); // Parses JSON data from requests
app.use(express.urlencoded({ extended: true })); // Parses form data from requests

// ===== API ROUTES =====
// Connect your route files to specific URL paths
// All menu routes will be available under /api/menu
// Example: /api/menu, /api/menu/1, /api/menu/formatted
app.use('/api/menu', menuRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Nook Server!',
    status: 'Server is running',
    port: PORT
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== API INFORMATION ENDPOINT =====
// This endpoint lists all available API endpoints
// Visit http://localhost:3013/api to see all available endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'Nook API',
    version: '1.0.0',
    endpoints: [
      // Basic endpoints
      'GET /',
      'GET /health',
      'GET /api',

      // Menu endpoints - these are the new ones we just added
      'GET /api/menu',           // Get all menu sections
      'GET /api/menu/formatted', // Get menu sections formatted for frontend
      'GET /api/menu/:id'        // Get specific menu section by ID
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ===== START SERVER =====
// This starts your server and makes it listen for requests
app.listen(PORT, async () => {
  console.log(`🚀 Nook Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API info: http://localhost:${PORT}/api`);
  console.log(`📋 Menu API: http://localhost:${PORT}/api/menu`);
  console.log(`📋 Formatted Menu: http://localhost:${PORT}/api/menu/formatted`);

  // Test database connection on startup
  console.log('🔗 Testing database connection...');
  await testConnection();
});

module.exports = app;
