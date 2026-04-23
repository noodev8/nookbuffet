// Unit tests for menu item operations (createMenuItem, updateMenuItem, deactivate)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/menuModel');

const menuModel = require('../models/menuModel');
const menuController = require('../controllers/menuController');

// Helper: build fake req and res objects
function setup(body = {}, params = {}, query = {}) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params, query };
  return { req, res, getResult: () => result };
}

// ─── CREATE MENU ITEM ────────────────────────────────────────────────────────

describe('createMenuItem', () => {
  test('returns INVALID_DATA when name is missing', async () => {
    const { req, res, getResult } = setup({ category_id: 1 });
    await menuController.createMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/name/i);
  });

  test('returns INVALID_DATA when name is blank', async () => {
    const { req, res, getResult } = setup({ name: '   ', category_id: 1 });
    await menuController.createMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns INVALID_DATA when category_id is missing', async () => {
    const { req, res, getResult } = setup({ name: 'Egg Mayo' });
    await menuController.createMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/category_id/i);
  });

  test('returns SUCCESS when all required data is valid', async () => {
    menuModel.createMenuItem.mockResolvedValue({
      id: 10, name: 'Egg Mayo', description: null, category_id: 2,
      dietary_info: null, allergens: null, is_included_in_base: true,
      branch_id: null, is_active: true
    });
    const { req, res, getResult } = setup({ name: 'Egg Mayo', category_id: 2 });
    await menuController.createMenuItem(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.name).toBe('Egg Mayo');
  });

  test('returns SUCCESS with optional fields populated', async () => {
    menuModel.createMenuItem.mockResolvedValue({
      id: 11, name: 'Tuna Mayo', description: 'Classic tuna', category_id: 2,
      dietary_info: null, allergens: 'Fish', is_included_in_base: true,
      branch_id: null, is_active: true
    });
    const { req, res, getResult } = setup({
      name: 'Tuna Mayo', category_id: 2,
      description: 'Classic tuna', allergens: 'Fish'
    });
    await menuController.createMenuItem(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.allergens).toBe('Fish');
  });
});

// ─── UPDATE MENU ITEM ────────────────────────────────────────────────────────

describe('updateMenuItem', () => {
  test('returns INVALID_ID when id is not a number', async () => {
    const { req, res, getResult } = setup({}, { id: 'abc' });
    await menuController.updateMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });

  test('returns INVALID_DATA when name is missing', async () => {
    const { req, res, getResult } = setup({ category_id: 1 }, { id: '5' });
    await menuController.updateMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/name/i);
  });

  test('returns INVALID_DATA when category_id is missing', async () => {
    const { req, res, getResult } = setup({ name: 'Egg Mayo' }, { id: '5' });
    await menuController.updateMenuItem(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/category_id/i);
  });

  test('returns NOT_FOUND when item does not exist', async () => {
    menuModel.updateMenuItem.mockRejectedValue(new Error('Menu item not found'));
    const { req, res, getResult } = setup({ name: 'Egg Mayo', category_id: 1 }, { id: '999' });
    await menuController.updateMenuItem(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });

  test('returns SUCCESS when update is valid', async () => {
    menuModel.updateMenuItem.mockResolvedValue({
      id: 5, name: 'Updated Item', description: null, category_id: 1,
      dietary_info: null, allergens: null, is_included_in_base: true, is_active: true, branch_id: null
    });
    const { req, res, getResult } = setup({ name: 'Updated Item', category_id: 1 }, { id: '5' });
    await menuController.updateMenuItem(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.name).toBe('Updated Item');
  });
});

// ─── DEACTIVATE MENU ITEM (stock off = "delete") ─────────────────────────────

describe('updateMenuItemStockStatus (deactivate)', () => {
  test('returns INVALID_ID when id is not a number', async () => {
    const { req, res, getResult } = setup({ is_active: false }, { id: 'abc' });
    await menuController.updateMenuItemStockStatus(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });

  test('returns INVALID_DATA when is_active is not a boolean', async () => {
    const { req, res, getResult } = setup({ is_active: 'no' }, { id: '5' });
    await menuController.updateMenuItemStockStatus(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns SUCCESS when item is deactivated', async () => {
    menuModel.updateMenuItemStockStatus.mockResolvedValue({ id: 5, is_active: false });
    const { req, res, getResult } = setup({ is_active: false }, { id: '5' });
    await menuController.updateMenuItemStockStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.is_active).toBe(false);
  });
});
