// Unit tests for buffet version operations (createBuffetVersion, updateBuffetVersion)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/buffetVersionModel');

const buffetVersionModel = require('../models/buffetVersionModel');
const buffetVersionController = require('../controllers/buffetVersionController');

// Helper: build fake req and res objects
function setup(body = {}, params = {}) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params, query: {} };
  return { req, res, getResult: () => result };
}

// ─── CREATE BUFFET VERSION ────────────────────────────────────────────────────

describe('createBuffetVersion', () => {
  test('returns INVALID_DATA when title is missing', async () => {
    const { req, res, getResult } = setup({ price_per_person: 15.99 });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/title/i);
  });

  test('returns INVALID_DATA when title is blank', async () => {
    const { req, res, getResult } = setup({ title: '   ', price_per_person: 15.99 });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns INVALID_DATA when price_per_person is missing', async () => {
    const { req, res, getResult } = setup({ title: 'Standard Buffet' });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/price_per_person/i);
  });

  test('returns INVALID_DATA when price_per_person is negative', async () => {
    const { req, res, getResult } = setup({ title: 'Standard Buffet', price_per_person: -5 });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns INVALID_DATA when price_per_person is not a number', async () => {
    const { req, res, getResult } = setup({ title: 'Standard Buffet', price_per_person: 'free' });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns SUCCESS when all required data is valid', async () => {
    buffetVersionModel.createBuffetVersion.mockResolvedValue({
      id: 1, title: 'Standard Buffet', description: null,
      price_per_person: 15.99, is_active: true, created_at: new Date(), branch_id: null
    });
    const { req, res, getResult } = setup({ title: 'Standard Buffet', price_per_person: 15.99 });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.title).toBe('Standard Buffet');
    expect(getResult().data.price_per_person).toBe(15.99);
  });

  test('returns SUCCESS with description and branch_id', async () => {
    buffetVersionModel.createBuffetVersion.mockResolvedValue({
      id: 2, title: 'Kids Buffet', description: 'For children',
      price_per_person: 9.99, is_active: true, created_at: new Date(), branch_id: 3
    });
    const { req, res, getResult } = setup({
      title: 'Kids Buffet', description: 'For children',
      price_per_person: 9.99, branch_id: 3
    });
    await buffetVersionController.createBuffetVersion(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.branch_id).toBe(3);
  });
});

// ─── UPDATE BUFFET VERSION ────────────────────────────────────────────────────

describe('updateBuffetVersion', () => {
  test('returns INVALID_ID when id is not a number', async () => {
    const { req, res, getResult } = setup(
      { title: 'Standard Buffet', price_per_person: 15.99 }, { id: 'abc' }
    );
    await buffetVersionController.updateBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });

  test('returns INVALID_DATA when title is missing', async () => {
    const { req, res, getResult } = setup({ price_per_person: 15.99 }, { id: '1' });
    await buffetVersionController.updateBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
    expect(getResult().message).toMatch(/title/i);
  });

  test('returns INVALID_DATA when price_per_person is invalid', async () => {
    const { req, res, getResult } = setup({ title: 'Standard Buffet', price_per_person: -1 }, { id: '1' });
    await buffetVersionController.updateBuffetVersion(req, res);
    expect(getResult().return_code).toBe('INVALID_DATA');
  });

  test('returns NOT_FOUND when version does not exist', async () => {
    buffetVersionModel.updateBuffetVersion.mockRejectedValue(new Error('Buffet version not found'));
    const { req, res, getResult } = setup(
      { title: 'Standard Buffet', price_per_person: 15.99 }, { id: '999' }
    );
    await buffetVersionController.updateBuffetVersion(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });

  test('returns SUCCESS when update is valid', async () => {
    buffetVersionModel.updateBuffetVersion.mockResolvedValue({
      id: 1, title: 'Premium Buffet', description: null,
      price_per_person: 19.99, is_active: true, branch_id: null
    });
    const { req, res, getResult } = setup(
      { title: 'Premium Buffet', price_per_person: 19.99 }, { id: '1' }
    );
    await buffetVersionController.updateBuffetVersion(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.title).toBe('Premium Buffet');
    expect(getResult().data.price_per_person).toBe(19.99);
  });
});
