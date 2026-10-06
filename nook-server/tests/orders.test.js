// Unit tests for the order controller: creating orders, status changes and payment
// Tests the controller validation with the model, date calculator and email service stubbed out.

jest.mock('../models/orderModel');
jest.mock('../models/sandwichModel');
jest.mock('../models/buffetVersionModel');
jest.mock('../utils/orderDateCalculator');
// Factory mock - automocking would load the real module, which needs a Resend API key
jest.mock('../utils/emailService', () => ({
  sendOrderConfirmationEmail: jest.fn(),
  sendNewOrderNotificationEmail: jest.fn(),
  sendOrderReadyEmail: jest.fn()
}));

const orderModel = require('../models/orderModel');
const sandwichModel = require('../models/sandwichModel');
const buffetVersionModel = require('../models/buffetVersionModel');
const { calculateEarliestOrderDate, calculateEarliestSandwichDate } = require('../utils/orderDateCalculator');
const { sendOrderConfirmationEmail, sendNewOrderNotificationEmail, sendOrderReadyEmail } = require('../utils/emailService');
const orderController = require('../controllers/orderController');

// Helper: build fake req and res objects. user is the logged-in token, if any.
function setup(body = {}, params = {}, user = null) {
  let result;
  const res = { json: (data) => { result = data; } };
  const req = { body, params, query: {}, user };
  return { req, res, getResult: () => result };
}

// Buffet version 1 is £12.00 a head and offers the £3.50 Continental upgrade
const BUFFET_PRICES = {
  versions: [{ id: 1, title: 'Standard Buffet', price_per_person: '12.00' }],
  upgrades: [{ buffet_version_id: 1, id: 2, name: 'Continental', price_per_person: '3.50' }]
};

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

// Bread (pick 1) and Fillings (pick 1-2, cheese costs 50p extra)
const SANDWICH_STEPS = [
  { id: 1, name: 'Bread', min_choices: 1, max_choices: 1, options: [{ id: 10, name: 'White', extra_price: '0.00' }] },
  { id: 2, name: 'Fillings', min_choices: 1, max_choices: 2, options: [
    { id: 20, name: 'Ham', extra_price: '0.00' },
    { id: 21, name: 'Cheese', extra_price: '0.50' }
  ] }
];

const SANDWICH_SETTINGS = {
  base_price: '5.00', enabled: true, cutoff_time: '11:00', open_time: '11:00', close_time: '14:00', slot_capacity: 5
};

// A sandwich-only order - no business name, address or buffets
function sandwichOrder(overrides = {}) {
  return {
    email: 'customer@example.com',
    phone: '01234 567890',
    businessName: 'Sam Smith',
    fulfillmentType: 'collection',
    fulfillmentDate: '2026-09-18',
    fulfillmentTime: '12:30',
    sandwiches: [{ quantity: 2, optionIds: [21, 10, 20] }],
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
  calculateEarliestSandwichDate.mockResolvedValue({
    success: true,
    earliestDate: '2026-09-18',
    today: '2026-09-18',
    currentTime: '09:30',
    cutoffTime: '11:00',
    isAfterCutoff: false
  });
  buffetVersionModel.getPricesForOrder.mockResolvedValue(BUFFET_PRICES);
  sandwichModel.getSettings.mockResolvedValue(SANDWICH_SETTINGS);
  sandwichModel.getMenuForCustomers.mockResolvedValue({ sold_out: false, steps: SANDWICH_STEPS });
  orderModel.createOrder.mockResolvedValue({ id: 7, order_number: 'ORD-007', created_at: '2026-09-18' });
  sendOrderConfirmationEmail.mockResolvedValue({ success: true });
  sendNewOrderNotificationEmail.mockResolvedValue({ success: true });
});

