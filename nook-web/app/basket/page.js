'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { readBasket, saveBasket, isSandwich, money, describeSandwich } from '../lib/basket';
import './basket.css';

// "YYYY-MM-DD" for a date in local time
const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDate = (key) => new Date(key + 'T00:00:00').toLocaleDateString('en-GB');

// Used if the server can't be reached - tomorrow for everything. The server checks again anyway.
const fallbackDateInfo = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const key = toDateKey(tomorrow);
  return { earliestDate: key, sandwiches: { earliestDate: key, today: toDateKey(new Date()) } };
};

export default function BasketPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateInfo, setDateInfo] = useState(null);
  const [loadingDateInfo, setLoadingDateInfo] = useState(true);

  // Customer details state. Buffet orders ask for a business name and address;
  // sandwich-only orders just need a name (stored in the same businessName field).
  const [businessName, setBusinessName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Collection date and time state. Time is only asked for when there are sandwiches.
  const [fulfillmentDate, setFulfillmentDate] = useState('');
  const [fulfillmentTime, setFulfillmentTime] = useState('');
  // 5-minute collection slots for the chosen day: { date, slots: [{ time, available }], error }
  const [slotInfo, setSlotInfo] = useState(null);

  // Get basket data from localStorage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    setOrders(readBasket());

    // Pre-fill customer details if they're logged in
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        if (customer.email) setEmail(customer.email);
        if (customer.phone) setPhone(customer.phone);
        const fullName = customer.full_name || [customer.first_name, customer.last_name].filter(Boolean).join(' ');
        if (fullName) setCustomerName(fullName);
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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    fetch(`${apiUrl}/api/orders/earliest-date`)
      .then(res => res.json())
      .then(result => setDateInfo(result.return_code === 'SUCCESS' ? result.data : fallbackDateInfo()))
      .catch(error => {
        console.error('Error fetching earliest date:', error);
        setDateInfo(fallbackDateInfo());
      })
      .finally(() => setLoadingDateInfo(false));
  }, []);

  // Keep the original basket index on each entry so edit/remove still point at the right one
  const buffets = orders.map((order, index) => ({ order, index })).filter(({ order }) => !isSandwich(order));
  const sandwiches = orders.map((order, index) => ({ order, index })).filter(({ order }) => isSandwich(order));
  const hasBuffets = buffets.length > 0;
  const hasSandwiches = sandwiches.length > 0;

  const totalPeople = buffets.reduce((sum, { order }) => sum + (order.numPeople || 0), 0);
  const grandTotal = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Buffets need the usual notice. Sandwich-only orders can be collected today before the sandwich cutoff.
  const dateRules = dateInfo && (hasBuffets ? dateInfo : dateInfo.sandwiches);
  const minDate = dateRules?.earliestDate || '';
  // Until the customer picks a date (or if what they picked is now too early) use the earliest one
  const dateValue = fulfillmentDate && fulfillmentDate >= minDate ? fulfillmentDate : minDate;
  const isToday = Boolean(dateInfo) && dateValue === dateInfo.sandwiches.today;

  // Load the sandwich collection slots whenever the day changes
  useEffect(() => {
    if (!hasSandwiches || !dateValue) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    fetch(`${apiUrl}/api/sandwiches/slots?date=${dateValue}`)
      .then(res => res.json())
      .then(data => setSlotInfo(data.return_code === 'SUCCESS'
        ? { date: dateValue, slots: data.data.slots }
        : { date: dateValue, slots: [], error: data.message || 'Could not load collection times' }))
      .catch(() => setSlotInfo({ date: dateValue, slots: [], error: 'Could not load collection times. Please try again.' }));
  }, [hasSandwiches, dateValue]);

  const slots = slotInfo?.date === dateValue ? slotInfo.slots : null; // null while loading
  const openSlots = (slots || []).filter(slot => slot.available);
  // Drop a picked time that isn't free on the chosen day (e.g. after changing the date)
  const timeValue = openSlots.some(slot => slot.time === fulfillmentTime) ? fulfillmentTime : '';

  const handleProceedToCheckout = () => {
    // Validate minimum 5 people total across all buffets
    if (hasBuffets && totalPeople < 5) {
      alert(`Minimum buffet order is 5 people. Your current total is ${totalPeople} ${totalPeople === 1 ? 'person' : 'people'}.`);
      return;
    }

    // Validate customer details
    if (hasBuffets) {
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
    } else if (!customerName.trim()) {
      alert('Please enter your name');
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
    if (!dateValue) {
      alert('Please select a date');
      return;
    }
    if (hasSandwiches && !timeValue) {
      alert('Please choose a collection time');
      return;
    }

    setLoading(true);
    // Add customer details and collection date to all orders
    const updatedOrders = orders.map(order => ({
      ...order,
      businessName: hasBuffets ? businessName.trim() : customerName.trim(),
      address: hasBuffets ? `${address.trim()}, ${postcode.trim()}` : '',
      email,
      phone,
      fulfillmentType: 'collection',
      fulfillmentDate: dateValue,
      fulfillmentTime: hasSandwiches ? timeValue : ''
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
    saveBasket(updatedOrders);
    if (updatedOrders.length === 0) {
      router.push('/');
    } else {
      setOrders(updatedOrders);
    }
  };

  // Edit an existing order - saves it to localStorage and navigates to order page
  const handleEditOrder = (index) => {
    const orderToEdit = orders[index];
    if (isSandwich(orderToEdit)) {
      router.push(`/sandwiches?edit=${index}`);
      return;
    }
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
      alert(`Please select a date from ${formatDate(minDate)} onwards. Selected date is too early.`);
      // Reset to minimum date or clear the field
      setFulfillmentDate(minDate);
      return;
    }

    setFulfillmentDate(selectedDate);
  };

  const editRemoveButtons = (index) => (
    <div className="order-header-buttons">
      <button className="order-edit-button" onClick={() => handleEditOrder(index)} title="Edit this order">
        ✎
      </button>
      <button className="order-remove-button" onClick={() => handleRemoveOrder(index)} title="Remove this order">
        ✕
      </button>
    </div>
  );

  return (
    <div className="welcome-page-option3">
      <div className="basket-page-container">
        <div className="basket-content-wrapper">
          <h1 className="basket-title">Your Basket</h1>

          {/* Orders Summary Section */}
          <div className="basket-section">
            <h2 className="basket-section-title">Your Order ({orders.length} item{orders.length !== 1 ? 's' : ''})</h2>
            <div className="orders-list">
              {buffets.map(({ order, index }) => (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <h3 className="order-number">{order.buffetName || 'Buffet'}</h3>
                    {editRemoveButtons(index)}
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

              {sandwiches.map(({ order, index }) => (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <h3 className="order-number">{order.quantity} × Sandwich</h3>
                    {editRemoveButtons(index)}
                  </div>
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="detail-value">{describeSandwich(order.picks)}</span>
                    </div>
                    {order.notes && (
                      <div className="detail-item">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{order.notes}</span>
                      </div>
                    )}
                    <div className="detail-item price-item">
                      <span className="detail-label">Total:</span>
                      <span className="detail-value price-value">
                        {money(order.totalPrice)}
                        {order.quantity > 1 && ` (${money(order.unitPrice)} each)`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Grand Total Section */}
          {orders.length > 0 && (
            <div className="basket-grand-total">
              <span>Grand Total:</span>
              <span className="grand-total-value">{money(grandTotal)}</span>
            </div>
          )}

          {/* Minimum People Warning - buffets only */}
          {hasBuffets && totalPeople < 5 && (
            <div className="minimum-people-warning">
              Minimum buffet order is 5 people. Current total: {totalPeople} {totalPeople === 1 ? 'person' : 'people'}.
            </div>
          )}

          {/* Customer Details Section */}
          {orders.length > 0 && (
            <div className="form-section">
              <h2 className="form-section-title">{hasBuffets ? 'Business Details' : 'Your Details'}</h2>
              {hasBuffets ? (
                <>
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
                </>
              ) : (
                <div className="form-group">
                  <label htmlFor="customer-name">Name *</label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Who is collecting?"
                    className="form-input"
                    autoComplete="name"
                  />
                </div>
              )}
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
                        value={dateValue}
                        min={minDate || undefined}
                        onChange={handleDateChange}
                        className="form-input"
                      />
                      {minDate && (
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                          Earliest available: {formatDate(minDate)}
                        </div>
                      )}
                      {dateRules?.cutoffTime && (
                        <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                          {!dateRules.isAfterCutoff ? (
                            <span style={{ color: '#28a745' }}>
                              ✓ Order by {dateRules.cutoffTime} for {hasBuffets ? 'next-day' : 'same-day'} collection
                            </span>
                          ) : (
                            <span style={{ color: '#ff6b35' }}>
                              After {dateRules.cutoffTime} cutoff - earliest collection: {formatDate(dateRules.earliestDate)}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {hasSandwiches && (
                  <div className="form-group">
                    <label htmlFor="fulfillment-time">Time *</label>
                    {slots === null ? (
                      <div style={{ padding: '10px', color: '#666' }}>Loading collection times...</div>
                    ) : slotInfo.error ? (
                      <div style={{ padding: '10px', color: '#ff6b35' }}>{slotInfo.error}</div>
                    ) : openSlots.length === 0 ? (
                      <div style={{ padding: '10px', color: '#ff6b35' }}>
                        {isToday ? 'No collection times left today' : 'No collection times left on this day'} - please choose another date.
                      </div>
                    ) : (
                      <>
                        <select
                          id="fulfillment-time"
                          value={timeValue}
                          onChange={(e) => setFulfillmentTime(e.target.value)}
                          className="form-input"
                        >
                          <option value="">Choose a time</option>
                          {slots.map(slot => (
                            <option key={slot.time} value={slot.time} disabled={!slot.available}>
                              {slot.time}{slot.available ? '' : ' (full)'}
                            </option>
                          ))}
                        </select>
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                          {isToday ? 'Collecting today - please allow us time to make it' : 'Times shown are when your sandwiches will be ready'}
                        </div>
                      </>
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
