/*
=======================================================================================================================================
SANDWICH CONTROLLER - Handles build-your-own sandwich menu requests
=======================================================================================================================================
Admins set up the steps of a sandwich (bread, fillings, sauce, toasted...), the options in each step
with any extra cost, and the base price. The customer side will read this to build a sandwich.
=======================================================================================================================================
*/

const sandwichModel = require('../models/sandwichModel');
const { calculateEarliestSandwichDate } = require('../utils/orderDateCalculator');
const { buildSlots, slotTimes, earliestSlotTime, toMinutes, TIME_STEP } = require('../utils/sandwichSlots');

// ===== HELPERS =====
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !isNaN(new Date(value).getTime());

const isTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

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

  // included_choices: picks included in the base price, null = all of them.
  // extra_choice_price: what each pick after those costs.
  const hasIncluded = body.included_choices !== undefined && body.included_choices !== null && body.included_choices !== '';
  const included = hasIncluded ? Number(body.included_choices) : null;
  if (hasIncluded && (!Number.isInteger(included) || included < 0)) return { error: 'included_choices must be 0 or more, or empty for all' };
  const extraChoicePrice = body.extra_choice_price === undefined || body.extra_choice_price === '' ? 0 : parsePrice(body.extra_choice_price);
  if (extraChoicePrice === null) return { error: 'extra_choice_price must be 0 or more' };

  return {
    step: {
      name, description: body.description?.trim() || null, min_choices: min, max_choices: max,
      included_choices: included, extra_choice_price: extraChoicePrice
    }
  };
};

// Checks and tidies option fields. Returns { error } or { option }.
const readOption = (body) => {
  const name = body.name?.trim();
  if (!name) return { error: 'name is required' };
  const extra = body.extra_price === undefined || body.extra_price === '' ? 0 : parsePrice(body.extra_price);
  if (extra === null) return { error: 'extra_price must be 0 or more' };
  return { option: { name, description: body.description?.trim() || null, extra_price: extra } };
};

// ===== GET MENU (customers) =====
// Public - what the website needs to build a sandwich.
const getMenuForCustomers = async (req, res) => {
  try {
    const [settings, menu] = await Promise.all([sandwichModel.getSettings(), sandwichModel.getMenuForCustomers()]);
    res.json({ return_code: 'SUCCESS', message: 'Got sandwich menu', data: { ...settings, ...menu } });
  } catch (error) {
    console.error('Get customer sandwich menu error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get the sandwich menu' });
  }
};

// ===== GET COLLECTION SLOTS (customers) =====
// Public - the collection slots on a day, and whether each still has room.
// Today only shows slots at least notice_minutes away.
const getSlots = async (req, res) => {
  try {
    const date = req.query.date;
    if (!isDate(date)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'date must be YYYY-MM-DD' });
    }
    const [settings, counts, blocked, now] = await Promise.all([
      sandwichModel.getSettings(), sandwichModel.getSlotCounts(date), sandwichModel.getBlockedSlots(date), calculateEarliestSandwichDate()
    ]);
    if (!now.success) return res.json({ return_code: 'SERVER_ERROR', message: 'Could not get collection times' });

    const earliest = date === now.today ? earliestSlotTime(now.currentTime, settings.notice_minutes) : null;
    const slots = date < now.today ? [] : buildSlots(settings, counts, earliest, blocked);
    res.json({
      return_code: 'SUCCESS',
      message: 'Got collection times',
      data: { open_time: settings.open_time, close_time: settings.close_time, slot_minutes: settings.slot_minutes, slots }
    });
  } catch (error) {
    console.error('Get sandwich slots error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get collection times' });
  }
};

// ===== SLOTS ON A DAY (staff) =====
// Every collection slot on a day with how many orders it has and whether it is blocked,
// for the Time slots page. Today's slots that have passed are marked so they can't be changed.
const getDaySlots = async (req, res) => {
  try {
    const date = req.query.date;
    if (!isDate(date)) return res.json({ return_code: 'INVALID_DATA', message: 'date must be YYYY-MM-DD' });
    const [settings, counts, blocked, now] = await Promise.all([
      sandwichModel.getSettings(), sandwichModel.getSlotCounts(date), sandwichModel.getBlockedSlots(date), calculateEarliestSandwichDate()
    ]);
    if (!now.success) return res.json({ return_code: 'SERVER_ERROR', message: 'Could not get collection times' });

    const slots = slotTimes(settings.open_time, settings.close_time, settings.slot_minutes).map(time => ({
      time,
      orders: counts[time] || 0,
      blocked: blocked.includes(time),
      passed: date < now.today || (date === now.today && time <= now.currentTime)
    }));
    res.json({ return_code: 'SUCCESS', message: 'Got collection times', data: { slot_capacity: settings.slot_capacity, slots } });
  } catch (error) {
    console.error('Get sandwich day slots error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not get collection times' });
  }
};

