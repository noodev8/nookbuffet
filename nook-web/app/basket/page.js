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

  // Branch timeslot state (set automatically from selected branch)
  const [branchTimeslot, setBranchTimeslot] = useState(null); 

  // Branch validation state (for delivery)
  const [branchId, setBranchId] = useState(null);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [addressValidationMessage, setAddressValidationMessage] = useState('');

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

      // Pre-fill collection branch if orders were placed with a branch already selected
      const firstBranchId = ordersList.find(o => o.branchId)?.branchId;
      if (firstBranchId) {
        setCollectionBranchId(firstBranchId.toString());
      }
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

  // Handle timeslot when switching fulfillment type
  useEffect(() => {
    if (fulfillmentType === 'collection') {
      // Collection has no fixed timeslot — clear it
      setBranchTimeslot(null);
      setDeliveryTime('');
    } else if (fulfillmentType === 'delivery' && addressValidated && branchId) {
      // Switching back to delivery with an already-validated address —
      // restore the timeslot from the branches list immediately
      const matchingBranch = branches.find(b => b.id === branchId);
      if (matchingBranch?.delivery_time_start && matchingBranch?.delivery_time_end) {
        setBranchTimeslot({ start: matchingBranch.delivery_time_start, end: matchingBranch.delivery_time_end });
        setDeliveryTime(`${matchingBranch.delivery_time_start}-${matchingBranch.delivery_time_end}`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentType]);

  // Auto-validate address when delivery is selected and address is filled (debounced)
  useEffect(() => {
    if (fulfillmentType === 'delivery' && address.trim() && !addressValidated) {
      // Debounce: wait 1 second after user stops typing before validating
      const timeoutId = setTimeout(() => {
        validateDeliveryArea();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentType, address]);

  // Auto-select nearest branch when collection is selected and address is filled (debounced)
  useEffect(() => {
    if (fulfillmentType === 'collection' && address.trim()) {
      // Debounce: wait 1 second after user stops typing before finding nearest branch
      const timeoutId = setTimeout(() => {
        findNearestBranchForCollection();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Collection has no fixed timeslot — customer can collect anytime
      }
    } catch (error) {
      console.error('Error finding nearest branch:', error);
    }
  };

  // Validate delivery area and get branch ID
  const validateDeliveryArea = async () => {
    if (!address.trim()) {
      return;
    }

    setValidatingAddress(true);
    setAddressValidated(false);
    setAddressValidationMessage('');
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
        setAddressValidationMessage('Failed to validate address. Please try again.');
        return;
      }

      const result = await response.json();

      if (result.return_code === 'SUCCESS') {
        if (result.data.isWithinRange) {
          const validatedBranchId = result.data.branch.id;
          setBranchId(validatedBranchId);
          setAddressValidated(true);
          setAddressValidationMessage(`Your nearest branch is ${result.data.branch.name} (${result.data.distanceMiles.toFixed(1)} miles away)`);
          // Look up the timeslot from the already-loaded branches list 
          const matchingBranch = branches.find(b => b.id === validatedBranchId);
          const timeStart = matchingBranch?.delivery_time_start || result.data.branch.deliveryTimeStart;
          const timeEnd = matchingBranch?.delivery_time_end || result.data.branch.deliveryTimeEnd;
          if (timeStart && timeEnd) {
            setBranchTimeslot({ start: timeStart, end: timeEnd });
            setDeliveryTime(`${timeStart}-${timeEnd}`);
          }
        } else {
          setAddressValidationMessage(`Sorry, this address is outside our delivery area. The nearest branch is ${result.data.distanceMiles.toFixed(1)} miles away (maximum: ${result.data.deliveryRadius} miles).`);
          setBranchTimeslot(null);
          setDeliveryTime('');
        }
      } else {
        setAddressValidationMessage(`Address validation failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error validating address:', error);
      setAddressValidationMessage('Failed to validate address. Please try again.');
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
    if (fulfillmentType === 'delivery' && !deliveryTime) {
      alert('No delivery timeslot available. Please validate your delivery address.');
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
    // Navigate to the order page with the same buffet version and branch
    const branchParam = orderToEdit.branchId ? `&branch_id=${orderToEdit.branchId}` : '';
    router.push(`/order?buffetVersionId=${orderToEdit.buffetVersionId}${branchParam}`);
  };

  // handle date changes with validation
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

  // Format "HH:MM" to "H:MM AM/PM" for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hourStr, minute] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className="welcome-page-option3">
      <div className="basket-page-container">
        <div className="basket-content-wrapper">
          <h1 className="basket-title">Your Basket</h1>

          {/* Beta Warning Banner */}
          <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of a ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
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
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressValidated(false); // Reset validation when address changes
                    setAddressValidationMessage(''); // Clear message when typing
                    setBranchId(null);
                  }}
                  placeholder="Enter your address"
                  className="form-input"
                />
                {fulfillmentType === 'delivery' && validatingAddress && (
                  <div style={{ marginTop: '5px', color: '#007bff', fontSize: '14px' }}>
                    Validating delivery address...
                  </div>
                )}
                {fulfillmentType === 'delivery' && !validatingAddress && addressValidated && (
                  <div style={{ marginTop: '5px', color: '#28a745', fontSize: '14px' }}>
                    ✓ {addressValidationMessage}
                  </div>
                )}
                {fulfillmentType === 'delivery' && !validatingAddress && !addressValidated && addressValidationMessage && (
                  <div style={{ marginTop: '5px', color: '#dc3545', fontSize: '14px' }}>
                    ✗ {addressValidationMessage}
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
                              After {cutoffInfo.cutoffTime} cutoff - earliest delivery: {new Date(cutoffInfo.earliestDate + 'T00:00:00').toLocaleDateString('en-GB')}
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
                {fulfillmentType === 'delivery' && (
                  <div className="form-group">
                    <label>Delivery Time</label>
                    {branchTimeslot ? (
                      <div style={{
                        padding: '10px 14px',
                        background: '#f0f7f0',
                        border: '1px solid #28a745',
                        borderRadius: '6px',
                        color: '#1a5c1a',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}>
                        {formatTime(branchTimeslot.start)} – {formatTime(branchTimeslot.end)}
                        <div style={{ fontSize: '12px', color: '#555', fontWeight: 'normal', marginTop: '4px' }}>
                          Set by your branch
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        background: '#f8f8f8',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        color: '#888',
                        fontSize: '14px'
                      }}>
                        Validate your address to see your delivery timeslot
                      </div>
                    )}
                  </div>
                )}
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

