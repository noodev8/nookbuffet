/*
=======================================================================================================================================
CUSTOMER MODEL - Database queries for the customers table
=======================================================================================================================================
This file handles all database operations related to customer accounts.
=======================================================================================================================================
*/

const { query } = require('../database');

// ===== CHECK IF EMAIL EXISTS =====
// Check if an email is already registered
// Used before creating an account to prevent duplicates
const emailExists = async (email) => {
  const sql = `
    SELECT id FROM customers WHERE email = $1
  `;
  const result = await query(sql, [email]);
  return result.rows.length > 0;
};

// ===== CREATE CUSTOMER =====
// Insert a new customer into the database
// Password must already be hashed before calling this
const createCustomer = async (customerData) => {
  const sql = `
    INSERT INTO customers (email, password_hash, first_name, last_name, phone, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, email, first_name, last_name, created_at
  `;

  const result = await query(sql, [
    customerData.email,
    customerData.password_hash,
    customerData.first_name || null,
    customerData.last_name  || null,
    customerData.phone      || null
  ]);

  return result.rows[0];
};

// ===== FIND CUSTOMER BY EMAIL =====
// Look up a customer by their email address
// Used during login to check if the account exists
const findByEmail = async (email) => {
  const sql = `
    SELECT id, email, password_hash, first_name, last_name, phone, default_address, is_active
    FROM customers
    WHERE email = $1
  `;
  const result = await query(sql, [email]);
  return result.rows[0]; // Returns undefined if not found
};

// ===== UPDATE LAST LOGIN =====
// Set the last_login timestamp when a customer successfully logs in
const updateLastLogin = async (customerId) => {
  const sql = `
    UPDATE customers
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  await query(sql, [customerId]);
};

// Export the functions so the controller can use them
module.exports = {
  emailExists,
  createCustomer,
  findByEmail,
  updateLastLogin
};

