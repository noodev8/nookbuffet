const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Get the different parts of your API
const menuRoutes = require('./routes/menuRoutes');
const contactRoutes = require('./routes/contactRoutes');



const app = express();
const PORT = process.env.PORT || 3013;
const HOST = process.env.SERVER_HOST || 'localhost';

// Set up the server basics
app.use(cors()); // Let your website talk to this server
app.use(express.json()); // Understand JSON data
app.use(express.urlencoded({ extended: true })); // Understand form data

// Connect your API routes
// /api/menu goes to menu stuff (like /api/menu, /api/menu/1, etc.)
app.use('/api/menu', menuRoutes);

// /api/contact goes to contact form stuff
app.use('/api/contact', contactRoutes);

// Home page - just shows server is working
app.get('/', (req, res) => {
  res.json({
    message: 'Nook Server is running',
    port: PORT
  });
});



// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Connect to: http://217.154.35.5:${PORT}`);
});

module.exports = app;
