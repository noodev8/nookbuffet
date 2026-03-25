/*
=======================================================================================================================================
CUSTOMER CONTROLLER - Handles customer account registration and login
=======================================================================================================================================
This file handles registration and login for customer accounts.
=======================================================================================================================================
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const customerModel = require('../models/customerModel');

const SALT_ROUNDS = 12;

// ===== REGISTER =====
/**
 * Creates a new customer account
 * Validates the fields, checks the email isn't taken, hashes the password, then saves to the db
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    // Make sure the required fields are there
    if (!email || !password || !confirm_password) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email, password and confirm password are required'
      });
    }

    // Make sure both passwords match
    if (password !== confirm_password) {
      return res.json({
        return_code: 'PASSWORDS_DO_NOT_MATCH',
        message: 'Passwords do not match'
      });
    }

    // Minimum password length
    if (password.length < 6) {
      return res.json({
        return_code: 'INVALID_PASSWORD',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check the email isn't already registered
    const taken = await customerModel.emailExists(email.toLowerCase().trim());
    if (taken) {
      return res.json({
        return_code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists'
      });
    }

    // Hash the password before saving
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the customer in the database
    const customer = await customerModel.createCustomer({
      email: email.toLowerCase().trim(),
      password_hash,
      first_name: first_name?.trim() || null,
      last_name:  last_name?.trim()  || null
    });

    // Send back the new customer details
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

// ===== LOGIN =====
/**
 * Logs in an existing customer and returns a JWT token
 * Checks the email exists, verifies the password, then signs a token
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Make sure both fields are provided
    if (!email || !password) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email and password are required'
      });
    }

    // Look up the customer by email
    const customer = await customerModel.findByEmail(email.toLowerCase().trim());

    if (!customer) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }


    // Compare the password against the stored hash
    const isPasswordValid = await bcrypt.compare(password, customer.password_hash);

    if (!isPasswordValid) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Record the login time
    await customerModel.updateLastLogin(customer.id);

    // Sign a JWT token - expires in 7 days
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Send the token and customer details back
    return res.json({
      return_code: 'SUCCESS',
      message: 'Logged in successfully',
      token,
      customer: {
        id:              customer.id,
        email:           customer.email,
        first_name:      customer.first_name,
        last_name:       customer.last_name,
        phone:           customer.phone,
        default_address: customer.default_address
      }
    });

  } catch (err) {
    console.error('Customer login error:', err);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again.'
    });
  }
};

// ===== UPDATE PROFILE =====
/**
 * Updates a customer's profile details
 * The customer is identified by the JWT - they can only edit their own account
 *
 * @param {object} req - The request object (req.user set by verifyToken middleware)
 * @param {object} res - The response object
 */
const updateProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { first_name, last_name, email, phone, default_address } = req.body;

    // Email is required
    if (!email) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email is required'
      });
    }

    // If they changed their email, make sure it isn't taken by someone else
    const existing = await customerModel.findByEmail(email.toLowerCase().trim());
    if (existing && existing.id !== customerId) {
      return res.json({
        return_code: 'EMAIL_TAKEN',
        message: 'This email is already in use by another account'
      });
    }

    // Save the updated details
    const customer = await customerModel.updateCustomer(customerId, {
      first_name:      first_name?.trim()      || null,
      last_name:       last_name?.trim()       || null,
      email:           email.toLowerCase().trim(),
      phone:           phone?.trim()           || null,
      default_address: default_address?.trim() || null
    });

    // Send back the updated customer
    return res.json({
      return_code: 'SUCCESS',
      message: 'Profile updated successfully',
      customer
    });

  } catch (err) {
    console.error('Customer updateProfile error:', err);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Export the functions so routes can use them
module.exports = { register, login, updateProfile };

