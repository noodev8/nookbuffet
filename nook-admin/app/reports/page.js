'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './reports.css';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Check if user has permission (manager only)
    if (parsedUser.role !== 'manager') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  // Fetch categories when user is authenticated
  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const response = await fetch(`${apiUrl}/api/reports/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.return_code === 'SUCCESS') {
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [user]);

  // Calculate date range for API
  const getDateParams = () => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    switch (dateRange) {
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate);
        if (customEndDate) endDate = new Date(customEndDate);
        break;
      default:
        // 'all' - no date filtering
        break;
    }

    return {
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null
    };
  };

  // Fetch stock report when tab is active and user is authenticated
  useEffect(() => {
    if (!user || activeTab !== 'stock') return;

    const fetchStockReport = async () => {
      setStockLoading(true);
      setStockError(null);

      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const { startDate, endDate } = getDateParams();
        let url = `${apiUrl}/api/reports/stock`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.return_code === 'SUCCESS') {
          setStockData(data.data || []);
        } else {
          setStockError(data.message || 'Failed to load stock report');
        }
      } catch (err) {
        console.error('Error fetching stock report:', err);
        setStockError('Failed to load stock report');
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockReport();
  }, [user, activeTab, dateRange, customStartDate, customEndDate]);

  const filteredStockData = (selectedCategory === 'all'
    ? stockData
    : stockData.filter(item => item.category_name === selectedCategory)
  ).sort((a, b) => {
    return sortOrder === 'desc'
      ? b.times_ordered - a.times_ordered
      : a.times_ordered - b.times_ordered;
  });

  const goToOrders = () => router.push('/');
  const goToMenuManagement = () => router.push('/menu');
  const goToStaffManagement = () => router.push('/staff');

  if (!user) {
    return (
      <div className="reports-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <header className="reports-header">
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
          <button className="nav-item" onClick={goToOrders}>Orders</button>
          <button className="nav-item" onClick={goToMenuManagement}>Menu Items</button>
          <button className="nav-item" onClick={goToStaffManagement}>Staff Management</button>
          <button className="nav-item active">Reports</button>
        </nav>
      </header>

      <div className="page-header">
        <h2>Reports</h2>
      </div>

      <div className="reports-tabs">
        <button
          className={`report-tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock Report
        </button>
        <button
          className={`report-tab ${activeTab === 'branch' ? 'active' : ''}`}
          onClick={() => setActiveTab('branch')}
        >
          Branch Report
        </button>
        <button
          className={`report-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account Reports
        </button>
        <button
          className={`report-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Report
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'stock' && (
          <div className="stock-report">
            <div className="report-filters">
              <div className="filter-group">
                <label>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Date Range:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {dateRange === 'custom' && (
                <>
                  <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {stockLoading && (
              <div className="report-loading">Loading stock report...</div>
            )}

            {stockError && (
              <div className="report-error">{stockError}</div>
            )}

            {!stockLoading && !stockError && filteredStockData.length === 0 && (
              <div className="report-empty">No order data available yet.</div>
            )}

            {!stockLoading && !stockError && filteredStockData.length > 0 && (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th
                      className="sortable"
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    >
                      Times Ordered {sortOrder === 'desc' ? '▼' : '▲'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockData.map((item, index) => (
                    <tr key={item.menu_item_id}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.category_name}</td>
                      <td className="times-ordered">{item.times_ordered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

