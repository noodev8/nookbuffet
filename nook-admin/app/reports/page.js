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

  // Branch report state
  const [branchData, setBranchData] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState(null);
  const [branchDateRange, setBranchDateRange] = useState('all');
  const [branchCustomStartDate, setBranchCustomStartDate] = useState('');
  const [branchCustomEndDate, setBranchCustomEndDate] = useState('');
  const [branchSortBy, setBranchSortBy] = useState('revenue');
  const [branchSortOrder, setBranchSortOrder] = useState('desc');

  // Account report state
  const [accountData, setAccountData] = useState([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [accountDateRange, setAccountDateRange] = useState('all');
  const [accountCustomStartDate, setAccountCustomStartDate] = useState('');
  const [accountCustomEndDate, setAccountCustomEndDate] = useState('');
  const [accountSortBy, setAccountSortBy] = useState('spent');
  const [accountSortOrder, setAccountSortOrder] = useState('desc');

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

  // Calculate date range for branch report API
  const getBranchDateParams = () => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    switch (branchDateRange) {
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
        if (branchCustomStartDate) startDate = new Date(branchCustomStartDate);
        if (branchCustomEndDate) endDate = new Date(branchCustomEndDate);
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

  // Fetch branch report when tab is active and user is authenticated
  useEffect(() => {
    if (!user || activeTab !== 'branch') return;

    const fetchBranchReport = async () => {
      setBranchLoading(true);
      setBranchError(null);

      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const { startDate, endDate } = getBranchDateParams();
        let url = `${apiUrl}/api/reports/branches`;
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
          setBranchData(data.data || []);
        } else {
          setBranchError(data.message || 'Failed to load branch report');
        }
      } catch (err) {
        console.error('Error fetching branch report:', err);
        setBranchError('Failed to load branch report');
      } finally {
        setBranchLoading(false);
      }
    };

    fetchBranchReport();
  }, [user, activeTab, branchDateRange, branchCustomStartDate, branchCustomEndDate]);

  // Sort branch data
  const sortedBranchData = [...branchData].sort((a, b) => {
    const field = branchSortBy === 'revenue' ? 'total_revenue' : 'total_orders';
    return branchSortOrder === 'desc'
      ? b[field] - a[field]
      : a[field] - b[field];
  });

  // Calculate totals for branch report
  const branchTotals = branchData.reduce((acc, branch) => ({
    totalOrders: acc.totalOrders + branch.total_orders,
    totalRevenue: acc.totalRevenue + branch.total_revenue
  }), { totalOrders: 0, totalRevenue: 0 });

  // Calculate date range for account report API
  const getAccountDateParams = () => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    switch (accountDateRange) {
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
        if (accountCustomStartDate) startDate = new Date(accountCustomStartDate);
        if (accountCustomEndDate) endDate = new Date(accountCustomEndDate);
        break;
      default:
        break;
    }

    return {
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null
    };
  };

  // Fetch account report when tab is active and user is authenticated
  useEffect(() => {
    if (!user || activeTab !== 'account') return;

    const fetchAccountReport = async () => {
      setAccountLoading(true);
      setAccountError(null);

      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const { startDate, endDate } = getAccountDateParams();
        let url = `${apiUrl}/api/reports/accounts`;
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
          setAccountData(data.data || []);
        } else {
          setAccountError(data.message || 'Failed to load account report');
        }
      } catch (err) {
        console.error('Error fetching account report:', err);
        setAccountError('Failed to load account report');
      } finally {
        setAccountLoading(false);
      }
    };

    fetchAccountReport();
  }, [user, activeTab, accountDateRange, accountCustomStartDate, accountCustomEndDate]);

  // Sort account data
  const sortedAccountData = [...accountData].sort((a, b) => {
    const field = accountSortBy === 'spent' ? 'total_spent' : 'total_orders';
    return accountSortOrder === 'desc'
      ? b[field] - a[field]
      : a[field] - b[field];
  });

  // Calculate totals for account report
  const accountTotals = accountData.reduce((acc, account) => ({
    totalOrders: acc.totalOrders + account.total_orders,
    totalSpent: acc.totalSpent + account.total_spent,
    totalCustomers: acc.totalCustomers + 1
  }), { totalOrders: 0, totalSpent: 0, totalCustomers: 0 });

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

        {activeTab === 'branch' && (
          <div className="branch-report">
            <div className="report-filters">
              <div className="filter-group">
                <label>Date Range:</label>
                <select
                  value={branchDateRange}
                  onChange={(e) => setBranchDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {branchDateRange === 'custom' && (
                <>
                  <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={branchCustomStartDate}
                      onChange={(e) => setBranchCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={branchCustomEndDate}
                      onChange={(e) => setBranchCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {branchLoading && (
              <div className="report-loading">Loading branch report...</div>
            )}

            {branchError && (
              <div className="report-error">{branchError}</div>
            )}

            {!branchLoading && !branchError && sortedBranchData.length === 0 && (
              <div className="report-empty">No branch data available yet.</div>
            )}

            {!branchLoading && !branchError && sortedBranchData.length > 0 && (
              <>
                <div className="branch-totals">
                  <div className="total-card">
                    <span className="total-label">Total Orders</span>
                    <span className="total-value">{branchTotals.totalOrders}</span>
                  </div>
                  <div className="total-card">
                    <span className="total-label">Total Revenue</span>
                    <span className="total-value">£{branchTotals.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>

                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Branch</th>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (branchSortBy === 'orders') {
                            setBranchSortOrder(branchSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setBranchSortBy('orders');
                            setBranchSortOrder('desc');
                          }
                        }}
                      >
                        Total Orders {branchSortBy === 'orders' ? (branchSortOrder === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (branchSortBy === 'revenue') {
                            setBranchSortOrder(branchSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setBranchSortBy('revenue');
                            setBranchSortOrder('desc');
                          }
                        }}
                      >
                        Total Revenue {branchSortBy === 'revenue' ? (branchSortOrder === 'desc' ? '▼' : '▲') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBranchData.map((branch, index) => (
                      <tr key={branch.branch_id}>
                        <td>{index + 1}</td>
                        <td>{branch.branch_name}</td>
                        <td className="times-ordered">{branch.total_orders}</td>
                        <td className="times-ordered">£{branch.total_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="account-report">
            <div className="report-filters">
              <div className="filter-group">
                <label>Date Range:</label>
                <select
                  value={accountDateRange}
                  onChange={(e) => setAccountDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {accountDateRange === 'custom' && (
                <>
                  <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={accountCustomStartDate}
                      onChange={(e) => setAccountCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={accountCustomEndDate}
                      onChange={(e) => setAccountCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {accountLoading && (
              <div className="report-loading">Loading account report...</div>
            )}

            {accountError && (
              <div className="report-error">{accountError}</div>
            )}

            {!accountLoading && !accountError && sortedAccountData.length === 0 && (
              <div className="report-empty">No customer data available yet.</div>
            )}

            {!accountLoading && !accountError && sortedAccountData.length > 0 && (
              <>
                <div className="branch-totals">
                  <div className="total-card">
                    <span className="total-label">Total Customers</span>
                    <span className="total-value">{accountTotals.totalCustomers}</span>
                  </div>
                  <div className="total-card">
                    <span className="total-label">Total Orders</span>
                    <span className="total-value">{accountTotals.totalOrders}</span>
                  </div>
                  <div className="total-card">
                    <span className="total-label">Total Revenue</span>
                    <span className="total-value">£{accountTotals.totalSpent.toFixed(2)}</span>
                  </div>
                </div>

                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer Email</th>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (accountSortBy === 'orders') {
                            setAccountSortOrder(accountSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setAccountSortBy('orders');
                            setAccountSortOrder('desc');
                          }
                        }}
                      >
                        Total Orders {accountSortBy === 'orders' ? (accountSortOrder === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (accountSortBy === 'spent') {
                            setAccountSortOrder(accountSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setAccountSortBy('spent');
                            setAccountSortOrder('desc');
                          }
                        }}
                      >
                        Total Spent {accountSortBy === 'spent' ? (accountSortOrder === 'desc' ? '▼' : '▲') : ''}
                      </th>
                      <th>First Order</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAccountData.map((account, index) => (
                      <tr key={account.customer_email}>
                        <td>{index + 1}</td>
                        <td>{account.customer_email}</td>
                        <td className="times-ordered">{account.total_orders}</td>
                        <td className="times-ordered">£{account.total_spent.toFixed(2)}</td>
                        <td>{new Date(account.first_order_date).toLocaleDateString('en-GB')}</td>
                        <td>{new Date(account.last_order_date).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

