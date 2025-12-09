/*
=======================================================================================================================================
ORDER CONTROLLER - Handles order creation requests
=======================================================================================================================================
Controllers are the middle person between routes and models. They:
1. Receive the request from the route
2. Validate the data
3. Ask the model to save to database
4. Send response back to the website
=======================================================================================================================================
*/

const orderModel = require('../models/orderModel');
const { calculateEarliestOrderDate } = require('../utils/orderDateCalculator');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// ===== CREATE A NEW ORDER =====
/**
 * Creates a new order with all buffets and items
 * This is called when someone submits their order at checkout
 * 
 * @param {object} req - The request object (contains order data in req.body)
 * @param {object} res - The response object (we use this to send data back)
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

    if (!orderData.fulfillmentType || !['delivery', 'collection'].includes(orderData.fulfillmentType)) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid fulfillment type is required (delivery or collection)'
      });
    }

    if (!orderData.address || !orderData.address.trim()) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Address is required'
      });
    }

    if (!orderData.buffets || !Array.isArray(orderData.buffets) || orderData.buffets.length === 0) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'At least one buffet is required'
      });
    }

    if (!orderData.totalPrice || orderData.totalPrice <= 0) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid total price is required'
      });
    }

    // Validate each buffet
    for (const buffet of orderData.buffets) {
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

    // Validate branch ID for all orders (delivery and collection)
    if (!orderData.branchId) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Branch ID is required'
      });
    }

    // Verify branch exists and is active
    const branchModel = require('../models/branchModel');
    const branch = await branchModel.getBranchById(orderData.branchId);
    if (!branch) {
      return res.json({
        return_code: 'INVALID_BRANCH',
        message: 'Selected branch is not available'
      });
    }

    // Validate delivery/collection date against cutoff rules
    const dateValidation = await calculateEarliestOrderDate();
    if (!dateValidation.success) {
      return res.json({
        return_code: 'SERVER_ERROR',
        message: 'Unable to validate order date'
      });
    }

    const requestedDate = new Date(orderData.deliveryDate);
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

    // Ask the model to create the order in the database
    const createdOrder = await orderModel.createOrder(orderData);

    // Send confirmation email to customer (don't wait for it - fire and forget)
    // We pass the original orderData plus the new order ID
    const emailData = {
      ...orderData,
      customerName: orderData.name,
      customerEmail: orderData.email,
      deliveryAddress: orderData.address
    };

    // Send email in background - don't block the response
    sendOrderConfirmationEmail(emailData, createdOrder.id)
      .then(result => {
        if (result.success) {
          console.log(`Confirmation email sent for order #${createdOrder.id}`);
        } else {
          console.error(`Failed to send confirmation email for order #${createdOrder.id}:`, result.error);
        }
      })
      .catch(err => {
        console.error(`Email error for order #${createdOrder.id}:`, err);
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
 * Supports optional branch_id query param to filter by branch
 *
 * @param {object} req - The request object (can have ?branch_id=X query param)
 * @param {object} res - The response object
 */
const getAllOrders = async (req, res) => {
  try {
    // Get branch_id from query params if provided
    // If branch_id is 'all' or not provided, show all orders
    const branchId = req.query.branch_id;
    const filterBranchId = branchId && branchId !== 'all' ? parseInt(branchId) : null;

    // Ask the model to get orders (optionally filtered by branch)
    const orders = await orderModel.getAllOrders(filterBranchId);

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
 * @param {object} req - The request object (contains orderId in params and status in body)
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
    const result = await calculateEarliestOrderDate();
    
    if (!result.success) {
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
        isAfterCutoff: result.isAfterCutoff
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

// Export the functions so routes can use them
module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getEarliestOrderDate
};




