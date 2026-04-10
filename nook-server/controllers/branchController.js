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
        address: nearestBranch.address,
        deliveryTimeStart: nearestBranch.delivery_time_start,
        deliveryTimeEnd: nearestBranch.delivery_time_end
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

// ===== UPDATE BRANCH TIMESLOT =====
/**
 * Updates the delivery/collection timeslot for a branch (manager only)
 *
 * @param {object} req - The request object (contains branchId in params, times in body)
 * @param {object} res - The response object
 */
const updateBranchTimeslot = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryTimeStart, deliveryTimeEnd } = req.body;

    if (!deliveryTimeStart || !deliveryTimeEnd) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Both deliveryTimeStart and deliveryTimeEnd are required'
      });
    }

    // Basic HH:MM format validation
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(deliveryTimeStart) || !timeRegex.test(deliveryTimeEnd)) {
      return res.json({
        return_code: 'INVALID_FORMAT',
        message: 'Times must be in HH:MM format (e.g. 09:00)'
      });
    }

    if (deliveryTimeStart >= deliveryTimeEnd) {
      return res.json({
        return_code: 'INVALID_RANGE',
        message: 'Start time must be before end time'
      });
    }

    const updated = await branchModel.updateBranchTimeslot(id, deliveryTimeStart, deliveryTimeEnd);

    if (!updated) {
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'Branch not found'
      });
    }

    res.json({
      return_code: 'SUCCESS',
      message: 'Timeslot updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Error updating branch timeslot:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to update branch timeslot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export the functions so routes can use them
module.exports = {
  getAllBranches,
  findNearestBranch,
  updateBranchTimeslot
};

