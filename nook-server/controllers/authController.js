/*
=======================================================================================================================================
AUTH CONTROLLER - Handles admin user login
=======================================================================================================================================
This controller handles authentication for admin users. It checks their credentials,
verifies their password, and returns a JWT token if everything is valid.

The flow:
1. User submits email/username and password
2. We look up the user in the database
3. We compare the password with the stored hash using bcrypt
4. If valid, we create a JWT token and send it back
5. The frontend stores this token and sends it with future requests
=======================================================================================================================================
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');

// ===== LOGIN FUNCTION =====
// Authenticates an admin user and returns a JWT token
const login = async (req, res) => {
  try {
    // Get the email/username and password from the request
    const { email, password } = req.body;

    // ===== VALIDATION =====
    // Make sure both fields are provided
    if (!email || !password) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email and password are required'
      });
    }

    // ===== FIND USER =====
    // Try to find the user by email first, then by username
    // This allows users to log in with either
    let user = await authModel.findUserByEmail(email);
    
    if (!user) {
      // If not found by email, try username
      user = await authModel.findUserByUsername(email);
    }

    // If still no user found, return error
    if (!user) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // ===== CHECK IF USER IS ACTIVE =====
    // Don't allow login if the user account is disabled
    if (!user.is_active) {
      return res.json({
        return_code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Please contact an administrator.'
      });
    }

    // ===== VERIFY PASSWORD =====
    // Compare the provided password with the stored hash
    // bcrypt.compare handles all the hashing and comparison securely
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // ===== UPDATE LAST LOGIN =====
    // Record when this user last logged in
    await authModel.updateLastLogin(user.id);

    // ===== CREATE JWT TOKEN =====
    // Create a token that contains the user's ID and role
    // This token will be sent with future requests to prove they're logged in
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this', // Secret key from .env
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // ===== SUCCESS RESPONSE =====
    // Send back the token and user info (but NOT the password hash!)
    return res.json({
      return_code: 'SUCCESS',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    // If anything goes wrong, log it and return an error
    console.error('Login error:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'An error occurred during login'
    });
  }
};

// ===== GET ALL USERS =====
// Get all users for the staff management page
// Only managers should be able to access this
const getAllUsers = async (req, res) => {
  try {
    // Get all users from the database
    const users = await authModel.getAllUsers();

    // Send back the user list
    return res.json({
      return_code: 'SUCCESS',
      message: 'Got all users',
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to retrieve users'
    });
  }
};

// ===== CREATE USER =====
// Create a new staff member
// Only managers should be able to do this
const createUser = async (req, res) => {
  try {
    // Get the user data from the request
    const { username, email, password, full_name, role } = req.body;

    // ===== VALIDATION =====
    // Make sure all required fields are provided
    if (!username || !email || !password || !full_name || !role) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'All fields are required (username, email, password, full_name, role)'
      });
    }

    // Validate role - only allow staff, admin, or manager
    if (!['staff', 'admin', 'manager'].includes(role)) {
      return res.json({
        return_code: 'INVALID_ROLE',
        message: 'Role must be staff, admin, or manager'
      });
    }

    // Check if email already exists
    const emailInUse = await authModel.emailExists(email);
    if (emailInUse) {
      return res.json({
        return_code: 'EMAIL_EXISTS',
        message: 'This email is already in use'
      });
    }

    // Check if username already exists
    const usernameInUse = await authModel.usernameExists(username);
    if (usernameInUse) {
      return res.json({
        return_code: 'USERNAME_EXISTS',
        message: 'This username is already in use'
      });
    }

    // ===== HASH PASSWORD =====
    // Hash the password before storing it
    // 10 is the salt rounds - higher is more secure but slower
    const password_hash = await bcrypt.hash(password, 10);

    // ===== CREATE USER =====
    // Create the user in the database
    const newUser = await authModel.createUser({
      username,
      email,
      password_hash,
      full_name,
      role
    });

    // ===== SUCCESS RESPONSE =====
    // Send back the new user info (but NOT the password hash!)
    return res.json({
      return_code: 'SUCCESS',
      message: 'User created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to create user'
    });
  }
};

// ===== UPDATE USER FUNCTION =====
// Updates an existing user's details (manager only)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, role, is_active, password } = req.body;

    // ===== CHECK IF USER EXISTS =====
    const existingUser = await authModel.getUserById(userId);
    if (!existingUser) {
      return res.json({
        return_code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // ===== VALIDATE ROLE =====
    if (role && !['staff', 'admin', 'manager'].includes(role)) {
      return res.json({
        return_code: 'INVALID_ROLE',
        message: 'Role must be staff, admin, or manager'
      });
    }

    // ===== CHECK FOR DUPLICATE EMAIL =====
    if (email && email !== existingUser.email) {
      const emailTaken = await authModel.emailExists(email);
      if (emailTaken) {
        return res.json({
          return_code: 'EMAIL_EXISTS',
          message: 'Email is already in use'
        });
      }
    }

    // ===== CHECK FOR DUPLICATE USERNAME =====
    if (username && username !== existingUser.username) {
      const usernameTaken = await authModel.usernameExists(username);
      if (usernameTaken) {
        return res.json({
          return_code: 'USERNAME_EXISTS',
          message: 'Username is already in use'
        });
      }
    }

    // ===== PREPARE UPDATE DATA =====
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    // ===== HASH PASSWORD IF PROVIDED =====
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // ===== UPDATE USER =====
    const updatedUser = await authModel.updateUser(userId, updateData);

    // ===== SUCCESS RESPONSE =====
    return res.json({
      return_code: 'SUCCESS',
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        last_login: updatedUser.last_login,
        created_at: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to update user'
    });
  }
};

// ===== DELETE USER FUNCTION =====
// Deletes a user from the system (manager only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // ===== CHECK IF USER EXISTS =====
    const existingUser = await authModel.getUserById(userId);
    if (!existingUser) {
      return res.json({
        return_code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // ===== PREVENT SELF-DELETION =====
    // Don't let managers delete themselves
    if (req.user.id === parseInt(userId)) {
      return res.json({
        return_code: 'CANNOT_DELETE_SELF',
        message: 'You cannot delete your own account'
      });
    }

    // ===== DELETE USER =====
    await authModel.deleteUser(userId);

    // ===== SUCCESS RESPONSE =====
    return res.json({
      return_code: 'SUCCESS',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to delete user'
    });
  }
};

// Export all the functions
module.exports = {
  login,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};

