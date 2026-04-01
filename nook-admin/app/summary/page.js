'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './summary.css';

export default function SummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Auth check - all roles allowed
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    // Default to user's own branch; fall back to 'all'
    setSelectedBranch(parsedUser.branch_id ? String(parsedUser.branch_id) : 'all');
  }, [router]);

  // Fetch branch list
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const res = await fetch(`${apiUrl}/api/branches`);
        const data = await res.json();
        if (data.return_code === 'SUCCESS') setBranches(data.data || []);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch orders whenever user + branch are both ready
  useEffect(() => {
    if (!user || selectedBranch === null) return;
    fetchOrders();
  }, [user, selectedBranch]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const url = selectedBranch === 'all'
        ? `${apiUrl}/api/orders`
        : `${apiUrl}/api/orders?branch_id=${selectedBranch}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.return_code === 'UNAUTHORIZED' || data.return_code === 'FORBIDDEN') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
        return;
      }
      if (data.return_code === 'SUCCESS') {
        const sorted = (data.data || []).sort((a, b) =>
          new Date(a.fulfillment_date) - new Date(b.fulfillment_date)
        );
        setOrders(sorted);
      } else {
        setError(data.message || 'Failed to load orders.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // When showing all branches, group by branch first otherwise just use a single group
  const branchGroups = selectedBranch === 'all'
    ? orders.reduce((acc, order) => {
        const key = order.branch_name || 'Unknown Branch';
        if (!acc[key]) acc[key] = [];
        acc[key].push(order);
        return acc;
      }, {})
    : { [branches.find(b => String(b.id) === selectedBranch)?.name || 'Branch']: orders };

  const sortedBranchNames = Object.keys(branchGroups).sort();

  // Group a set of orders by fulfillment date
  const groupByDate = (branchOrders) =>
    branchOrders.reduce((acc, order) => {
      const date = order.fulfillment_date
        ? order.fulfillment_date.split('T')[0]
        : 'No date set';
      if (!acc[date]) acc[date] = [];
      acc[date].push(order);
      return acc;
    }, {});

  // Aggregate items for a set of orders
  const buildSummary = (dateOrders) => {
    const summary = {};
    dateOrders.forEach(order => {
      (order.buffets || []).forEach(buffet => {
        const people = buffet.num_people || 0;

        (buffet.items || []).forEach(item => {
          const cat = item.category_name || 'Other';
          const name = item.item_name || 'Unknown item';
          if (!summary[cat]) summary[cat] = {};
          if (!summary[cat][name]) summary[cat][name] = { orders: 0, people: 0 };
          summary[cat][name].orders += 1;
          summary[cat][name].people += people;
        });

        (buffet.upgrades || []).forEach(upgrade => {
          (upgrade.selectedItems || []).forEach(item => {
            const cat = item.category_name || 'Upgrades';
            const name = item.item_name || 'Unknown item';
            if (!summary[cat]) summary[cat] = {};
            if (!summary[cat][name]) summary[cat][name] = { orders: 0, people: 0 };
            summary[cat][name].orders += 1;
            summary[cat][name].people += people;
          });
        });
      });
    });
    return summary;
  };

  const formatDate = (dateStr) => {
    if (dateStr === 'No date set') return dateStr;
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { return dateStr; }
  };

  const totalPeople = (dateOrders) =>
    dateOrders.reduce((sum, o) =>
      sum + (o.buffets || []).reduce((s, b) => s + (b.num_people || 0), 0), 0);

  const handleNavOrders = () => router.push('/');
  const handleNavMenu = () => router.push('/menu');
  const handleNavStaff = () => router.push('/staff');
  const handleNavReports = () => router.push('/reports');
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-top">
          <h1>the little nook buffet</h1>
          <div className="user-info">
            <span className="user-name">{user.full_name || user.username}</span>
            <span className="user-role">({user.role})</span>
          </div>
        </div>
        <nav className="main-nav">
          <button className="nav-item" onClick={handleNavOrders}>Orders</button>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button className="nav-item" onClick={handleNavMenu}>Menu Items</button>
          )}
          {user.role === 'manager' && (
            <button className="nav-item" onClick={handleNavStaff}>Staff Management</button>
          )}
          {user.role === 'manager' && (
            <button className="nav-item" onClick={handleNavReports}>Reports</button>
          )}
        </nav>
      </header>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading summary...</p>
        </div>
      )}

      {!loading && error && (
        <div className="error-state"><p>{error}</p></div>
      )}

      {/* Branch filter bar */}
      <div className="page-header">
        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-label">Open Orders</span>
            <span className="stat-value">{orders.length}</span>
          </div>
        </div>
        <div className="page-actions">
          <div className="branch-filter">
            <label htmlFor="summary-branch-select">Branch:</label>
            <select
              id="summary-branch-select"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="branch-select"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state"><p>No open orders — nothing to prepare!</p></div>
      )}

      {!loading && !error && sortedBranchNames.map(branchName => {
        const branchOrders = branchGroups[branchName];
        const dateGrouped = groupByDate(branchOrders);
        const sortedDates = Object.keys(dateGrouped).sort();

        return (
          <div key={branchName} className="summary-branch-section">

            {selectedBranch === 'all' && (
              <div className="summary-branch-header">
                <h2 className="summary-branch-title">{branchName}</h2>
                <span className="summary-badge summary-badge-people">
                  {branchOrders.reduce((s, o) =>
                    s + (o.buffets || []).reduce((ss, b) => ss + (b.num_people || 0), 0), 0)
                  } people
                </span>
              </div>
            )}

            {sortedDates.map(date => {
              const dateOrders = dateGrouped[date];
              const summary = buildSummary(dateOrders);
              const people = totalPeople(dateOrders);

              return (
                <div key={date} className="summary-date-section">

                  <div className="summary-date-header">
                    <h3 className="summary-date-title">{formatDate(date)}</h3>
                    <div className="summary-date-badges">
                      <span className="summary-badge">{dateOrders.length} order{dateOrders.length !== 1 ? 's' : ''}</span>
                      <span className="summary-badge summary-badge-people">{people} people total</span>
                    </div>
                  </div>

                  <div className="summary-category-grid">
                    {Object.keys(summary).sort().map(category => (
                      <div key={category} className="summary-category-card">
                        <h4 className="summary-category-title">
                          <span className="category-dot"></span>
                          {category}
                        </h4>
                        <ul className="summary-items-list">
                          {Object.entries(summary[category])
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([itemName, info]) => (
                              <li key={itemName} className="summary-item-row">
                                <span className="summary-item-name">{itemName}</span>
                                <span className="summary-item-meta">
                                  {info.orders} order{info.orders !== 1 ? 's' : ''} &middot; {info.people} people
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="summary-order-refs">
                    <p className="summary-order-refs-title">Orders included:</p>
                    <div className="summary-order-ref-list">
                      {dateOrders.map(order => (
                        <a key={order.id} href={`/orders/${order.id}`} className="summary-order-ref-chip">
                          {order.order_number}
                          {order.fulfillment_time && <span className="summary-ref-time">{order.fulfillment_time}</span>}
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        );
      })}

      <button className="logout-button-bottom" onClick={handleLogout}>Logout</button>
    </div>
  );
}