// ===== BLOCK / UNBLOCK A SLOT (staff) =====
const setSlotBlocked = async (req, res) => {
  try {
    const { date, time, blocked } = req.body;
    if (!isDate(date)) return res.json({ return_code: 'INVALID_DATA', message: 'date must be YYYY-MM-DD' });
    if (typeof blocked !== 'boolean') return res.json({ return_code: 'INVALID_DATA', message: 'blocked must be true or false' });
    const [settings, now] = await Promise.all([sandwichModel.getSettings(), calculateEarliestSandwichDate()]);
    if (!now.success) return res.json({ return_code: 'SERVER_ERROR', message: 'Could not update the time' });
    if (!slotTimes(settings.open_time, settings.close_time, settings.slot_minutes).includes(time)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'time must be one of the collection slots' });
    }
    if (date < now.today) return res.json({ return_code: 'INVALID_DATA', message: 'That day has already passed' });

    const blockedTimes = await sandwichModel.setSlotBlocked(date, time, blocked, now.today);
    res.json({ return_code: 'SUCCESS', message: blocked ? 'Time blocked' : 'Time unblocked', data: { date, blocked: blockedTimes } });
  } catch (error) {
    console.error('Block sandwich slot error:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Could not update the time' });
  }
};

// ===== GET MENU (management) =====
// All staff can see the menu (to mark items sold out); only admins get the settings with it
const getMenuForManagement = async (req, res) => {
  try {
    const [settings, steps] = await Promise.all([sandwichModel.getSettings(), sandwichModel.getMenuForManagement()]);
    const data = req.user?.role === 'admin' ? { settings, steps } : { steps };
    res.json({ return_code: 'SUCCESS', message: 'Got sandwich menu', data });
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
    // The rest are optional - anything not sent is left as it is
    const { open_time, close_time } = req.body;
    for (const [name, value] of Object.entries({ open_time, close_time })) {
      if (value !== undefined && !isTime(value)) {
        return res.json({ return_code: 'INVALID_DATA', message: `${name} must be a time like 11:00` });
      }
    }
    for (const [name, value] of Object.entries({ open_time, close_time })) {
      if (value !== undefined && toMinutes(value) % TIME_STEP !== 0) {
        return res.json({ return_code: 'INVALID_DATA', message: `${name} must be on a 5-minute mark, like 11:00 or 11:05` });
      }
    }
    if ((open_time === undefined) !== (close_time === undefined)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'open_time and close_time must be sent together' });
    }
    if (open_time !== undefined && open_time >= close_time) {
      return res.json({ return_code: 'INVALID_DATA', message: 'Collection must close after it opens' });
    }
    const capacity = req.body.slot_capacity === undefined ? undefined : Number(req.body.slot_capacity);
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'slot_capacity must be 1 or more' });
    }
    const slotMinutes = req.body.slot_minutes === undefined ? undefined : Number(req.body.slot_minutes);
    if (slotMinutes !== undefined &&
        (!Number.isInteger(slotMinutes) || slotMinutes < TIME_STEP || slotMinutes > 120 || slotMinutes % TIME_STEP !== 0)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'slot_minutes must be 5 to 120, in steps of 5' });
    }
    const noticeMinutes = req.body.notice_minutes === undefined ? undefined : Number(req.body.notice_minutes);
    if (noticeMinutes !== undefined && (!Number.isInteger(noticeMinutes) || noticeMinutes < 0 || noticeMinutes > 240)) {
      return res.json({ return_code: 'INVALID_DATA', message: 'notice_minutes must be 0 to 240' });
    }

    const settings = await sandwichModel.updateSettings({
      base_price: basePrice,
      open_time,
      close_time,
      slot_minutes: slotMinutes,
      slot_capacity: capacity,
      notice_minutes: noticeMinutes
    });
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
    // All staff can add an item (e.g. a special), but only admins can give it its own price
    if (req.user?.role !== 'admin') option.extra_price = 0;
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
  getDaySlots,
  setSlotBlocked,
  getMenuForCustomers,
  getSlots,
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
