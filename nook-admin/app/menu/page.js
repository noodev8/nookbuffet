'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './menu.css';

export default function MenuManagementPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    // Check if user has permission (admin or manager only)
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  // Fetch menu items when user is authenticated
  useEffect(() => {
    if (!user) return;

    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        
        const response = await fetch(`${apiUrl}/api/menu/manage`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.return_code === 'SUCCESS') {
          setMenuItems(data.data || []);

          // Extract unique categories
          const uniqueCategories = [...new Set(data.data.map(item => item.category_name))];
          setCategories(uniqueCategories);
        } else if (data.return_code === 'UNAUTHORIZED' || data.return_code === 'FORBIDDEN') {
          // Clear invalid token and redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/login');
        } else {
          setError(data.message || 'Failed to load menu items');
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [user, router]);

  // Toggle stock status
  const toggleStockStatus = async (itemId, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      
      const response = await fetch(`${apiUrl}/api/menu/manage/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Update local state
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, is_active: !currentStatus } : item
          )
        );
      } else {
        alert(data.message || 'Failed to update item status');
      }
    } catch (err) {
      console.error('Error updating stock status:', err);
      alert('Failed to update item status. Please try again.');
    }
  };

  const goToOrders = () => {
    router.push('/');
  };

  const goToStaffManagement = () => {
    router.push('/staff');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  // Filter menu items by category
  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_name === filterCategory);

  if (loading) {
    return (
      <div className="menu-management-container">
        <div className="loading">Loading menu items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-management-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="menu-management-container">
      <header className="menu-header">
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
          <button className="nav-item active">Menu Items</button>
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={goToStaffManagement}>Staff Management</button>
          )}
        </nav>
      </header>

      <div className="page-header">
        <div className="filter-section">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="menu-items-grid">
        {filteredItems.map(item => (
          <div key={item.id} className={`menu-item-card ${!item.is_active ? 'out-of-stock' : ''}`}>
            <div className="item-header">
              <h3>{item.name}</h3>
              <span className="category-badge">{item.category_name}</span>
            </div>

            {item.description && (
              <p className="item-description">{item.description}</p>
            )}

            {item.dietary_info && (
              <p className="item-dietary">{item.dietary_info}</p>
            )}

            {item.allergens && (
              <p className="item-allergens">Allergens: {item.allergens}</p>
            )}

            <div className="item-actions">
              <button
                className={`stock-toggle ${item.is_active ? 'in-stock' : 'out-of-stock'}`}
                onClick={() => toggleStockStatus(item.id, item.is_active)}
              >
                {item.is_active ? '✓ In Stock' : '✗ Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p>No menu items found</p>
        </div>
      )}

      <button className="logout-button-bottom" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

