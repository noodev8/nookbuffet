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
  const [formData, setFormData] = useState({ deliveryTimeStart: '', deliveryTimeEnd: '', deliveryRadius: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add branch modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', address: '', deliveryRadiusMiles: '7', deliveryTimeStart: '09:00', deliveryTimeEnd: '17:00' });
  const [addFormError, setAddFormError] = useState('');
  const [addFormLoading, setAddFormLoading] = useState(false);

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
      deliveryTimeEnd: branch.delivery_time_end || '10:00',
      deliveryRadius: branch.delivery_radius_miles ?? 7
    });
    setFormError('');
    setSuccessMessage('');
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      const [timeslotRes, radiusRes] = await Promise.all([
        fetch(`${apiUrl}/api/branches/${editingBranch.id}/timeslot`, {
          method: 'PUT', headers,
          body: JSON.stringify({ deliveryTimeStart: formData.deliveryTimeStart, deliveryTimeEnd: formData.deliveryTimeEnd })
        }),
        fetch(`${apiUrl}/api/branches/${editingBranch.id}/delivery-radius`, {
          method: 'PATCH', headers,
          body: JSON.stringify({ deliveryRadius: formData.deliveryRadius })
        })
      ]);

      const [timeslotData, radiusData] = await Promise.all([timeslotRes.json(), radiusRes.json()]);

      if (timeslotData.return_code === 'SUCCESS' && radiusData.return_code === 'SUCCESS') {
        setShowEditModal(false);
        setSuccessMessage(`Delivery radius and timeslots updated for ${editingBranch.name}`);
        fetchBranches();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const errorMsg = timeslotData.return_code !== 'SUCCESS'
          ? `Timeslot: ${timeslotData.message}`
          : `Radius: ${radiusData.message}`;
        setFormError(errorMsg || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving branch:', err);
      setFormError('Failed to save. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddFormChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
    setAddFormError('');
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    setAddFormLoading(true);
    setAddFormError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      const response = await fetch(`${apiUrl}/api/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addForm)
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        setShowAddModal(false);
        setAddForm({ name: '', address: '', deliveryRadiusMiles: '7', deliveryTimeStart: '09:00', deliveryTimeEnd: '17:00' });
        setSuccessMessage(`Branch "${data.data.name}" added successfully`);
        fetchBranches();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setAddFormError(data.message || 'Failed to add branch');
      }
    } catch (err) {
      console.error('Error adding branch:', err);
      setAddFormError('Failed to add branch. Please try again.');
    } finally {
      setAddFormLoading(false);
    }
  };

  const handleDeleteBranch = async (branch) => {
    if (!window.confirm(`Are you sure you want to remove "${branch.name}"?\n\nThis will hide the branch from customers. Existing orders will not be affected.`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      const response = await fetch(`${apiUrl}/api/branches/${branch.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        setSuccessMessage(`Branch "${branch.name}" removed`);
        fetchBranches();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setSuccessMessage('');
        setError(data.message || 'Failed to remove branch');
      }
    } catch (err) {
      console.error('Error deleting branch:', err);
      setError('Failed to remove branch. Please try again.');
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
          <button className="nav-item" onClick={() => router.push('/menu-builder')}>Menu Builder</button>
          <button className="nav-item" onClick={() => router.push('/staff')}>Staff Management</button>
          <button className="nav-item active">Branches</button>
          <button className="nav-item" onClick={() => router.push('/reports')}>Reports</button>
        </nav>
      </header>

      <div className="branches-page-header">
        <div>
          <h2>Branches</h2>
          <p className="page-subtitle">Set the delivery time window for each branch</p>
        </div>
        <button className="add-branch-button" onClick={() => { setAddFormError(''); setShowAddModal(true); }}>
          + Add Branch
        </button>
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
                <div className="timeslot-display">
                  <span className="timeslot-label">Delivery Radius:</span>
                  <span className="timeslot-value">{branch.delivery_radius_miles ?? 7} miles</span>
                </div>
              </div>
              <div className="branch-actions">
                <button className="edit-timeslot-button" onClick={() => handleEditClick(branch)}>
                  Edit
                </button>
                <button className="delete-branch-button" onClick={() => handleDeleteBranch(branch)}>
                  Delete
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
              <h2>Edit — {editingBranch.name}</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className="timeslot-form">
              {formError && <div className="form-error">{formError}</div>}
              <p className="form-hint">
                Customers in this branch's area will automatically be assigned this delivery window.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deliveryTimeStart">Start Time</label>
                  <input type="time" id="deliveryTimeStart" name="deliveryTimeStart"
                    value={formData.deliveryTimeStart} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="deliveryTimeEnd">End Time</label>
                  <input type="time" id="deliveryTimeEnd" name="deliveryTimeEnd"
                    value={formData.deliveryTimeEnd} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="deliveryRadius">Delivery Radius (miles)</label>
                <input type="number" id="deliveryRadius" name="deliveryRadius"
                  value={formData.deliveryRadius} onChange={handleFormChange}
                  min="0.1" step="0.1" required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Branch</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddBranch} className="timeslot-form">
              {addFormError && <div className="form-error">{addFormError}</div>}
              <div className="form-group">
                <label htmlFor="add-name">Branch Name</label>
                <input type="text" id="add-name" name="name"
                  value={addForm.name} onChange={handleAddFormChange}
                  placeholder="e.g. Shrewsbury" required />
              </div>
              <div className="form-group">
                <label htmlFor="add-address">Address</label>
                <input type="text" id="add-address" name="address"
                  value={addForm.address} onChange={handleAddFormChange}
                  placeholder="e.g. 12 High Street, Shrewsbury, SY1 1AA" required />
                <p className="form-hint">The address is used to calculate delivery distances for customers.</p>
              </div>
              <div className="form-group">
                <label htmlFor="add-radius">Delivery Radius (miles)</label>
                <input type="number" id="add-radius" name="deliveryRadiusMiles"
                  value={addForm.deliveryRadiusMiles} onChange={handleAddFormChange}
                  min="0.1" step="0.1" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-start">Start Time</label>
                  <input type="time" id="add-start" name="deliveryTimeStart"
                    value={addForm.deliveryTimeStart} onChange={handleAddFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="add-end">End Time</label>
                  <input type="time" id="add-end" name="deliveryTimeEnd"
                    value={addForm.deliveryTimeEnd} onChange={handleAddFormChange} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)} disabled={addFormLoading}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={addFormLoading}>
                  {addFormLoading ? 'Adding...' : 'Add Branch'}
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
