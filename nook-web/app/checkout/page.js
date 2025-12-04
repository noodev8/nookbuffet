// This tells Next.js to run this page on the client side (in the browser) not the server
'use client';

// Bringing in the tools we need from Next.js and React
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import './checkout.css';

function CheckoutContent() {
  // router lets us navigate between pages, searchParams grabs stuff from the URL
  const router = useRouter();
  const searchParams = useSearchParams();

  // These are state variables - the data this page keeps track of
  const [orders, setOrders] = useState([]); // All the buffet orders from the basket
  const [loading, setLoading] = useState(false); // Whether we're currently processing the order
  const [cardNumber, setCardNumber] = useState(''); // Card number input (not actually charged, just for testing)
  const [cardExpiry, setCardExpiry] = useState(''); // Card expiry date
  const [cardCVC, setCardCVC] = useState(''); // Card security code

  // This runs when the page loads - grabs the order data from the URL
  // The basket page sends all the orders through the URL so it can display them here
  useEffect(() => {
    const ordersParam = searchParams.get('orders');

    if (ordersParam) {
      try {
        // URL encoding makes special characters safe for URLs
        const decoded = decodeURIComponent(ordersParam);
        // Turn the text back into actual JavaScript objects
        const parsedOrders = JSON.parse(decoded);
        // Make sure it's an array of orders, even if there's just one
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : [parsedOrders]);
      } catch (e) {
        // If something goes wrong reading the orders
        console.error('Error parsing orders:', e);
      }
    }
  }, [searchParams]); // This runs whenever searchParams changes

  // This is what happens when someone clicks "Confirm Order"
  const handleConfirmOrder = async () => {
    setLoading(true); // Show the loading state so they know something's happening
    try {
      // First, make sure they filled in all the payment fields
      // .trim() removes any spaces, so "   " counts as empty
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCVC.trim()) {
        alert('Please enter all payment details');
        setLoading(false);
        return; // Stop here if fields are empty
      }

      // Package up all the order info to send to the server
      // taking info from the first order since business details are the same for all
      const orderData = {
        email: orders[0]?.email || '', // The ?. means "if orders[0] exists, get email, otherwise undefined"
        phone: orders[0]?.phone || '', // The || '' means "if undefined, use empty string instead"
        businessName: orders[0]?.businessName || '',
        address: orders[0]?.address || '',
        fulfillmentType: orders[0]?.fulfillmentType || 'delivery', // Either 'delivery' or 'collection'
        deliveryDate: orders[0]?.deliveryDate || '',
        deliveryTime: orders[0]?.deliveryTime || '',
        branchId: orders[0]?.branchId || null, // Include the branch ID from delivery validation
        // Add up all the order prices to get the grand total
        totalPrice: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        // Convert each order into the format the server expects
        buffets: orders.map(order => ({
          buffetVersionId: order.buffetVersionId, // Which buffet menu they chose
          numPeople: order.numPeople, // How many people
          pricePerPerson: order.pricePerPerson, // Price per head
          totalPrice: order.totalPrice, // Total for this buffet (including upgrades)
          items: order.items, // All the food items they selected
          notes: order.notes || '', // Any special requests
          dietaryInfo: order.dietaryInfo || '', // Dietary requirements
          allergens: order.allergens || '', // Allergy info
          // Include selected upgrades with their item selections
          upgrades: (order.upgrades || []).map(upgrade => ({
            upgradeId: upgrade.upgradeId,
            selectedItems: upgrade.selectedItems || []
          }))
        }))
      };

      //where to send the order 
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      // Send the order to the server
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST', // POST means we're sending data to create something new
        headers: {
          'Content-Type': 'application/json', // Tell the server we're sending JSON
        },
        body: JSON.stringify(orderData) // Turn our JavaScript object into JSON text
      });

      // Get the server's response and turn it back into a JavaScript object
      const result = await response.json();

      // Check if the order went through successfully
      if (result.return_code === 'SUCCESS') {
        alert(`Order confirmed! Your order number is ${result.data.orderNumber}`);
        localStorage.removeItem('basketData'); // Clear the basket since order is complete
        router.push('/'); // Send them back to the home page
      } else {
        // Something went wrong on the server
        alert(`Failed to create order: ${result.message}`);
      }
    } catch (error) {
      // This catches any errors like network problems or server being down
      console.error('Error creating order:', error);
      alert('Failed to confirm order. Please try again.');
    } finally {
      // This runs no matter what - success or error - to turn off the loading state
      setLoading(false);
    }
  };

  // Here's what actually shows up on the page
  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <h1 className="checkout-title">Complete Your Order</h1>

          {/* Big warning banner at the top - this is just for testing, not real orders */}
          <div className="beta-warning-banner">
            <strong>⚠️ BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of our ordering system. No real orders will be processed and no payments will be charged. Please do not enter real payment information.</p>
          </div>

          {/* Show all the buffets they're ordering */}
          <div className="checkout-section">
            {/* The title shows how many buffets - adds an 's' if more than one */}
            <h2 className="checkout-section-title">Order Summary ({orders.length} buffet{orders.length !== 1 ? 's' : ''})</h2>
            <div className="checkout-orders-list">
              {/* Loop through each order and display it */}
              {orders.map((order, index) => (
                <div key={index} className="checkout-order-item">
                  <div className="checkout-order-header">
                    {/* Show which buffet this is (1, 2, 3, etc.) */}
                    <span className="checkout-order-number">Buffet #{index + 1}</span>
                    {/* Show how many people - adds an 's' if more than one person */}
                    <span className="checkout-order-people">{order.numPeople} person{order.numPeople !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="checkout-order-details">
                    {/* Only show notes if they actually wrote something */}
                    {order.notes && <span>Notes: {order.notes}</span>}
                    {/* Show buffet base price */}
                    <span className="checkout-order-buffet-price">
                      Buffet: £{(order.pricePerPerson * order.numPeople).toFixed(2)}
                    </span>
                    {/* Show upgrades if any */}
                    {order.upgrades && order.upgrades.length > 0 && (
                      <div className="checkout-order-upgrades">
                        {order.upgrades.map((upgrade, idx) => (
                          <span key={idx} className="checkout-upgrade-item">
                            + {upgrade.upgradeName}: £{upgrade.subtotal.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Show the total price with 2 decimal places (like £25.00) */}
                    {order.totalPrice !== undefined && (
                      <span className="checkout-order-price">Total: £{order.totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Show the grand total if there are any orders */}
            {orders.length > 0 && (
              <div className="checkout-grand-total">
                <span>Grand Total:</span>
                <span className="checkout-grand-total-value">
                  {/* Add up all the prices and format with 2 decimals */}
                  £{orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Show the business details - only if we have orders and a business name */}
          {orders.length > 0 && orders[0].businessName && (
            <div className="checkout-section">
              <h2 className="checkout-section-title">Business Details</h2>
              <div className="checkout-details-display">
                {/* Each detail-row shows a label and the actual value */}
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
                  {/* Show "Delivery" or "Collection" based on what they picked */}
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

          {/* Payment section - remember this is just for testing, not real payments */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Payment Details</h2>

            {/* Card number input field */}
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number:</label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)} // Update state when they type
                placeholder="1234 5678 9012 3456"
                className="checkout-input"
                maxLength="19" // Limit to 19 characters (16 digits + 3 spaces)
              />
            </div>

            {/* Expiry and CVC side by side */}
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
                  maxLength="5" // MM/YY is 5 characters
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
                  maxLength="4" // Most cards have 3 digits, Amex has 4
                />
              </div>
            </div>
          </div>

          {/* The two buttons at the bottom */}
          <div className="checkout-actions">
            {/* Back button takes them to the previous page */}
            <button
              className="checkout-back-button"
              onClick={() => router.back()} // Go back to wherever they came from
              disabled={loading} // Can't click while processing
            >
              Back
            </button>
            {/* Main submit button */}
            <button
              className="checkout-submit-button"
              onClick={handleConfirmOrder} // Runs the function we wrote above
              disabled={loading} // Can't click while processing
            >
              {/* Show different text depending on whether we're processing */}
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// main checkout page component - wraps everything in Suspense
// show a loading screen while the page figures out what orders to display
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      // fallback is what shows up while loading
      <div className="welcome-page-option3">
        <div className="checkout-page-container">
          <div className="checkout-content-wrapper">
            <div className="loading-state">
              <p>Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      {/* once everything's loaded, show the actual checkout content */}
      <CheckoutContent />
    </Suspense>
  );
}
