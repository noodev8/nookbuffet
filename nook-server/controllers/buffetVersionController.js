/*
=======================================================================================================================================
BUFFET VERSION CONTROLLER - Handles buffet version API requests
=======================================================================================================================================
This file handles requests for buffet versions (like "Standard Buffet", "Premium Buffet", etc.)
and their pricing information.

A buffet version is basically a package/tier that customers can choose from.
Each version has a name, description, and price per person.
=======================================================================================================================================
*/

// Import the buffet version model - this has all the database queries for buffet versions
const buffetVersionModel = require('../models/buffetVersionModel');

// ===== GET ONE SPECIFIC BUFFET VERSION =====
/**
 * Get a single buffet version by its ID
 * This is called when someone visits /api/buffet-versions/1 (or any number)
 *
 * @param {object} req - The request object (contains the ID in req.params.id)
 * @param {object} res - The response object (we use this to send data back)
 */
const getBuffetVersionById = async (req, res) => {
  try {
    // Get the ID from the URL
    const versionId = req.params.id;

    // Check if the ID is valid 
    if (!versionId || isNaN(versionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid buffet version ID number'
      });
    }

    // Ask the model to get that specific buffet version from the database
    const version = await buffetVersionModel.getBuffetVersionById(versionId);

    // Send back the buffet version data
    res.json({
      return_code: 'SUCCESS',
      message: 'Found the buffet version!',
      data: version
    });

  } catch (error) {
    // Check what kind of error happened
    if (error.message === 'Buffet version not found') {
      // The buffet version doesn't exist in the database
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'That buffet version does not exist'
      });
    }

    // Some other error happened somehow
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get that buffet version'
    });
  }
};

// ===== GET ALL BUFFET VERSIONS =====
/**
 * Get all active buffet versions
 * This is called when someone visits /api/buffet-versions
 *
 * Returns all the different buffet packages that customers can choose from.
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const getAllBuffetVersions = async (req, res) => {
  try {
    // Ask the model to get all buffet versions from the database
    const versions = await buffetVersionModel.getAllBuffetVersions();

    // Send all the buffet versions back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Got all buffet versions!',
      data: versions,
      count: versions.length
    });

  } catch (error) {
    // If something goes wrong
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get buffet versions'
    });
  }
};

// ===== EXPORTS =====
// Make these functions available to the routes file
module.exports = {
  getBuffetVersionById,
  getAllBuffetVersions
};

