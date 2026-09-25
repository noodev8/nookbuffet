/*
=======================================================================================================================================
SANDWICH CONTROLLER - Handles build-your-own sandwich menu requests
=======================================================================================================================================
Admins set up the steps of a sandwich (bread, fillings, sauce, toasted...), the options in each step
with any extra cost, and the base price. The customer side will read this to build a sandwich.
=======================================================================================================================================
*/

const sandwichModel = require('../models/sandwichModel');

// ===== HELPERS =====
const parseId = (value) => {
  const id = parseInt(value);
  return id > 0 ? id : null;
};

// Returns a price rounded to pennies, or null if it isn't a valid non-negative amount
const parsePrice = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : null;
};

// Checks and tidies step fields. Returns { error } or { step }.
// min_choices: 0 means the step is optional. max_choices: null means no limit.
const readStep = (body) => {
  const name = body.name?.trim();
  if (!name) return { error: 'name is required' };

  const min = body.min_choices === undefined || body.min_choices === '' ? 0 : Number(body.min_choices);
  if (!Number.isInteger(min) || min < 0) return { error: 'min_choices must be 0 or more' };

  const hasMax = body.max_choices !== undefined && body.max_choices !== null && body.max_choices !== '';
  const max = hasMax ? Number(body.max_choices) : null;
  if (hasMax && (!Number.isInteger(max) || max < 1)) return { error: 'max_choices must be 1 or more, or empty for no limit' };
  if (max !== null && max < min) return { error: 'max_choices cannot be less than min_choices' };

  return { step: { name, description: body.description?.trim() || null, min_choices: min, max_choices: max } };
};

// Checks and tidies option fields. Returns { error } or { option }.
const readOption = (body) => {
  const name = body.name?.trim();
  if (!name) return { error: 'name is required' };
  const extra = body.extra_price === undefined || body.extra_price === '' ? 0 : parsePrice(body.extra_price);
  if (extra === null) return { error: 'extra_price must be 0 or more' };
  return { option: { name, description: body.description?.trim() || null, extra_price: extra } };
};

// ===== GET MENU (management) =====
const getMenuForManagement = async (req, res) => {
  try {
    const [settings, steps] = await Promise.all([sandwichModel.getSettings(), sandwichModel.getMenuForManagement()]);
    res.json({ return_code: 'SUCCESS', message: 'Got sandwich menu', data: { settings, steps } });
  } catch (error) {
    console.error('Get sandwich menu error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get the sandwich menu' });
  }
};

// ===== UPDATE SETTINGS =====
const updateSettings = async (req, res) => {
  try {
    const basePrice = parsePrice(req.body.base_price);
    if (basePrice === null) return res.json({ return_code: 'INVALID_DATA', message: 'base_price must be 0 or more' });
    if (typeof req.body.enabled !== 'boolean') return res.json({ return_code: 'INVALID_DATA', message: 'enabled must be true or false' });
    const settings = await sandwichModel.updateSettings(basePrice, req.body.enabled);
    res.json({ return_code: 'SUCCESS', message: 'Settings saved', data: settings });
  } catch (error) {
    console.error('Update sandwich settings error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not save settings' });
  }
};

// ===== STEPS =====
const createStep = async (req, res) => {
  try {
    const { error, step } = readStep(req.body);
    if (error) return res.json({ return_code: 'INVALID_DATA', message: error });
    const created = await sandwichModel.createStep(step);
    res.json({ return_code: 'SUCCESS', message: 'Step created', data: created });
  } catch (error) {
    console.error('Create sandwich step error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create step' });
  }
};

const updateStep = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.json({ return_code: 'INVALID_ID', message: 'Invalid step ID' });
    const { error, step } = readStep(req.body);
    if (error) return res.json({ return_code: 'INVALID_DATA', message: error });
    const updated = await sandwichModel.updateStep(id, step);
    if (!updated) return res.json({ return_code: 'NOT_FOUND', message: 'Step not found' });
    res.json({ return_code: 'SUCCESS', message: 'Step updated', data: updated });
  } catch (error) {
    console.error('Update sandwich step error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update step' });
  }
};

// Expects an array of { id, position }
const reorderSteps = async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.json({ return_code: 'INVALID_DATA', message: 'Expected an array of {id, position}' });
    }
    if (updates.some(u => !parseId(u.id) || !Number.isInteger(u.position))) {
      return res.json({ return_code: 'INVALID_DATA', message: 'Each item must have id and position' });
    }
    await sandwichModel.updateStepPositions(updates);
    res.json({ return_code: 'SUCCESS', message: 'Order saved' });
  } catch (error) {
    console.error('Reorder sandwich steps error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not save order' });
  }
};

const deleteStep = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.json({ return_code: 'INVALID_ID', message: 'Invalid step ID' });
    const deleted = await sandwichModel.deleteStep(id);
    if (!deleted) return res.json({ return_code: 'NOT_FOUND', message: 'Step not found' });
    res.json({ return_code: 'SUCCESS', message: 'Step deleted' });
  } catch (error) {
    console.error('Delete sandwich step error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not delete step' });
  }
};

// ===== OPTIONS =====
const createOption = async (req, res) => {
  try {
    const stepId = parseId(req.params.id);
    if (!stepId) return res.json({ return_code: 'INVALID_ID', message: 'Invalid step ID' });
    const { error, option } = readOption(req.body);
    if (error) return res.json({ return_code: 'INVALID_DATA', message: error });
    const created = await sandwichModel.createOption(stepId, option);
    if (!created) return res.json({ return_code: 'NOT_FOUND', message: 'Step not found' });
    res.json({ return_code: 'SUCCESS', message: 'Option created', data: created });
  } catch (error) {
    console.error('Create sandwich option error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not create option' });
  }
};

const updateOption = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.json({ return_code: 'INVALID_ID', message: 'Invalid option ID' });
    const { error, option } = readOption(req.body);
    if (error) return res.json({ return_code: 'INVALID_DATA', message: error });
    const updated = await sandwichModel.updateOption(id, option);
    if (!updated) return res.json({ return_code: 'NOT_FOUND', message: 'Option not found' });
    res.json({ return_code: 'SUCCESS', message: 'Option updated', data: updated });
  } catch (error) {
    console.error('Update sandwich option error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update option' });
  }
};

// Marks an option in or out of stock
const setOptionStock = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.json({ return_code: 'INVALID_ID', message: 'Invalid option ID' });
    if (typeof req.body.is_active !== 'boolean') return res.json({ return_code: 'INVALID_DATA', message: 'is_active must be true or false' });
    const updated = await sandwichModel.setOptionStock(id, req.body.is_active);
    if (!updated) return res.json({ return_code: 'NOT_FOUND', message: 'Option not found' });
    res.json({ return_code: 'SUCCESS', message: 'Stock updated', data: updated });
  } catch (error) {
    console.error('Update sandwich option stock error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update stock' });
  }
};

const deleteOption = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.json({ return_code: 'INVALID_ID', message: 'Invalid option ID' });
    const deleted = await sandwichModel.deleteOption(id);
    if (!deleted) return res.json({ return_code: 'NOT_FOUND', message: 'Option not found' });
    res.json({ return_code: 'SUCCESS', message: 'Option deleted' });
  } catch (error) {
    console.error('Delete sandwich option error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not delete option' });
  }
};

module.exports = {
  getMenuForManagement,
  updateSettings,
  createStep,
  updateStep,
  reorderSteps,
  deleteStep,
  createOption,
  updateOption,
  setOptionStock,
  deleteOption
};
