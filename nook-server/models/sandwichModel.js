/*
=======================================================================================================================================
SANDWICH MODEL - Database queries for the build-your-own sandwich menu
=======================================================================================================================================
A sandwich is built step by step (bread, fillings, sauce, toasted...). Each step says how many options
can be picked and how many are included in the base price, with a price for each one after that.
Each option can also add its own extra to the price. The base price and the on/off switch are
stored in order_config.
=======================================================================================================================================
*/

const { query } = require('../database');

const STEP_FIELDS = 'id, name, description, min_choices, max_choices, included_choices, extra_choice_price, position';
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

// ===== THE SANDWICH MENU CUSTOMERS SEE =====
// Only in-stock options. Optional steps with nothing in stock are left out. If a required
// step has nothing in stock no sandwich can be built, so sold_out is set instead.
const getMenuForCustomers = async () => {
  const steps = await getMenuForManagement();
  const available = steps
    .map(step => ({ ...step, options: step.options.filter(o => o.is_active) }))
    .filter(step => step.options.length > 0 || step.min_choices > 0);
  const soldOut = available.some(step => step.options.length < step.min_choices);
  return { steps: soldOut ? [] : available, sold_out: soldOut };
};

// ===== SETTINGS =====
// Each setting's order_config key, description and default (used until staff save one)
const SETTINGS = {
  base_price:    { key: 'sandwich_base_price',   default: '0.00',  description: 'Price of a sandwich before any extras' },
  open_time:     { key: 'sandwich_open_time',    default: '11:00', description: 'First sandwich collection time of the day' },
  close_time:    { key: 'sandwich_close_time',   default: '14:00', description: 'Sandwich collections must be before this time' },
  slot_minutes:  { key: 'sandwich_slot_minutes',  default: '5',    description: 'How long each sandwich collection slot is, in minutes' },
  slot_capacity: { key: 'sandwich_slot_capacity', default: '5',    description: 'Most sandwich orders that can be collected in each slot' },
  notice_minutes: { key: 'sandwich_notice_minutes', default: '30',  description: 'Customers must order at least this many minutes before their collection time' },
  max_sandwiches: { key: 'sandwich_max_per_order',  default: '7',   description: 'Most sandwiches a customer can order online in one order' },
};

const getSettings = async () => {
  const keys = Object.values(SETTINGS).map(s => s.key);
  const result = await query(
    `SELECT config_key, config_value FROM order_config WHERE config_key = ANY($1)`,
    [keys]
  );
  const config = Object.fromEntries(result.rows.map(r => [r.config_key, r.config_value]));
  const value = (name) => config[SETTINGS[name].key] ?? SETTINGS[name].default;
  return {
    base_price: value('base_price'),
    open_time: value('open_time'),
    close_time: value('close_time'),
    slot_minutes: parseInt(value('slot_minutes')),
    slot_capacity: parseInt(value('slot_capacity')),
    notice_minutes: parseInt(value('notice_minutes')),
    max_sandwiches: parseInt(value('max_sandwiches')),
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

// Saves whichever settings are given ({ base_price: 5, open_time: '11:00', ... }),
// leaving the rest as they are. Values have already been checked by the controller.
const updateSettings = async (changes) => {
  for (const [name, value] of Object.entries(changes)) {
    if (value === undefined || !SETTINGS[name]) continue;
    const stored = name === 'base_price' ? value.toFixed(2) : String(value);
    await setConfig(SETTINGS[name].key, stored, SETTINGS[name].description);
  }
  return getSettings();
};

// ===== SLOT BOOKINGS =====
// How many open orders with sandwiches are already booked in each collection slot on a day.
// Returns { "12:30": 3, ... }
const getSlotCounts = async (date) => {
  const result = await query(
    `SELECT o.fulfillment_time, COUNT(*)::int AS orders
     FROM orders o
     WHERE o.fulfillment_date = $1
       AND o.status <> 'cancelled'
       AND EXISTS (SELECT 1 FROM order_sandwiches os WHERE os.order_id = o.id)
     GROUP BY o.fulfillment_time`,
    [date]
  );
  return Object.fromEntries(result.rows.map(r => [r.fulfillment_time, r.orders]));
};

// ===== BLOCKED SLOTS =====
// Slots staff have blocked, kept in order_config as { "2026-10-24": ["13:00", "13:10"], ... }.
// A blocked slot is full for that day only. Past days are dropped whenever it is saved.
const BLOCKED_KEY = 'sandwich_blocked_slots';

const getAllBlocked = async () => {
  const result = await query(`SELECT config_value FROM order_config WHERE config_key = $1`, [BLOCKED_KEY]);
  try {
    return JSON.parse(result.rows[0]?.config_value || '{}');
  } catch {
    return {};
  }
};

// ["13:00", ...] blocked on one day
const getBlockedSlots = async (date) => (await getAllBlocked())[date] || [];

// Blocks or unblocks one slot on a day. Returns that day's blocked slots.
const setSlotBlocked = async (date, time, blocked, today) => {
  const all = await getAllBlocked();
  for (const day of Object.keys(all)) if (day < today) delete all[day];
  const times = new Set(all[date] || []);
  if (blocked) times.add(time);
  else times.delete(time);
  if (times.size > 0) all[date] = [...times].sort();
  else delete all[date];
  await setConfig(BLOCKED_KEY, JSON.stringify(all), 'Sandwich collection slots staff have blocked, by day');
  return all[date] || [];
};

// ===== STEPS =====
const createStep = async ({ name, description, min_choices, max_choices, included_choices, extra_choice_price }) => {
  // New steps go on the end
  const result = await query(
    `INSERT INTO sandwich_steps (name, description, min_choices, max_choices, included_choices, extra_choice_price, position)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(position) + 1, 0) FROM sandwich_steps WHERE is_deleted = false))
     RETURNING ${STEP_FIELDS}`,
    [name, description, min_choices, max_choices, included_choices, extra_choice_price]
  );
  return { ...result.rows[0], options: [] };
};

const updateStep = async (id, { name, description, min_choices, max_choices, included_choices, extra_choice_price }) => {
  const result = await query(
    `UPDATE sandwich_steps SET name = $1, description = $2, min_choices = $3, max_choices = $4,
       included_choices = $5, extra_choice_price = $6
     WHERE id = $7 AND is_deleted = false
     RETURNING ${STEP_FIELDS}`,
    [name, description, min_choices, max_choices, included_choices, extra_choice_price, id]
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
  getMenuForCustomers,
  getSettings,
  getSlotCounts,
  getBlockedSlots,
  setSlotBlocked,
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
