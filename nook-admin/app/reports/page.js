'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './reports.css';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

  const goToOrders = () => {
    router.push('/');
  };

  const goToMenuManagement = () => {
    router.push('/menu');
  };

  const goToStaffManagement = () => {
    router.push('/staff');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  // Don't render until we've verified authentication
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

      <div className="reports-content">
      </div>
    </div>
  );
}

