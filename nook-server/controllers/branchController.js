/*
=======================================================================================================================================
BRANCH CONTROLLER - Handles branch-related requests
=======================================================================================================================================
Controllers are the middle person between routes and models. They:
1. Receive the request from the route
2. Validate the data
3. Ask the model to get data from the database
4. Send response back to the website
=======================================================================================================================================
*/

const branchModel = require('../models/branchModel');

// ===== GET ALL ACTIVE BRANCHES =====
/**
 * Gets all active branches for display (e.g., collection point selection)
 * 
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const getAllBranches = async (req, res) => {
  try {
    // Ask the model to get all active branches from the database
    const branches = await branchModel.getAllActiveBranches();

    // Send the branches back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Got all branches!',
      data: branches,
      count: branches.length
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Error getting branches:', error);

    // Send error response
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get branches. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export the functions so routes can use them
module.exports = {
  getAllBranches
};

