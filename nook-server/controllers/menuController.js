// This file gets menu data from the database and sends it to the website

// Get the database functions
const menuModel = require('../models/menuModel');

// Get all menu sections (like "Sandwiches", "Salads", etc.)
const getAllMenuSections = async (req, res) => {
  try {
    // Get menu data from database
    const sections = await menuModel.getAllMenuSections();

    // Send the menu data back to the website
    res.json({
      success: true,
      message: 'Got the menu!',
      data: sections,
      count: sections.length
    });

  } catch (error) {
    // If something goes wrong, tell the website
    res.json({
      success: false,
      message: 'Could not get menu data'
    });
  }
};

// Get one specific menu section (like just "Sandwiches")
const getMenuSectionById = async (req, res) => {
  try {
    // Get the ID from the URL (like /api/menu/1)
    const sectionId = req.params.id;

    // Check if the ID is a valid number
    if (!sectionId || isNaN(sectionId)) {
      return res.json({
        success: false,
        message: 'Please provide a valid section ID number'
      });
    }

    // Get that specific section from database
    const section = await menuModel.getMenuSectionById(sectionId);

    // Send the section data back to the website
    res.json({
      success: true,
      message: 'Found the menu section!',
      data: section
    });

  } catch (error) {
    // If section doesn't exist
    if (error.message === 'Section not found') {
      return res.json({
        success: false,
        message: 'That menu section does not exist'
      });
    }

    // If something else goes wrong
    res.json({
      success: false,
      message: 'Could not get that menu section'
    });
  }
};

// Get menu data formatted exactly how the website needs it
const getFormattedMenuSections = async (req, res) => {
  try {
    // Get all menu sections from database
    const sections = await menuModel.getAllMenuSections();

    // Change the data format to match what the website expects
    const formattedSections = sections.map(section => ({
      id: section.id,
      title: section.name,              // Change "name" to "title"
      description: section.description,
      image: section.image_url,         // Change "image_url" to "image"
      items: section.items || []
    }));

    // Send the formatted data to the website
    res.json({
      success: true,
      message: 'Got formatted menu data!',
      sections: formattedSections
    });

  } catch (error) {
    // If something goes wrong
    res.json({
      success: false,
      message: 'Could not get formatted menu data'
    });
  }
};

// Export these functions so other files can use them
module.exports = {
  getAllMenuSections,
  getMenuSectionById,
  getFormattedMenuSections
};
