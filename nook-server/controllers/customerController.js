const bcrypt = require('bcrypt');
const customerModel = require('../models/customerModel');

const SALT_ROUNDS = 12;

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    if (!email || !password || !confirm_password) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email, password and confirm password are required'
      });
    }

    if (password !== confirm_password) {
      return res.json({
        return_code: 'PASSWORDS_DO_NOT_MATCH',
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.json({
        return_code: 'INVALID_PASSWORD',
        message: 'Password must be at least 6 characters'
      });
    }

    const taken = await customerModel.emailExists(email.toLowerCase().trim());
    if (taken) {
      return res.json({
        return_code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists'
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await customerModel.createCustomer({
      email: email.toLowerCase().trim(),
      password_hash,
      first_name: first_name?.trim() || null,
      last_name:  last_name?.trim()  || null
    });

    return res.json({
      return_code: 'SUCCESS',
      message: 'Account created successfully',
      customer: {
        id:         customer.id,
        email:      customer.email,
        first_name: customer.first_name,
        last_name:  customer.last_name
      }
    });

  } catch (err) {
    console.error('Customer register error:', err);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = { register };

