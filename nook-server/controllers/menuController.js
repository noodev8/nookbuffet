// Menu Controller - Handles HTTP requests for menu data
// This file receives requests from routes and sends responses back to the frontend

// Import the menu model to get data from database
const menuModel = require('../models/menuModel');

/**
 * Get all menu sections with items
 * This function handles GET /api/menu requests
 */
const getAllMenuSections = async (req, res) => {
  try {
    console.log('📋 Getting all menu sections...');
    
    // Call the model to get data from database
    const sections = await menuModel.getAllMenuSections();
    
    console.log(`✅ Found ${sections.length} menu sections`);
    
    // Send successful response with data
    res.status(200).json({
      success: true,
      message: 'Menu sections retrieved successfully',
      data: sections,
      count: sections.length
    });
    
  } catch (error) {
    console.error('❌ Error in getAllMenuSections controller:', error.message);
    
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu sections',
      error: error.message
    });
  }
};

/**
 * Get a specific menu section by ID
 * This function handles GET /api/menu/:id requests
 */
const getMenuSectionById = async (req, res) => {
  try {
    // Get the section ID from the URL parameter
    const sectionId = req.params.id;
    
    console.log(`📋 Getting menu section with ID: ${sectionId}`);
    
    // Validate that ID is a number
    if (!sectionId || isNaN(sectionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section ID. Must be a number.'
      });
    }
    
    // Call the model to get data from database
    const section = await menuModel.getMenuSectionById(sectionId);
    
    console.log(`✅ Found section: ${section.name}`);
    
    // Send successful response with data
    res.status(200).json({
      success: true,
      message: 'Menu section retrieved successfully',
      data: section
    });
    
  } catch (error) {
    console.error('❌ Error in getMenuSectionById controller:', error.message);
    
    // Check if it's a "not found" error
    if (error.message === 'Section not found') {
      return res.status(404).json({
        success: false,
        message: 'Menu section not found'
      });
    }
    
    // Send general error response
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu section',
      error: error.message
    });
  }
};

/**
 * Get menu sections formatted for frontend
 * This function handles GET /api/menu/formatted requests
 * Returns data in the exact format your frontend expects
 */
const getFormattedMenuSections = async (req, res) => {
  try {
    console.log('📋 Getting formatted menu sections for frontend...');
    
    // Get all sections from model
    const sections = await menuModel.getAllMenuSections();
    
    // Format the data to match what your frontend expects
    const formattedSections = sections.map(section => ({
      id: section.id,
      title: section.name,
      description: section.description,
      image: section.image_url,
      items: section.items || []
    }));
    
    console.log(`✅ Formatted ${formattedSections.length} sections for frontend`);
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'Formatted menu sections retrieved successfully',
      sections: formattedSections
    });
    
  } catch (error) {
    console.error('❌ Error in getFormattedMenuSections controller:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve formatted menu sections',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  getAllMenuSections,
  getMenuSectionById,
  getFormattedMenuSections
};
