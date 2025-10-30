/*
=======================================================================================================================================
TRANSACTION UTILITY - Database transaction wrapper
=======================================================================================================================================
This file provides a helper function for running database transactions.

A transaction is a group of database operations that must all succeed or all fail together.
Think of it like a bank transfer:
- You take money out of account A
- You put money into account B
- If something goes wrong in the middle, you want to undo BOTH operations, not just one

Without transactions, you could end up with money disappearing or being duplicated!

This utility handles all the complexity of transactions automatically:
- Starts the transaction (BEGIN)
- Runs your code
- If it succeeds, commits the changes (COMMIT)
- If it fails, undoes everything (ROLLBACK)
- Always cleans up the database connection

=======================================================================================================================================
*/

const { getClient } = require('../database');  // Import the function to get a database connection

// ===== TRANSACTION WRAPPER =====
/**
 * Execute a function within a database transaction
 *
 * This ensures that either ALL the database operations succeed, or NONE of them do.
 * It automatically handles BEGIN, COMMIT, and ROLLBACK.
 *
 * Example usage:
 *
 * const result = await withTransaction(async (client) => {
 *   // All queries here are part of the same transaction
 *   await client.query('INSERT INTO orders...');
 *   await client.query('UPDATE inventory...');
 *   await client.query('INSERT INTO order_items...');
 *   // If any of these fail, ALL changes are undone
 *   return { success: true };
 * });
 *
 * @param {function} callback - An async function that receives the database client
 *                              This function should run all your database queries
 *                              If it throws an error, the transaction is rolled back
 * @returns {Promise} The result returned by your callback function
 */
const withTransaction = async (callback) => {
  // Get a direct connection to the database
  const client = await getClient();

  try {
    // ===== START TRANSACTION =====
    // Tell the database we're starting a transaction
    // From now on, all queries are grouped together
    await client.query('BEGIN');

    // ===== RUN YOUR CODE =====
    // Execute the callback function with the client
    // The callback can run multiple queries, and they're all part of the same transaction
    const result = await callback(client);

    // ===== COMMIT TRANSACTION =====
    // If we got here, everything succeeded!
    // Tell the database to save all the changes
    await client.query('COMMIT');

    // Return the result from your callback
    return result;

  } catch (error) {
    // ===== ROLLBACK ON ERROR =====
    // If something went wrong, undo ALL the changes
    // This is like pressing "undo" on everything that happened in the transaction
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;

  } finally {
    // ===== CLEANUP =====
    // Always release the database connection back to the pool
    // This is important so other requests can use the connection
    // This runs whether the transaction succeeded or failed
    client.release();
  }
};

// ===== EXPORTS =====
// Make this function available to other files
module.exports = {
  withTransaction
};