describe('createOrder', () => {
  test('creates a valid collection order', async () => {
    const { req, res, getResult } = setup(validOrder());
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(getResult().data.orderNumber).toBe('ORD-007');
    expect(orderModel.createOrder).toHaveBeenCalledWith(expect.objectContaining({ fulfillmentDate: '2026-09-21' }));
    expect(sendNewOrderNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'customer@example.com', phone: '01234 567890' }), 'ORD-007');
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

  test('prices buffets on the server and ignores the prices sent', async () => {
    const order = validOrder({ totalPrice: 0.01 });
    order.buffets[0].pricePerPerson = 0.01;
    order.buffets[0].totalPrice = 0.05;
    const { req, res, getResult } = setup(order);
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    const saved = orderModel.createOrder.mock.calls[0][0];
    expect(saved.totalPrice).toBe(60); // 5 x £12.00
    expect(saved.buffets[0]).toMatchObject({ pricePerPerson: 12, totalPrice: 60, buffetName: 'Standard Buffet' });
  });

  test('adds upgrades to the buffet price', async () => {
    const order = validOrder();
    order.buffets[0].upgrades = [{ upgradeId: 2, selectedItems: [4, 5] }];
    const { req, res, getResult } = setup(order);
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    const saved = orderModel.createOrder.mock.calls[0][0];
    expect(saved.totalPrice).toBe(77.5); // 5 x (£12.00 + £3.50)
    expect(saved.buffets[0].upgrades).toEqual([
      { upgradeId: 2, name: 'Continental', pricePerPerson: 3.5, subtotal: 17.5, selectedItems: [4, 5] }
    ]);
  });

  test('rejects an upgrade not offered with that buffet', async () => {
    const order = validOrder();
    order.buffets[0].upgrades = [{ upgradeId: 99 }];
    const { req, res, getResult } = setup(order);
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects a buffet that is no longer available', async () => {
    const order = validOrder();
    order.buffets[0].buffetVersionId = 3;
    const { req, res, getResult } = setup(order);
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects a buffet with no people', async () => {
    const order = validOrder();
    order.buffets[0].numPeople = 0;
    const { req, res, getResult } = setup(order);
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
  });

  test('links the order to a logged-in customer from their token, not the request', async () => {
    const { req, res } = setup(validOrder({ customerId: 99 }), {}, { id: 5, type: 'customer' });
    await orderController.createOrder(req, res);
    expect(orderModel.createOrder.mock.calls[0][0].customerId).toBe(5);
  });

  test('does not link guest or staff orders to a customer account', async () => {
    const guest = setup(validOrder({ customerId: 99 }));
    await orderController.createOrder(guest.req, guest.res);
    expect(orderModel.createOrder.mock.calls[0][0].customerId).toBeNull();

    const staff = setup(validOrder(), {}, { id: 5, type: 'staff', role: 'admin' });
    await orderController.createOrder(staff.req, staff.res);
    expect(orderModel.createOrder.mock.calls[1][0].customerId).toBeNull();
  });
});

describe('createOrder with sandwiches', () => {
  test('prices sandwiches on the server and ignores the total sent', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ totalPrice: 0.01 }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    const saved = orderModel.createOrder.mock.calls[0][0];
    expect(saved.totalPrice).toBe(11); // 2 x (5.00 + 0.50 cheese)
    expect(saved.sandwiches[0]).toMatchObject({ quantity: 2, unitPrice: 5.5, subtotal: 11 });
    // Picks are put back in step order
    expect(saved.sandwiches[0].options.map(o => o.optionName)).toEqual(['White', 'Ham', 'Cheese']);
  });

  test('allows a sandwich-only order for later today', async () => {
    const { req, res, getResult } = setup(sandwichOrder());
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(calculateEarliestOrderDate).not.toHaveBeenCalled();
  });

  test('rejects a same-day time that has already passed', async () => {
    // 11:30 is within collection hours, but it is already 12:00
    calculateEarliestSandwichDate.mockResolvedValue({
      success: true, earliestDate: '2026-09-18', today: '2026-09-18', currentTime: '12:00', cutoffTime: '11:00', isAfterCutoff: true
    });
    const { req, res, getResult } = setup(sandwichOrder({ fulfillmentTime: '11:30' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('INVALID_DATE');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('uses the buffet date rules when there is a buffet too', async () => {
    const { req, res, getResult } = setup(validOrder({
      fulfillmentDate: '2026-09-18',
      fulfillmentTime: '12:30',
      sandwiches: [{ quantity: 1, optionIds: [10, 20] }]
    }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('INVALID_DATE');
  });

  test('adds sandwiches to the buffet total', async () => {
    const { req, res, getResult } = setup(validOrder({
      fulfillmentTime: '12:30',
      sandwiches: [{ quantity: 1, optionIds: [10, 20] }]
    }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(orderModel.createOrder.mock.calls[0][0].totalPrice).toBe(65);
  });

  test('requires a collection time', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ fulfillmentTime: '' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(getResult().message).toMatch(/time/i);
  });

  test('rejects a sandwich missing a required step', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ sandwiches: [{ quantity: 1, optionIds: [20] }] }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(getResult().message).toMatch(/Bread/);
  });

  test('rejects too many picks for a step', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ sandwiches: [{ quantity: 1, optionIds: [10, 20, 21, 20] }] }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
  });

  test('rejects an option that is out of stock or unknown', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ sandwiches: [{ quantity: 1, optionIds: [10, 99] }] }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(getResult().message).toMatch(/no longer available/);
  });

  test('rejects a bad quantity', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ sandwiches: [{ quantity: 0, optionIds: [10, 20] }] }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
  });

  test('rejects sandwiches when they are switched off', async () => {
    sandwichModel.getSettings.mockResolvedValue({ ...SANDWICH_SETTINGS, enabled: false });
    const { req, res, getResult } = setup(sandwichOrder());
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SANDWICHES_UNAVAILABLE');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('passes the slot capacity on so the model can check the slot', async () => {
    const { req, res } = setup(sandwichOrder());
    await orderController.createOrder(req, res);
    expect(orderModel.createOrder.mock.calls[0][0].slotCapacity).toBe(5);
  });

  test('rejects a time outside collection hours', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ fulfillmentTime: '15:00' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });

  test('rejects a time between slots', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ fulfillmentTime: '12:32' }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
  });

  test('tells the customer when their slot filled up', async () => {
    orderModel.createOrder.mockRejectedValue(Object.assign(new Error('full'), { code: 'SLOT_FULL' }));
    const { req, res, getResult } = setup(sandwichOrder());
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('SLOT_FULL');
    expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    expect(sendNewOrderNotificationEmail).not.toHaveBeenCalled();
  });

  test('rejects an empty order', async () => {
    const { req, res, getResult } = setup(sandwichOrder({ sandwiches: [] }));
    await orderController.createOrder(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
  });
});

