// This file handles buffet version API requests

const buffetVersionModel = require('../models/buffetVersionModel');

/**
 * Get a specific buffet version by ID
 */
const getBuffetVersionById = async (req, res) => {
  try {
    const versionId = req.params.id;

    // Check if ID is valid
    if (!versionId || isNaN(versionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid buffet version ID number'
      });
    }

    // Get the buffet version from database
    const version = await buffetVersionModel.getBuffetVersionById(versionId);

    // Send back the buffet version
    res.json({
      return_code: 'SUCCESS',
      message: 'Found the buffet version!',
      data: version
    });

  } catch (error) {
    // If version doesn't exist
    if (error.message === 'Buffet version not found') {
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'That buffet version does not exist'
      });
    }

    // If something else goes wrong
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get that buffet version'
    });
  }
};

/**
 * Get all active buffet versions
 */
const getAllBuffetVersions = async (req, res) => {
  try {
    const versions = await buffetVersionModel.getAllBuffetVersions();

    res.json({
      return_code: 'SUCCESS',
      message: 'Got all buffet versions!',
      data: versions,
      count: versions.length
    });

  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get buffet versions'
    });
  }
};

module.exports = {
  getBuffetVersionById,
  getAllBuffetVersions
};

