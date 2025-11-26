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
    // Ask the model to get all menu sections from the database
    const sections = await menuModel.getAllMenuSections();

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

// ===== GET MENU SECTIONS BY BUFFET VERSION =====
/**
 * Get menu sections filtered by buffet version ID
 * This is called when someone visits /api/menu/buffet-version/:id
 *
 * This returns only the menu sections that belong to a specific buffet version.
 * For example, if you want only the "Standard Buffet" menu items, pass in that buffet version's ID.
 *
 * @param {object} req - The request object (contains the buffet version ID in req.params.id)
 * @param {object} res - The response object (we use this to send data back)
 */
const getMenuSectionsByBuffetVersion = async (req, res) => {
  try {
    // Get the buffet version ID from the URL
    // If someone visits /api/menu/buffet-version/1, then req.params.id = 1
    const buffetVersionId = req.params.id;

    // Check if the ID is valid (must be a number)
    if (!buffetVersionId || isNaN(buffetVersionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid buffet version ID number'
      });
    }

    // Ask the model to get menu sections for this buffet version from the database
    const sections = await menuModel.getMenuSectionsByBuffetVersion(buffetVersionId);

    // Send the menu data back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Got menu sections for buffet version!',
      data: sections,
      count: sections.length
    });

  } catch (error) {
    // If something goes wrong, log it and tell the website
    console.error('Error getting menu sections by buffet version:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get menu data for this buffet version'
    });
  }
};

// ===== GET ALL MENU ITEMS FOR MANAGEMENT =====
/**
 * Get all menu items for admin management
 * This is called when someone visits /api/menu/manage
 *
 * Returns all menu items with their stock status for the admin panel.
 * Only accessible by admin and manager roles.
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const getAllMenuItemsForManagement = async (req, res) => {
  try {
    // Get all menu items from the database
    const items = await menuModel.getAllMenuItemsForManagement();

    // Send the data back
    res.json({
      return_code: 'SUCCESS',
      message: 'Got all menu items for management',
      data: items,
      count: items.length
    });

  } catch (error) {
    console.error('Error getting menu items for management:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get menu items for management'
    });
  }
};

// ===== UPDATE MENU ITEM STOCK STATUS =====
/**
 * Update the stock status of a menu item
 * This is called when someone makes a PATCH request to /api/menu/manage/:id
 *
 * Updates whether an item is in stock or out of stock.
 * Only accessible by admin and manager roles.
 *
 * @param {object} req - The request object (contains item ID and new status)
 * @param {object} res - The response object
 */
const updateMenuItemStockStatus = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { is_active } = req.body;

    // Validate input
    if (!itemId || isNaN(itemId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid menu item ID'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.json({
        return_code: 'INVALID_DATA',
        message: 'is_active must be a boolean value'
      });
    }

    // Update the item in the database
    const updatedItem = await menuModel.updateMenuItemStockStatus(itemId, is_active);

    // Send success response
    res.json({
      return_code: 'SUCCESS',
      message: `Menu item ${is_active ? 'marked as in stock' : 'marked as out of stock'}`,
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating menu item stock status:', error);

    if (error.message === 'Menu item not found') {
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'Menu item not found'
      });
    }

    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not update menu item stock status'
    });
  }
};

// ===== EXPORTS =====
// Make these functions available to the routes file
module.exports = {
  getAllMenuSections,
  getMenuSectionsByBuffetVersion,
  getAllMenuItemsForManagement,
  updateMenuItemStockStatus
};
