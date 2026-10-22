/*
=======================================================================================================================================
ORDER CONTROLLER - Handles order creation requests
=======================================================================================================================================
This file handles requests for creating new orders.
=======================================================================================================================================
*/

const orderModel = require('../models/orderModel');
const sandwichModel = require('../models/sandwichModel');
const buffetVersionModel = require('../models/buffetVersionModel');
const { checkBuffets } = require('../utils/buffetOrder');
const { calculateEarliestOrderDate, calculateEarliestSandwichDate } = require('../utils/orderDateCalculator');
const { checkSandwiches } = require('../utils/sandwichOrder');
const { slotTimes } = require('../utils/sandwichSlots');
const { sendOrderConfirmationEmail, sendNewOrderNotificationEmail, sendOrderCancelledEmail } = require('../utils/emailService');
const { addClient, notifyOrdersChanged } = require('../utils/orderEvents');

// ===== CREATE A NEW ORDER =====
/**
 * Creates a new order with all buffets and items
 * This is called when someone submits their order at checkout
 * 
 * @param {object} req - The request object
 * @param {object} res - The response object 
 */
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.email || !orderData.email.trim()) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Email is required'
      });
    }

    if (!orderData.phone || !orderData.phone.trim()) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Phone number is required'
      });
    }

    if (orderData.fulfillmentType !== 'collection') {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Orders are collection only'
      });
    }

    // Without this an empty or garbled date slips past the cutoff check below
    // (an Invalid Date is never "earlier" than anything) and the order is saved with no date
    if (!orderData.fulfillmentDate || isNaN(new Date(orderData.fulfillmentDate).getTime())) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'A valid collection date is required'
      });
    }

    // An order can have buffets, sandwiches, or both
    const buffets = orderData.buffets ?? [];
    const rawSandwiches = orderData.sandwiches ?? [];
    if (!Array.isArray(buffets) || !Array.isArray(rawSandwiches)) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'buffets and sandwiches must be arrays'
      });
    }

    if (buffets.length === 0 && rawSandwiches.length === 0) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Your order is empty'
      });
    }

    // Business address is only asked for on buffet orders
    if (buffets.length > 0 && (!orderData.address || !orderData.address.trim())) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Address is required'
      });
    }

    // Buffets are checked and priced from the current buffet and upgrade prices, not from what the browser sent
    let pricedBuffets = [];
    let buffetTotal = 0;
    if (buffets.length > 0) {
      const prices = await buffetVersionModel.getPricesForOrder(buffets.map(b => b?.buffetVersionId));
      const checked = checkBuffets(buffets, prices.versions, prices.upgrades);
      if (checked.error) {
        return res.json({ return_code: 'VALIDATION_ERROR', message: checked.error });
      }
      pricedBuffets = checked.buffets;
      buffetTotal = checked.total;
    }

    // Sandwiches are checked and priced from the current menu, not from what the browser sent
    let sandwiches = [];
    let sandwichTotal = 0;
    if (rawSandwiches.length > 0) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(orderData.fulfillmentTime || '')) {
        return res.json({
          return_code: 'VALIDATION_ERROR',
          message: 'Please choose a collection time for your sandwiches'
        });
      }

      const [settings, menu] = await Promise.all([sandwichModel.getSettings(), sandwichModel.getMenuForCustomers()]);
      if (menu.sold_out) {
        return res.json({
          return_code: 'SANDWICHES_UNAVAILABLE',
          message: 'Sorry, sandwiches are not available to order right now'
        });
      }

      // Must be one of the 5-minute slots within collection hours. Whether it is full is
      // checked when the order is saved, so two customers can't take the last place at once.
      if (!slotTimes(settings.open_time, settings.close_time).includes(orderData.fulfillmentTime)) {
        return res.json({
          return_code: 'VALIDATION_ERROR',
          message: `Sandwiches can be collected between ${settings.open_time} and ${settings.close_time}, every 5 minutes`
        });
      }
      orderData.slotCapacity = settings.slot_capacity;

      const checked = checkSandwiches(rawSandwiches, menu.steps, settings.base_price);
      if (checked.error) {
        return res.json({ return_code: 'VALIDATION_ERROR', message: checked.error });
      }
      sandwiches = checked.sandwiches;
      sandwichTotal = checked.total;

      // A slot is how many sandwiches the kitchen can make in 5 minutes, so a bigger order can't fit in any
      const sandwichCount = sandwiches.reduce((sum, s) => sum + s.quantity, 0);
      if (sandwichCount > settings.slot_capacity) {
        return res.json({
          return_code: 'TOO_MANY_SANDWICHES',
          message: `We can make up to ${settings.slot_capacity} sandwiches for one collection time. For a bigger order please call the shop.`
        });
      }
    }

    const totalPrice = Math.round((buffetTotal + sandwichTotal) * 100) / 100;
    if (!(totalPrice > 0)) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid total price is required'
      });
    }

    // Validate the collection date against cutoff rules. Buffets need the usual notice;
    // sandwich-only orders can be collected the same day if placed before the sandwich cutoff.
    const sandwichOnly = buffets.length === 0;
    const dateValidation = sandwichOnly ? await calculateEarliestSandwichDate() : await calculateEarliestOrderDate();
    if (!dateValidation.success) {
      return res.json({
        return_code: 'SERVER_ERROR',
        message: 'Unable to validate order date'
      });
    }

    const requestedDate = new Date(orderData.fulfillmentDate);
    const earliestDate = new Date(dateValidation.earliestDate);

    if (requestedDate < earliestDate) {
      return res.json({
        return_code: 'INVALID_DATE',
        message: `Orders must be placed for ${dateValidation.earliestDate} or later. Current cutoff time is ${dateValidation.cutoffTime}.`,
        data: {
          earliestDate: dateValidation.earliestDate,
          cutoffTime: dateValidation.cutoffTime,
          isAfterCutoff: dateValidation.isAfterCutoff
        }
      });
    }

    // Same-day collection has to be later than now
    if (sandwichOnly && String(orderData.fulfillmentDate).slice(0, 10) === dateValidation.today &&
        orderData.fulfillmentTime <= dateValidation.currentTime) {
      return res.json({
        return_code: 'INVALID_DATE',
        message: 'Please choose a collection time later today'
      });
    }

    orderData.buffets = pricedBuffets;
    orderData.sandwiches = sandwiches;
    orderData.totalPrice = totalPrice;
    // Only a logged-in customer's own token links the order to their account
    orderData.customerId = req.user?.type === 'customer' ? req.user.id : null;
    if (sandwiches.length === 0) orderData.fulfillmentTime = null;

    // Ask the model to create the order in the database
    let createdOrder;
    try {
      createdOrder = await orderModel.createOrder(orderData);
    } catch (error) {
      if (error.code !== 'SLOT_FULL') throw error;
      return res.json({
        return_code: 'SLOT_FULL',
        message: `Sorry, ${orderData.fulfillmentTime} no longer has room for your sandwiches. Please choose another collection time.`
      });
    }

    // Send confirmation email to customer 
    const emailData = {
      ...orderData,
      customerName: orderData.businessName || 'Customer',
      customerEmail: orderData.email,
      fulfillmentAddress: orderData.address
    };

    // Send email in background - don't block the response
    // Pass the order number (ORD-014 format)
    sendOrderConfirmationEmail(emailData, createdOrder.order_number)
      .then(result => {
        if (result.success) {
          console.log(`Confirmation email sent for ${createdOrder.order_number}`);
        } else {
          console.error(`Failed to send confirmation email for ${createdOrder.order_number}:`, result.error);
        }
      })
      .catch(err => {
        console.error(`Email error for ${createdOrder.order_number}:`, err);
      });

    // Let the shop know about the new order, also in the background
    sendNewOrderNotificationEmail(orderData, createdOrder.order_number)
      .then(result => {
        if (!result.success) {
          console.error(`Failed to send new order notification for ${createdOrder.order_number}:`, result.error);
        }
      })
      .catch(err => {
        console.error(`Notification email error for ${createdOrder.order_number}:`, err);
      });

    // Update the open orders screens (and play the new order sound)
    notifyOrdersChanged({ newOrder: true });

    // Send success response back to the website
    res.json({
      return_code: 'SUCCESS',
      message: 'Order created successfully!',
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        createdAt: createdOrder.created_at
      }
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Error creating order:', error);

    // Send error response
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to create order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===== GET ALL ORDERS =====
/**
 * Gets all orders with complete details
 * This is for the admin portal
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object
 */
const getAllOrders = async (req, res) => {
  try {
    // Ask the model to get all orders
    // ?archived=true for collected and cancelled orders, otherwise the open ones
    const orders = await orderModel.getAllOrders({ archived: req.query.archived === 'true' });

    // Send all orders back
    res.json({
      return_code: 'SUCCESS',
      message: 'Got all orders!',
      data: orders,
      count: orders.length
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Error getting orders:', error);

    // Send error response
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get orders. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===== UPDATE ORDER STATUS =====
/**
 * Updates the status of an order from the admin portal:
 *   pending   - placed, being made
 *   ready     - made, waiting to be collected
 *   collected - picked up; the order is archived
 *   cancelled - archived; the customer is emailed that it has been cancelled
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Invalid order ID' });
    }

    // Validate status
    if (!status || !['pending', 'ready', 'collected', 'cancelled'].includes(status)) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid status is required (pending, ready, collected, or cancelled)'
      });
    }

    // Ask the model to update the order status
    const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.json({ return_code: 'NOT_FOUND', message: 'Order not found' });
    }
    notifyOrdersChanged();

    // Email the customer when an open order is cancelled - not when an order that was
    // already archived (collected or cancelled) is changed again
    const wasOpen = ['pending', 'ready'].includes(updatedOrder.previous_status);
    if (status === 'cancelled' && wasOpen && updatedOrder.customer_email) {
      const emailResult = await sendOrderCancelledEmail(updatedOrder);
      if (emailResult.success) {
        console.log('Order cancelled email sent to:', updatedOrder.customer_email);
      } else {
        console.log('Failed to send order cancelled email:', emailResult.error);
      }
    }

    // Send success response
    res.json({
      return_code: 'SUCCESS',
      message: 'Order status updated successfully!',
      data: updatedOrder
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Error updating order status:', error);

    // Send error response
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to update order status. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getEarliestOrderDate = async (req, res) => {
  try {
    const [result, sandwichResult] = await Promise.all([calculateEarliestOrderDate(), calculateEarliestSandwichDate()]);

    if (!result.success || !sandwichResult.success) {
      return res.json({
        return_code: 'SERVER_ERROR',
        message: 'Unable to calculate earliest order date'
      });
    }

    res.json({
      return_code: 'SUCCESS',
      data: {
        earliestDate: result.earliestDate,
        cutoffTime: result.cutoffTime,
        isAfterCutoff: result.isAfterCutoff,
        // For orders with only sandwiches - same day if before the sandwich cutoff
        sandwiches: {
          earliestDate: sandwichResult.earliestDate,
          today: sandwichResult.today,
          cutoffTime: sandwichResult.cutoffTime,
          isAfterCutoff: sandwichResult.isAfterCutoff
        }
      }
    });

  } catch (error) {
    console.error('Error getting earliest order date:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Unable to get earliest order date'
    });
  }
};

// ===== GET SINGLE ORDER BY ID =====
/**
 * Gets a single order with complete details by its ID
 * This is for the admin portal order details page
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object
 */
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Validate the ID
    if (!orderId || isNaN(orderId)) {
      return res.json({
        return_code: 'INVALID_ID',
        message: 'Please provide a valid order ID'
      });
    }

    // Ask the model to get the order
    const order = await orderModel.getOrderById(orderId);

    if (!order) {
      return res.json({
        return_code: 'NOT_FOUND',
        message: 'Order not found'
      });
    }

    // Send the order back
    res.json({
      return_code: 'SUCCESS',
      message: 'Got order details!',
      data: order
    });

  } catch (error) {
    console.error('Error getting order:', error);
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===== UPDATE STAFF NOTES =====
const updateStaffNotes = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId || isNaN(orderId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Invalid order ID' });
    }
    const { staff_notes } = req.body;
    const updated = await orderModel.updateStaffNotes(orderId, staff_notes);
    if (!updated) return res.json({ return_code: 'NOT_FOUND', message: 'Order not found' });
    notifyOrdersChanged();
    res.json({ return_code: 'SUCCESS', message: 'Staff notes updated', data: updated });
  } catch (error) {
    console.error('Error updating staff notes:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Failed to update staff notes' });
  }
};

// ===== LIVE ORDER UPDATES =====
// Keeps the connection open and sends "orders-changed" whenever an order is placed or changed
const orderEvents = (req, res) => addClient(req, res);

// Export the functions so routes can use them
module.exports = {
  createOrder,
  orderEvents,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getEarliestOrderDate,
  updateStaffNotes
};




