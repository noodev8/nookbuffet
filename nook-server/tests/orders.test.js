// Unit tests for order creation (createOrder)
// Tests the controller validation with the model, date calculator and email service stubbed out.

jest.mock('../models/orderModel');
jest.mock('../utils/orderDateCalculator');
// Factory mock - automocking would load the real module, which needs a Resend API key
jest.mock('../utils/emailService', () => ({ sendOrderConfirmationEmail: jest.fn() }));

const orderModel = require('../models/orderModel');
const { calculateEarliestOrderDate } = require('../utils/orderDateCalculator');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const orderController = require('../controllers/orderController');

// Helper: build fake req and res objects
function setup(body = {}) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params: {}, query: {} };
  return { req, res, getResult: () => result };
}

// A complete, valid collection order - tests override one field at a time
function validOrder(overrides = {}) {
  return {
    email: 'customer@example.com',
    phone: '01234 567890',
    businessName: 'Acme Corp',
    address: '1 High Street, SY21 7AA',
    fulfillmentType: 'collection',
    fulfillmentDate: '2026-09-21',
    totalPrice: 60,
    buffets: [{
      buffetVersionId: 1,
      numPeople: 5,
      pricePerPerson: 12,
      totalPrice: 60,
      items: [1, 2, 3]
    }],
    ...overrides
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  calculateEarliestOrderDate.mockResolvedValue({
    success: true,
    earliestDate: '2026-09-20',
    cutoffTime: '16:00',
    isAfterCutoff: false
  });
  orderModel.createOrder.mockResolvedValue({ id: 7, order_number: 'ORD-007', created_at: '2026-09-18' });
  sendOrderConfirmationEmail.mockResolvedValue({ success: true });
});

describe('createOrder', () => {
  test('creates a valid collection order', async () => {
    const { req, res, getResult } = setup(validOrder());
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.orderNumber).toBe('ORD-007');
    expect(orderModel.createOrder).toHaveBeenCalledWith(expect.objectContaining({ fulfillmentDate: '2026-09-21' }));
  });

  test('rejects delivery orders', async () => {
    const { req, res, getResult } = setup(validOrder({ fulfillmentType: 'delivery' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects an order with no collection date', async () => {
    const { req, res, getResult } = setup(validOrder({ fulfillmentDate: '' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(getResult().message).toMatch(/date/i);
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects an order with an unreadable collection date', async () => {
    const { req, res, getResult } = setup(validOrder({ fulfillmentDate: 'next tuesday' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects a collection date before the earliest allowed date', async () => {
    const { req, res, getResult } = setup(validOrder({ fulfillmentDate: '2026-09-19' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('INVALID_DATE');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });
});
