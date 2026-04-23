// Unit tests for user operations (createUser, updateUser, deleteUser)
// Tests the controller logic with the model layer stubbed out.

jest.mock('../models/authModel');
// Provide a factory so Jest never loads the real emailService (it calls `new Resend()` at module level)
jest.mock('../utils/emailService', () => ({
  sendTwoFaCodeEmail: jest.fn().mockResolvedValue(undefined),
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

const authModel = require('../models/authModel');
const authController = require('../controllers/authController');

// Helper: build fake req and res objects
function setup(body = {}, params = {}, user = { id: 999 }) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params, user };
  return { req, res, getResult: () => result };
}

// ─── CREATE USER ────────────────────────────────────────────────────────────

describe('createUser', () => {
  test('returns MISSING_FIELDS when required fields are absent', async () => {
    const { req, res, getResult } = setup({ username: 'bob' }); // missing email, password, full_name, role
    await authController.createUser(req, res);
    expect(getResult().return_code).toBe('MISSING_FIELDS');
  });

  test('returns INVALID_ROLE when role is not allowed', async () => {
    const { req, res, getResult } = setup({
      username: 'bob', email: 'bob@test.com', password: 'pass123',
      full_name: 'Bob Smith', role: 'superadmin'
    });
    await authController.createUser(req, res);
    expect(getResult().return_code).toBe('INVALID_ROLE');
  });

  test('returns EMAIL_EXISTS when email is already taken', async () => {
    authModel.emailExists.mockResolvedValue(true);
    const { req, res, getResult } = setup({
      username: 'bob', email: 'bob@test.com', password: 'pass123',
      full_name: 'Bob Smith', role: 'staff'
    });
    await authController.createUser(req, res);
    expect(getResult().return_code).toBe('EMAIL_EXISTS');
  });

  test('returns USERNAME_EXISTS when username is already taken', async () => {
    authModel.emailExists.mockResolvedValue(false);
    authModel.usernameExists.mockResolvedValue(true);
    const { req, res, getResult } = setup({
      username: 'bob', email: 'bob@test.com', password: 'pass123',
      full_name: 'Bob Smith', role: 'staff'
    });
    await authController.createUser(req, res);
    expect(getResult().return_code).toBe('USERNAME_EXISTS');
  });

  test('returns SUCCESS when all data is valid', async () => {
    authModel.emailExists.mockResolvedValue(false);
    authModel.usernameExists.mockResolvedValue(false);
    authModel.createUser.mockResolvedValue({
      id: 1, username: 'bob', email: 'bob@test.com',
      full_name: 'Bob Smith', role: 'staff', branch_id: null, is_active: true, created_at: new Date()
    });
    const { req, res, getResult } = setup({
      username: 'bob', email: 'bob@test.com', password: 'pass123',
      full_name: 'Bob Smith', role: 'staff'
    });
    await authController.createUser(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.username).toBe('bob');
  });
});

// ─── UPDATE USER ────────────────────────────────────────────────────────────

describe('updateUser', () => {
  test('returns USER_NOT_FOUND when user does not exist', async () => {
    authModel.getUserById.mockResolvedValue(null);
    const { req, res, getResult } = setup({}, { id: '99' });
    await authController.updateUser(req, res);
    expect(getResult().return_code).toBe('USER_NOT_FOUND');
  });

  test('returns INVALID_ROLE when an invalid role is supplied', async () => {
    authModel.getUserById.mockResolvedValue({ id: 5, email: 'x@x.com', username: 'x' });
    const { req, res, getResult } = setup({ role: 'god' }, { id: '5' });
    await authController.updateUser(req, res);
    expect(getResult().return_code).toBe('INVALID_ROLE');
  });

  test('returns SUCCESS when update is valid', async () => {
    authModel.getUserById.mockResolvedValue({ id: 5, email: 'old@test.com', username: 'oldname' });
    authModel.updateUser.mockResolvedValue({
      id: 5, username: 'newname', email: 'old@test.com',
      full_name: 'Updated', role: 'staff', branch_id: null, is_active: true,
      last_login: null, created_at: new Date()
    });
    const { req, res, getResult } = setup({ full_name: 'Updated', role: 'staff' }, { id: '5' });
    await authController.updateUser(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.full_name).toBe('Updated');
  });
});

// ─── DELETE USER ────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  test('returns USER_NOT_FOUND when user does not exist', async () => {
    authModel.getUserById.mockResolvedValue(null);
    const { req, res, getResult } = setup({}, { id: '99' });
    await authController.deleteUser(req, res);
    expect(getResult().return_code).toBe('USER_NOT_FOUND');
  });

  test('returns CANNOT_DELETE_SELF when user tries to delete their own account', async () => {
    authModel.getUserById.mockResolvedValue({ id: 999 });
    const { req, res, getResult } = setup({}, { id: '999' }, { id: 999 });
    await authController.deleteUser(req, res);
    expect(getResult().return_code).toBe('CANNOT_DELETE_SELF');
  });

  test('returns SUCCESS when a different user is deleted', async () => {
    authModel.getUserById.mockResolvedValue({ id: 5 });
    authModel.deleteUser.mockResolvedValue({ id: 5 });
    const { req, res, getResult } = setup({}, { id: '5' }, { id: 999 });
    await authController.deleteUser(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
  });
});
