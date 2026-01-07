/*
=======================================================================================================================================
PAYMENT ROUTES - Handles Stripe payment processing
=======================================================================================================================================
These routes handle creating payment intents and processing payments through Stripe.
Payment flow: Create intent -> Customer pays -> Confirm payment -> Create order
=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

// Initialize Stripe with secret key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ===== ROUTE: CREATE PAYMENT INTENT =====
// Creates a Stripe PaymentIntent which gives us a client secret for the frontend
// The frontend uses this to securely collect payment details
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, email, metadata } = req.body;

    // Validate amount - Stripe uses smallest currency unit (pence for GBP)
    if (!amount || amount <= 0) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Invalid payment amount'
      });
    }

    // Convert pounds to pence (Stripe needs amounts in smallest unit)
    const amountInPence = Math.round(amount * 100);

    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      receipt_email: email || undefined,
      // Store order info so  can link payment to order later
      metadata: metadata || {},
      // Enable automatic payment methods for flexibility
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send back the client secret - frontend needs this to complete payment
    res.json({
      return_code: 'SUCCESS',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.json({
      return_code: 'PAYMENT_ERROR',
      message: 'Failed to initialize payment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== ROUTE: VERIFY PAYMENT =====
// After frontend completes payment, verify it was successful before creating order
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.json({
        return_code: 'VALIDATION_ERROR',
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve the payment intent from Stripe to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        return_code: 'SUCCESS',
        message: 'Payment verified successfully',
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back to pounds
          status: paymentIntent.status
        }
      });
    } else {
      res.json({
        return_code: 'PAYMENT_INCOMPLETE',
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        data: {
          status: paymentIntent.status
        }
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.json({
      return_code: 'PAYMENT_ERROR',
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

