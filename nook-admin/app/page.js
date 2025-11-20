'use client';

import { useState, useEffect } from 'react';
import './page.css';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const response = await fetch(`${apiUrl}/api/orders`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.return_code === 'SUCCESS') {
          setOrders(data.data || []);
        } else {
          setError(data.message || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Nook Admin Portal</h1>
        <p className="order-count">Total Orders: {orders.length}</p>
      </header>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">No orders yet</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => toggleOrder(order.id)}>
                <div className="order-header-left">
                  <h2 className="order-number">{order.order_number}</h2>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-header-right">
                  <span className="order-total">£{parseFloat(order.total_price).toFixed(2)}</span>
                  <span className={`expand-icon ${expandedOrders[order.id] ? 'expanded' : ''}`}>▼</span>
                </div>
              </div>

              {expandedOrders[order.id] && (
                <div className="order-details">
                  {/* Customer Info */}
                  <div className="detail-section">
                    <h3>Customer Details</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Business:</span>
                        <span className="detail-value">{order.notes || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{order.customer_email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{order.customer_phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{order.fulfillment_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Info */}
                  <div className="detail-section">
                    <h3>Fulfillment Details</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value fulfillment-type">{order.fulfillment_type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(order.fulfillment_date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{formatTime(order.fulfillment_time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Buffets */}
                  {order.buffets && order.buffets.map((buffet, buffetIndex) => (
                    <div key={buffet.id} className="detail-section buffet-section">
                      <h3>Buffet #{buffetIndex + 1}</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Number of People:</span>
                          <span className="detail-value">{buffet.num_people}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Price per Person:</span>
                          <span className="detail-value">£{parseFloat(buffet.price_per_person).toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Subtotal:</span>
                          <span className="detail-value">£{parseFloat(buffet.subtotal).toFixed(2)}</span>
                        </div>
                        {buffet.dietary_info && (
                          <div className="detail-item full-width">
                            <span className="detail-label">Dietary Info:</span>
                            <span className="detail-value">{buffet.dietary_info}</span>
                          </div>
                        )}
                        {buffet.allergens && (
                          <div className="detail-item full-width">
                            <span className="detail-label">Allergens:</span>
                            <span className="detail-value">{buffet.allergens}</span>
                          </div>
                        )}
                        {buffet.notes && (
                          <div className="detail-item full-width">
                            <span className="detail-label">Notes:</span>
                            <span className="detail-value">{buffet.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      {buffet.items && buffet.items.length > 0 && (
                        <div className="menu-items">
                          <h4>Menu Items:</h4>
                          <div className="items-by-category">
                            {(() => {
                              // Group items by category
                              const itemsByCategory = {};
                              buffet.items.forEach(item => {
                                if (!itemsByCategory[item.category_name]) {
                                  itemsByCategory[item.category_name] = [];
                                }
                                itemsByCategory[item.category_name].push(item);
                              });

                              return Object.entries(itemsByCategory).map(([category, items]) => (
                                <div key={category} className="category-group">
                                  <h5>{category}</h5>
                                  <ul className="items-list">
                                    {items.map(item => (
                                      <li key={item.id}>{item.item_name}</li>
                                    ))}
                                  </ul>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

