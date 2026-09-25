/*
=======================================================================================================================================
SANDWICH MODEL - Database queries for the build-your-own sandwich menu
=======================================================================================================================================
A sandwich is built step by step (bread, fillings, sauce, toasted...). Each step says how many options
can be picked, and each option can add to the base price. The base price and the on/off switch are
stored in order_config.
=======================================================================================================================================
*/

const { query } = require('../database');

const STEP_FIELDS = 'id, name, description, min_choices, max_choices, position';
const OPTION_FIELDS = 'id, step_id, name, description, extra_price, is_active';

// ===== GET THE WHOLE SANDWICH MENU FOR MANAGEMENT =====
// Two queries (steps, then all their options) rather than one per step
const getMenuForManagement = async () => {
  const stepsResult = await query(
    `SELECT ${STEP_FIELDS} FROM sandwich_steps WHERE is_deleted = false ORDER BY position, id`
  );
  const optionsResult = await query(
    `SELECT o.id, o.step_id, o.name, o.description, o.extra_price, o.is_active
     FROM sandwich_options o
     JOIN sandwich_steps s ON s.id = o.step_id AND s.is_deleted = false
     WHERE o.is_deleted = false
     ORDER BY o.id`
  );

  const steps = stepsResult.rows.map(step => ({ ...step, options: [] }));
  const byId = new Map(steps.map(step => [step.id, step]));
  for (const option of optionsResult.rows) byId.get(option.step_id)?.options.push(option);
  return steps;
};

// ===== SETTINGS (base price, on/off) =====
const getSettings = async () => {
  const result = await query(
    `SELECT config_key, config_value FROM order_config
     WHERE config_key IN ('sandwich_base_price', 'sandwiches_enabled')`
  );
  const config = Object.fromEntries(result.rows.map(r => [r.config_key, r.config_value]));
  return {
    base_price: config.sandwich_base_price ?? '0.00',
    enabled: config.sandwiches_enabled === 'true',
  };
};

// Update a config value, adding the row if it is missing
const setConfig = async (key, value, description) => {
  const updated = await query(
    `UPDATE order_config SET config_value = $1, updated_at = CURRENT_TIMESTAMP WHERE config_key = $2 RETURNING id`,
    [value, key]
  );
  if (updated.rows.length === 0) {
    await query(
      `INSERT INTO order_config (config_key, config_value, description) VALUES ($1, $2, $3)`,
      [key, value, description]
    );
  }
};

const updateSettings = async (basePrice, enabled) => {
  await setConfig('sandwich_base_price', basePrice.toFixed(2), 'Price of a sandwich before any extras');
  await setConfig('sandwiches_enabled', enabled ? 'true' : 'false', 'Whether customers can order sandwiches on the website');
  return getSettings();
};

// ===== STEPS =====
const createStep = async ({ name, description, min_choices, max_choices }) => {
  // New steps go on the end
  const result = await query(
    `INSERT INTO sandwich_steps (name, description, min_choices, max_choices, position)
     VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(position) + 1, 0) FROM sandwich_steps WHERE is_deleted = false))
     RETURNING ${STEP_FIELDS}`,
    [name, description, min_choices, max_choices]
  );
  return { ...result.rows[0], options: [] };
};

const updateStep = async (id, { name, description, min_choices, max_choices }) => {
  const result = await query(
    `UPDATE sandwich_steps SET name = $1, description = $2, min_choices = $3, max_choices = $4
     WHERE id = $5 AND is_deleted = false
     RETURNING ${STEP_FIELDS}`,
    [name, description, min_choices, max_choices, id]
  );
  return result.rows[0] || null;
};

const updateStepPositions = async (updates) => {
  for (const { id, position } of updates) {
    await query('UPDATE sandwich_steps SET position = $1 WHERE id = $2', [position, id]);
  }
};

// Soft delete - rows are kept so future orders can still show what was picked
const deleteStep = async (id) => {
  const result = await query(
    'UPDATE sandwich_steps SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id',
    [id]
  );
  return result.rows.length > 0;
};

// ===== OPTIONS =====
const createOption = async (stepId, { name, description, extra_price }) => {
  const result = await query(
    `INSERT INTO sandwich_options (step_id, name, description, extra_price)
     SELECT id, $2, $3, $4 FROM sandwich_steps WHERE id = $1 AND is_deleted = false
     RETURNING ${OPTION_FIELDS}`,
    [stepId, name, description, extra_price]
  );
  return result.rows[0] || null;
};

const updateOption = async (id, { name, description, extra_price }) => {
  const result = await query(
    `UPDATE sandwich_options SET name = $1, description = $2, extra_price = $3
     WHERE id = $4 AND is_deleted = false
     RETURNING ${OPTION_FIELDS}`,
    [name, description, extra_price, id]
  );
  return result.rows[0] || null;
};

const setOptionStock = async (id, isActive) => {
  const result = await query(
    `UPDATE sandwich_options SET is_active = $1 WHERE id = $2 AND is_deleted = false RETURNING ${OPTION_FIELDS}`,
    [isActive, id]
  );
  return result.rows[0] || null;
};

const deleteOption = async (id) => {
  const result = await query(
    'UPDATE sandwich_options SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id',
    [id]
  );
  return result.rows.length > 0;
};

module.exports = {
  getMenuForManagement,
  getSettings,
  updateSettings,
  createStep,
  updateStep,
  updateStepPositions,
  deleteStep,
  createOption,
  updateOption,
  setOptionStock,
  deleteOption
};
