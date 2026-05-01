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

// ===== GET ALL UPGRADES FOR MANAGEMENT (with categories and items) =====
const getAllUpgradesForManagement = async () => {
  try {
    const upgradesResult = await query(
      `SELECT id, name, description, price_per_person, is_active FROM upgrades ORDER BY name`
    );
    const upgrades = upgradesResult.rows;

    for (const upgrade of upgrades) {
      const catsResult = await query(
        `SELECT id, name, description, num_choices, is_required, position
         FROM upgrade_categories WHERE upgrade_id = $1 ORDER BY position, name`,
        [upgrade.id]
      );
      upgrade.categories = catsResult.rows;
      for (const cat of upgrade.categories) {
        const itemsResult = await query(
          `SELECT id, name, description FROM upgrade_items WHERE upgrade_category_id = $1 ORDER BY name`,
          [cat.id]
        );
        cat.items = itemsResult.rows;
      }
    }
    return upgrades;
  } catch (error) {
    console.error('Could not get upgrades for management:', error);
    throw error;
  }
};

// ===== CREATE UPGRADE =====
const createUpgrade = async (name, description, pricePerPerson) => {
  try {
    const result = await query(
      `INSERT INTO upgrades (name, description, price_per_person, is_active)
       VALUES ($1, $2, $3, true) RETURNING id, name, description, price_per_person, is_active`,
      [name, description || null, pricePerPerson]
    );
    return { ...result.rows[0], categories: [] };
  } catch (error) {
    console.error('Could not create upgrade:', error);
    throw error;
  }
};

// ===== UPDATE UPGRADE =====
const updateUpgrade = async (id, name, description, pricePerPerson) => {
  try {
    const result = await query(
      `UPDATE upgrades SET name = $1, description = $2, price_per_person = $3
       WHERE id = $4 RETURNING id, name, description, price_per_person, is_active`,
      [name, description || null, pricePerPerson, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Could not update upgrade:', error);
    throw error;
  }
};

// ===== GET BUFFET VERSION LINKS FOR AN UPGRADE =====
// returns all active buffet versions with is_linked flag for this upgrade
const getBuffetVersionLinksForUpgrade = async (upgradeId) => {
  try {
    const result = await query(
      `SELECT bv.id, bv.title, bv.branch_id,
              CASE WHEN bu.id IS NOT NULL THEN true ELSE false END AS is_linked
       FROM buffet_versions bv
       LEFT JOIN buffet_upgrades bu ON bu.buffet_version_id = bv.id
         AND bu.upgrade_id = $1 AND bu.is_active = true
       WHERE bv.is_active = true
       ORDER BY bv.title`,
      [upgradeId]
    );
    return result.rows;
  } catch (error) {
    console.error('Could not get buffet version links for upgrade:', error);
    throw error;
  }
};

// ===== CREATE UPGRADE CATEGORY =====
const createUpgradeCategory = async (upgradeId, name, description, numChoices, isRequired, position) => {
  try {
    const result = await query(
      `INSERT INTO upgrade_categories (upgrade_id, name, description, num_choices, is_required, position, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, upgrade_id, name, description, num_choices, is_required, position`,
      [upgradeId, name, description || null, numChoices || null, isRequired || false, position || 0]
    );
    return { ...result.rows[0], items: [] };
  } catch (error) {
    console.error('Could not create upgrade category:', error);
    throw error;
  }
};

// ===== UPDATE UPGRADE CATEGORY =====
const updateUpgradeCategory = async (id, name, description, numChoices, isRequired) => {
  try {
    const result = await query(
      `UPDATE upgrade_categories SET name = $1, description = $2, num_choices = $3, is_required = $4
       WHERE id = $5 RETURNING id, upgrade_id, name, description, num_choices, is_required, position`,
      [name, description || null, numChoices || null, isRequired || false, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Could not update upgrade category:', error);
    throw error;
  }
};

// ===== CREATE UPGRADE ITEM =====
const createUpgradeItem = async (categoryId, name, description) => {
  try {
    const result = await query(
      `INSERT INTO upgrade_items (upgrade_category_id, name, description, is_active)
       VALUES ($1, $2, $3, true) RETURNING id, upgrade_category_id, name, description`,
      [categoryId, name, description || null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Could not create upgrade item:', error);
    throw error;
  }
};

// ===== UPDATE UPGRADE ITEM =====
const updateUpgradeItem = async (id, name, description) => {
  try {
    const result = await query(
      `UPDATE upgrade_items SET name = $1, description = $2
       WHERE id = $3 RETURNING id, upgrade_category_id, name, description`,
      [name, description || null, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Could not update upgrade item:', error);
    throw error;
  }
};

// ===== GET ALL UPGRADES WITH LINK STATUS FOR A BUFFET VERSION =====
// returns all active upgrades, each with is_linked=true/false for this buffet version
const getBuffetUpgradeLinks = async (buffetVersionId) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.description, u.price_per_person,
              CASE WHEN bu.id IS NOT NULL THEN true ELSE false END AS is_linked
       FROM upgrades u
       LEFT JOIN buffet_upgrades bu
         ON bu.upgrade_id = u.id
         AND bu.buffet_version_id = $1
         AND bu.is_active = true
       WHERE u.is_active = true
       ORDER BY u.name`,
      [buffetVersionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Could not get buffet upgrade links:', error);
    throw error;
  }
};

// ===== LINK AN UPGRADE TO A BUFFET VERSION =====
// inserts a row into buffet_upgrades (or reactivates an existing soft-deleted one)
const linkUpgradeToBuffet = async (buffetVersionId, upgradeId) => {
  try {
    // Try to reactivate a previously deactivated link first
    const update = await query(
      `UPDATE buffet_upgrades
       SET is_active = true
       WHERE buffet_version_id = $1 AND upgrade_id = $2
       RETURNING id`,
      [buffetVersionId, upgradeId]
    );
    if (update.rows.length > 0) return update.rows[0];

    // Otherwise insert a fresh link
    const insert = await query(
      `INSERT INTO buffet_upgrades (buffet_version_id, upgrade_id, is_active)
       VALUES ($1, $2, true)
       RETURNING id`,
      [buffetVersionId, upgradeId]
    );
    return insert.rows[0];
  } catch (error) {
    console.error('Could not link upgrade to buffet:', error);
    throw error;
  }
};

// ===== UNLINK AN UPGRADE FROM A BUFFET VERSION =====
// soft-deletes the link row
const unlinkUpgradeFromBuffet = async (buffetVersionId, upgradeId) => {
  try {
    await query(
      `UPDATE buffet_upgrades
       SET is_active = false
       WHERE buffet_version_id = $1 AND upgrade_id = $2`,
      [buffetVersionId, upgradeId]
    );
  } catch (error) {
    console.error('Could not unlink upgrade from buffet:', error);
    throw error;
  }
};

module.exports = {
  getAllUpgrades,
  getUpgradeById,
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

