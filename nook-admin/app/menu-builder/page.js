'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './menu-builder.css';

export default function MenuBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [buffetVersions, setBuffetVersions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('versions'); // 'versions' | 'categories' | 'items'
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Edit state
  const [editingVersion, setEditingVersion] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemVersionId, setEditingItemVersionId] = useState('');
  const [editingItemCategories, setEditingItemCategories] = useState([]);

  // Buffet version form
  const [vTitle, setVTitle] = useState('');
  const [vDescription, setVDescription] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vBranchId, setVBranchId] = useState('');

  // Category form
  const [cName, setCName] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cBuffetVersionId, setCBuffetVersionId] = useState('');
  const [cPosition, setCPosition] = useState('');
  const [cIsRequired, setCIsRequired] = useState(false);

  // Menu item form
  const [iName, setIName] = useState('');
  const [iDescription, setIDescription] = useState('');
  const [iBuffetVersionId, setIBuffetVersionId] = useState('');
  const [iCategoryId, setICategoryId] = useState('');
  const [iDietaryInfo, setIDietaryInfo] = useState('');
  const [iAllergens, setIAllergens] = useState('');
  const [categoriesForItem, setCategoriesForItem] = useState([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

  // Auth check + fetch branches + fetch buffet versions
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (!token || !userData) { router.push('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') { router.push('/'); return; }
    setUser(parsedUser);

    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${apiUrl}/api/branches`, { headers })
      .then(r => r.json())
      .then(d => { if (d.return_code === 'SUCCESS') setBranches(d.data || []); })
      .catch(() => {});

    fetch(`${apiUrl}/api/buffet-versions/manage`, { headers })
      .then(r => r.json())
      .then(d => { if (d.return_code === 'SUCCESS') setBuffetVersions(d.data || []); })
      .catch(() => {});

    fetch(`${apiUrl}/api/menu/manage`, { headers })
      .then(r => r.json())
      .then(d => { if (d.return_code === 'SUCCESS') setMenuItems(d.data || []); })
      .catch(() => {});

    fetch(`${apiUrl}/api/menu`, { headers })
      .then(r => r.json())
      .then(d => { if (d.return_code === 'SUCCESS') setAllCategories(d.data || []); })
      .catch(() => {});
  }, [router, apiUrl]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const token = () => localStorage.getItem('admin_token');
  const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  // Fetch categories when buffet version changes in the item form
  const onItemBuffetVersionChange = async (buffetVersionId) => {
    setIBuffetVersionId(buffetVersionId);
    setICategoryId('');
    if (!buffetVersionId) { setCategoriesForItem([]); return; }
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/categories?buffet_version_id=${buffetVersionId}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') setCategoriesForItem(d.data || []);
    } catch { setCategoriesForItem([]); }
  };

  // ===== EDIT HELPERS =====
  const startEditVersion = (v) => {
    setEditingVersion({ ...v });
    setEditingCategory(null);
    setEditingItem(null);
  };

  const startEditCategory = (c) => {
    setEditingCategory({ ...c });
    setEditingVersion(null);
    setEditingItem(null);
  };

  const startEditItem = async (item) => {
    setEditingItem({ ...item });
    setEditingItemVersionId(item.buffet_version_id?.toString() || '');
    setEditingVersion(null);
    setEditingCategory(null);
    // Load categories for this item's buffet version
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/categories?buffet_version_id=${item.buffet_version_id}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') setEditingItemCategories(d.data || []);
    } catch { setEditingItemCategories([]); }
  };

  const onEditItemVersionChange = async (buffetVersionId) => {
    setEditingItemVersionId(buffetVersionId);
    setEditingItem(prev => ({ ...prev, category_id: '' }));
    if (!buffetVersionId) { setEditingItemCategories([]); return; }
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/categories?buffet_version_id=${buffetVersionId}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') setEditingItemCategories(d.data || []);
    } catch { setEditingItemCategories([]); }
  };

  // ===== SAVE: BUFFET VERSION =====
  const saveVersion = async (e) => {
    e.preventDefault();
    if (!editingVersion.title?.trim()) { alert('Name is required'); return; }
    if (!editingVersion.price_per_person || isNaN(parseFloat(editingVersion.price_per_person))) { alert('A valid price is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/buffet-versions/manage/${editingVersion.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({
          title: editingVersion.title.trim(),
          description: editingVersion.description?.trim() || null,
          price_per_person: parseFloat(editingVersion.price_per_person),
          branch_id: editingVersion.branch_id || null
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        const branchName = branches.find(b => b.id === d.data.branch_id)?.name || null;
        setBuffetVersions(prev => prev.map(v => v.id === d.data.id ? { ...d.data, branch_name: branchName } : v));
        setEditingVersion(null);
        showSuccess(`"${d.data.title}" updated!`);
      } else { alert(d.message || 'Failed to update'); }
    } catch { alert('Failed to update buffet version'); } finally { setSaving(false); }
  };

  // ===== SAVE: CATEGORY =====
  const saveCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name?.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/categories/${editingCategory.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({
          name: editingCategory.name.trim(),
          description: editingCategory.description?.trim() || null,
          position: editingCategory.position !== undefined ? parseInt(editingCategory.position) : 0,
          is_required: editingCategory.is_required === true
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        setAllCategories(prev => prev.map(c => c.id === d.data.id ? { ...c, ...d.data } : c));
        setEditingCategory(null);
        showSuccess(`"${d.data.name}" updated!`);
      } else { alert(d.message || 'Failed to update'); }
    } catch { alert('Failed to update category'); } finally { setSaving(false); }
  };

  // ===== SAVE: MENU ITEM =====
  const saveItem = async (e) => {
    e.preventDefault();
    if (!editingItem.name?.trim()) { alert('Name is required'); return; }
    if (!editingItem.category_id) { alert('Please select a category'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/items/${editingItem.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({
          name: editingItem.name.trim(),
          description: editingItem.description?.trim() || null,
          category_id: parseInt(editingItem.category_id),
          dietary_info: editingItem.dietary_info?.trim() || null,
          allergens: editingItem.allergens?.trim() || null,
          is_included_in_base: true
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        const catName = editingItemCategories.find(c => c.id === parseInt(editingItem.category_id))?.name || editingItem.category_name;
        const bvName = buffetVersions.find(v => v.id.toString() === editingItemVersionId)?.title || editingItem.buffet_version_name;
        setMenuItems(prev => prev.map(i => i.id === d.data.id ? { ...i, ...d.data, category_name: catName, buffet_version_name: bvName } : i));
        setEditingItem(null);
        setEditingItemCategories([]);
        showSuccess(`"${d.data.name}" updated!`);
      } else { alert(d.message || 'Failed to update'); }
    } catch { alert('Failed to update menu item'); } finally { setSaving(false); }
  };

  // ===== SUBMIT: BUFFET VERSION =====
  const submitVersion = async (e) => {
    e.preventDefault();
    if (!vTitle.trim()) { alert('Name is required'); return; }
    if (!vPrice || isNaN(parseFloat(vPrice)) || parseFloat(vPrice) < 0) { alert('A valid price is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/buffet-versions/manage`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          title: vTitle.trim(), description: vDescription.trim() || null,
          price_per_person: parseFloat(vPrice), branch_id: vBranchId ? parseInt(vBranchId) : null
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        setBuffetVersions(prev => [...prev, d.data]);
        setVTitle(''); setVDescription(''); setVPrice(''); setVBranchId('');
        showSuccess(`Buffet version "${d.data.title}" created!`);
      } else { alert(d.message || 'Failed to create buffet version'); }
    } catch { alert('Failed to create buffet version'); } finally { setSaving(false); }
  };

  // ===== SUBMIT: CATEGORY =====
  const submitCategory = async (e) => {
    e.preventDefault();
    if (!cName.trim()) { alert('Name is required'); return; }
    if (!cBuffetVersionId) { alert('Please select a buffet version'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/categories`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          name: cName.trim(), description: cDescription.trim() || null,
          buffet_version_id: parseInt(cBuffetVersionId),
          position: cPosition !== '' ? parseInt(cPosition) : 0,
          is_required: cIsRequired
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        setAllCategories(prev => [...prev, { ...d.data, items: [] }]);
        setCName(''); setCDescription(''); setCBuffetVersionId(''); setCPosition(''); setCIsRequired(false);
        showSuccess(`Category "${d.data.name}" created!`);
      } else { alert(d.message || 'Failed to create category'); }
    } catch { alert('Failed to create category'); } finally { setSaving(false); }
  };

  // ===== SUBMIT: MENU ITEM =====
  const submitItem = async (e) => {
    e.preventDefault();
    if (!iName.trim()) { alert('Name is required'); return; }
    if (!iCategoryId) { alert('Please select a category'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menu/manage/items`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          name: iName.trim(), description: iDescription.trim() || null,
          category_id: parseInt(iCategoryId),
          dietary_info: iDietaryInfo.trim() || null,
          allergens: iAllergens.trim() || null,
          is_included_in_base: true
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        const catName = categoriesForItem.find(c => c.id === parseInt(iCategoryId))?.name || '';
        const bvName = buffetVersions.find(v => v.id.toString() === iBuffetVersionId)?.title || '';
        setMenuItems(prev => [...prev, { ...d.data, category_name: catName, buffet_version_name: bvName }]);
        setIName(''); setIDescription(''); setIBuffetVersionId(''); setICategoryId('');
        setIDietaryInfo(''); setIAllergens('');
        setCategoriesForItem([]);
        showSuccess(`Menu item "${d.data.name}" created!`);
      } else { alert(d.message || 'Failed to create menu item'); }
    } catch { alert('Failed to create menu item'); } finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="mb-container">
      <header className="mb-header">
        <div className="header-top">
          <h1>the little nook buffet</h1>
          <div className="user-info">
            <span className="user-name">{user.full_name || user.username}</span>
            <span className="user-role">({user.role})</span>
          </div>
        </div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => router.push('/')}>Orders</button>
          <button className="nav-item" onClick={() => router.push('/menu')}>Menu Items</button>
          <button className="nav-item" onClick={() => router.push('/prices')}>Prices</button>
          <button className="nav-item active">Menu Builder</button>
          <button className="nav-item" onClick={() => router.push('/staff')}>Staff Management</button>
          <button className="nav-item" onClick={() => router.push('/branches')}>Delivery Times</button>
          <button className="nav-item" onClick={() => router.push('/reports')}>Reports</button>
        </nav>
      </header>

      <div className="mb-page-header">
        <h2>Menu Builder</h2>
        <p className="mb-subtitle">Add new buffet versions, categories, and menu items</p>
      </div>

      {successMessage && <div className="mb-success">{successMessage}</div>}

      {/* Tabs */}
      <div className="mb-tabs">
        <button className={`mb-tab ${activeTab === 'versions' ? 'active' : ''}`} onClick={() => setActiveTab('versions')}>
          Buffet Versions
        </button>
        <button className={`mb-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Categories
        </button>
        <button className={`mb-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
          Menu Items
        </button>
      </div>

      {/* ===== BUFFET VERSIONS TAB ===== */}
      {activeTab === 'versions' && (
        <div className="mb-card">
          <h3 className="mb-card-title">Add New Buffet Version</h3>
          <form className="mb-form" onSubmit={submitVersion}>
            <div className="mb-fields">
              <div className="mb-field">
                <label>Name *</label>
                <input className="mb-input" type="text" placeholder="e.g. Premium Buffet"
                  value={vTitle} onChange={e => setVTitle(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Price per person (£) *</label>
                <input className="mb-input" type="number" placeholder="0.00" step="0.01" min="0"
                  value={vPrice} onChange={e => setVPrice(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Description</label>
                <input className="mb-input" type="text" placeholder="Optional"
                  value={vDescription} onChange={e => setVDescription(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Branch</label>
                <select className="mb-input" value={vBranchId} onChange={e => setVBranchId(e.target.value)}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <button className="mb-submit" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Buffet Version'}
            </button>
          </form>

          <div className="mb-existing">
            <h4 className="mb-existing-title">Existing Buffet Versions</h4>
            {buffetVersions.length === 0
              ? <p className="mb-empty">No buffet versions yet</p>
              : buffetVersions.map(v => (
                <div key={v.id}>
                  {editingVersion?.id === v.id ? (
                    <form className="mb-edit-form" onSubmit={saveVersion}>
                      <div className="mb-fields">
                        <div className="mb-field">
                          <label>Name *</label>
                          <input className="mb-input" type="text" value={editingVersion.title}
                            onChange={e => setEditingVersion(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Price per person (£) *</label>
                          <input className="mb-input" type="number" step="0.01" min="0" value={editingVersion.price_per_person}
                            onChange={e => setEditingVersion(p => ({ ...p, price_per_person: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Description</label>
                          <input className="mb-input" type="text" value={editingVersion.description || ''}
                            onChange={e => setEditingVersion(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Branch</label>
                          <select className="mb-input" value={editingVersion.branch_id || ''}
                            onChange={e => setEditingVersion(p => ({ ...p, branch_id: e.target.value || null }))}>
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mb-edit-actions">
                        <button className="mb-submit mb-submit-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        <button className="mb-cancel-btn" type="button" onClick={() => setEditingVersion(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-existing-item">
                      <span className="mb-existing-name">{v.title}</span>
                      <span className="mb-existing-detail">£{parseFloat(v.price_per_person).toFixed(2)} / person</span>
                      {v.branch_name && <span className="mb-badge">{v.branch_name}</span>}
                      <button className="mb-edit-btn" onClick={() => startEditVersion(v)}>Edit</button>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ===== CATEGORIES TAB ===== */}
      {activeTab === 'categories' && (
        <div className="mb-card">
          <h3 className="mb-card-title">Add New Category</h3>
          <form className="mb-form" onSubmit={submitCategory}>
            <div className="mb-fields">
              <div className="mb-field">
                <label>Name *</label>
                <input className="mb-input" type="text" placeholder="e.g. Sandwiches"
                  value={cName} onChange={e => setCName(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Buffet Version *</label>
                <select className="mb-input" value={cBuffetVersionId} onChange={e => setCBuffetVersionId(e.target.value)}>
                  <option value="">Select buffet version</option>
                  {buffetVersions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                </select>
              </div>
              <div className="mb-field">
                <label>Description</label>
                <input className="mb-input" type="text" placeholder="Optional"
                  value={cDescription} onChange={e => setCDescription(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Sort Position</label>
                <input className="mb-input" type="number" placeholder="0" min="0"
                  value={cPosition} onChange={e => setCPosition(e.target.value)} />
              </div>
              <div className="mb-field mb-field-check">
                <label><input type="checkbox" checked={cIsRequired} onChange={e => setCIsRequired(e.target.checked)} /> Required category</label>
              </div>
            </div>
            <button className="mb-submit" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Category'}
            </button>
          </form>

          <div className="mb-existing">
            <h4 className="mb-existing-title">Existing Categories</h4>
            {allCategories.length === 0
              ? <p className="mb-empty">No categories yet</p>
              : allCategories.map(c => {
                  const bvName = buffetVersions.find(v => v.id === c.buffet_version_id)?.title || `Version ${c.buffet_version_id}`;
                  return (
                    <div key={c.id}>
                      {editingCategory?.id === c.id ? (
                        <form className="mb-edit-form" onSubmit={saveCategory}>
                          <div className="mb-fields">
                            <div className="mb-field">
                              <label>Name *</label>
                              <input className="mb-input" type="text" value={editingCategory.name}
                                onChange={e => setEditingCategory(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="mb-field">
                              <label>Description</label>
                              <input className="mb-input" type="text" value={editingCategory.description || ''}
                                onChange={e => setEditingCategory(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="mb-field">
                              <label>Sort Position</label>
                              <input className="mb-input" type="number" min="0" value={editingCategory.position ?? 0}
                                onChange={e => setEditingCategory(p => ({ ...p, position: e.target.value }))} />
                            </div>
                            <div className="mb-field mb-field-check">
                              <label>
                                <input type="checkbox" checked={editingCategory.is_required === true}
                                  onChange={e => setEditingCategory(p => ({ ...p, is_required: e.target.checked }))} />
                                Required category
                              </label>
                            </div>
                          </div>
                          <div className="mb-edit-actions">
                            <button className="mb-submit mb-submit-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                            <button className="mb-cancel-btn" type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="mb-existing-item">
                          <span className="mb-existing-name">{c.name}</span>
                          <span className="mb-badge">{bvName}</span>
                          {c.is_required && <span className="mb-badge mb-badge-required">Required</span>}
                          <button className="mb-edit-btn" onClick={() => startEditCategory(c)}>Edit</button>
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {/* ===== MENU ITEMS TAB ===== */}
      {activeTab === 'items' && (
        <div className="mb-card">
          <h3 className="mb-card-title">Add New Menu Item</h3>
          <form className="mb-form" onSubmit={submitItem}>
            <div className="mb-fields">
              <div className="mb-field">
                <label>Name *</label>
                <input className="mb-input" type="text" placeholder="e.g. Egg Mayo"
                  value={iName} onChange={e => setIName(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Buffet Version</label>
                <select className="mb-input" value={iBuffetVersionId} onChange={e => onItemBuffetVersionChange(e.target.value)}>
                  <option value="">Select buffet version first</option>
                  {buffetVersions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                </select>
              </div>
              <div className="mb-field">
                <label>Category *</label>
                <select className="mb-input" value={iCategoryId} onChange={e => setICategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {categoriesForItem.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="mb-field">
                <label>Description</label>
                <input className="mb-input" type="text" placeholder="Optional"
                  value={iDescription} onChange={e => setIDescription(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Dietary Info</label>
                <input className="mb-input" type="text" placeholder="e.g. Vegetarian"
                  value={iDietaryInfo} onChange={e => setIDietaryInfo(e.target.value)} />
              </div>
              <div className="mb-field">
                <label>Allergens</label>
                <input className="mb-input" type="text" placeholder="e.g. Gluten, Dairy"
                  value={iAllergens} onChange={e => setIAllergens(e.target.value)} />
              </div>

            </div>
            <button className="mb-submit" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Menu Item'}
            </button>
          </form>

          <div className="mb-existing">
            <h4 className="mb-existing-title">Existing Menu Items</h4>
            {menuItems.length === 0
              ? <p className="mb-empty">No menu items yet</p>
              : menuItems.map(item => (
                <div key={item.id}>
                  {editingItem?.id === item.id ? (
                    <form className="mb-edit-form" onSubmit={saveItem}>
                      <div className="mb-fields">
                        <div className="mb-field">
                          <label>Name *</label>
                          <input className="mb-input" type="text" value={editingItem.name}
                            onChange={e => setEditingItem(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Buffet Version</label>
                          <select className="mb-input" value={editingItemVersionId} onChange={e => onEditItemVersionChange(e.target.value)}>
                            <option value="">Select buffet version</option>
                            {buffetVersions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                          </select>
                        </div>
                        <div className="mb-field">
                          <label>Category *</label>
                          <select className="mb-input" value={editingItem.category_id || ''}
                            onChange={e => setEditingItem(p => ({ ...p, category_id: e.target.value }))}>
                            <option value="">Select category</option>
                            {editingItemCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="mb-field">
                          <label>Description</label>
                          <input className="mb-input" type="text" value={editingItem.description || ''}
                            onChange={e => setEditingItem(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Dietary Info</label>
                          <input className="mb-input" type="text" value={editingItem.dietary_info || ''}
                            onChange={e => setEditingItem(p => ({ ...p, dietary_info: e.target.value }))} />
                        </div>
                        <div className="mb-field">
                          <label>Allergens</label>
                          <input className="mb-input" type="text" value={editingItem.allergens || ''}
                            onChange={e => setEditingItem(p => ({ ...p, allergens: e.target.value }))} />
                        </div>

                      </div>
                      <div className="mb-edit-actions">
                        <button className="mb-submit mb-submit-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        <button className="mb-cancel-btn" type="button" onClick={() => { setEditingItem(null); setEditingItemCategories([]); }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className={`mb-existing-item ${!item.is_active ? 'mb-item-inactive' : ''}`}>
                      <span className="mb-existing-name">{item.name}</span>
                      <span className="mb-existing-detail">{item.category_name}</span>
                      <span className="mb-badge">{item.buffet_version_name}</span>
                      {item.dietary_info && <span className="mb-badge mb-badge-dietary">{item.dietary_info}</span>}
                      {!item.is_active && <span className="mb-badge mb-badge-inactive">Out of stock</span>}
                      <button className="mb-edit-btn" onClick={() => startEditItem(item)}>Edit</button>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      <button className="logout-button-bottom" onClick={handleLogout}>Logout</button>
    </div>
  );
}
