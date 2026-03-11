const { query } = require('../database');

const emailExists = async (email) => {
  const sql = `
    SELECT id FROM customers WHERE email = $1
  `;
  const result = await query(sql, [email]);
  return result.rows.length > 0;
};

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

module.exports = {
  emailExists,
  createCustomer
};

