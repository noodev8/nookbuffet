/*
=======================================================================================================================================
DATABASE CONNECTION & QUERY WRAPPER
=======================================================================================================================================
This file handles all communication with the PostgreSQL database.

like a translator between the server code and the database:
- the code asks for data using the query() function
- This file sends that request to the database
- The database sends back the data
- This file returns it to the code

It also uses a "connection pool" which is like having multiple phone lines to the database.
Instead of waiting for one line to be free, you can use any available line. This makes things faster.
=======================================================================================================================================
*/

const { Pool } = require('pg');  // PostgreSQL library for Node.js

// ===== CREATE CONNECTION POOL =====
// A pool is a collection of database connections that can be reused
// This is more efficient than creating a new connection for every query
const pool = new Pool({
  // These settings come from the .env file
  host: process.env.DB_HOST,           // Where the database server is 
  port: process.env.DB_PORT,           // What port it's listening on 
  database: process.env.DB_NAME,       // The name of your database
  user: process.env.DB_USER,           // Username to log in with
  password: process.env.DB_PASSWORD,   // Password to log in with

  // ===== CONNECTION POOL SETTINGS =====
  // These control how the pool behaves
  max: 200,                            // Maximum number of connections to keep open at once
  idleTimeoutMillis: 60000,            // If a connection isn't used for 60 seconds, close it
  connectionTimeoutMillis: 60000,      // If we can't connect within 60 seconds, give up and error
});

// ===== ERROR HANDLING =====
// If something goes seriously wrong with the database connection, stop the server
// This prevents the server from running in a broken state
pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);  // Exit with error code -1
});

// ===== QUERY FUNCTION =====
/**
 * Execute a SQL query against the database
 *
 * This is the main function used to talk to the database.
 * It handles errors and returns the results.
 *
 * @param {string} queryText - The SQL query you want to run (e.g., "SELECT * FROM users")
 * @param {array} values - Optional parameters to safely inject into the query
 *                         This prevents SQL injection attacks
 *                         Example: query("SELECT * FROM users WHERE id = $1", [5])
 * @returns {Promise} The result object from the database with a .rows property containing the data
 */
const query = async (queryText, values) => {
  try {
    // Send the query to the database and wait for the result
    const result = await pool.query(queryText, values);
    return result;
  } catch (error) {
    // If something goes wrong, log it and throw the error so the caller knows
    console.error('Database query error:', error);
    throw error;
  }
};

// ===== GET CLIENT FUNCTION =====
/**
 * Get a direct connection to the database for transactions
 *
 * Use this when you need to run multiple queries that must all succeed or all fail together.
 * This is called a "transaction" and it's important for data consistency.
 *
 * Example usage:
 * const client = await getClient();
 * await client.query('BEGIN');
 * await client.query('INSERT INTO orders...');
 * await client.query('UPDATE inventory...');
 * await client.query('COMMIT');
 * client.release();
 *
 * @returns {Promise} A database client connection
 */
const getClient = async () => {
  return await pool.connect();
};

// ===== EXPORTS =====
// Make these functions available to other files in the project
module.exports = {
  query,      // Use this for regular queries
  getClient,  // Use this for transactions
  pool        // The connection pool itself (rarely needed directly)
};

