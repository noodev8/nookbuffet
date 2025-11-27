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

// ===== GET ALL USERS =====
// Get all admin users (for staff management page)
// Returns user info without password hashes
const getAllUsers = async () => {
  const sql = `
    SELECT id, username, email, full_name, role, is_active, last_login, created_at
    FROM admin_users
    ORDER BY created_at DESC
  `;

  const result = await query(sql);
  return result.rows;
};

// ===== CREATE USER =====
// Create a new admin user
// Takes username, email, password_hash, full_name, and role
const createUser = async (userData) => {
  const sql = `
    INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, username, email, full_name, role, is_active, created_at
  `;

  const result = await query(sql, [
    userData.username,
    userData.email,
    userData.password_hash,
    userData.full_name,
    userData.role
  ]);

  return result.rows[0];
};

// ===== CHECK IF EMAIL EXISTS =====
// Check if an email is already in use
// Used before creating a new user to prevent duplicates
const emailExists = async (email) => {
  const sql = `
    SELECT id FROM admin_users WHERE email = $1
  `;

  const result = await query(sql, [email]);
  return result.rows.length > 0;
};

// ===== CHECK IF USERNAME EXISTS =====
// Check if a username is already in use
// Used before creating a new user to prevent duplicates
const usernameExists = async (username) => {
  const sql = `
    SELECT id FROM admin_users WHERE username = $1
  `;

  const result = await query(sql, [username]);
  return result.rows.length > 0;
};

// ===== GET USER BY ID =====
// Get a single user by their ID
// Used when updating or deleting a user
const getUserById = async (userId) => {
  const sql = `
    SELECT id, username, email, full_name, role, is_active, last_login, created_at
    FROM admin_users
    WHERE id = $1
  `;

  const result = await query(sql, [userId]);
  return result.rows[0];
};

// ===== UPDATE USER =====
// Update user details (can update username, email, full_name, role, is_active)
// Password is optional - only update if provided
const updateUser = async (userId, userData) => {
  // Build the SQL dynamically based on what fields are provided
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (userData.username !== undefined) {
    fields.push(`username = $${paramCount}`);
    values.push(userData.username);
    paramCount++;
  }

  if (userData.email !== undefined) {
    fields.push(`email = $${paramCount}`);
    values.push(userData.email);
    paramCount++;
  }

  if (userData.full_name !== undefined) {
    fields.push(`full_name = $${paramCount}`);
    values.push(userData.full_name);
    paramCount++;
  }

  if (userData.role !== undefined) {
    fields.push(`role = $${paramCount}`);
    values.push(userData.role);
    paramCount++;
  }

  if (userData.is_active !== undefined) {
    fields.push(`is_active = $${paramCount}`);
    values.push(userData.is_active);
    paramCount++;
  }

  if (userData.password_hash !== undefined) {
    fields.push(`password_hash = $${paramCount}`);
    values.push(userData.password_hash);
    paramCount++;
  }

  // Add the user ID as the last parameter
  values.push(userId);

  const sql = `
    UPDATE admin_users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, email, full_name, role, is_active, last_login, created_at
  `;

  const result = await query(sql, values);
  return result.rows[0];
};

// ===== DELETE USER =====
// Delete a user from the database
// Managers can delete staff members
const deleteUser = async (userId) => {
  const sql = `
    DELETE FROM admin_users
    WHERE id = $1
    RETURNING id, username, email
  `;

  const result = await query(sql, [userId]);
  return result.rows[0];
};

// Export all the functions so they can be used in the controller
module.exports = {
  findUserByEmail,
  findUserByUsername,
  updateLastLogin,
  getAllUsers,
  createUser,
  emailExists,
  usernameExists,
  getUserById,
  updateUser,
  deleteUser
};

