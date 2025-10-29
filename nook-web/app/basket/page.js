'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './basket.css';

export default function BasketPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [fulfillmentType, setFulfillmentType] = useState('collection');
  const [loading, setLoading] = useState(false);

  // Get basket data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('basketData');
    if (data) {
      const parsed = JSON.parse(data);
      // Handle both array and single object formats
      const ordersList = Array.isArray(parsed) ? parsed : [parsed];
      setOrders(ordersList);
    }
  }, []);

  const handleProceedToCheckout = () => {
    setLoading(true);
    // Pass all orders and fulfillment type to checkout page
    const ordersData = encodeURIComponent(JSON.stringify(orders));
    router.push(`/checkout?orders=${ordersData}&fulfillmentType=${fulfillmentType}`);
  };

  const handleClearBasket = () => {
    localStorage.removeItem('basketData');
    router.push('/');
  };

  const handleRemoveOrder = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    if (updatedOrders.length === 0) {
      localStorage.removeItem('basketData');
      router.push('/');
    } else {
      setOrders(updatedOrders);
      localStorage.setItem('basketData', JSON.stringify(updatedOrders));
    }
  };

  return (
    <div className="welcome-page-option3">
      <div className="basket-page-container">
        <div className="basket-content-wrapper">
          <h1 className="basket-title">Your Basket</h1>

          {/* Orders Summary Section */}
          <div className="basket-section">
            <h2 className="basket-section-title">Orders in Basket ({orders.length})</h2>
            <div className="orders-list">
              {orders.map((order, index) => (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <h3 className="order-number">Buffet #{index + 1}</h3>
                    <button
                      className="order-remove-button"
                      onClick={() => handleRemoveOrder(index)}
                      title="Remove this order"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="order-details">
                    <div className="detail-item">
                      <span>People:</span>
                      <span className="detail-value">{order.numPeople}</span>
                    </div>
                    {order.notes && (
                      <div className="detail-item">
                        <span>Notes:</span>
                        <span className="detail-value">{order.notes}</span>
                      </div>
                    )}
                    {order.totalPrice !== undefined && (
                      <div className="detail-item price-item">
                        <span>Price:</span>
                        <span className="detail-value price-value">£{order.totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

       

          {/* Fulfillment Type Section */}
          <div className="fulfillment-section-card">
            <div className="fulfillment-section-header">
              <div className="fulfillment-title-wrapper">
                <h3 className="fulfillment-section-title">Fulfillment Type</h3>
              </div>
            </div>
            <div className="fulfillment-items-container">
              <ul>
                <li
                  className={`fulfillment-item ${fulfillmentType === 'collection' ? 'selected' : ''}`}
                  onClick={() => setFulfillmentType('collection')}
                >
                  <input
                    type="radio"
                    name="fulfillment-selection"
                    checked={fulfillmentType === 'collection'}
                    onChange={() => {}}
                    className="fulfillment-item-radio"
                  />
                  <span className="fulfillment-item-name">Collection</span>
                </li>
                <li
                  className={`fulfillment-item ${fulfillmentType === 'delivery' ? 'selected' : ''}`}
                  onClick={() => setFulfillmentType('delivery')}
                >
                  <input
                    type="radio"
                    name="fulfillment-selection"
                    checked={fulfillmentType === 'delivery'}
                    onChange={() => {}}
                    className="fulfillment-item-radio"
                  />
                  <span className="fulfillment-item-name">Delivery</span>
                </li>
              </ul>
            </div>
          </div>

             {/* Grand Total Section */}
          {orders.length > 0 && (
            <div className="basket-grand-total">
              <span>Grand Total:</span>
              <span className="grand-total-value">
                £{orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="basket-actions">
            <button
              className="basket-back-button"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              Continue Shopping
            </button>
            <button
              className="basket-clear-button"
              onClick={handleClearBasket}
              disabled={loading}
            >
              Clear Basket
            </button>
            <button
              className="basket-submit-button"
              onClick={handleProceedToCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

