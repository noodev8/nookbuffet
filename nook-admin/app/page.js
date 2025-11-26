'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      // Not logged in, redirect to login page
      router.push('/login');
      return;
    }

    // Set user data
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    // Don't fetch orders if not authenticated
    if (!user) return;

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
          // Sort orders by fulfillment date, closest date first
          const sortedOrders = (data.data || []).sort((a, b) => {
            const dateA = new Date(a.fulfillment_date);
            const dateB = new Date(b.fulfillment_date);
            return dateA - dateB;
          });
          setOrders(sortedOrders);
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
  }, [user]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const markOrderAsDone = async (orderId) => {
    if (!confirm('Mark this order as completed?')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Remove the order from the list
        setOrders(orders.filter(order => order.id !== orderId));
      } else {
        alert('Failed to update order: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again. Error: ' + error.message);
    }
  };

  const handlePrintOrders = () => {
    window.print();
  };

  const handlePrintSingleOrder = (orderId) => {
    // Add a class to the body to indicate single order print
    document.body.classList.add('print-single-order');

    // Add a class to the specific order card to show it
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (orderCard) {
      orderCard.classList.add('print-this-order');
    }

    window.print();

    // Remove the classes after printing
    setTimeout(() => {
      document.body.classList.remove('print-single-order');
      if (orderCard) {
        orderCard.classList.remove('print-this-order');
      }
    }, 100);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    // Redirect to login page
    router.push('/login');
  };

  const goToMenuManagement = () => {
    router.push('/menu');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-top">
          <h1>the little nook buffet</h1>
          {user && (
            <div className="user-info">
              <span className="user-name">{user.full_name || user.username}</span>
              <span className="user-role">({user.role})</span>
            </div>
          )}
        </div>

        <nav className="main-nav">
          <button className="nav-item active">Orders</button>
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <button className="nav-item" onClick={goToMenuManagement}>Menu Items</button>
          )}
        </nav>
      </header>

      <div className="page-header">
        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">£{calculateTotalRevenue().toFixed(2)}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={handlePrintOrders}>
            Print Orders
          </button>
        </div>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card" data-order-id={order.id}>
              <div className="order-header">
                <div className="order-header-main" onClick={() => toggleOrder(order.id)}>
                  <div className="order-header-left">
                    <div className="order-number-section">
                      <h2 className="order-number">{order.order_number}</h2>
                      <div className="order-dates">
                        <span className="order-date">
                          Ordered: {formatDateTime(order.created_at)}
                        </span>
                        <span className="order-date fulfillment-date">
                          Needed: {order.fulfillment_date ? new Date(order.fulfillment_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Not specified'} {order.fulfillment_time ? `at ${order.fulfillment_time}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="order-badges">
                      <span className={`badge badge-${order.fulfillment_type}`}>
                        {order.fulfillment_type}
                      </span>
                      <span className="badge badge-people">
                        {order.buffets?.reduce((sum, b) => sum + b.num_people, 0) || 0} people
                      </span>
                    </div>
                  </div>
                  <div className="order-header-right">
                    <span className="order-total">£{parseFloat(order.total_price).toFixed(2)}</span>
                    <span className={`expand-icon ${expandedOrders[order.id] ? 'expanded' : ''}`}>
                      {expandedOrders[order.id] ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                <div className="order-actions">
                  <button
                    className="print-single-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintSingleOrder(order.id);
                    }}
                  >
                    Print
                  </button>
                  <button
                    className="mark-done-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      markOrderAsDone(order.id);
                    }}
                  >
                    Mark as Done
                  </button>
                </div>
              </div>

              <div className={`order-details ${expandedOrders[order.id] ? 'expanded' : 'collapsed'}`}>
                  {/* Customer Info */}
                  <div className="detail-section customer-section">
                    <h3>Customer Details</h3>
                    <div className="info-cards">
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Business</span>
                          <span className="info-value">{order.notes || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Email</span>
                          <span className="info-value">{order.customer_email}</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Phone</span>
                          <span className="info-value">{order.customer_phone}</span>
                        </div>
                      </div>
                      <div className="info-card full-width">
                        <div className="info-content">
                          <span className="info-label">Address</span>
                          <span className="info-value">{order.fulfillment_address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Info */}
                  <div className="detail-section fulfillment-section">
                    <h3>Fulfillment Details</h3>
                    <div className="info-cards">
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Type</span>
                          <span className="info-value fulfillment-type">{order.fulfillment_type}</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Date</span>
                          <span className="info-value">{formatDate(order.fulfillment_date)}</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <div className="info-content">
                          <span className="info-label">Time</span>
                          <span className="info-value">{formatTime(order.fulfillment_time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buffets */}
                  {order.buffets && order.buffets.map((buffet, buffetIndex) => (
                    <div key={buffet.id} className="detail-section buffet-section">
                      <h3>Buffet #{buffetIndex + 1}</h3>

                      <div className="buffet-summary">
                        <div className="summary-item">
                          <div>
                            <span className="summary-label">People</span>
                            <span className="summary-value">{buffet.num_people}</span>
                          </div>
                        </div>
                        <div className="summary-item">
                          <div>
                            <span className="summary-label">Per Person</span>
                            <span className="summary-value">£{parseFloat(buffet.price_per_person).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="summary-item highlight">
                          <div>
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">£{parseFloat(buffet.subtotal).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {(buffet.dietary_info || buffet.allergens || buffet.notes) && (
                        <div className="buffet-notes">
                          {buffet.dietary_info && (
                            <div className="note-item dietary-note">
                              <div>
                                <span className="note-label">Dietary Info</span>
                                <span className="note-value">{buffet.dietary_info}</span>
                              </div>
                            </div>
                          )}
                          {buffet.allergens && (
                            <div className="note-item allergen-note">
                              <div>
                                <span className="note-label">Allergens</span>
                                <span className="note-value">{buffet.allergens}</span>
                              </div>
                            </div>
                          )}
                          {buffet.notes && (
                            <div className="note-item general-note">
                              <div>
                                <span className="note-label">Notes</span>
                                <span className="note-value">{buffet.notes}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Menu Items */}
                      {buffet.items && buffet.items.length > 0 && (
                        <div className="menu-items">
                          <h4>Selected Menu Items</h4>
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
                                  <h5 className="category-title">
                                    <span className="category-dot"></span>
                                    {category}
                                  </h5>
                                  <ul className="items-list">
                                    {items.map(item => (
                                      <li key={item.id}>
                                        {item.item_name}
                                      </li>
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
              </div>
          ))
        )}
      </div>

      <button className="logout-button-bottom" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

