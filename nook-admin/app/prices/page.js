'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './prices.css';

export default function PricesManagementPage() {
  const router = useRouter();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);



  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) { router.push('/login'); return; }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      router.push('/'); return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    setUser(parsedUser);
  }, [router]);

  // Fetch buffet versions once the user is ready
  useEffect(() => {
    if (!user) return;

    const fetchVersions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const res = await fetch(`${apiUrl}/api/buffet-versions/manage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.return_code === 'SUCCESS') {
          setVersions(data.data || []);
        } else if (data.return_code === 'UNAUTHORIZED' || data.return_code === 'FORBIDDEN') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/login');
        } else {
          setError(data.message || 'Failed to load buffet versions');
        }
      } catch {
        setError('Failed to load buffet versions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [user, router]);

  const startEdit = (version) => {
    setEditingId(version.id);
    setEditPrice(parseFloat(version.price_per_person).toFixed(2));
  };

  const cancelEdit = () => { setEditingId(null); setEditPrice(''); };

  const savePrice = async (versionId) => {
    if (!editPrice || isNaN(parseFloat(editPrice)) || parseFloat(editPrice) < 0) {
      alert('Please enter a valid price'); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      const version = versions.find(v => v.id === versionId);
      const res = await fetch(`${apiUrl}/api/buffet-versions/manage/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: version.title,
          description: version.description || null,
          price_per_person: parseFloat(editPrice)
        })
      });
      const data = await res.json();

      if (data.return_code === 'SUCCESS') {
        setVersions(prev => prev.map(v =>
          v.id === versionId
            ? { ...v, price_per_person: data.data.price_per_person }
            : v
        ));
        cancelEdit();
      } else {
        alert(data.message || 'Failed to save price');
      }
    } catch {
      alert('Failed to save price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  if (loading) return <div className="prices-management-container"><div className="loading">Loading...</div></div>;
  if (error)   return <div className="prices-management-container"><div className="error">{error}</div></div>;


  return (
    <div className="prices-management-container">
      <header className="prices-header">
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
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <button className="nav-item" onClick={() => router.push('/menu')}>Menu Items</button>
          )}
          {user && user.role === 'manager' && (
            <button className="nav-item active">Prices</button>
          )}
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={() => router.push('/menu-builder')}>Menu Builder</button>
          )}
          {user && user.role === 'manager' && (
            <button className="nav-item" onClick={() => router.push('/staff')}>Staff Management</button>
          )}
        </nav>
      </header>

      <div className="prices-grid">
        {versions.map(version => (
          <div key={version.id} className="price-card">
            <div className="price-card-header">
              <h3>{version.title}</h3>
            </div>

            {editingId === version.id ? (
              <div className="price-edit-form">
                <div className="price-input-row">
                  <span className="price-input-prefix">£</span>
                  <input
                    type="number"
                    className="price-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    autoFocus
                  />
                </div>
                <div className="edit-actions">
                  <button className="save-button" onClick={() => savePrice(version.id)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="cancel-button" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="price-display">
                <div>
                  <span className="price-value">£{parseFloat(version.price_per_person).toFixed(2)}</span>
                  <span className="price-label">per person</span>
                </div>
                <button className="edit-price-button" onClick={() => startEdit(version)}>
                  Edit
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {versions.length === 0 && (
        <div className="empty-state"><p>No buffet versions found</p></div>
      )}

      <button className="logout-button-bottom" onClick={handleLogout}>Logout</button>
    </div>
  );
}
