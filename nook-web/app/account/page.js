'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './account.css';

const EMPTY_CUSTOMER = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  default_address: '',
};

const STATUS_LABELS = {
  pending: { label: 'Pending', className: 'status-pending' },
  confirmed: { label: 'Confirmed', className: 'status-confirmed' },
  completed: { label: 'Completed', className: 'status-completed' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState(EMPTY_CUSTOMER);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(EMPTY_CUSTOMER);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Load the customer from localStorage and then fetch their orders
  useEffect(() => {
    const stored = localStorage.getItem('customer');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const customer = JSON.parse(stored);
      const safe = { ...EMPTY_CUSTOMER, ...customer, phone: customer.phone || '', default_address: customer.default_address || '' };
      setProfile(safe);
      setEditData(safe);
    } catch {
      router.push('/login');
      return;
    }
    setLoading(false);

    // Fetch the customer's order history
    const token = localStorage.getItem('customer_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    fetch(`${apiUrl}/api/customers/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.return_code === 'SUCCESS') setOrders(data.data);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [router]);

  const handleReorder = (order) => {
    // Convert each buffet from the old order into the basket format
    const basketItems = order.buffets.map(buffet => ({
      buffetVersionId: buffet.buffet_version_id,
      buffetName: buffet.buffet_name,
      numPeople: buffet.num_people,
      pricePerPerson: parseFloat(buffet.price_per_person),
      totalPrice: parseFloat(buffet.subtotal),
      items: buffet.items.map(i => i.menu_item_id),
      upgrades: buffet.upgrades.map(u => ({
        upgradeId: u.upgrade_id,
        upgradeName: u.upgrade_name,
        pricePerPerson: parseFloat(u.price_per_person),
        subtotal: parseFloat(u.subtotal),
        selectedItems: u.selectedItems.map(si => si.upgrade_item_id)
      })),
      notes: buffet.notes || '',
      dietaryInfo: buffet.dietary_info || '',
      allergens: buffet.allergens || '',
      timestamp: new Date().toISOString()
    }));

    localStorage.setItem('basketData', JSON.stringify(basketItems));
    router.push('/basket');
  };

  const handleSignOut = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    router.push('/login');
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setSaveError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const token = localStorage.getItem('customer_token');
      const response = await fetch(`${apiUrl}/api/customers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Update the profile in state and localStorage
        const safe = { ...EMPTY_CUSTOMER, ...data.customer, phone: data.customer.phone || '', default_address: data.customer.default_address || '' };
        setProfile(safe);
        localStorage.setItem('customer', JSON.stringify(data.customer));
        setEditing(false);
      } else {
        setSaveError(data.message || 'Failed to save changes. Please try again.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveError('Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const initials = ((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase() || '?';

  return (
    <div className="welcome-page-option3">
      <div className="account-page-container">

        {/* ===== HEADER ===== */}
        <div className="account-header">
          <div className="account-avatar">{initials}</div>
          <div className="account-header-info">
            <h1 className="account-name">{profile.first_name} {profile.last_name}</h1>
            <p className="account-email">{profile.email}</p>
          </div>
          <button className="account-signout-link" onClick={handleSignOut}>Sign out</button>
        </div>

        {/* ===== TABS ===== */}
        <div className="account-tabs">
          <button
            className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button
            className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div className="account-section">
            {ordersLoading ? (
              <div className="account-empty"><p>Loading your orders...</p></div>
            ) : orders.length === 0 ? (
              <div className="account-empty">
                <p>You haven't placed any orders yet.</p>
                <Link href="/select-buffet" className="account-cta-button">Order a Buffet</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const status = STATUS_LABELS[order.status] || { label: order.status, className: '' };
                  const fulfilmentDate = order.fulfillment_date
                    ? new Date(order.fulfillment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';
                  const orderedDate = new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <span className="order-number">{order.order_number}</span>
                          <span className={`order-status-badge ${status.className}`}>{status.label}</span>
                        </div>
                        <span className="order-total">£{parseFloat(order.total_price).toFixed(2)}</span>
                      </div>
                      <div className="order-card-body">
                        <div className="order-detail-row">
                          <span className="order-detail-label">Buffet</span>
                          <span>{order.buffets.map(b => `${b.buffet_name} (${b.num_people} people)`).join(', ')}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">Date</span>
                          <span>{fulfilmentDate}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">Type</span>
                          <span>{order.fulfillment_type === 'delivery' ? 'Delivery' : 'Collection'}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">Ordered</span>
                          <span>{orderedDate}</span>
                        </div>
                      </div>
                      <div className="order-card-footer">
                        <button className="order-reorder-button" onClick={() => handleReorder(order)}>
                          Reorder
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div className="account-section">
            {!editing ? (
              <>
                <div className="profile-display">
                  <div className="detail-row">
                    <span className="detail-label">First Name</span>
                    <span className="detail-value">{profile.first_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Name</span>
                    <span className="detail-value">{profile.last_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{profile.phone || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Default Address</span>
                    <span className="detail-value">{profile.default_address || '—'}</span>
                  </div>
                </div>
                <button className="account-edit-button" onClick={() => { setEditData(profile); setEditing(true); }}>
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSave} className="profile-edit-form">
                <div className="auth-form-row">
                  <div className="auth-form-group">
                    <label>First Name</label>
                    <input className="auth-input" name="first_name" value={editData.first_name} onChange={handleEditChange} required />
                  </div>
                  <div className="auth-form-group">
                    <label>Last Name</label>
                    <input className="auth-input" name="last_name" value={editData.last_name} onChange={handleEditChange} required />
                  </div>
                </div>
                <div className="auth-form-group">
                  <label>Email Address</label>
                  <input className="auth-input" type="email" name="email" value={editData.email} onChange={handleEditChange} required />
                </div>
                <div className="auth-form-group">
                  <label>Phone</label>
                  <input className="auth-input" name="phone" value={editData.phone} onChange={handleEditChange} placeholder="07700 900000" />
                </div>
                <div className="auth-form-group">
                  <label>Default Delivery Address</label>
                  <input className="auth-input" name="default_address" value={editData.default_address} onChange={handleEditChange} placeholder="Your delivery address" />
                </div>
                {saveError && <p className="auth-error">{saveError}</p>}
                <div className="profile-edit-actions">
                  <button type="submit" className="auth-submit-button" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="account-cancel-button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

