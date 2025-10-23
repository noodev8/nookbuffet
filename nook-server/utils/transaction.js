/*
=======================================================================================================================================
Transaction Wrapper Utility
=======================================================================================================================================
Purpose: Provides a wrapper for atomic database transactions to ensure data consistency
=======================================================================================================================================
*/

const { getClient } = require('../database');

/**
 * Execute a function within a database transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 * @param {function} callback - Async function that receives the client and executes queries
 * @returns {Promise} Result of the callback function
 */
const withTransaction = async (callback) => {
  const client = await getClient();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Execute the callback with the client
    const result = await callback(client);

    // Commit transaction if successful
    await client.query('COMMIT');

    return result;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

module.exports = {
  withTransaction
};

