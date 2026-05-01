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

// ===== GET ALL UPGRADES FOR MANAGEMENT =====
const getAllUpgradesForManagement = async (req, res) => {
  try {
    const upgrades = await upgradeModel.getAllUpgradesForManagement();
    res.json({ return_code: 'SUCCESS', message: 'Got upgrades for management', data: upgrades });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get upgrades' });
  }
};

// ===== CREATE UPGRADE =====
const createUpgrade = async (req, res) => {
  try {
    const { name, description, price_per_person } = req.body;
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    if (price_per_person === undefined || isNaN(parseFloat(price_per_person))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'price_per_person is required' });
    }
    const upgrade = await upgradeModel.createUpgrade(name.trim(), description?.trim() || null, parseFloat(price_per_person));
    res.json({ return_code: 'SUCCESS', message: 'Upgrade created', data: upgrade });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create upgrade' });
  }
};

// ===== UPDATE UPGRADE =====
const updateUpgrade = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price_per_person } = req.body;
    if (!id || isNaN(id)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid upgrade ID' });
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    if (price_per_person === undefined || isNaN(parseFloat(price_per_person))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'price_per_person is required' });
    }
    const upgrade = await upgradeModel.updateUpgrade(id, name.trim(), description?.trim() || null, parseFloat(price_per_person));
    if (!upgrade) return res.json({ return_code: 'NOT_FOUND', message: 'Upgrade not found' });
    res.json({ return_code: 'SUCCESS', message: 'Upgrade updated', data: upgrade });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update upgrade' });
  }
};

// ===== GET BUFFET VERSION LINKS FOR AN UPGRADE =====
const getBuffetVersionLinksForUpgrade = async (req, res) => {
  try {
    const upgradeId = parseInt(req.params.upgradeId);
    if (!upgradeId || isNaN(upgradeId)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid upgrade ID' });
    const links = await upgradeModel.getBuffetVersionLinksForUpgrade(upgradeId);
    res.json({ return_code: 'SUCCESS', message: 'Got buffet links', data: links });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get buffet links' });
  }
};

// ===== CREATE UPGRADE CATEGORY =====
const createUpgradeCategory = async (req, res) => {
  try {
    const upgradeId = parseInt(req.params.upgradeId);
    const { name, description, num_choices, is_required, position } = req.body;
    if (!upgradeId || isNaN(upgradeId)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid upgrade ID' });
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    const cat = await upgradeModel.createUpgradeCategory(
      upgradeId, name.trim(), description?.trim() || null,
      num_choices ? parseInt(num_choices) : null,
      is_required === true || is_required === 'true',
      position !== undefined ? parseInt(position) : 0
    );
    res.json({ return_code: 'SUCCESS', message: 'Category created', data: cat });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create category' });
  }
};

// ===== UPDATE UPGRADE CATEGORY =====
const updateUpgradeCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.catId);
    const { name, description, num_choices, is_required } = req.body;
    if (!id || isNaN(id)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid category ID' });
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    const cat = await upgradeModel.updateUpgradeCategory(
      id, name.trim(), description?.trim() || null,
      num_choices ? parseInt(num_choices) : null,
      is_required === true || is_required === 'true'
    );
    if (!cat) return res.json({ return_code: 'NOT_FOUND', message: 'Category not found' });
    res.json({ return_code: 'SUCCESS', message: 'Category updated', data: cat });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update category' });
  }
};

// ===== CREATE UPGRADE ITEM =====
const createUpgradeItem = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.catId);
    const { name, description } = req.body;
    if (!categoryId || isNaN(categoryId)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid category ID' });
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    const item = await upgradeModel.createUpgradeItem(categoryId, name.trim(), description?.trim() || null);
    res.json({ return_code: 'SUCCESS', message: 'Item created', data: item });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create item' });
  }
};

// ===== UPDATE UPGRADE ITEM =====
const updateUpgradeItem = async (req, res) => {
  try {
    const id = parseInt(req.params.itemId);
    const { name, description } = req.body;
    if (!id || isNaN(id)) return res.json({ return_code: 'INVALID_ID', message: 'Invalid item ID' });
    if (!name?.trim()) return res.json({ return_code: 'INVALID_DATA', message: 'name is required' });
    const item = await upgradeModel.updateUpgradeItem(id, name.trim(), description?.trim() || null);
    if (!item) return res.json({ return_code: 'NOT_FOUND', message: 'Item not found' });
    res.json({ return_code: 'SUCCESS', message: 'Item updated', data: item });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update item' });
  }
};

// ===== GET ALL UPGRADES WITH LINK STATUS FOR A BUFFET (management) =====
const getBuffetUpgradeLinks = async (req, res) => {
  try {
    const buffetVersionId = parseInt(req.params.buffetId);
    if (!buffetVersionId || isNaN(buffetVersionId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Please provide a valid buffet version ID' });
    }
    const upgrades = await upgradeModel.getBuffetUpgradeLinks(buffetVersionId);
    res.json({ return_code: 'SUCCESS', message: 'Got upgrade links', data: upgrades });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get upgrade links' });
  }
};

// ===== LINK AN UPGRADE TO A BUFFET VERSION =====
const linkUpgradeToBuffet = async (req, res) => {
  try {
    const buffetVersionId = parseInt(req.params.buffetId);
    const upgradeId = parseInt(req.params.upgradeId);
    if (!buffetVersionId || isNaN(buffetVersionId) || !upgradeId || isNaN(upgradeId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Please provide valid IDs' });
    }
    await upgradeModel.linkUpgradeToBuffet(buffetVersionId, upgradeId);
    res.json({ return_code: 'SUCCESS', message: 'Upgrade linked to buffet' });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not link upgrade' });
  }
};

// ===== UNLINK AN UPGRADE FROM A BUFFET VERSION =====
const unlinkUpgradeFromBuffet = async (req, res) => {
  try {
    const buffetVersionId = parseInt(req.params.buffetId);
    const upgradeId = parseInt(req.params.upgradeId);
    if (!buffetVersionId || isNaN(buffetVersionId) || !upgradeId || isNaN(upgradeId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Please provide valid IDs' });
    }
    await upgradeModel.unlinkUpgradeFromBuffet(buffetVersionId, upgradeId);
    res.json({ return_code: 'SUCCESS', message: 'Upgrade removed from buffet' });
  } catch {
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not unlink upgrade' });
  }
};

module.exports = {
  getAllUpgrades,
  getUpgradesForBuffet,
  getUpgradeWithItems,
  getAllUpgradesForManagement,
  createUpgrade,
  updateUpgrade,
  getBuffetVersionLinksForUpgrade,
  createUpgradeCategory,
  updateUpgradeCategory,
  createUpgradeItem,
  updateUpgradeItem,
  getBuffetUpgradeLinks,
  linkUpgradeToBuffet,
  unlinkUpgradeFromBuffet
};

