'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './staff.css';

export default function StaffManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'staff'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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

  // Fetch users when user is authenticated
  useEffect(() => {
    if (!user) return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      
      const response = await fetch(`${apiUrl}/api/auth/users`, {
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
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      
      const response = await fetch(`${apiUrl}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Reset form and close modal
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role: 'staff'
        });
        setShowAddForm(false);
        
        // Refresh the user list
        fetchUsers();
      } else {
        setFormError(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setFormError('Failed to create user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const goToOrders = () => {
    router.push('/');
  };

  const goToMenuManagement = () => {
    router.push('/menu');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  const handleEditUser = (staffUser) => {
    setEditingUser(staffUser);
    setFormData({
      username: staffUser.username,
      email: staffUser.email,
      password: '', // Leave password empty - only update if filled
      full_name: staffUser.full_name,
      role: staffUser.role
    });
    setFormError('');
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      // Prepare update data - only include password if it's filled
      const updateData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${apiUrl}/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Update the user in the list
        setUsers(users.map(u => u.id === editingUser.id ? data.data : u));
        setShowEditForm(false);
        setEditingUser(null);
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role: 'staff'
        });
      } else {
        setFormError(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setFormError('Failed to update user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (staffUser) => {
    if (!confirm(`Are you sure you want to delete ${staffUser.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      const response = await fetch(`${apiUrl}/api/auth/users/${staffUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Remove the user from the list
        setUsers(users.filter(u => u.id !== staffUser.id));
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="staff-management-container">
        <div className="loading">Loading staff...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-management-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="staff-management-container">
      <header className="staff-header">
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
          <button className="nav-item active">Staff Management</button>
        </nav>
      </header>

      <div className="page-header">
        <h2>Staff Members</h2>
        <button className="add-staff-button" onClick={() => setShowAddForm(true)}>
          + Add New Staff
        </button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No staff members found</p>
          </div>
        ) : (
          users.map((staffUser) => (
            <div key={staffUser.id} className="user-card">
              <div className="user-header">
                <div className="user-name-section">
                  <h3>{staffUser.full_name}</h3>
                  <span className={`role-badge role-${staffUser.role}`}>
                    {staffUser.role}
                  </span>
                </div>
                <div className={`status-badge ${staffUser.is_active ? 'active' : 'inactive'}`}>
                  {staffUser.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{staffUser.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{staffUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">{formatDate(staffUser.last_login)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{formatDate(staffUser.created_at)}</span>
                </div>
              </div>
              <div className="user-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEditUser(staffUser)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteUser(staffUser)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Staff Member</h2>
              <button className="close-button" onClick={() => setShowAddForm(false)}>×</button>
            </div>

            <form onSubmit={handleAddUser} className="add-user-form">
              {formError && (
                <div className="form-error">{formError}</div>
              )}

              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Staff Member</h2>
              <button className="close-button" onClick={() => setShowEditForm(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateUser} className="add-user-form">
              {formError && (
                <div className="form-error">{formError}</div>
              )}

              <div className="form-group">
                <label htmlFor="edit_full_name">Full Name</label>
                <input
                  type="text"
                  id="edit_full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_username">Username</label>
                <input
                  type="text"
                  id="edit_username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_email">Email</label>
                <input
                  type="email"
                  id="edit_email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_password">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="edit_password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  minLength="6"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_role">Role</label>
                <select
                  id="edit_role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={formLoading}
                >
                  {formLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button className="logout-button-bottom" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