describe('updatePaymentStatus', () => {
  test('marks an order as paid', async () => {
    orderModel.updatePaymentStatus.mockResolvedValue({ id: 7, payment_status: 'paid' });
    const { req, res, getResult } = setup({ payment_status: 'paid' }, { id: '7' });
    await orderController.updatePaymentStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(orderModel.updatePaymentStatus).toHaveBeenCalledWith('7', 'paid');
  });

  test('marks an order back to unpaid', async () => {
    orderModel.updatePaymentStatus.mockResolvedValue({ id: 7, payment_status: 'unpaid' });
    const { req, res, getResult } = setup({ payment_status: 'unpaid' }, { id: '7' });
    await orderController.updatePaymentStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
  });

  test('rejects any other payment status', async () => {
    const { req, res, getResult } = setup({ payment_status: 'waived' }, { id: '7' });
    await orderController.updatePaymentStatus(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.updatePaymentStatus).not.toHaveBeenCalled();
  });

  test('rejects a non-numeric order ID', async () => {
    const { req, res, getResult } = setup({ payment_status: 'paid' }, { id: 'abc' });
    await orderController.updatePaymentStatus(req, res);
    expect(getResult().return_code).toBe('INVALID_ID');
  });

  test('returns NOT_FOUND when the order does not exist', async () => {
    orderModel.updatePaymentStatus.mockResolvedValue(undefined);
    const { req, res, getResult } = setup({ payment_status: 'paid' }, { id: '999' });
    await orderController.updatePaymentStatus(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
  });
});

describe('updateOrderStatus', () => {
  const updated = (status, previous_status) =>
    orderModel.updateOrderStatus.mockResolvedValue({ id: 7, order_number: 'ORD-007', customer_email: 'customer@example.com', status, previous_status });

  beforeEach(() => sendOrderReadyEmail.mockResolvedValue({ success: true }));

  test('rejects an unknown status', async () => {
    const { req, res, getResult } = setup({ status: 'done' }, { id: '7' });
    await orderController.updateOrderStatus(req, res);
    expect(getResult().return_code).toBe('VALIDATION_ERROR');
    expect(orderModel.updateOrderStatus).not.toHaveBeenCalled();
  });

  test('emails the customer when an order is first marked ready', async () => {
    updated('ready', 'pending');
    const { req, res, getResult } = setup({ status: 'ready' }, { id: '7' });
    await orderController.updateOrderStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sendOrderReadyEmail).toHaveBeenCalledTimes(1);
  });

  test('does not email again when a collected order is restored to ready', async () => {
    updated('ready', 'collected');
    const { req, res, getResult } = setup({ status: 'ready' }, { id: '7' });
    await orderController.updateOrderStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(sendOrderReadyEmail).not.toHaveBeenCalled();
  });

  test('returns NOT_FOUND when the order does not exist', async () => {
    orderModel.updateOrderStatus.mockResolvedValue(null);
    const { req, res, getResult } = setup({ status: 'ready' }, { id: '999' });
    await orderController.updateOrderStatus(req, res);
    expect(getResult().return_code).toBe('NOT_FOUND');
    expect(sendOrderReadyEmail).not.toHaveBeenCalled();
  });

  test('marks an order collected without emailing', async () => {
    updated('collected', 'ready');
    const { req, res, getResult } = setup({ status: 'collected' }, { id: '7' });
    await orderController.updateOrderStatus(req, res);
    expect(getResult().return_code).toBe('SUCCESS');
    expect(orderModel.updateOrderStatus).toHaveBeenCalledWith('7', 'collected');
    expect(sendOrderReadyEmail).not.toHaveBeenCalled();
  });
});

describe('getAllOrders', () => {
  test('returns open orders by default and the archive when asked', async () => {
    orderModel.getAllOrders.mockResolvedValue([]);
    const open = setup();
    await orderController.getAllOrders(open.req, open.res);
    expect(orderModel.getAllOrders).toHaveBeenLastCalledWith({ archived: false });

    const archive = setup();
    archive.req.query = { archived: 'true' };
    await orderController.getAllOrders(archive.req, archive.res);
    expect(orderModel.getAllOrders).toHaveBeenLastCalledWith({ archived: true });
  });
});
