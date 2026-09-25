// Unit tests for the sandwich menu controller (settings, steps, options)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/sandwichModel');

const sandwichModel = require('../models/sandwichModel');
const sandwichController = require('../controllers/sandwichController');

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
    const { req, res, getResult } = setup({ base_price: -1, enabled: true });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('rejects a missing enabled flag', async () => {
    const { req, res, getResult } = setup({ base_price: 5 });
    await sandwichController.updateSettings(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('rounds the price to pennies and saves', async () => {
    sandwichModel.updateSettings.mockResolvedValue({ base_price: '5.50', enabled: true });
    const { req, res, getResult } = setup({ base_price: '5.499', enabled: true });
    await sandwichController.updateSettings(req, res);
    expect(sandwichModel.updateSettings).toHaveBeenCalledWith(5.5, true);
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
    expect(sandwichModel.createStep).toHaveBeenCalledWith({ name: 'Salad', description: null, min_choices: 0, max_choices: null });
    expect(getResult().return_code).toBe('SUCCESS');
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
