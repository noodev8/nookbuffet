'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './menu-builder.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ===== SORTABLE CATEGORY ROW =====
function SortableCategory({ c, editingCategory, isKids, webUrl, saveCategory, setEditingCategory, startEditCategory, saving, ImagePicker }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: c.id,
    disabled: editingCategory?.id === c.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
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
            <div className="mb-field mb-field-check">
              <label>
                <input type="checkbox" checked={editingCategory.is_required === true}
                  onChange={e => setEditingCategory(p => ({ ...p, is_required: e.target.checked }))} />
                Required category
              </label>
            </div>
            <div className="mb-field mb-field-full">
              <label>Category Image{isKids ? '' : 's (4 slots shown on the website)'}</label>
              <div className={isKids ? '' : 'mb-img-grid'}>
                <ImagePicker label="Image 1" value={editingCategory.image_url} onChange={v => setEditingCategory(p => ({ ...p, image_url: v }))} />
                {!isKids && <ImagePicker label="Image 2" value={editingCategory.image_url_2} onChange={v => setEditingCategory(p => ({ ...p, image_url_2: v }))} />}
                {!isKids && <ImagePicker label="Image 3" value={editingCategory.image_url_3} onChange={v => setEditingCategory(p => ({ ...p, image_url_3: v }))} />}
                {!isKids && <ImagePicker label="Image 4" value={editingCategory.image_url_4} onChange={v => setEditingCategory(p => ({ ...p, image_url_4: v }))} />}
              </div>
            </div>
          </div>
          <div className="mb-edit-actions">
            <button className="mb-submit mb-submit-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="mb-cancel-btn" type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="mb-existing-item">
          <span className="mb-drag-handle" {...attributes} {...listeners} title="Drag to reorder">::</span>
          <div className="mb-thumb-strip">
            {(isKids ? [c.image_url] : [c.image_url, c.image_url_2, c.image_url_3, c.image_url_4]).map((img, i) =>
              img
                ? <img key={i} draggable={false} src={`${webUrl}${img}`} alt={`${c.name} ${i + 1}`} className="mb-img-thumb" />
                : <div key={i} className="mb-img-thumb mb-img-thumb-empty" />
            )}
          </div>
          <div className="mb-existing-info">
            <span className="mb-existing-name">{c.name}</span>
            {c.is_required && <span className="mb-badge mb-badge-required">Required</span>}
          </div>
          <button className="mb-edit-btn" onClick={() => startEditCategory(c)}>Edit</button>
        </div>
      )}
    </div>
  );
}

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

  // Category filters
  const [catSearch, setCatSearch] = useState('');
  const [catFilterVersion, setCatFilterVersion] = useState('');
  const [catFilterBranch, setCatFilterBranch] = useState('');

  // Drag-to-reorder sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Item filters
  const [itemSearch, setItemSearch] = useState('');
  const [itemFilterVersion, setItemFilterVersion] = useState('');
  const [itemFilterCategory, setItemFilterCategory] = useState('');

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
  const [cImageUrl, setCImageUrl] = useState('');
  const [cImageUrl2, setCImageUrl2] = useState('');
  const [cImageUrl3, setCImageUrl3] = useState('');
  const [cImageUrl4, setCImageUrl4] = useState('');

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

  const categoryImageOptions = [
    { label: 'None', value: '' },
    { label: 'Sandwiches', value: '/assets/sandwiches.png' },
    { label: 'Sandwiches 2', value: '/assets/sandwiches2.png' },
    { label: 'Sandwiches 3', value: '/assets/sandwiches3.png' },
    { label: 'Wraps', value: '/assets/wraps.png' },
    { label: 'Wraps 2', value: '/assets/wraps2.png' },
    { label: 'Wraps 3', value: '/assets/wraps3.png' },
    { label: 'Wraps 4', value: '/assets/wraps4.png' },
    { label: 'Savoury', value: '/assets/savoury.png' },
    { label: 'Savoury 2', value: '/assets/savoury2.png' },
    { label: 'Savoury 3', value: '/assets/savoury3.png' },
    { label: 'Savoury 4', value: '/assets/savoury4.png' },
    { label: 'Dips & Sticks', value: '/assets/dipsandsticks.png' },
    { label: 'Dips 2', value: '/assets/dips2.png' },
    { label: 'Dips 3', value: '/assets/dips3.png' },
    { label: 'Dips 4', value: '/assets/dips4.png' },
    { label: 'Fruit', value: '/assets/fruit.png' },
    { label: 'Fruit 2', value: '/assets/fruit2.png' },
    { label: 'Fruit 3', value: '/assets/fruit3.png' },
    { label: 'Fruit 5', value: '/assets/fruit5.png' },
    { label: 'Cake', value: '/assets/cake.png' },
    { label: 'Cake 2', value: '/assets/cake2.png' },
    { label: 'Cake 3', value: '/assets/cake3.png' },
    { label: 'Cake 4', value: '/assets/cake4.png' },
    { label: 'Continental 1', value: '/assets/continental1.png' },
    { label: 'Continental 2', value: '/assets/continental2.png' },
    { label: 'Full Buffet 1', value: '/assets/fullbuffet1.png' },
    { label: 'Full Buffet 2', value: '/assets/fullbuffet2.png' },
    { label: 'Kids Cake', value: '/assets/kidscake.png' },
    { label: 'Kids Crisps', value: '/assets/kidscrisps.png' },
    { label: 'Food 2', value: '/assets/food2.png' },
    { label: 'Nook', value: '/assets/nook.jpg' },
  ];

  // Helper to render a single image slot picker
  const ImagePicker = ({ label, value, onChange }) => (
    <div className="mb-img-slot">
      <select className="mb-input mb-img-select" value={value || ''} onChange={e => onChange(e.target.value || null)}>
        {categoryImageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {value
        ? <img draggable={false} src={`${webUrl}${value}`} alt="preview" className="mb-img-preview" />
        : <div className="mb-img-empty">No image</div>
      }
    </div>
  );

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
      .then(d => {
        if (d.return_code === 'SUCCESS') {
          const sorted = [...(d.data || [])].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
          setAllCategories(sorted);
        }
      })
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
    setEditingCategory({ ...c, position: (c.position ?? 0) + 1 });
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
          position: editingCategory.position !== undefined ? parseInt(editingCategory.position) - 1 : 0,
          is_required: editingCategory.is_required === true,
          image_url: editingCategory.image_url || null,
          image_url_2: editingCategory.image_url_2 || null,
          image_url_3: editingCategory.image_url_3 || null,
          image_url_4: editingCategory.image_url_4 || null,
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        setAllCategories(prev => sortCategories(prev.map(c => c.id === d.data.id ? { ...c, ...d.data } : c)));
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
          position: cPosition !== '' ? Math.max(0, parseInt(cPosition) - 1) : 0,
          is_required: cIsRequired,
          image_url: cImageUrl || null,
          image_url_2: cImageUrl2 || null,
          image_url_3: cImageUrl3 || null,
          image_url_4: cImageUrl4 || null,
        })
      });
      const d = await res.json();
      if (d.return_code === 'SUCCESS') {
        setAllCategories(prev => sortCategories([...prev, { ...d.data, items: [] }]));
        setCName(''); setCDescription(''); setCBuffetVersionId(''); setCPosition(''); setCIsRequired(false);
        setCImageUrl(''); setCImageUrl2(''); setCImageUrl3(''); setCImageUrl4('');
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

  const sortCategories = (cats) =>
    [...cats].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const fromCat = allCategories.find(c => c.id === active.id);
    const toCat = allCategories.find(c => c.id === over.id);
    if (!fromCat || !toCat) return;

    const fromPos = fromCat.position;
    const toPos = toCat.position;

    setAllCategories(prev => sortCategories(prev.map(c => {
      if (c.id === active.id) return { ...c, position: toPos };
      if (c.id === over.id) return { ...c, position: fromPos };
      return c;
    })));

    try {
      await fetch(`${apiUrl}/api/menu/manage/categories/reorder`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify([
          { id: active.id, position: toPos },
          { id: over.id, position: fromPos },
        ])
      });
    } catch { /* silently fail — UI already updated */ }
  };

  if (!user) return null;

  // Filtered categories
  const filteredCategories = allCategories.filter(c => {
    const bv = buffetVersions.find(v => v.id === c.buffet_version_id);
    const matchesSearch = !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase());
    const matchesVersion = !catFilterVersion || String(c.buffet_version_id) === catFilterVersion;
    const matchesBranch = !catFilterBranch || String(bv?.branch_id) === catFilterBranch;
    return matchesSearch && matchesVersion && matchesBranch;
  });

  // Filtered menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !itemSearch || item.name.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesVersion = !itemFilterVersion || String(item.buffet_version_id) === itemFilterVersion;
    const matchesCategory = !itemFilterCategory || String(item.category_id) === itemFilterCategory;
    return matchesSearch && matchesVersion && matchesCategory;
  });

  // Unique categories available for the item filter dropdown (respect version filter)
  const itemFilterCategoryOptions = allCategories.filter(c =>
    !itemFilterVersion || String(c.buffet_version_id) === itemFilterVersion
  );

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
                <input className="mb-input" type="number" placeholder="1" min="1"
                  value={cPosition} onChange={e => setCPosition(e.target.value)} />
              </div>
              <div className="mb-field mb-field-check">
                <label><input type="checkbox" checked={cIsRequired} onChange={e => setCIsRequired(e.target.checked)} /> Required category</label>
              </div>
              {(() => {
                const selectedBv = buffetVersions.find(v => String(v.id) === String(cBuffetVersionId));
                const createIsKids = selectedBv?.title?.toLowerCase().includes('kids');
                return (
                  <div className="mb-field mb-field-full">
                    <label>Category Image{createIsKids ? '' : 's (4 slots shown on the website)'}</label>
                    <div className={createIsKids ? '' : 'mb-img-grid'}>
                      <ImagePicker label="Image 1" value={cImageUrl} onChange={setCImageUrl} />
                      {!createIsKids && <ImagePicker label="Image 2" value={cImageUrl2} onChange={setCImageUrl2} />}
                      {!createIsKids && <ImagePicker label="Image 3" value={cImageUrl3} onChange={setCImageUrl3} />}
                      {!createIsKids && <ImagePicker label="Image 4" value={cImageUrl4} onChange={setCImageUrl4} />}
                    </div>
                  </div>
                );
              })()}
            </div>
            <button className="mb-submit" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Category'}
            </button>
          </form>

          <div className="mb-existing">
            <h4 className="mb-existing-title">Existing Categories</h4>

            <div className="mb-filters">
              <input className="mb-filter-search" type="text" placeholder="Search categories..."
                value={catSearch} onChange={e => setCatSearch(e.target.value)} />
              <select className="mb-filter-select" value={catFilterBranch} onChange={e => { setCatFilterBranch(e.target.value); setCatFilterVersion(''); }}>
                <option value="">All locations</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select className="mb-filter-select" value={catFilterVersion} onChange={e => setCatFilterVersion(e.target.value)}>
                <option value="">All buffet versions</option>
                {buffetVersions
                  .filter(v => !catFilterBranch || String(v.branch_id ?? 'null') === catFilterBranch)
                  .map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
              {(catSearch || catFilterVersion || catFilterBranch) &&
                <button className="mb-filter-clear" onClick={() => { setCatSearch(''); setCatFilterVersion(''); setCatFilterBranch(''); }}>Clear</button>
              }
              <span className="mb-filter-count">{filteredCategories.length} of {allCategories.length}</span>
            </div>

            {filteredCategories.length === 0
              ? <p className="mb-empty">{allCategories.length === 0 ? 'No categories yet' : 'No categories match your filters'}</p>
              : (() => {
                  // Group filtered categories by buffet version, preserving position order within each group
                  const versionIds = [...new Set(filteredCategories.map(c => c.buffet_version_id))];
                  return versionIds.map(vId => {
                    const bv = buffetVersions.find(v => v.id === vId);
                    const bvName = bv?.title || `Version ${vId}`;
                    const branchName = bv?.branch_name || null;
                    const isKids = bv?.title?.toLowerCase().includes('kids');
                    const groupCats = filteredCategories.filter(c => c.buffet_version_id === vId);
                    return (
                      <div key={vId} className="mb-version-group">
                        <div className="mb-version-group-header">
                          <span className="mb-version-group-title">{bvName}</span>
                          {branchName
                            ? <span className="mb-badge mb-badge-branch">{branchName}</span>
                            : <span className="mb-badge mb-badge-all">All branches</span>}
                          <span className="mb-drag-hint">Drag to reorder</span>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={groupCats.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            {groupCats.map(c => (
                              <SortableCategory
                                key={c.id}
                                c={c}
                                editingCategory={editingCategory}
                                isKids={isKids}
                                webUrl={webUrl}
                                saveCategory={saveCategory}
                                setEditingCategory={setEditingCategory}
                                startEditCategory={startEditCategory}
                                saving={saving}
                                ImagePicker={ImagePicker}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    );
                  });
                })()
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

            <div className="mb-filters">
              <input className="mb-filter-search" type="text" placeholder="Search items..."
                value={itemSearch} onChange={e => setItemSearch(e.target.value)} />
              <select className="mb-filter-select" value={itemFilterVersion} onChange={e => { setItemFilterVersion(e.target.value); setItemFilterCategory(''); }}>
                <option value="">All buffet versions</option>
                {buffetVersions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
              <select className="mb-filter-select" value={itemFilterCategory} onChange={e => setItemFilterCategory(e.target.value)}>
                <option value="">All categories</option>
                {itemFilterCategoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {(itemSearch || itemFilterVersion || itemFilterCategory) &&
                <button className="mb-filter-clear" onClick={() => { setItemSearch(''); setItemFilterVersion(''); setItemFilterCategory(''); }}>Clear</button>
              }
              <span className="mb-filter-count">{filteredItems.length} of {menuItems.length}</span>
            </div>

            {filteredItems.length === 0
              ? <p className="mb-empty">{menuItems.length === 0 ? 'No menu items yet' : 'No items match your filters'}</p>
              : filteredItems.map(item => (
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
