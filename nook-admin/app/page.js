'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const parsedUser = JSON.parse(userData);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    // Don't fetch orders if not authenticated
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const response = await fetch(`${apiUrl}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if token is invalid or expired
        if (data.return_code === 'UNAUTHORIZED' || data.return_code === 'FORBIDDEN') {
          // Clear invalid token and redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/login');
          return;
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const goToOrderDetails = (orderId) => {
    router.push(`/orders/${orderId}`);
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
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const goToStaffManagement = () => {
    router.push('/staff');
  };

  const goToSummary = () => {
    router.push('/summary');
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
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={() => router.push('/prices')}>Prices</button>
          )}
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={() => router.push('/menu-builder')}>Menu Builder</button>
          )}
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={goToStaffManagement}>Staff Management</button>
          )}
        </nav>
      </header>

      <div className="page-header">
        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          {user && user.role === 'manager' && (
            <div className="stat-item">
              <span className="stat-label">Revenue</span>
              <span className="stat-value">£{calculateTotalRevenue().toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={goToSummary}>
            Summary
          </button>
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
            <div key={order.id} className="order-card" data-order-id={order.id} onClick={() => goToOrderDetails(order.id)}>
              {/* On-screen summary */}
              <div className="order-card-content">
                <div className="order-card-main">
                  <h2 className="order-number">{order.order_number}</h2>
                  <div className="order-dates">
                    <span className="order-date">Ordered: {formatDateTime(order.created_at)}</span>
                    <span className="order-date fulfillment-date">
                      Needed: {order.fulfillment_date ? new Date(order.fulfillment_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Not specified'} {order.fulfillment_time ? `at ${order.fulfillment_time}` : ''}
                    </span>
                  </div>
                  <div className="order-badges">
                    <span className={`badge badge-${order.fulfillment_type}`}>{order.fulfillment_type}</span>
                    <span className="badge badge-people">
                      {order.buffets?.reduce((sum, b) => sum + b.num_people, 0) || 0} people
                    </span>
                    <span className="badge badge-total">£{parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Print-only full details — hidden on screen, shown when printing */}
              <div className="order-print-details">
                <h2 className="opd-order-number">{order.order_number}</h2>
                <div className="opd-meta">
                  <span className="opd-type">{order.fulfillment_type}</span>
                  <span>
                    Needed: {order.fulfillment_date ? new Date(order.fulfillment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
                    {order.fulfillment_time ? ` at ${order.fulfillment_time}` : ''}
                  </span>
                  <span>{order.buffets?.reduce((sum, b) => sum + b.num_people, 0) || 0} people</span>
                  <span>£{parseFloat(order.total_price).toFixed(2)}</span>
                </div>

                <div className="opd-row"><span className="opd-label">Email:</span> {order.customer_email}</div>
                {order.customer_phone && <div className="opd-row"><span className="opd-label">Phone:</span> {order.customer_phone}</div>}
                {order.notes && <div className="opd-row"><span className="opd-label">Business:</span> {order.notes}</div>}
                {order.fulfillment_address && (
                  <div className="opd-row"><span className="opd-label">Address:</span> {order.fulfillment_address}</div>
                )}
                {order.staff_notes && (
                  <div className="opd-row opd-staff"><span className="opd-label">Staff Notes:</span> {order.staff_notes}</div>
                )}

                <div className="opd-buffets">
                  {order.buffets?.map((buffet, bi) => {
                    const grouped = (buffet.items || []).reduce((acc, item) => {
                      const cat = item.category_name || 'Items';
                      (acc[cat] = acc[cat] || []).push(item.item_name);
                      return acc;
                    }, {});
                    return (
                      <div key={bi} className="opd-buffet">
                        <div className="opd-buffet-header">
                          <strong>{buffet.buffet_name}</strong>
                          <span>{buffet.num_people} people @ £{parseFloat(buffet.price_per_person).toFixed(2)}/person — £{parseFloat(buffet.subtotal).toFixed(2)}</span>
                        </div>
                        {Object.entries(grouped).map(([cat, items]) => (
                          <div key={cat} className="opd-cat-row">
                            <span className="opd-cat-name">{cat}:</span> {items.join(', ')}
                          </div>
                        ))}
                        {buffet.upgrades?.filter(u => u.upgrade_name).map((upg, ui) => (
                          <div key={ui} className="opd-upgrade-row">
                            + {upg.upgrade_name}{upg.items?.length > 0 ? `: ${upg.items.map(i => i.item_name).join(', ')}` : ''}
                          </div>
                        ))}
                        {buffet.dietary_info && <div className="opd-note-row"><span className="opd-label">Dietary:</span> {buffet.dietary_info}</div>}
                        {buffet.allergens && <div className="opd-note-row"><span className="opd-label">Allergens:</span> {buffet.allergens}</div>}
                        {buffet.notes && <div className="opd-note-row"><span className="opd-label">Notes:</span> {buffet.notes}</div>}
                      </div>
                    );
                  })}
                </div>
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

