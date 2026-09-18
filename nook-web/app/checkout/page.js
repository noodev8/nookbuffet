'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
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

  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // No payment is taken online - the order goes through as unpaid and staff
  // mark it paid in the admin portal once the customer has paid
  const handlePlaceOrder = async () => {
    setLoading(true);
    setOrderError('');

    try {
      // Staff IDs live in admin_users, not customers
      const storedCustomer = localStorage.getItem('customer');
      const parsedCustomer = storedCustomer ? JSON.parse(storedCustomer) : null;
      const customerId = parsedCustomer && parsedCustomer.accountType !== 'staff' ? parsedCustomer.id : null;

      const orderData = {
        email: orders[0]?.email || '',
        phone: orders[0]?.phone || '',
        businessName: orders[0]?.businessName || '',
        address: orders[0]?.address || '',
        fulfillmentType: 'collection',
        fulfillmentDate: orders[0]?.fulfillmentDate || '',
        totalPrice: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        customerId,
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
            <h2 className="checkout-section-title">Order Summary ({orders.length} buffet{orders.length !== 1 ? 's' : ''})</h2>
            <div className="checkout-orders-list">
              {orders.map((order, index) => (
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

          {/* Business details - only shown if they have orders and a business name */}
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
                  <span className="detail-value">Collection</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{orders[0].fulfillmentDate}</span>
                </div>
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
              {loading ? 'Placing Order...' : `Place Order (£${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)})`}
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
