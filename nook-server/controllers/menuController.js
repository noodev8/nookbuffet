/*
=======================================================================================================================================
MENU CONTROLLER - Handles all menu-related API requests
=======================================================================================================================================
This file is for menu requests. When someone asks for menu data via the API,
this file figures out what they want and gets it from the database.

=======================================================================================================================================
*/

// Import the menu model - this has all the database queries for menu stuff
const menuModel = require('../models/menuModel');

// ===== GET ALL MENU SECTIONS =====
/**
 * Get all menu sections with their items
 * This is called when someone visits /api/menu
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object 
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
      count: sections.length             // How many sections 
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
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object 
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

    // Optional branch filter via query param e.g. /api/menu/buffet-version/1?branch_id=2
    const branchId = req.query.branch_id ? parseInt(req.query.branch_id) : null;

    // Ask the model to get menu sections for this buffet version from the database
    const sections = await menuModel.getMenuSectionsByBuffetVersion(buffetVersionId, branchId);

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
    // Optional branch filter via query param e.g. /api/menu/manage?branch_id=2
    const branchId = req.query.branch_id ? parseInt(req.query.branch_id) : null;
    const items = await menuModel.getAllMenuItemsForManagement(branchId);

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

// ===== GET CATEGORIES FOR MANAGEMENT =====
/**
 * Get all categories for a buffet version (protected, manager/admin only)
 * GET /api/menu/manage/categories?buffet_version_id=1
 */
const getCategoriesForManagement = async (req, res) => {
  try {
    const buffetVersionId = req.query.buffet_version_id ? parseInt(req.query.buffet_version_id) : null;

    if (!buffetVersionId || isNaN(buffetVersionId)) {
      return res.json({
        return_code: 'INVALID_DATA',
        message: 'Please provide a valid buffet_version_id'
      });
    }

    const categories = await menuModel.getCategoriesForManagement(buffetVersionId);
    res.json({ return_code: 'SUCCESS', message: 'Got categories', data: categories, count: categories.length });
  } catch (error) {
    console.error('Error getting categories for management:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get categories' });
  }
};

// ===== CREATE CATEGORY =====
/**
 * Create a new menu category (protected, manager/admin only)
 * POST /api/menu/manage/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, buffet_version_id, position, is_required } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    }
    if (!buffet_version_id || isNaN(parseInt(buffet_version_id))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'buffet_version_id is required' });
    }

    const created = await menuModel.createCategory(
      name.trim(),
      description ? description.trim() : null,
      parseInt(buffet_version_id),
      position !== undefined ? parseInt(position) : 0,
      is_required === true || is_required === 'true'
    );

    res.json({ return_code: 'SUCCESS', message: 'Category created successfully', data: created });
  } catch (error) {
    console.error('Error creating category:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create category' });
  }
};

// ===== CREATE MENU ITEM =====
/**
 * Create a new menu item (protected, manager/admin only)
 * POST /api/menu/manage/items
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, description, category_id, dietary_info, allergens, is_included_in_base, branch_id } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    }
    if (!category_id || isNaN(parseInt(category_id))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'category_id is required' });
    }

    const created = await menuModel.createMenuItem(
      name.trim(),
      description ? description.trim() : null,
      parseInt(category_id),
      dietary_info ? dietary_info.trim() : null,
      allergens ? allergens.trim() : null,
      is_included_in_base !== false && is_included_in_base !== 'false',
      branch_id ? parseInt(branch_id) : null
    );

    res.json({ return_code: 'SUCCESS', message: 'Menu item created successfully', data: created });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create menu item' });
  }
};

// ===== UPDATE CATEGORY =====
/**
 * Update an existing category (protected, manager/admin only)
 * PATCH /api/menu/manage/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid category ID' });

    const { name, description, position, is_required } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    }

    const updated = await menuModel.updateCategory(
      id, name.trim(), description ? description.trim() : null,
      position !== undefined ? parseInt(position) : 0,
      is_required === true || is_required === 'true'
    );
    res.json({ return_code: 'SUCCESS', message: 'Category updated successfully', data: updated });
  } catch (error) {
    if (error.message === 'Category not found') return res.json({ return_code: 'NOT_FOUND', message: 'Category not found' });
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update category' });
  }
};

// ===== UPDATE MENU ITEM =====
/**
 * Update an existing menu item's details (protected, manager/admin only)
 * PATCH /api/menu/manage/items/:id
 */
const updateMenuItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid menu item ID' });

    const { name, description, category_id, dietary_info, allergens, is_included_in_base } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    }
    if (!category_id || isNaN(parseInt(category_id))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'category_id is required' });
    }

    const updated = await menuModel.updateMenuItem(
      id, name.trim(), description ? description.trim() : null,
      parseInt(category_id), dietary_info ? dietary_info.trim() : null,
      allergens ? allergens.trim() : null,
      is_included_in_base !== false && is_included_in_base !== 'false'
    );
    res.json({ return_code: 'SUCCESS', message: 'Menu item updated successfully', data: updated });
  } catch (error) {
    if (error.message === 'Menu item not found') return res.json({ return_code: 'NOT_FOUND', message: 'Menu item not found' });
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update menu item' });
  }
};

// ===== EXPORTS =====
// Make these functions available to the routes file
module.exports = {
  getAllMenuSections,
  getMenuSectionsByBuffetVersion,
  getAllMenuItemsForManagement,
  updateMenuItemStockStatus,
  getCategoriesForManagement,
  createCategory,
  createMenuItem,
  updateCategory,
  updateMenuItem
};
