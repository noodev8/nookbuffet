/*
=======================================================================================================================================
ORDER CONTROLLER - Handles order creation requests
=======================================================================================================================================
This file handles requests for creating new orders.
=======================================================================================================================================
*/

const orderModel = require('../models/orderModel');
const sandwichModel = require('../models/sandwichModel');
const { calculateEarliestOrderDate, calculateEarliestSandwichDate } = require('../utils/orderDateCalculator');
const { checkSandwiches } = require('../utils/sandwichOrder');
const { slotTimes } = require('../utils/sandwichSlots');
const { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } = require('../utils/emailService');

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

    // Validate each buffet
    for (const buffet of buffets) {
      if (!buffet.buffetVersionId || !buffet.numPeople || !buffet.pricePerPerson || !buffet.totalPrice) {
        return res.json({
          return_code: 'VALIDATION_ERROR',
          message: 'Each buffet must have version ID, number of people, price per person, and total price'
        });
      }

      if (!buffet.items || !Array.isArray(buffet.items) || buffet.items.length === 0) {
        return res.json({
          return_code: 'VALIDATION_ERROR',
          message: 'Each buffet must have at least one menu item selected'
        });
      }

      // Validate upgrades if provided (upgrades are optional)
      if (buffet.upgrades && !Array.isArray(buffet.upgrades)) {
        return res.json({
          return_code: 'VALIDATION_ERROR',
          message: 'Upgrades must be an array of upgrade IDs'
        });
      }
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

      const settings = await sandwichModel.getSettings();
      const menu = settings.enabled ? await sandwichModel.getMenuForCustomers() : null;
      if (!menu || menu.sold_out) {
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
    }

    const buffetTotal = buffets.reduce((sum, buffet) => sum + Number(buffet.totalPrice), 0);
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

    orderData.buffets = buffets;
    orderData.sandwiches = sandwiches;
    orderData.totalPrice = totalPrice;
    if (sandwiches.length === 0) orderData.fulfillmentTime = null;

    // Ask the model to create the order in the database
    let createdOrder;
    try {
      createdOrder = await orderModel.createOrder(orderData);
    } catch (error) {
      if (error.code !== 'SLOT_FULL') throw error;
      return res.json({
        return_code: 'SLOT_FULL',
        message: `Sorry, ${orderData.fulfillmentTime} has just filled up. Please choose another collection time.`
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
    const orders = await orderModel.getAllOrders();

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
 * Updates the status of an order
 * This is for marking orders as completed in the admin portal
 *
 * @param {object} req - The request object 
 * @param {object} res - The response object
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid status is required (pending, completed, or cancelled)'
      });
    }

    // Ask the model to update the order status
    const updatedOrder = await orderModel.updateOrderStatus(orderId, status);

    // If status is completed, send email to customer
    if (status === 'completed' && updatedOrder.customer_email) {
      const { sendOrderReadyEmail } = require('../utils/emailService');
      const emailResult = await sendOrderReadyEmail(updatedOrder);
      if (emailResult.success) {
        console.log('Order ready email sent to:', updatedOrder.customer_email);
      } else {
        console.log('Failed to send order ready email:', emailResult.error);
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
    res.json({ return_code: 'SUCCESS', message: 'Staff notes updated', data: updated });
  } catch (error) {
    console.error('Error updating staff notes:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Failed to update staff notes' });
  }
};

// ===== UPDATE PAYMENT STATUS =====
// No payment is taken online, so staff mark orders paid here once the customer has paid
const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId || isNaN(orderId)) {
      return res.json({ return_code: 'INVALID_ID', message: 'Invalid order ID' });
    }
    const { payment_status } = req.body;
    if (!['paid', 'unpaid'].includes(payment_status)) {
      return res.json({ return_code: 'VALIDATION_ERROR', message: 'payment_status must be paid or unpaid' });
    }
    const updated = await orderModel.updatePaymentStatus(orderId, payment_status);
    if (!updated) return res.json({ return_code: 'NOT_FOUND', message: 'Order not found' });
    res.json({ return_code: 'SUCCESS', message: 'Payment status updated', data: updated });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.json({ return_code: 'SERVER_ERROR', message: 'Failed to update payment status' });
  }
};

// Export the functions so routes can use them
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getEarliestOrderDate,
  updateStaffNotes,
  updatePaymentStatus
};




