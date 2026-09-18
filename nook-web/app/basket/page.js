'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './basket.css';

export default function BasketPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [cutoffInfo, setCutoffInfo] = useState(null);
  const [loadingDateInfo, setLoadingDateInfo] = useState(true);

  // Business details state
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Collection date state
  const [fulfillmentDate, setFulfillmentDate] = useState('');

  // Get basket data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('basketData');
    if (data) {
      const parsed = JSON.parse(data);
      // Handle both array and single object formats
      const ordersList = Array.isArray(parsed) ? parsed : [parsed];
      setOrders(ordersList);
    }

    // Pre-fill customer details if they're logged in
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        if (customer.email) setEmail(customer.email);
        if (customer.phone) setPhone(customer.phone);
        if (customer.default_address) {
          // Try to split a UK postcode off the end of the saved address
          const postcodeRegex = /([A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2})$/i;
          const match = customer.default_address.match(postcodeRegex);
          if (match) {
            setPostcode(match[1].trim().toUpperCase());
            setAddress(customer.default_address.replace(postcodeRegex, '').replace(/,?\s*$/, '').trim());
          } else {
            // No postcode found - put the whole thing in address
            setAddress(customer.default_address);
          }
        }
      } catch (_) {}
    }
  }, []);

  // Calculate fallback minimum date (tomorrow) in case API fails
  const calculateFallbackMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  useEffect(() => {
    const fetchEarliestDate = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const response = await fetch(`${apiUrl}/api/orders/earliest-date`);

        if (!response.ok) {
          console.error('Failed to fetch earliest date:', response.status);
          const fallback = calculateFallbackMinDate();
          setMinDate(fallback);
          if (!fulfillmentDate) {
            setFulfillmentDate(fallback);
          }
          return;
        }

        const result = await response.json();

        if (result.return_code === 'SUCCESS') {
          setMinDate(result.data.earliestDate);
          setCutoffInfo(result.data);

          // Auto-set collection date to earliest available if not already set
          if (!fulfillmentDate) {
            setFulfillmentDate(result.data.earliestDate);
          }
        } else {
          // API returned an error, use fallback
          const fallback = calculateFallbackMinDate();
          setMinDate(fallback);
          if (!fulfillmentDate) {
            setFulfillmentDate(fallback);
          }
        }
      } catch (error) {
        console.error('Error fetching earliest date:', error);
        // Use fallback minimum date if API fails
        const fallback = calculateFallbackMinDate();
        setMinDate(fallback);
        if (!fulfillmentDate) {
          setFulfillmentDate(fallback);
        }
      } finally {
        setLoadingDateInfo(false);
      }
    };

    fetchEarliestDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToCheckout = () => {
    // Validate minimum 5 people total across all buffets
    const totalPeople = orders.reduce((sum, order) => sum + (order.numPeople || 0), 0);
    if (totalPeople < 5) {
      alert(`Minimum order is 5 people. Your current total is ${totalPeople} ${totalPeople === 1 ? 'person' : 'people'}.`);
      return;
    }

    // Validate business details
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }
    if (!postcode.trim()) {
      alert('Please enter a postcode');
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
    if (!fulfillmentDate) {
      alert('Please select a date');
      return;
    }
    // Validate selected date is not before minimum date
    if (minDate && fulfillmentDate < minDate) {
      alert(`Please select a date from ${new Date(minDate).toLocaleDateString('en-GB')} onwards`);
      return;
    }

    setLoading(true);
    // Add business details and collection date to all orders
    const updatedOrders = orders.map(order => ({
      ...order,
      businessName,
      address: `${address.trim()}, ${postcode.trim()}`,
      email,
      phone,
      fulfillmentType: 'collection',
      fulfillmentDate
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

  // Edit an existing order - saves it to localStorage and navigates to order page
  const handleEditOrder = (index) => {
    const orderToEdit = orders[index];
    // Store the order being edited along with its index
    localStorage.setItem('editingOrder', JSON.stringify({
      ...orderToEdit,
      editIndex: index
    }));
    // Navigate to the order page with the same buffet version
    router.push(`/order?buffetVersionId=${orderToEdit.buffetVersionId}`);
  };

  // handle date changes with validation
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    // Check if selected date is before minimum allowed date
    if (minDate && selectedDate < minDate) {
      alert(`Please select a date from ${new Date(minDate).toLocaleDateString('en-GB')} onwards. Selected date is too early.`);
      // Reset to minimum date or clear the field
      setFulfillmentDate(minDate);
      return;
    }
    
    setFulfillmentDate(selectedDate);
  };

  return (
    <div className="welcome-page-option3">
      <div className="basket-page-container">
        <div className="basket-content-wrapper">
          <h1 className="basket-title">Your Basket</h1>

          {/* Beta Warning Banner */}
          {/* <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of a ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
          </div> */}

          {/* Orders Summary Section */}
          <div className="basket-section">
            <h2 className="basket-section-title">Your Buffets ({orders.length})</h2>
            <div className="orders-list">
              {orders.map((order, index) => (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <h3 className="order-number">{order.buffetName || `Buffet #${index + 1}`}</h3>
                    <div className="order-header-buttons">
                      <button
                        className="order-edit-button"
                        onClick={() => handleEditOrder(index)}
                        title="Edit this order"
                      >
                        ✎
                      </button>
                      <button
                        className="order-remove-button"
                        onClick={() => handleRemoveOrder(index)}
                        title="Remove this order"
                      >
                        ✕
                      </button>
                    </div>
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
                    {/* Buffet subtotal */}
                    <div className="detail-item">
                      <span className="detail-label">Buffet:</span>
                      <span className="detail-value">£{(order.pricePerPerson * order.numPeople).toFixed(2)}</span>
                    </div>
                    {/* Display upgrades if any */}
                    {order.upgrades && order.upgrades.length > 0 && (
                      <div className="order-upgrades">
                        <span className="detail-label">Upgrades:</span>
                        {order.upgrades.map((upgrade, idx) => (
                          <div key={idx} className="upgrade-detail">
                            <span className="upgrade-name">{upgrade.upgradeName}</span>
                            <span className="upgrade-subtotal">+ £{upgrade.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {order.totalPrice !== undefined && (
                      <div className="detail-item price-item">
                        <span className="detail-label">Total:</span>
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

          {/* Minimum People Warning */}
          {orders.length > 0 && orders.reduce((sum, order) => sum + (order.numPeople || 0), 0) < 5 && (
            <div className="minimum-people-warning">
              Minimum order is 5 people. Current total: {orders.reduce((sum, order) => sum + (order.numPeople || 0), 0)} {orders.reduce((sum, order) => sum + (order.numPeople || 0), 0) === 1 ? 'person' : 'people'}.
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
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="postcode">Postcode *</label>
                <input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. SY1 1AA"
                  className="form-input"
                  style={{ maxWidth: '160px' }}
                />
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

          {/* Collection Section */}
          {orders.length > 0 && (
            <div className="form-section">
              <h2 className="form-section-title">Collection</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fulfillment-date">Date *</label>
                  {loadingDateInfo ? (
                    <div style={{ padding: '10px', color: '#666' }}>Loading available dates...</div>
                  ) : (
                    <>
                      <input
                        id="fulfillment-date"
                        type="date"
                        value={fulfillmentDate}
                        min={minDate || undefined}
                        onChange={handleDateChange}
                        className="form-input"
                      />
                      {minDate && (
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                          Earliest available: {new Date(minDate + 'T00:00:00').toLocaleDateString('en-GB')}
                        </div>
                      )}
                      {cutoffInfo && (
                        <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                          {cutoffInfo.isAfterCutoff ? (
                            <span style={{ color: '#ff6b35' }}>
                              After {cutoffInfo.cutoffTime} cutoff - earliest collection: {new Date(cutoffInfo.earliestDate + 'T00:00:00').toLocaleDateString('en-GB')}
                            </span>
                          ) : (
                            <span style={{ color: '#28a745' }}>
                              ✓ Order by {cutoffInfo.cutoffTime} for next-day collection
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
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

