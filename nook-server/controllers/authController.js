/*
=======================================================================================================================================
AUTH CONTROLLER - Handles admin user login
=======================================================================================================================================
This controller handles authentication for admin users. It checks their credentials,
verifies their password, and returns a JWT token if everything is valid.

The flow:
1. User submits email/username and password
2. look up the user in the database
3. compare the password with the stored hash using bcrypt
4. If valid, create a JWT token and send it back
5. The frontend stores this token and sends it with future requests
=======================================================================================================================================
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const { sendTwoFaCodeEmail } = require('../utils/emailService');

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

    // ===== GENERATE 2FA CODE =====
    // Make a random 6-digit code, store it on the user, and email it
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await authModel.saveTwoFaCode(user.id, code, expiresAt);
    await sendTwoFaCodeEmail(user.email, user.full_name, code);

    // ===== TEMP TOKEN =====
    // Short-lived token just to carry the user ID to the verify step
    // Not a full login token - just used for the 2FA handoff
    const tempToken = jwt.sign(
      { userId: user.id, type: 'two_fa_pending' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '10m' }
    );

    return res.json({
      return_code: 'TWO_FA_REQUIRED',
      temp_token: tempToken,
      message: 'A verification code has been sent to your email'
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
    const { username, email, password, full_name, role, branch_id } = req.body;

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
    const password_hash = await bcrypt.hash(password, 10);

    // ===== CREATE USER =====
    // Create the user in the database
    const newUser = await authModel.createUser({
      username,
      email,
      password_hash,
      full_name,
      role,
      branch_id: branch_id || null
    });

    // ===== SUCCESS RESPONSE =====
    // Send back the new user info 
    return res.json({
      return_code: 'SUCCESS',
      message: 'User created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        branch_id: newUser.branch_id,
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
    const { username, email, full_name, role, is_active, password, branch_id } = req.body;

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
    // branch_id can be null (to unassign) or a number
    if (branch_id !== undefined) updateData.branch_id = branch_id;

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
        branch_id: updatedUser.branch_id,
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

// ===== VERIFY 2FA CODE =====
// Second step of login - check the code the user received by email
// Expects: { temp_token: string, code: string } in the request body
const verifyTwoFa = async (req, res) => {
  try {
    const { temp_token, code } = req.body;

    // Both fields are required - temp_token keeps track of who is verifying, code is what they typed in
    if (!temp_token || !code) {
      return res.json({ return_code: 'MISSING_FIELDS', message: 'Token and code are required' });
    }

    // Decode the temp token to get the user ID
    // This token was issued at the end of step 1 (password check) and lasts 10 minutes
    // If it's expired or tampered with, jwt.verify will throw and i catch it below
    let decoded;
    try {
      decoded = jwt.verify(temp_token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (e) {
      // Token is expired or invalid - user needs to start the login again
      return res.json({ return_code: 'INVALID_TOKEN', message: 'Verification session expired, please log in again' });
    }

    // Stops someone skipping the code check by passing their existing session token
    if (decoded.type !== 'two_fa_pending') {
      return res.json({ return_code: 'INVALID_TOKEN', message: 'Invalid token type' });
    }

    // Fetch the user with their stored code from the database
    // decoded.userId came from the temp token  issued in step 1
    const user = await authModel.findUserByIdWithCode(decoded.userId);
    if (!user) {
      return res.json({ return_code: 'INVALID_TOKEN', message: 'User not found' });
    }

    // Check the code matches what was saved - also handles the case where no code exists at all
    if (!user.two_fa_code || user.two_fa_code !== code) {
      return res.json({ return_code: 'INVALID_CODE', message: 'Invalid verification code' });
    }

    // Check the code hasn't expired - codes last 10 minutes from when they were sent
    // Clear the code from the DB even if expired so it can't be reused
    if (new Date() > new Date(user.two_fa_expires_at)) {
      await authModel.clearTwoFaCode(user.id);
      return res.json({ return_code: 'CODE_EXPIRED', message: 'Verification code has expired, please log in again' });
    }

    // Code is good - clear it from the DB so it can't be used again, then record the login
    await authModel.clearTwoFaCode(user.id);
    await authModel.updateLastLogin(user.id);

    // Issue the real 24h session token - this is what gets stored in the browser and used for all future requests
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send the token and user info back - frontend stores the token and redirects to the dashboard
    return res.json({
      return_code: 'SUCCESS',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id
      }
    });

  } catch (error) {
    console.error('2FA verify error:', error);
    return res.json({ return_code: 'SERVER_ERROR', message: 'An error occurred during verification' });
  }
};

// ===== STAFF WEB LOGIN =====
/**
 * Lets staff members log into the customer-facing site using their admin credentials
 * Same password check as the admin login but no 2FA 
 * Returns a JWT with type:'staff' so the frontend knows who they are
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const staffWebLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Email and password are required'
      });
    }

    // Look up by email first, then username (staff might use either)
    let user = await authModel.findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      user = await authModel.findUserByUsername(email.trim());
    }

    if (!user) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.json({
        return_code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.json({
        return_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Stamp the login time
    await authModel.updateLastLogin(user.id);

    // Sign a 7-day token - same duration as customer tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type: 'staff' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.json({
      return_code: 'SUCCESS',
      message: 'Logged in successfully',
      token,
      staff: {
        id:        user.id,
        email:     user.email,
        full_name: user.full_name,
        role:      user.role,
        branch_id: user.branch_id
      }
    });

  } catch (err) {
    console.error('Staff web login error:', err);
    return res.json({
      return_code: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Export all the functions
module.exports = {
  login,
  verifyTwoFa,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  staffWebLogin
};


