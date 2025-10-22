const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get the different parts of your API
const menuRoutes = require('./routes/menuRoutes');
const contactRoutes = require('./routes/contactRoutes');



const app = express();
const PORT = process.env.PORT || 3013;

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



// Function to read IP from frontend config
const getFrontendIP = () => {
  try {
    const configPath = path.join(__dirname, '../nook-frontend/src/config.js');
    const configFile = fs.readFileSync(configPath, 'utf8');

    // Extract IP from the config file
    const ipMatch = configFile.match(/SERVER_IP = ['"`]([^'"`]+)['"`]/);
    if (ipMatch) {
      return ipMatch[1];
    }
  } catch (error) {
    // If can't read frontend config, fall back to localhost
  }
  return 'localhost';
};

// Start the server
app.listen(PORT, () => {
  const host = getFrontendIP();
  console.log(`Server running on http://${host}:${PORT}`);
  console.log(`Frontend is configured to use: http://${host}:${PORT}`);
});

module.exports = app;
