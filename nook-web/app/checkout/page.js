'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import { isSandwich, money, describeSandwich } from '../lib/basket';
import './checkout.css';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The basket passes the orders through the URL. searchParams.get() has already
  // decoded it - decoding again throws on any '%' the customer typed (e.g. in notes)
  const ordersParam = searchParams.get('orders');
  const orders = useMemo(() => {
    if (!ordersParam) return [];
    try {
      const parsedOrders = JSON.parse(ordersParam);
      return Array.isArray(parsedOrders) ? parsedOrders : [parsedOrders];
    } catch (e) {
      console.error('Error parsing orders:', e);
      return [];
    }
  }, [ordersParam]);

  const buffets = orders.filter(order => !isSandwich(order));
  const sandwiches = orders.filter(isSandwich);
  const grandTotal = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // No payment is taken online - the order goes through as unpaid and staff
  // mark it paid in the admin portal once the customer has paid
  const handlePlaceOrder = async () => {
    setLoading(true);
    setOrderError('');

    try {
      const orderData = {
        email: orders[0]?.email || '',
        phone: orders[0]?.phone || '',
        businessName: orders[0]?.businessName || '',
        address: orders[0]?.address || '',
        fulfillmentType: 'collection',
        fulfillmentDate: orders[0]?.fulfillmentDate || '',
        fulfillmentTime: orders[0]?.fulfillmentTime || '',
        sandwiches: sandwiches.map(sandwich => ({
          quantity: sandwich.quantity,
          optionIds: sandwich.optionIds,
          notes: sandwich.notes || ''
        })),
        // Only what was picked is sent - the server works out every price from today's menu
        buffets: buffets.map(order => ({
          buffetVersionId: order.buffetVersionId,
          numPeople: order.numPeople,
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
      // A logged-in customer's token links the order to their account
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('customer_token');
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.return_code === 'SUCCESS') {
        localStorage.removeItem('basketData');
        router.push(`/checkout/success?orderNumber=${result.data.orderNumber}`);
      } else {
        setOrderError(result.message || 'Order could not be placed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <h1 className="checkout-title">Complete Your Order</h1>

          {/* Big warning banner at the top - this is just for testing, not real orders */}
          {/* <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of a ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
          </div> */}

          <div className="checkout-section">
            <h2 className="checkout-section-title">Order Summary ({orders.length} item{orders.length !== 1 ? 's' : ''})</h2>
            <div className="checkout-orders-list">
              {buffets.map((order, index) => (
                <div key={index} className="checkout-order-item">
                  <div className="checkout-order-header">
                    <span className="checkout-order-number">{order.buffetName || `Buffet #${index + 1}`}</span>
                    <span className="checkout-order-people">{order.numPeople} person{order.numPeople !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="checkout-order-details">
                    {order.notes && <span>Notes: {order.notes}</span>}
                    <span className="checkout-order-buffet-price">
                      Buffet: £{(order.pricePerPerson * order.numPeople).toFixed(2)}
                    </span>
                    {order.upgrades && order.upgrades.length > 0 && (
                      <div className="checkout-order-upgrades">
                        {order.upgrades.map((upgrade, idx) => (
                          <span key={idx} className="checkout-upgrade-item">
                            + {upgrade.upgradeName}: £{upgrade.subtotal.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}
                    {order.totalPrice !== undefined && (
                      <span className="checkout-order-price">Total: £{order.totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
              {sandwiches.map((sandwich, index) => (
                <div key={`sandwich-${index}`} className="checkout-order-item">
                  <div className="checkout-order-header">
                    <span className="checkout-order-number">Sandwich</span>
                    <span className="checkout-order-people">× {sandwich.quantity}</span>
                  </div>
                  <div className="checkout-order-details">
                    <span>{describeSandwich(sandwich.picks)}</span>
                    {sandwich.notes && <span>Notes: {sandwich.notes}</span>}
                    <span className="checkout-order-price">Total: {money(sandwich.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
            {orders.length > 0 && (
              <div className="checkout-grand-total">
                <span>Grand Total:</span>
                <span className="checkout-grand-total-value">{money(grandTotal)}</span>
              </div>
            )}
          </div>

          {/* Customer details - only shown if they have orders and a name */}
          {orders.length > 0 && orders[0].businessName && (
            <div className="checkout-section">
              <h2 className="checkout-section-title">{buffets.length > 0 ? 'Business Details' : 'Your Details'}</h2>
              <div className="checkout-details-display">
                <div className="detail-row">
                  <span className="detail-label">{buffets.length > 0 ? 'Business:' : 'Name:'}</span>
                  <span className="detail-value">{orders[0].businessName}</span>
                </div>
                {orders[0].address && (
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{orders[0].address}</span>
                  </div>
                )}
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
                  <span className="detail-value">Collection</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{orders[0].fulfillmentDate}</span>
                </div>
                {orders[0].fulfillmentTime && (
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{orders[0].fulfillmentTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Place order - no payment is taken online */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Place Your Order</h2>
            <p className="checkout-payment-note">
              No payment is taken online – please pay when you collect your order.
            </p>

            {orderError && (
              <div className="payment-error-message">
                {orderError}
              </div>
            )}

            <button
              className="checkout-submit-button"
              onClick={handlePlaceOrder}
              disabled={loading || orders.length === 0}
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              {loading ? 'Placing Order...' : `Place Order (${money(grandTotal)})`}
            </button>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="welcome-page-option3">
        <div className="checkout-page-container">
          <div className="checkout-content-wrapper">
            <div className="checkout-loading-state">
              <p>Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
