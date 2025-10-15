// Database Connection Configuration
// This file sets up the PostgreSQL connection using the pg package

const { Pool } = require('pg');

// Create a connection pool using environment variables
// A pool manages multiple database connections efficiently
const pool = new Pool({
  host: process.env.DB_HOST,        // Database server address
  port: process.env.DB_PORT,        // Database port (usually 5432 for PostgreSQL)
  database: process.env.DB_NAME,    // Database name
  user: process.env.DB_USER,        // Database username
  password: process.env.DB_PASSWORD, // Database password
  
  // Connection pool settings
  max: 20,                          // Maximum number of connections in pool
  idleTimeoutMillis: 30000,         // How long a client can be idle before closing
  connectionTimeoutMillis: 2000,    // How long to wait when connecting
});

// Test the database connection when the module loads
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🔗 Database connection test successful:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

// Export the pool so other files can use it
module.exports = {
  pool,
  testConnection
};
