
// Unit tests for category operations (createCategory, updateCategory)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/menuModel');

const menuModel = require('../models/menuModel');
const menuController = require('../controllers/menuController');

// Helper: build fake req and res objects
function setup(body = {}, params = {}) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params };
  return { req, res, getResult: () => result };
}

// ─── CREATE CATEGORY ─────────────────────────────────────────────────────────

describe('createCategory', () => {
  test('returns INVALID_DATA when name is missing', async () => {
    const { req, res, getResult } = setup({ buffet_version_id: 1 });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/name/i);
  });

  test('returns INVALID_DATA when name is blank', async () => {
    const { req, res, getResult } = setup({ name: '   ', buffet_version_id: 1 });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns INVALID_DATA when buffet_version_id is missing', async () => {
    const { req, res, getResult } = setup({ name: 'Sandwiches' });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/buffet_version_id/i);
  });

  test('returns INVALID_DATA when buffet_version_id is not a number', async () => {
    const { req, res, getResult } = setup({ name: 'Sandwiches', buffet_version_id: 'abc' });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns SUCCESS when all required data is valid', async () => {
    menuModel.createCategory.mockResolvedValue({
      id: 3, name: 'Sandwiches', description: null, buffet_version_id: 1,
      position: 0, is_required: false, is_active: true,
      image_url: null, image_url_2: null, image_url_3: null, image_url_4: null
    });
    const { req, res, getResult } = setup({ name: 'Sandwiches', buffet_version_id: 1 });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.name).toBe('Sandwiches');
  });

  test('returns SUCCESS with optional fields populated', async () => {
    menuModel.createCategory.mockResolvedValue({
      id: 4, name: 'Hot Food', description: 'Warm dishes', buffet_version_id: 2,
      position: 1, is_required: true, is_active: true,
      image_url: null, image_url_2: null, image_url_3: null, image_url_4: null
    });
    const { req, res, getResult } = setup({
      name: 'Hot Food', description: 'Warm dishes',
      buffet_version_id: 2, position: 1, is_required: true
    });
    await menuController.createCategory(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.description).toBe('Warm dishes');
    expect(getResult().data.is_required).toBe(true);
  });
});

// ─── UPDATE CATEGORY ─────────────────────────────────────────────────────────

describe('updateCategory', () => {
  test('returns INVALID_ID when id is not a number', async () => {
    const { req, res, getResult } = setup({ name: 'Sandwiches' }, { id: 'abc' });
    await menuController.updateCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });

  test('returns INVALID_DATA when name is missing', async () => {
    const { req, res, getResult } = setup({}, { id: '3' });
    await menuController.updateCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/name/i);
  });

  test('returns INVALID_DATA when name is blank', async () => {
    const { req, res, getResult } = setup({ name: '' }, { id: '3' });
    await menuController.updateCategory(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns NOT_FOUND when category does not exist', async () => {
    menuModel.updateCategory.mockRejectedValue(new Error('Category not found'));
    const { req, res, getResult } = setup({ name: 'Sandwiches' }, { id: '999' });
    await menuController.updateCategory(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });

  test('returns SUCCESS when update is valid', async () => {
    menuModel.updateCategory.mockResolvedValue({
      id: 3, name: 'Updated Category', description: null, buffet_version_id: 1,
      position: 2, is_required: false, is_active: true,
      image_url: null, image_url_2: null, image_url_3: null, image_url_4: null
    });
    const { req, res, getResult } = setup({ name: 'Updated Category', position: 2 }, { id: '3' });
    await menuController.updateCategory(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.name).toBe('Updated Category');
  });
});
