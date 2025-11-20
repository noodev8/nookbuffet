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
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'Email is required'
      });
    }
    
    if (!orderData.phone || !orderData.phone.trim()) {
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'Phone number is required'
      });
    }
    
    if (!orderData.fulfillmentType || !['delivery', 'collection'].includes(orderData.fulfillmentType)) {
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid fulfillment type is required (delivery or collection)'
      });
    }
    
    if (!orderData.address || !orderData.address.trim()) {
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'Address is required'
      });
    }
    
    if (!orderData.buffets || !Array.isArray(orderData.buffets) || orderData.buffets.length === 0) {
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'At least one buffet is required'
      });
    }
    
    if (!orderData.totalPrice || orderData.totalPrice <= 0) {
      return res.status(400).json({
        return_code: 'VALIDATION_ERROR',
        message: 'Valid total price is required'
      });
    }
    
    // Validate each buffet
    for (const buffet of orderData.buffets) {
      if (!buffet.buffetVersionId || !buffet.numPeople || !buffet.pricePerPerson || !buffet.totalPrice) {
        return res.status(400).json({
          return_code: 'VALIDATION_ERROR',
          message: 'Each buffet must have version ID, number of people, price per person, and total price'
        });
      }
      
      if (!buffet.items || !Array.isArray(buffet.items) || buffet.items.length === 0) {
        return res.status(400).json({
          return_code: 'VALIDATION_ERROR',
          message: 'Each buffet must have at least one menu item selected'
        });
      }
    }
    
    // Ask the model to create the order in the database
    const createdOrder = await orderModel.createOrder(orderData);
    
    // Send success response back to the website
    res.status(201).json({
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
    res.status(500).json({
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
    // Ask the model to get all orders from the database
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
    res.status(500).json({
      return_code: 'SERVER_ERROR',
      message: 'Failed to get orders. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export the functions so routes can use them
module.exports = {
  createOrder,
  getAllOrders
};

