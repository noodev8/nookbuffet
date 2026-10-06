// Unit tests for the auth middleware: which tokens can use the admin routes, and the optional token

const jwt = require('jsonwebtoken');
const { JWT_SECRET, verifyToken, optionalToken, checkRole } = require('../middleware/authMiddleware');

// Runs a middleware with a token (or none). Returns what it answered and whether it let the request through.
function run(middleware, payload, { req: extra = {} } = {}) {
  let result;
  let passed = false;
  const headers = payload ? { authorization: `Bearer ${jwt.sign(payload, JWT_SECRET)}` } : {};
  const req = { headers, ...extra };
  const res = { json: (data) => { result = data; } };
  middleware(req, res, () => { passed = true; });
  return { req, result, passed };
}

const ADMIN_PORTAL = { userId: 1, email: 'admin@example.com', role: 'admin' };
const STAFF_WEBSITE = { id: 1, email: 'admin@example.com', role: 'admin', type: 'staff' };
const CUSTOMER = { id: 5, email: 'customer@example.com', type: 'customer' };

describe('verifyToken', () => {
  test('lets a valid token through and sets req.user', () => {
    const { req, passed } = run(verifyToken, CUSTOMER);
    expect(passed).toBe(true);
    expect(req.user).toMatchObject(CUSTOMER);
  });

  test('rejects a missing token', () => {
    const { result, passed } = run(verifyToken, null);
    expect(passed).toBe(false);
    expect(result.return_code).toBe('UNAUTHORIZED');
  });

  test('rejects a token signed with another secret', () => {
    const req = { headers: { authorization: `Bearer ${jwt.sign(CUSTOMER, 'not-the-secret')}` } };
    let result;
    let passed = false;
    verifyToken(req, { json: (data) => { result = data; } }, () => { passed = true; });
    expect(passed).toBe(false);
    expect(result.return_code).toBe('UNAUTHORIZED');
  });
});

describe('checkRole', () => {
  const adminOnly = checkRole(['admin']);

  test('lets an admin portal login with the right role through', () => {
    const { passed } = run(adminOnly, null, { req: { user: ADMIN_PORTAL } });
    expect(passed).toBe(true);
  });

  test('turns away an admin portal login with the wrong role', () => {
    const { result, passed } = run(adminOnly, null, { req: { user: { ...ADMIN_PORTAL, role: 'general' } } });
    expect(passed).toBe(false);
    expect(result.return_code).toBe('FORBIDDEN');
  });

  test('turns away staff logged into the website, even admins', () => {
    const { result, passed } = run(adminOnly, null, { req: { user: STAFF_WEBSITE } });
    expect(passed).toBe(false);
    expect(result.return_code).toBe('FORBIDDEN');
  });

  test('turns away customers', () => {
    const { result, passed } = run(adminOnly, null, { req: { user: CUSTOMER } });
    expect(passed).toBe(false);
    expect(result.return_code).toBe('FORBIDDEN');
  });
});

describe('optionalToken', () => {
  test('sets req.user when there is a valid token', () => {
    const { req, passed } = run(optionalToken, CUSTOMER);
    expect(passed).toBe(true);
    expect(req.user).toMatchObject(CUSTOMER);
  });

  test('carries on without a user when there is no token or a bad one', () => {
    const none = run(optionalToken, null);
    expect(none.passed).toBe(true);
    expect(none.req.user).toBeNull();

    const req = { headers: { authorization: 'Bearer nonsense' } };
    let passed = false;
    optionalToken(req, {}, () => { passed = true; });
    expect(passed).toBe(true);
    expect(req.user).toBeNull();
  });
});
