'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './checkout.css';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('collection');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Get orders and fulfillment type from URL params
  useEffect(() => {
    const ordersParam = searchParams.get('orders');
    const fulfillmentParam = searchParams.get('fulfillmentType');

    if (ordersParam) {
      try {
        const decoded = decodeURIComponent(ordersParam);
        const parsedOrders = JSON.parse(decoded);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : [parsedOrders]);
      } catch (e) {
        console.error('Error parsing orders:', e);
      }
    }

    if (fulfillmentParam) {
      setFulfillmentType(fulfillmentParam);
    }
  }, [searchParams]);

  const handleAddToBasket = async () => {
    setLoading(true);
    try {
      // Here you would send the order data to your backend
      const orderData = {
        orders,
        fulfillmentType,
        email,
        address,
        cardNumber,
        cardExpiry,
        cardCVC,
        timestamp: new Date().toISOString()
      };

      console.log('Order data:', orderData);
      // TODO: Send to API endpoint

      // For now, just show success and redirect
      alert('Order confirmed!');
      localStorage.removeItem('basketData');
      router.push('/');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <h1 className="checkout-title">Complete Your Order</h1>

          {/* Orders Summary Section */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Order Summary ({orders.length} buffet{orders.length !== 1 ? 's' : ''})</h2>
            <div className="checkout-orders-list">
              {orders.map((order, index) => (
                <div key={index} className="checkout-order-item">
                  <div className="checkout-order-header">
                    <span className="checkout-order-number">Buffet #{index + 1}</span>
                    <span className="checkout-order-people">{order.numPeople} person{order.numPeople !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="checkout-order-details">
                    {order.notes && <span>Notes: {order.notes}</span>}
                    {order.totalPrice !== undefined && (
                      <span className="checkout-order-price">£{order.totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {orders.length > 0 && (
              <div className="checkout-grand-total">
                <span>Grand Total:</span>
                <span className="checkout-grand-total-value">
                  £{orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Contact Information</h2>

            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="checkout-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Delivery Address:</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                className="checkout-textarea"
              />
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Payment Details</h2>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number:</label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="checkout-input"
                maxLength="19"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiry Date:</label>
                <input
                  id="cardExpiry"
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="checkout-input"
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardCVC">CVC:</label>
                <input
                  id="cardCVC"
                  type="text"
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value)}
                  placeholder="123"
                  className="checkout-input"
                  maxLength="4"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="checkout-actions">
            <button
              className="checkout-back-button"
              onClick={() => router.back()}
              disabled={loading}
            >
              Back
            </button>
            <button
              className="checkout-submit-button"
              onClick={handleAddToBasket}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

