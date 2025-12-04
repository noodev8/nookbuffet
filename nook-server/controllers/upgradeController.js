/*
=======================================================================================================================================
UPGRADE CONTROLLER - Handles upgrade API requests
=======================================================================================================================================
handles requests for buffet upgrades - extra add-ons like dessert packages, drink upgrades etc
that customers can add to their buffet for an extra cost per person
=======================================================================================================================================
*/

const upgradeModel = require('../models/upgradeModel');

// ===== GET ALL UPGRADES =====
const getAllUpgrades = async (req, res) => {
  try {
    const upgrades = await upgradeModel.getAllUpgrades();
    res.json({
      return_code: 'SUCCESS',
      message: 'Got all upgrades',
      data: upgrades,
      count: upgrades.length
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get upgrades'
    });
  }
};

// ===== GET UPGRADES FOR A SPECIFIC BUFFET =====
// returns only upgrades available for that buffet version
const getUpgradesForBuffet = async (req, res) => {
  try {
    const buffetVersionId = req.params.buffetId;

    if (!buffetVersionId || isNaN(buffetVersionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid buffet version ID'
      });
    }

    const upgrades = await upgradeModel.getUpgradesForBuffet(buffetVersionId);
    res.json({
      return_code: 'SUCCESS',
      message: 'Got upgrades for buffet',
      data: upgrades,
      count: upgrades.length
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get upgrades for buffet'
    });
  }
};

// ===== CREATE NEW UPGRADE =====
const createUpgrade = async (req, res) => {
  try {
    const { name, description, pricePerPerson } = req.body;

    if (!name || !pricePerPerson) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Name and price per person are required'
      });
    }

    const upgrade = await upgradeModel.createUpgrade(name, description, pricePerPerson);
    res.json({
      return_code: 'SUCCESS',
      message: 'Upgrade created',
      data: upgrade
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not create upgrade'
    });
  }
};

// ===== LINK UPGRADE TO BUFFET =====
// makes an upgrade available for a specific buffet
const linkUpgradeToBuffet = async (req, res) => {
  try {
    const buffetVersionId = req.params.buffetId;
    const { upgradeId } = req.body;

    if (!buffetVersionId || isNaN(buffetVersionId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid buffet version ID'
      });
    }

    if (!upgradeId) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Upgrade ID is required'
      });
    }

    const link = await upgradeModel.linkUpgradeToBuffet(buffetVersionId, upgradeId);
    res.json({
      return_code: 'SUCCESS',
      message: 'Upgrade linked to buffet',
      data: link
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not link upgrade to buffet'
    });
  }
};

// ===== UPDATE UPGRADE =====
const updateUpgrade = async (req, res) => {
  try {
    const upgradeId = req.params.id;
    const { name, description, pricePerPerson } = req.body;

    if (!upgradeId || isNaN(upgradeId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid upgrade ID'
      });
    }

    const upgrade = await upgradeModel.updateUpgrade(upgradeId, name, description, pricePerPerson);
    res.json({
      return_code: 'SUCCESS',
      message: 'Upgrade updated',
      data: upgrade
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not update upgrade'
    });
  }
};

// ===== GET UPGRADE WITH ALL CATEGORIES AND ITEMS =====
// returns full upgrade structure for the order page
const getUpgradeWithItems = async (req, res) => {
  try {
    const upgradeId = req.params.id;

    if (!upgradeId || isNaN(upgradeId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid upgrade ID'
      });
    }

    const upgrade = await upgradeModel.getUpgradeWithItems(upgradeId);

    if (!upgrade) {
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'Upgrade not found'
      });
    }

    res.json({
      return_code: 'SUCCESS',
      message: 'Got upgrade with items',
      data: upgrade
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not get upgrade'
    });
  }
};

// ===== CREATE UPGRADE CATEGORY =====
const createUpgradeCategory = async (req, res) => {
  try {
    const upgradeId = req.params.id;
    const { name, description, numChoices, isRequired, position } = req.body;

    if (!upgradeId || isNaN(upgradeId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid upgrade ID'
      });
    }

    if (!name) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Category name is required'
      });
    }

    const category = await upgradeModel.createUpgradeCategory(
      upgradeId, name, description, numChoices || null, isRequired || false, position || 0
    );
    res.json({
      return_code: 'SUCCESS',
      message: 'Category created',
      data: category
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not create category'
    });
  }
};

// ===== CREATE UPGRADE ITEM =====
const createUpgradeItem = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { name, description } = req.body;

    if (!categoryId || isNaN(categoryId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid category ID'
      });
    }

    if (!name) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Item name is required'
      });
    }

    const item = await upgradeModel.createUpgradeItem(categoryId, name, description);
    res.json({
      return_code: 'SUCCESS',
      message: 'Item created',
      data: item
    });
  } catch (error) {
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Could not create item'
    });
  }
};

module.exports = {
  getAllUpgrades,
  getUpgradesForBuffet,
  createUpgrade,
  linkUpgradeToBuffet,
  updateUpgrade,
  getUpgradeWithItems,
  createUpgradeCategory,
  createUpgradeItem
};

