/*
=======================================================================================================================================
UPGRADE MODEL - Database queries for buffet upgrades
=======================================================================================================================================
handles getting upgrade info from the database - things like dessert upgrades, drink packages etc
that customers can add on to their buffet order for an extra cost per person
=======================================================================================================================================
*/

const { query } = require('../database');

// ===== GET ALL ACTIVE UPGRADES =====
const getAllUpgrades = async () => {
  try {
    const result = await query(
      `SELECT id, name, description, price_per_person, is_active, created_at
       FROM upgrades
       WHERE is_active = true
       ORDER BY name`
    );
    return result.rows;
  } catch (error) {
    console.error('Could not get upgrades:', error);
    throw error;
  }
};

// ===== GET UPGRADE BY ID =====
const getUpgradeById = async (upgradeId) => {
  try {
    const result = await query(
      `SELECT id, name, description, price_per_person, is_active, created_at
       FROM upgrades
       WHERE id = $1 AND is_active = true`,
      [upgradeId]
    );
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Could not get upgrade:', error);
    throw error;
  }
};

// ===== GET UPGRADES FOR A SPECIFIC BUFFET =====
// returns only upgrades that are linked to this buffet version
const getUpgradesForBuffet = async (buffetVersionId) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.description, u.price_per_person
       FROM upgrades u
       INNER JOIN buffet_upgrades bu ON u.id = bu.upgrade_id
       WHERE bu.buffet_version_id = $1 
         AND bu.is_active = true 
         AND u.is_active = true
       ORDER BY u.name`,
      [buffetVersionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Could not get upgrades for buffet:', error);
    throw error;
  }
};

// ===== GET UPGRADE WITH CATEGORIES AND ITEMS =====
// returns full upgrade structure with all categories and their items
const getUpgradeWithItems = async (upgradeId) => {
  try {
    // Get the upgrade
    const upgradeResult = await query(
      `SELECT id, name, description, price_per_person
       FROM upgrades
       WHERE id = $1 AND is_active = true`,
      [upgradeId]
    );

    if (!upgradeResult.rows || upgradeResult.rows.length === 0) {
      return null;
    }

    const upgrade = upgradeResult.rows[0];

    // Get categories for this upgrade
    const categoriesResult = await query(
      `SELECT id, name, description, num_choices, is_required, position
       FROM upgrade_categories
       WHERE upgrade_id = $1 AND is_active = true
       ORDER BY position, name`,
      [upgradeId]
    );

    upgrade.categories = categoriesResult.rows;

    // Get items for each category
    for (const category of upgrade.categories) {
      const itemsResult = await query(
        `SELECT id, name, description
         FROM upgrade_items
         WHERE upgrade_category_id = $1 AND is_active = true
         ORDER BY name`,
        [category.id]
      );
      category.items = itemsResult.rows;
    }

    return upgrade;
  } catch (error) {
    console.error('Could not get upgrade with items:', error);
    throw error;
  }
};

module.exports = {
  getAllUpgrades,
  getUpgradeById,
  getUpgradesForBuffet,
  getUpgradeWithItems
};

