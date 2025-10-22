// This file connects to your PostgreSQL database

const { Pool } = require('pg');

// Set up database connection using your .env file settings
const pool = new Pool({
  host: process.env.DB_HOST,      
  port: process.env.DB_PORT,      
  database: process.env.DB_NAME,   
  user: process.env.DB_USER,     
  password: process.env.DB_PASSWORD, 

  // Connection settings 
  max: 200,                          // Max connections at once
  idleTimeoutMillis: 60000,         // Close unused connections after 1 min
  connectionTimeoutMillis: 60000,    // Give up connecting after 1 min
});

// If database has problems, show error and stop server
pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);
});

// Make pool available to other files
module.exports = {
  pool
};
