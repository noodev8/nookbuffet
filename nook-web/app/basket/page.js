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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fulfillment state
  const [fulfillmentType, setFulfillmentType] = useState('collection');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Branch validation state (for delivery)
  const [branchId, setBranchId] = useState(null);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  // Branch selection state (for collection)
  const [branches, setBranches] = useState([]);
  const [collectionBranchId, setCollectionBranchId] = useState('');

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

  // Fetch branches for collection dropdown when page loads
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const response = await fetch(`${apiUrl}/api/branches`);
        if (!response.ok) {
          console.error('Failed to fetch branches:', response.status);
          return;
        }
        const data = await response.json();
        if (data.return_code === 'SUCCESS') {
          setBranches(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Auto-validate address when delivery is selected and address is filled
  useEffect(() => {
    if (fulfillmentType === 'delivery' && address.trim() && !addressValidated) {
      validateDeliveryArea();
    }
  }, [fulfillmentType, address]);

  // Auto-select nearest branch when collection is selected and address is filled
  useEffect(() => {
    if (fulfillmentType === 'collection' && address.trim()) {
      findNearestBranchForCollection();
    }
  }, [fulfillmentType, address]);

  // Find nearest branch for collection orders
  const findNearestBranchForCollection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/branches/nearest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        console.error('Failed to find nearest branch:', response.status);
        return;
      }

      const result = await response.json();

      if (result.return_code === 'SUCCESS' && result.data) {
        setCollectionBranchId(result.data.id.toString());
      }
    } catch (error) {
      console.error('Error finding nearest branch:', error);
    }
  };

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

      if (!response.ok) {
        console.error('Failed to validate address:', response.status);
        alert('Failed to validate address. Please try again.');
        return;
      }

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
          if (!deliveryDate) {
            setDeliveryDate(fallback);
          }
          return;
        }

        const result = await response.json();

        if (result.return_code === 'SUCCESS') {
          setMinDate(result.data.earliestDate);
          setCutoffInfo(result.data);

          // Auto-set delivery date to earliest available if not already set
          if (!deliveryDate) {
            setDeliveryDate(result.data.earliestDate);
          }
        } else {
          // API returned an error, use fallback
          const fallback = calculateFallbackMinDate();
          setMinDate(fallback);
          if (!deliveryDate) {
            setDeliveryDate(fallback);
          }
        }
      } catch (error) {
        console.error('Error fetching earliest date:', error);
        // Use fallback minimum date if API fails
        const fallback = calculateFallbackMinDate();
        setMinDate(fallback);
        if (!deliveryDate) {
          setDeliveryDate(fallback);
        }
      } finally {
        setLoadingDateInfo(false);
      }
    };

    fetchEarliestDate();
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

    // Validate selected date is not before minimum date
    if (minDate && deliveryDate < minDate) {
      alert(`Please select a date from ${new Date(minDate).toLocaleDateString('en-GB')} onwards`);
      return;
    }

    // Check if delivery area has been validated for delivery orders
    if (fulfillmentType === 'delivery' && !addressValidated) {
      alert('Please wait for address validation to complete, or check that your address is within our delivery area');
      return;
    }

    // Check if collection branch has been selected for collection orders
    if (fulfillmentType === 'collection' && !collectionBranchId) {
      alert('Please select a collection branch');
      return;
    }

    setLoading(true);
    // Add business details and fulfillment to all orders
    // Use branchId from delivery validation or collectionBranchId from dropdown
    const selectedBranchId = fulfillmentType === 'delivery' ? branchId : parseInt(collectionBranchId);
    const updatedOrders = orders.map(order => ({
      ...order,
      businessName,
      address,
      email,
      phone,
      fulfillmentType,
      deliveryDate,
      deliveryTime,
      branchId: selectedBranchId
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

  // Add this function to handle date changes with validation
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    // Check if selected date is before minimum allowed date
    if (minDate && selectedDate < minDate) {
      alert(`Please select a date from ${new Date(minDate).toLocaleDateString('en-GB')} onwards. Selected date is too early.`);
      // Reset to minimum date or clear the field
      setDeliveryDate(minDate);
      return;
    }
    
    setDeliveryDate(selectedDate);
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
                    {order.fulfillmentType && (
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{order.fulfillmentType === 'delivery' ? 'Delivery' : 'Collection'}</span>
                      </div>
                    )}
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
              ⚠️ Minimum order is 5 people. Current total: {orders.reduce((sum, order) => sum + (order.numPeople || 0), 0)} {orders.reduce((sum, order) => sum + (order.numPeople || 0), 0) === 1 ? 'person' : 'people'}.
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
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressValidated(false); // Reset validation when address changes
                    setBranchId(null);
                  }}
                  placeholder="Enter your address"
                  className="form-input"
                />
                {fulfillmentType === 'delivery' && validatingAddress && (
                  <div style={{ marginTop: '5px', color: '#007bff', fontSize: '14px' }}>
                    🔄 Validating delivery address...
                  </div>
                )}
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

              {/* Branch selection for collection orders */}
              {fulfillmentType === 'collection' && (
                <div className="form-group">
                  <label htmlFor="collection-branch">Collection Branch *</label>
                  <select
                    id="collection-branch"
                    value={collectionBranchId}
                    onChange={(e) => setCollectionBranchId(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="delivery-date">Date *</label>
                  {loadingDateInfo ? (
                    <div style={{ padding: '10px', color: '#666' }}>Loading available dates...</div>
                  ) : (
                    <>
                      <input
                        id="delivery-date"
                        type="date"
                        value={deliveryDate}
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
                              ⏰ After {cutoffInfo.cutoffTime} cutoff - earliest delivery: {new Date(cutoffInfo.earliestDate + 'T00:00:00').toLocaleDateString('en-GB')}
                            </span>
                          ) : (
                            <span style={{ color: '#28a745' }}>
                              ✓ Order by {cutoffInfo.cutoffTime} for next-day delivery
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
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

