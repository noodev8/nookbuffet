/*
=======================================================================================================================================
MAIN SERVER FILE - This is where everything starts
=======================================================================================================================================
This file sets up the Express server and connects all the different parts of your API together.
Think of it like the main control center that routes requests to the right place.
=======================================================================================================================================
*/

// Import the libraries we need
const express = require('express');  // Express is the framework that handles web requests
const cors = require('cors');        // CORS lets your website talk to this server from a different domain
require('dotenv').config();          // Load environment variables from .env file (like passwords, API keys, etc.)

// Import all the different route files that handle specific API endpoints
const menuRoutes = require('./routes/menuRoutes');              // Routes for menu data
const contactRoutes = require('./routes/contactRoutes');        // Routes for contact form emails
const buffetVersionRoutes = require('./routes/buffetVersionRoutes'); // Routes for buffet pricing/versions
const orderRoutes = require('./routes/orderRoutes');            // Routes for order creation
const authRoutes = require('./routes/authRoutes');              // Routes for admin authentication
const deliveryRoutes = require('./routes/deliveryRoutes');      // Routes for delivery services

// Create the Express app - this is the main server object
const app = express();

// Get the port and host from .env file, or use defaults if not set
// PORT is what port the server runs on (like 3013)
// HOST is the IP address or hostname (like localhost or 217.154.35.5)
const PORT = process.env.PORT || 3013;
const HOST = process.env.SERVER_HOST || 'localhost';

// ===== CORS SETUP =====
// CORS (Cross-Origin Resource Sharing) lets your website talk to this server
// Without this, your website couldn't make requests to the server from a different domain
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({
  origin: corsOrigins,                                           // Which websites are allowed to talk to us
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Which HTTP methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization'],             // Which headers are allowed
  credentials: true                                              // Allow cookies and auth headers
}));

// ===== MIDDLEWARE SETUP =====
// Middleware is code that runs on every request before it gets to the routes
app.use(express.json());                    // Parse incoming JSON data (like from contact forms)
app.use(express.urlencoded({ extended: true })); // Parse form data from HTML forms

// ===== ROUTE SETUP =====
// These lines connect the different route files to specific URL paths
// When someone visits /api/menu, it goes to the menu routes
// When someone visits /api/contact, it goes to the contact routes
// etc.

app.use('/api/menu', menuRoutes);                    // Menu endpoints
app.use('/api/contact', contactRoutes);              // Contact form endpoints
app.use('/api/buffet-versions', buffetVersionRoutes); // Buffet version endpoints
app.use('/api/orders', orderRoutes);                 // Order endpoints
app.use('/api/auth', authRoutes);                    // Admin authentication endpoints
app.use('/api/delivery', deliveryRoutes);            // Delivery endpoints

// ===== HEALTH CHECK ENDPOINT =====
// This is a simple endpoint that just tells you the server is running
// Useful for checking if the server is alive
app.get('/', (req, res) => {
  res.json({
    message: 'Nook Server is running',
    port: PORT
  });
});

// ===== START THE SERVER =====
// This actually starts listening for requests on the specified port and host
app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Connect to: http://${HOST}:${PORT}`);
});

// Export the app so it can be used in tests or other files
module.exports = app;

