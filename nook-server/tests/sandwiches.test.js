// Unit tests for the sandwich menu controller (settings, steps, options)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/sandwichModel');
jest.mock('../utils/orderDateCalculator');

const sandwichModel = require('../models/sandwichModel');
const sandwichController = require('../controllers/sandwichController');
const { calculateEarliestSandwichDate } = require('../utils/orderDateCalculator');

// Helper: build fake req and res objects
function setup(body = {}, params = {}) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params };
  return { req, res, getResult: () => result };
}

beforeEach(() => jest.clearAllMocks());

// ─── SETTINGS ───────────────────────────────────────────────────────────────

describe('updateSettings', () => {
  test('rejects a negative base price', async () => {
    const { req, res, getResult } = setup({ base_price: -1 });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('rounds the price to pennies and saves', async () => {
    sandwichModel.updateSettings.mockResolvedValue({ base_price: '5.50' });
    const { req, res, getResult } = setup({ base_price: '5.499' });
    await sandwichController.updateSettings(req, res);
    expect(sandwichModel.updateSettings).toHaveBeenCalledWith(expect.objectContaining({ base_price: 5.5, open_time: undefined })); // not sent - left as it is
    expect(getResult().return_code).toBe('SUCCESS');
  });
});

// ─── STEPS ──────────────────────────────────────────────────────────────────

describe('createStep', () => {
  test('requires a name', async () => {
    const { req, res, getResult } = setup({ name: '  ', min_choices: 1 });
    await sandwichController.createStep(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/name/i);
  });

  test('rejects max_choices below min_choices', async () => {
    const { req, res, getResult } = setup({ name: 'Fillings', min_choices: 3, max_choices: 2 });
    await sandwichController.createStep(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(sandwichModel.createStep).not.toHaveBeenCalled();
  });

  test('rejects a max_choices of 0', async () => {
    const { req, res, getResult } = setup({ name: 'Sauce', min_choices: 0, max_choices: 0 });
    await sandwichController.createStep(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('treats a blank max_choices as no limit and a blank min as optional', async () => {
    sandwichModel.createStep.mockResolvedValue({ id: 1 });
    const { req, res, getResult } = setup({ name: ' Salad ', min_choices: '', max_choices: '' });
    await sandwichController.createStep(req, res);
    expect(sandwichModel.createStep).toHaveBeenCalledWith({
      name: 'Salad', description: null, min_choices: 0, max_choices: null, included_choices: null, extra_choice_price: 0
    });
    expect(getResult().return_code).toBe('SUCCESS');
  });

  test('saves how many picks are included and what each extra costs', async () => {
    sandwichModel.createStep.mockResolvedValue({ id: 1 });
    const { req, res } = setup({ name: 'Meat', min_choices: 0, max_choices: 2, included_choices: '1', extra_choice_price: '0.4' });
    await sandwichController.createStep(req, res);
    expect(sandwichModel.createStep).toHaveBeenCalledWith(expect.objectContaining({ included_choices: 1, extra_choice_price: 0.4 }));
  });

  test.each([
    [{ included_choices: -1 }],
    [{ included_choices: 1.5 }],
    [{ extra_choice_price: -0.4 }],
  ])('rejects bad pricing %o', async (pricing) => {
    const { req, res, getResult } = setup({ name: 'Meat', ...pricing });
    await sandwichController.createStep(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });
});

describe('updateStep', () => {
  test('returns NOT_FOUND when the step does not exist', async () => {
    sandwichModel.updateStep.mockResolvedValue(null);
    const { req, res, getResult } = setup({ name: 'Bread', min_choices: 1, max_choices: 1 }, { id: '99' });
    await sandwichController.updateStep(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });

  test('rejects a bad id', async () => {
    const { req, res, getResult } = setup({ name: 'Bread' }, { id: 'abc' });
    await sandwichController.updateStep(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });
});

describe('reorderSteps', () => {
  test('rejects entries without a position', async () => {
    const { req, res, getResult } = setup([{ id: 1 }]);
    await sandwichController.reorderSteps(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('saves a valid order', async () => {
    sandwichModel.updateStepPositions.mockResolvedValue();
    const { req, res, getResult } = setup([{ id: 2, position: 0 }, { id: 1, position: 1 }]);
    await sandwichController.reorderSteps(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
  });
});

// ─── OPTIONS ────────────────────────────────────────────────────────────────

describe('createOption', () => {
  test('rejects a negative extra price', async () => {
    const { req, res, getResult } = setup({ name: 'Ham', extra_price: -0.5 }, { id: '1' });
    await sandwichController.createOption(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('defaults the extra price to 0', async () => {
    sandwichModel.createOption.mockResolvedValue({ id: 3 });
    const { req, res, getResult } = setup({ name: 'Ham' }, { id: '1' });
    await sandwichController.createOption(req, res);
    expect(sandwichModel.createOption).toHaveBeenCalledWith(1, { name: 'Ham', description: null, extra_price: 0 });
    expect(getResult().return_code).toBe('SUCCESS');
  });

  test('returns NOT_FOUND when the step has been deleted', async () => {
    sandwichModel.createOption.mockResolvedValue(null);
    const { req, res, getResult } = setup({ name: 'Ham' }, { id: '1' });
    await sandwichController.createOption(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });
});

describe('setOptionStock', () => {
  test('requires a boolean', async () => {
    const { req, res, getResult } = setup({ is_active: 'no' }, { id: '1' });
    await sandwichController.setOptionStock(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });
});

// ─── CUSTOMER MENU ──────────────────────────────────────────────────────────

describe('getMenuForCustomers', () => {
  test('returns the settings and in-stock menu', async () => {
    sandwichModel.getSettings.mockResolvedValue({ base_price: '5.00' });
    sandwichModel.getMenuForCustomers.mockResolvedValue({ sold_out: false, steps: [{ id: 1 }] });
    const { req, res, getResult } = setup();
    await sandwichController.getMenuForCustomers(req, res);
    expect(getResult().data).toMatchObject({ base_price: '5.00', steps: [{ id: 1 }] });
  });
});

describe('updateSettings collection time format', () => {
  test('rejects a badly formatted time', async () => {
    const { req, res, getResult } = setup({ base_price: 5, open_time: '11am', close_time: '14:00' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });
});

describe('updateSettings collection hours and slots', () => {
  const base = { base_price: 5 };

  test('saves collection hours and slot capacity', async () => {
    sandwichModel.updateSettings.mockResolvedValue({});
    const { req, res, getResult } = setup({ ...base, open_time: '11:00', close_time: '14:00', slot_capacity: '4' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sandwichModel.updateSettings).toHaveBeenCalledWith(expect.objectContaining({
      open_time: '11:00', close_time: '14:00', slot_capacity: 4
    }));
  });

  test('rejects closing before opening', async () => {
    const { req, res, getResult } = setup({ ...base, open_time: '14:00', close_time: '11:00' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('rejects times off the 5-minute marks', async () => {
    const { req, res, getResult } = setup({ ...base, open_time: '11:02', close_time: '14:00' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('saves the slot length', async () => {
    sandwichModel.updateSettings.mockResolvedValue({});
    const { req, res, getResult } = setup({ ...base, slot_minutes: '15' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sandwichModel.updateSettings).toHaveBeenCalledWith(expect.objectContaining({ slot_minutes: 15 }));
  });

  test.each([0, 7, 125])('rejects a slot length of %s minutes', async (minutes) => {
    const { req, res, getResult } = setup({ ...base, slot_minutes: minutes });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('saves the notice period', async () => {
    sandwichModel.updateSettings.mockResolvedValue({});
    const { req, res, getResult } = setup({ ...base, notice_minutes: '45' });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sandwichModel.updateSettings).toHaveBeenCalledWith(expect.objectContaining({ notice_minutes: 45 }));
  });

  test.each([-5, 2.5, 300])('rejects a notice period of %s minutes', async (minutes) => {
    const { req, res, getResult } = setup({ ...base, notice_minutes: minutes });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('rejects a slot capacity of 0', async () => {
    const { req, res, getResult } = setup({ ...base, slot_capacity: 0 });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });
});

describe('setSlotBlocked', () => {
  beforeEach(() => {
    sandwichModel.getSettings.mockResolvedValue({ open_time: '11:00', close_time: '14:00', slot_minutes: 10 });
    calculateEarliestSandwichDate.mockResolvedValue({ success: true, today: '2026-10-22', currentTime: '09:00' });
    sandwichModel.setSlotBlocked.mockResolvedValue(['13:00']);
  });

  test('blocks a slot on a day', async () => {
    const { req, res, getResult } = setup({ date: '2026-10-24', time: '13:00', blocked: true });
    await sandwichController.setSlotBlocked(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sandwichModel.setSlotBlocked).toHaveBeenCalledWith('2026-10-24', '13:00', true, '2026-10-22');
  });

  test('rejects a time that is not a slot', async () => {
    const { req, res, getResult } = setup({ date: '2026-10-24', time: '13:05', blocked: true });
    await sandwichController.setSlotBlocked(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(sandwichModel.setSlotBlocked).not.toHaveBeenCalled();
  });

  test('rejects a day that has passed', async () => {
    const { req, res, getResult } = setup({ date: '2026-10-21', time: '13:00', blocked: true });
    await sandwichController.setSlotBlocked(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });
});

describe('getDaySlots', () => {
  test('lists every slot with its orders and whether it is blocked or passed', async () => {
    sandwichModel.getSettings.mockResolvedValue({ open_time: '11:00', close_time: '11:30', slot_minutes: 10, slot_capacity: 3 });
    sandwichModel.getSlotCounts.mockResolvedValue({ '11:10': 2 });
    sandwichModel.getBlockedSlots.mockResolvedValue(['11:20']);
    calculateEarliestSandwichDate.mockResolvedValue({ success: true, today: '2026-10-22', currentTime: '11:05' });
    const { req, res, getResult } = setup();
    req.query = { date: '2026-10-22' };
    await sandwichController.getDaySlots(req, res);
    expect(getResult().data.slots).toEqual([
      { time: '11:00', orders: 0, blocked: false, passed: true },
      { time: '11:10', orders: 2, blocked: false, passed: false },
      { time: '11:20', orders: 0, blocked: true, passed: false },
    ]);
  });
});
