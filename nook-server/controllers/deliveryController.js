/*
=======================================================================================================================================
DELIVERY CONTROLLER - Handles delivery area validation
=======================================================================================================================================
This controller validates whether a customer address is within the delivery radius
of any branch using Mapbox API for accurate road distance calculations.

ENDPOINTS:
1. POST /api/delivery/validate-area
   Purpose: Check if address is within delivery range of any branch
   Request Body: { "address": "123 Main St, London" }
   Success Response: {
     "return_code": "SUCCESS",
     "data": {
       "isWithinRange": true,
       "branch": { ... },
       "distanceMiles": 5.2,
       "durationMinutes": 15
     }
   }
=======================================================================================================================================
*/

const branchModel = require('../models/branchModel');
const { calculateRoadDistance, geocodeAddress } = require('../utils/distanceCalculator');

/**
 * Validate if customer address is within delivery range
 * @param {object} req - Request object with address in body
 * @param {object} res - Response object
 */
const validateDeliveryArea = async (req, res) => {
  try {
    const { address } = req.body;

    // Validate required fields
    if (!address || !address.trim()) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Address is required'
      });
    }

    // First, geocode the customer address
    const customerCoords = await geocodeAddress(address);
    if (!customerCoords.success) {
      return res.json({
        return_code: 'INVALID_ADDRESS',
        message: 'Could not find the provided address'
      });
    }

    // Get all active branches
    const branches = await branchModel.getAllActiveBranches();
    if (branches.length === 0) {
      return res.json({
        return_code: 'NO_BRANCHES',
        message: 'No active branches available'
      });
    }

    // Find the nearest branch (straight-line distance )
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

    // Calculate actual road distance to nearest branch
    const distanceResult = await calculateRoadDistance(nearestBranch.address, address);
    
    if (!distanceResult.success) {
      return res.json({
        return_code: 'DISTANCE_CALCULATION_FAILED',
        message: 'Could not calculate distance to branch'
      });
    }

    // Check if within delivery radius
    const deliveryRadius = nearestBranch.delivery_radius_miles || 7;
    const isWithinRange = distanceResult.distanceMiles <= deliveryRadius;

    // Success response
    res.json({
      return_code: 'SUCCESS',
      data: {
        isWithinRange,
        branch: {
          id: nearestBranch.id,
          name: nearestBranch.name,
          address: nearestBranch.address
        },
        distanceMiles: distanceResult.distanceMiles,
        durationMinutes: distanceResult.durationMinutes,
        deliveryRadius
      }
    });

  } catch (error) {
    console.error('Error validating delivery area:', error);
    
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to validate delivery area',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  validateDeliveryArea
};