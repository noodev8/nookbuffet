// This tells Next.js to run this page on the client side (in the browser) not the server
'use client';

// what i need from Next.js and React
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './checkout.css';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// The actual payment form component that uses Stripe hooks
function PaymentForm({ orders, clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage('');

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/checkout/success',
      },
      redirect: 'if_required', // Only redirect if 3D Secure is needed
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      onError(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful - now create the order
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      {errorMessage && (
        <div className="payment-error-message">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="checkout-submit-button"
        style={{ width: '100%', marginTop: '1.5rem' }}
      >
        {loading ? 'Processing...' : `Pay £${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}`}
      </button>
    </form>
  );
}

function CheckoutContent() {
  // router lets us navigate between pages, searchParams grabs stuff from the URL
  const router = useRouter();
  const searchParams = useSearchParams();

  // These are state variables - the data this page keeps track of
  const [orders, setOrders] = useState([]); // All the buffet orders from the basket
  const [loading, setLoading] = useState(false); // Whether its currently processing
  const [clientSecret, setClientSecret] = useState(''); // Stripe payment intent secret
  const [paymentError, setPaymentError] = useState('');

  // This runs when the page loads - grabs the order data from the URL
  useEffect(() => {
    const ordersParam = searchParams.get('orders');

    if (ordersParam) {
      try {
        const decoded = decodeURIComponent(ordersParam);
        const parsedOrders = JSON.parse(decoded);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : [parsedOrders]);
      } catch (e) {
        console.error('Error parsing orders:', e);
      }
    }
  }, [searchParams]);

  // Create payment intent when orders are loaded
  useEffect(() => {
    if (orders.length === 0) return;

    const createPaymentIntent = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const totalPrice = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      try {
        const response = await fetch(`${apiUrl}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            email: orders[0]?.email || '',
            metadata: {
              businessName: orders[0]?.businessName || '',
              numBuffets: orders.length.toString(),
            }
          })
        });

        const result = await response.json();
        if (result.return_code === 'SUCCESS') {
          setClientSecret(result.data.clientSecret);
        } else {
          setPaymentError('Failed to initialize payment. Please try again.');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setPaymentError('Failed to connect to payment server.');
      }
    };

    createPaymentIntent();
  }, [orders]);

  // Called when Stripe payment succeeds
  const handlePaymentSuccess = async (paymentIntentId) => {
    setLoading(true);
    try {
      // Now create the order in the database with payment confirmed
      const orderData = {
        email: orders[0]?.email || '',
        phone: orders[0]?.phone || '',
        businessName: orders[0]?.businessName || '',
        address: orders[0]?.address || '',
        fulfillmentType: orders[0]?.fulfillmentType || 'delivery',
        deliveryDate: orders[0]?.deliveryDate || '',
        deliveryTime: orders[0]?.deliveryTime || '',
        branchId: orders[0]?.branchId || null,
        totalPrice: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        paymentIntentId: paymentIntentId, // Include Stripe payment ID
        buffets: orders.map(order => ({
          buffetVersionId: order.buffetVersionId,
          numPeople: order.numPeople,
          pricePerPerson: order.pricePerPerson,
          totalPrice: order.totalPrice,
          items: order.items,
          notes: order.notes || '',
          dietaryInfo: order.dietaryInfo || '',
          allergens: order.allergens || '',
          upgrades: (order.upgrades || []).map(upgrade => ({
            upgradeId: upgrade.upgradeId,
            selectedItems: upgrade.selectedItems || []
          }))
        }))
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.return_code === 'SUCCESS') {
        localStorage.removeItem('basketData');
        router.push(`/checkout/success?orderNumber=${result.data.orderNumber}`);
      } else {
        // Payment was taken but order creation failed - this needs manual handling
        alert(`Payment successful but order creation failed. Please contact us with payment ID: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Payment successful but order creation failed. Please contact us.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (message) => {
    setPaymentError(message);
  };

  // Here's what actually shows up on the page
  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <h1 className="checkout-title">Complete Your Order</h1>

          {/* Big warning banner at the top - this is just for testing, not real orders */}
          <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of a ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
          </div>

          {/* Show all the buffets they're ordering */}
          <div className="checkout-section">
            {/* The title shows how many buffets - adds an 's' if more than one */}
            <h2 className="checkout-section-title">Order Summary ({orders.length} buffet{orders.length !== 1 ? 's' : ''})</h2>
            <div className="checkout-orders-list">
              {/* Loop through each order and display it */}
              {orders.map((order, index) => (
                <div key={index} className="checkout-order-item">
                  <div className="checkout-order-header">
                    {/* Show the buffet name (e.g., "Standard Buffet", "Kids Buffet") */}
                    <span className="checkout-order-number">{order.buffetName || `Buffet #${index + 1}`}</span>
                    {/* Show how many people - adds an 's' if more than one person */}
                    <span className="checkout-order-people">{order.numPeople} person{order.numPeople !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="checkout-order-details">
                    {/* Only show notes if they actually wrote something */}
                    {order.notes && <span>Notes: {order.notes}</span>}
                    {/* Show buffet base price */}
                    <span className="checkout-order-buffet-price">
                      Buffet: £{(order.pricePerPerson * order.numPeople).toFixed(2)}
                    </span>
                    {/* Show upgrades if any */}
                    {order.upgrades && order.upgrades.length > 0 && (
                      <div className="checkout-order-upgrades">
                        {order.upgrades.map((upgrade, idx) => (
                          <span key={idx} className="checkout-upgrade-item">
                            + {upgrade.upgradeName}: £{upgrade.subtotal.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Show the total price with 2 decimal places (like £25.00) */}
                    {order.totalPrice !== undefined && (
                      <span className="checkout-order-price">Total: £{order.totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Show the grand total if there are any orders */}
            {orders.length > 0 && (
              <div className="checkout-grand-total">
                <span>Grand Total:</span>
                <span className="checkout-grand-total-value">
                  {/* Add up all the prices and format with 2 decimals */}
                  £{orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Show the business details - only if rhey have orders and a business name */}
          {orders.length > 0 && orders[0].businessName && (
            <div className="checkout-section">
              <h2 className="checkout-section-title">Business Details</h2>
              <div className="checkout-details-display">
                {/* Each detail-row shows a label and the actual value */}
                <div className="detail-row">
                  <span className="detail-label">Business:</span>
                  <span className="detail-value">{orders[0].businessName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{orders[0].address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{orders[0].email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{orders[0].phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  {/* Show "Delivery" or "Collection" based on what they picked */}
                  <span className="detail-value">{orders[0].fulfillmentType === 'delivery' ? 'Delivery' : 'Collection'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{orders[0].deliveryDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{orders[0].deliveryTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment section with Stripe Elements */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Payment Details</h2>

            {paymentError && (
              <div className="payment-error-message">
                {paymentError}
              </div>
            )}

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#ffffff',
                      colorBackground: 'rgba(255, 255, 255, 0.08)',
                      colorText: '#ffffff',
                      colorDanger: '#ff6b6b',
                      fontFamily: 'Source Sans Pro, sans-serif',
                      borderRadius: '6px',
                    },
                    rules: {
                      '.Input': {
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px',
                      },
                      '.Input:focus': {
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.15)',
                      },
                      '.Label': {
                        color: '#ffffff',
                        fontWeight: '600',
                      },
                    },
                  },
                }}
              >
                <PaymentForm
                  orders={orders}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            ) : (
              <div className="loading-state">
                <p>Loading payment form...</p>
              </div>
            )}
          </div>

          {/* Back button */}
          <div className="checkout-actions">
            <button
              className="checkout-back-button"
              onClick={() => router.back()}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// main checkout page component - wraps everything in Suspense
// show a loading screen while the page figures out what orders to display
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      // fallback is what shows up while loading
      <div className="welcome-page-option3">
        <div className="checkout-page-container">
          <div className="checkout-content-wrapper">
            <div className="loading-state">
              <p>Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      {/* once everything's loaded, show the actual checkout content */}
      <CheckoutContent />
    </Suspense>
  );
}
