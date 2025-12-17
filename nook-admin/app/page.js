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
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // null means loading, 'all' means all branches

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      // Not logged in, redirect to login page
      router.push('/login');
      return;
    }

    // Set user data and default branch filter
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Default to user's branch if they have one, otherwise 'all'
    setSelectedBranch(parsedUser.branch_id ? String(parsedUser.branch_id) : 'all');
  }, [router]);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const response = await fetch(`${apiUrl}/api/branches`);
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

  useEffect(() => {
    // Don't fetch orders if not authenticated or branch not yet determined
    if (!user || selectedBranch === null) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        // Add branch filter to the API call
        const url = selectedBranch === 'all'
          ? `${apiUrl}/api/orders`
          : `${apiUrl}/api/orders?branch_id=${selectedBranch}`;

        const response = await fetch(url, {
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
  }, [user, selectedBranch]);

  const goToOrderDetails = (orderId) => {
    window.location.href = `/orders/${orderId}`;
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
          <div className="branch-filter">
            <label htmlFor="branch-select">Branch:</label>
            <select
              id="branch-select"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="branch-select"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
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
                    <span className={`badge badge-${order.fulfillment_type}`}>
                      {order.fulfillment_type}
                    </span>
                    <span className="badge badge-people">
                      {order.buffets?.reduce((sum, b) => sum + b.num_people, 0) || 0} people
                    </span>
                    <span className="badge badge-total">£{parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
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

