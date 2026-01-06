/*
=======================================================================================================================================
BRANCH CONTROLLER - Handles branch-related requests
=======================================================================================================================================
This file handles requests related to branches
=======================================================================================================================================
*/

const branchModel = require('../models/branchModel');
const { geocodeAddress } = require('../utils/distanceCalculator');

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

// ===== FIND NEAREST BRANCH =====
/**
 * Finds the nearest branch to a given address
 * Used for auto-selecting collection branch
 *
 * @param {object} req - The request object (contains address in req.body)
 * @param {object} res - The response object
 */
const findNearestBranch = async (req, res) => {
  try {
    const { address } = req.body;

    // Check if there is an address
    if (!address || !address.trim()) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Address is required'
      });
    }

    // Geocode the customer's address to get coordinates
    const customerCoords = await geocodeAddress(address);
    if (!customerCoords) {
      return res.json({
        return_code: 'INVALID_ADDRESS',
        message: 'Could not find the provided address'
      });
    }

    // Find the nearest branch
    const nearestBranch = await branchModel.findNearestBranch(
      customerCoords.lat,
      customerCoords.lng
    );

    if (!nearestBranch) {
      return res.json({
        return_code: 'NO_BRANCHES',
        message: 'No branches found'
      });
    }

    // Send back the nearest branch
    res.json({
      return_code: 'SUCCESS',
      message: 'Found nearest branch!',
      data: {
        id: nearestBranch.id,
        name: nearestBranch.name,
        address: nearestBranch.address
      }
    });

  } catch (error) {
    console.error('Error finding nearest branch:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to find nearest branch. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export the functions so routes can use them
module.exports = {
  getAllBranches,
  findNearestBranch
};

