/*
=======================================================================================================================================
MENU CONTROLLER - Handles all menu-related API requests
=======================================================================================================================================
This file is the "brain" for menu requests. When someone asks for menu data via the API,
this file figures out what they want and gets it from the database.

Controllers are like the middle person between the routes (which receive requests) and the models
(which talk to the database). The controller:
1. Receives the request
2. Asks the model to get data from the database
3. Formats the response
4. Sends it back to the website
=======================================================================================================================================
*/

// Import the menu model - this has all the database queries for menu stuff
const menuModel = require('../models/menuModel');

// ===== GET ALL MENU SECTIONS =====
/**
 * Get all menu sections with their items
 * This is called when someone visits /api/menu
 *
 * @param {object} req - The request object (contains info about what the user asked for)
 * @param {object} res - The response object (we use this to send data back)
 */
const getAllMenuSections = async (req, res) => {
  try {
    console.log('getAllMenuSections called');

    // Ask the model to get all menu sections from the database
    const sections = await menuModel.getAllMenuSections();

    console.log('Menu sections retrieved:', sections.length, 'sections');
    if (sections.length > 0) {
      console.log('First section price_per_person:', sections[0].price_per_person);
    }

    // Send the menu data back to the website in JSON format
    // return_code tells the website if it was successful or not
    res.json({
      return_code: 'SUCCESS',
      message: 'Got the menu!',
      data: sections,                    // The actual menu data
      count: sections.length             // How many sections we got
    });

  } catch (error) {
    // If something goes wrong, log it and tell the website
    console.error('Error getting menu sections:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get menu data'
    });
  }
};

// ===== GET ONE SPECIFIC MENU SECTION =====
/**
 * Get a single menu section by its ID
 * This is called when someone visits /api/menu/1 (or any number)
 *
 * @param {object} req - The request object (contains the ID in req.params.id)
 * @param {object} res - The response object (we use this to send data back)
 */
const getMenuSectionById = async (req, res) => {
  try {
    // Get the ID from the URL
    // If someone visits /api/menu/5, then req.params.id = 5
    const sectionId = req.params.id;

    // Check if the ID is valid (must be a number)
    if (!sectionId || isNaN(sectionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid section ID number'
      });
    }

    // Ask the model to get that specific section from the database
    const section = await menuModel.getMenuSectionById(sectionId);

    // Send the section data back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Found the menu section!',
      data: section
    });

  } catch (error) {
    // Check what kind of error happened
    if (error.message === 'Section not found') {
      // The section doesn't exist in the database
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'That menu section does not exist'
      });
    }

    // Some other error happened
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get that menu section'
    });
  }
};

// ===== GET FORMATTED MENU SECTIONS =====
/**
 * Get all menu sections but formatted the way the website expects
 * This is called when someone visits /api/menu/formatted
 *
 * Sometimes the database has data in one format, but the website needs it in a different format.
 * This function transforms the data to match what the website expects.
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const getFormattedMenuSections = async (req, res) => {
  try {
    // Get all menu sections from the database
    const sections = await menuModel.getAllMenuSections();

    // Transform the data to match what the website expects
    // This is like translating from one language to another
    const formattedSections = sections.map(section => ({
      id: section.id,
      title: section.name,              // Database calls it "name", website expects "title"
      description: section.description,
      image: section.image_url,         // Database calls it "image_url", website expects "image"
      items: section.items || []        // If no items, use empty array instead of null
    }));

    // Send the formatted data back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Got formatted menu data!',
      sections: formattedSections
    });

  } catch (error) {
    // If something goes wrong
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get formatted menu data'
    });
  }
};

// ===== EXPORTS =====
// Make these functions available to the routes file
module.exports = {
  getAllMenuSections,
  getMenuSectionById,
  getFormattedMenuSections
};
