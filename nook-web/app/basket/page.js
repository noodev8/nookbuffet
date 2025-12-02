'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './basket.css';

export default function BasketPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Business details state
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fulfillment state
  const [fulfillmentType, setFulfillmentType] = useState('collection');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Branch validation state
  const [branchId, setBranchId] = useState(null);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

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

  // Validate delivery area and get branch ID
  const validateDeliveryArea = async () => {
    if (!address.trim()) {
      alert('Please enter an address first');
      return;
    }

    setValidatingAddress(true);
    setAddressValidated(false);
    setBranchId(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/delivery/validate-area`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      const result = await response.json();

      if (result.return_code === 'SUCCESS') {
        if (result.data.isWithinRange) {
          setBranchId(result.data.branch.id);
          setAddressValidated(true);
          alert(`✓ Address validated! Your nearest branch is ${result.data.branch.name} (${result.data.distanceMiles.toFixed(1)} miles away)`);
        } else {
          alert(`Sorry, this address is outside our delivery area. The nearest branch is ${result.data.distanceMiles.toFixed(1)} miles away (maximum: ${result.data.deliveryRadius} miles).`);
        }
      } else {
        alert(`Address validation failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error validating address:', error);
      alert('Failed to validate address. Please try again.');
    } finally {
      setValidatingAddress(false);
    }
  };

  const handleProceedToCheckout = () => {
    // Validate business details
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    if (!deliveryDate) {
      alert('Please select a date');
      return;
    }
    if (!deliveryTime) {
      alert('Please select a time');
      return;
    }

    // Check if delivery area has been validated for delivery orders
    if (fulfillmentType === 'delivery' && !addressValidated) {
      alert('Please validate your delivery address first by clicking "Validate Address"');
      return;
    }

    setLoading(true);
    // Add business details and fulfillment to all orders
    const updatedOrders = orders.map(order => ({
      ...order,
      businessName,
      address,
      email,
      phone,
      fulfillmentType,
      deliveryDate,
      deliveryTime,
      branchId: fulfillmentType === 'delivery' ? branchId : null // Include branchId for delivery orders
    }));

    // Pass all orders to checkout page
    const ordersData = encodeURIComponent(JSON.stringify(updatedOrders));
    router.push(`/checkout?orders=${ordersData}`);
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

          {/* Beta Warning Banner */}
          <div className="beta-warning-banner">
            <strong>⚠️ BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of our ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
          </div>

          {/* Orders Summary Section */}
          <div className="basket-section">
            <h2 className="basket-section-title">Your Buffets ({orders.length})</h2>
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
                    {order.notes && (
                      <div className="detail-item">
                        <span className="detail-label">Menu:</span>
                        <span className="detail-value">{order.notes}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">People:</span>
                      <span className="detail-value">{order.numPeople}</span>
                    </div>
                    {order.fulfillmentType && (
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{order.fulfillmentType === 'delivery' ? 'Delivery' : 'Collection'}</span>
                      </div>
                    )}
                    {order.totalPrice !== undefined && (
                      <div className="detail-item price-item">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value price-value">£{order.totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

          {/* Business Details Section */}
          {orders.length > 0 && (
            <div className="form-section">
              <h2 className="form-section-title">Business Details</h2>
              <div className="form-group">
                <label htmlFor="business-name">Business Name *</label>
                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business or department name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setAddressValidated(false); // Reset validation when address changes
                      setBranchId(null);
                    }}
                    placeholder="Enter your address"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  {fulfillmentType === 'delivery' && (
                    <button
                      type="button"
                      onClick={validateDeliveryArea}
                      disabled={validatingAddress || !address.trim()}
                      className="validate-address-button"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: addressValidated ? '#28a745' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: validatingAddress || !address.trim() ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: validatingAddress || !address.trim() ? 0.6 : 1
                      }}
                    >
                      {validatingAddress ? 'Validating...' : addressValidated ? '✓ Validated' : 'Validate Address'}
                    </button>
                  )}
                </div>
                {fulfillmentType === 'delivery' && addressValidated && (
                  <div style={{ marginTop: '5px', color: '#28a745', fontSize: '14px' }}>
                    ✓ Address validated and within delivery range
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fulfillment Section */}
          {orders.length > 0 && (
            <div className="form-section">
              <h2 className="form-section-title">Delivery or Collection</h2>
              <div className="fulfillment-options">
                <label className="fulfillment-option">
                  <input
                    type="radio"
                    name="fulfillment"
                    value="collection"
                    checked={fulfillmentType === 'collection'}
                    onChange={(e) => setFulfillmentType(e.target.value)}
                  />
                  <span>Collection</span>
                </label>
                <label className="fulfillment-option">
                  <input
                    type="radio"
                    name="fulfillment"
                    value="delivery"
                    checked={fulfillmentType === 'delivery'}
                    onChange={(e) => setFulfillmentType(e.target.value)}
                  />
                  <span>Delivery</span>
                </label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="delivery-date">Date *</label>
                  <input
                    id="delivery-date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="delivery-time">Time *</label>
                  <select
                    id="delivery-time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="13:30">1:30 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="17:30">5:30 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                  </select>
                </div>
              </div>
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

