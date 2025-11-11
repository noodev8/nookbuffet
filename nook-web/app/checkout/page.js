'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './checkout.css';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Get orders from URL params
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

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      // Validate payment details
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCVC.trim()) {
        alert('Please enter all payment details');
        setLoading(false);
        return;
      }

      // Here you would send the order data to your backend
      const orderData = {
        orders,
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

          {/* Business Details Section */}
          {orders.length > 0 && orders[0].businessName && (
            <div className="checkout-section">
              <h2 className="checkout-section-title">Business Details</h2>
              <div className="checkout-details-display">
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
              onClick={handleConfirmOrder}
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

