/*
=======================================================================================================================================
TRANSACTION UTILITY
=======================================================================================================================================
helper for running multiple database queries that need to all succeed or all fail together

instead of manually writing BEGIN/COMMIT/ROLLBACK every time, you can wrap your queries in
withTransaction() and it handles all that for you automatically

Example usage:
  const result = await withTransaction(async (client) => {
    await client.query('INSERT INTO orders...');
    await client.query('UPDATE inventory...');
    return { success: true };
  });
=======================================================================================================================================
*/

const { getClient } = require('../database');

/**
 * Wraps database operations in a transaction
 * If anything fails, everything gets rolled back automatically
 * 
 * @param {function} callback - async function that receives a database client
 *                              do all queries using this 
 * @returns {*} whatever the callback function returns
 * @throws {Error} if anything goes wrong (after rolling back)
 */
const withTransaction = async (callback) => {
  const client = await getClient();
  
  try {
    // Start the transaction
    await client.query('BEGIN');
    
    // Run whatever queries the caller wants to do
    const result = await callback(client);
    
    // If we got here without errors, save everything
    await client.query('COMMIT');
    
    return result;
    
  } catch (error) {
    // Something went wrong - undo everything
    await client.query('ROLLBACK');
    throw error;
    
  } finally {
    // Always release the connection back to the pool
    client.release();
  }
};

module.exports = {
  withTransaction
};

