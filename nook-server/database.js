/*
=======================================================================================================================================
Database Connection & Query Wrapper
=======================================================================================================================================
Purpose: Central database pooling and query execution wrapper for all database operations
=======================================================================================================================================
*/

const { Pool } = require('pg');

// Set up database connection using environment variables
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

/**
 * Execute a database query with the connection pool
 * @param {string} queryText - SQL query string
 * @param {array} values - Query parameters (for parameterized queries)
 * @returns {Promise} Query result
 */
const query = async (queryText, values) => {
  try {
    const result = await pool.query(queryText, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transaction operations
 * @returns {Promise} Database client
 */
const getClient = async () => {
  return await pool.connect();
};

// Export query function and pool for direct access if needed
module.exports = {
  query,
  getClient,
  pool
};

