'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './branches.css';

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ deliveryTimeStart: '', deliveryTimeEnd: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (!token || !userData) { router.push('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'manager') { router.push('/'); return; }
    setUser(parsedUser);
  }, [router]);

  // Fetch branches when authenticated
  useEffect(() => {
    if (!user) return;
    fetchBranches();
  }, [user]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/branches`);
      const data = await response.json();
      if (data.return_code === 'SUCCESS') {
        setBranches(data.data || []);
      } else {
        setError(data.message || 'Failed to load branches');
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Not set';
    const [hourStr, minute] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const handleEditClick = (branch) => {
    setEditingBranch(branch);
    setFormData({
      deliveryTimeStart: branch.delivery_time_start || '09:00',
      deliveryTimeEnd: branch.delivery_time_end || '10:00'
    });
    setFormError('');
    setSuccessMessage('');
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSaveTimeslot = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      const response = await fetch(`${apiUrl}/api/branches/${editingBranch.id}/timeslot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        setShowEditModal(false);
        setSuccessMessage(`Timeslot for ${editingBranch.name} updated successfully`);
        fetchBranches();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setFormError(data.message || 'Failed to update timeslot');
      }
    } catch (err) {
      console.error('Error updating timeslot:', err);
      setFormError('Failed to update timeslot. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="branches-container">
        <div className="loading">Loading branches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="branches-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="branches-container">
      <header className="branches-header">
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
          <button className="nav-item" onClick={() => router.push('/')}>Orders</button>
          <button className="nav-item" onClick={() => router.push('/menu')}>Menu Items</button>
          <button className="nav-item" onClick={() => router.push('/prices')}>Prices</button>
          <button className="nav-item" onClick={() => router.push('/staff')}>Staff Management</button>
          <button className="nav-item active">Delivery Times</button>
          <button className="nav-item" onClick={() => router.push('/reports')}>Reports</button>
        </nav>
      </header>

      <div className="branches-page-header">
        <h2>Delivery Times</h2>
        <p className="page-subtitle">Set the delivery time window for each branch</p>
      </div>

      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      <div className="branches-list">
        {branches.length === 0 ? (
          <div className="empty-state"><p>No branches found</p></div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="branch-card">
              <div className="branch-info">
                <h3 className="branch-name">{branch.name}</h3>
                <p className="branch-address">{branch.address}</p>
                <div className="timeslot-display">
                  <span className="timeslot-label">Delivery Window:</span>
                  <span className="timeslot-value">
                    {formatTime(branch.delivery_time_start)} – {formatTime(branch.delivery_time_end)}
                  </span>
                </div>
              </div>
              <div className="branch-actions">
                <button className="edit-timeslot-button" onClick={() => handleEditClick(branch)}>
                  Edit Timeslot
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showEditModal && editingBranch && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Timeslot — {editingBranch.name}</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveTimeslot} className="timeslot-form">
              {formError && <div className="form-error">{formError}</div>}
              <p className="form-hint">
                Customers in this branch's area will automatically be assigned this delivery window.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deliveryTimeStart">Start Time</label>
                  <input
                    type="time"
                    id="deliveryTimeStart"
                    name="deliveryTimeStart"
                    value={formData.deliveryTimeStart}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deliveryTimeEnd">End Time</label>
                  <input
                    type="time"
                    id="deliveryTimeEnd"
                    name="deliveryTimeEnd"
                    value={formData.deliveryTimeEnd}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Timeslot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button className="logout-button-bottom" onClick={handleLogout}>Logout</button>
    </div>
  );
}
