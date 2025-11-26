/*
=======================================================================================================================================
AUTH MODEL - Database queries for admin user authentication
=======================================================================================================================================
This file handles all database operations related to admin users - finding users by email/username,
updating last login times, etc.

Think of it like this:
- Controller asks model to find a user
- Model queries the database
- Model returns the user data (including password hash) to controller
- Controller verifies the password and creates a token
=======================================================================================================================================
*/

const { query } = require('../database');

// ===== FIND USER BY EMAIL =====
// Look up an admin user by their email address
// Used during login to check if the user exists
const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, username, email, password_hash, full_name, role, is_active, last_login
    FROM admin_users
    WHERE email = $1
  `;
  
  const result = await query(sql, [email]);
  return result.rows[0]; // Return the first user found, or undefined if none
};

// ===== FIND USER BY USERNAME =====
// Look up an admin user by their username
// Used during login if they enter username instead of email
const findUserByUsername = async (username) => {
  const sql = `
    SELECT id, username, email, password_hash, full_name, role, is_active, last_login
    FROM admin_users
    WHERE username = $1
  `;
  
  const result = await query(sql, [username]);
  return result.rows[0];
};

// ===== UPDATE LAST LOGIN =====
// Update the last_login timestamp when a user successfully logs in
// This helps track when users last accessed the system
const updateLastLogin = async (userId) => {
  const sql = `
    UPDATE admin_users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  
  await query(sql, [userId]);
};

// Export all the functions so they can be used in the controller
module.exports = {
  findUserByEmail,
  findUserByUsername,
  updateLastLogin
};

