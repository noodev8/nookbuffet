'use client';
/* eslint-disable @next/next/no-img-element -- previews of pictures hosted on the customer website, not this app */

import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminShell, { WEB_URL, useAdmin } from '../components/AdminShell';
import ImagePicker, { BUILT_IN_IMAGES } from './ImagePicker';
import UpgradesPanel from './UpgradesPanel';
import { money } from '../lib/format';

export default function MenuPage() {
  return (
    <AdminShell>
      <Menu />
    </AdminShell>
  );
}

const byPosition = (a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name);

// The kids buffet only shows one picture per category on the website
const isKidsBuffet = (version) => version?.title?.toLowerCase().includes('kids');

const IMAGE_FIELDS = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4'];

function Menu() {
  const { api, user } = useAdmin();
  const canEdit = user.role === 'admin' || user.role === 'manager';

  const [versions, setVersions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [images, setImages] = useState(BUILT_IN_IMAGES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(null); // a buffet id, 'upgrades' or 'new'
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([api('/api/buffet-versions/manage'), api('/api/menu'), api('/api/menu/manage')])
      .then(([v, c, i]) => {
        const failed = [v, c, i].find(res => res.return_code !== 'SUCCESS');
        if (failed) {
          setError(failed.message || 'Failed to load the menu');
          return;
        }
        setVersions(v.data || []);
        setCategories((c.data || []).map(({ items: _items, ...cat }) => cat));
        setItems(i.data || []);
        setTab(v.data?.[0]?.id ?? (canEdit ? 'new' : null));
        // Also offer any uploaded pictures that categories are already using
        const inUse = (c.data || []).flatMap(cat => IMAGE_FIELDS.map(f => cat[f])).filter(Boolean);
        setImages(prev => [...new Set([...prev, ...inUse])]);
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api, canEdit]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="notice">Loading menu...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const version = versions.find(v => v.id === tab);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Menu</h1>
          <p className="page-sub">
            {canEdit
              ? 'Pick a buffet to change its price, categories and items. Changes show on the website straight away.'
              : 'Mark items out of stock to take them off the website until they are back.'}
          </p>
        </div>
      </div>

      <div className="tabs">
        {versions.map(v => (
          <button key={v.id} className={`tab${tab === v.id ? ' active' : ''}`} onClick={() => setTab(v.id)}>{v.title}</button>
        ))}
        {canEdit && <button className={`tab${tab === 'upgrades' ? ' active' : ''}`} onClick={() => setTab('upgrades')}>Upgrades</button>}
        {canEdit && <button className={`tab tab-add${tab === 'new' ? ' active' : ''}`} onClick={() => setTab('new')}>+ New buffet</button>}
      </div>

      {tab === 'new' && (
        <BuffetForm
          onCancel={versions.length ? () => setTab(versions[0].id) : null}
          onSaved={(created) => {
            setVersions(prev => [...prev, created]);
            setTab(created.id);
            showToast(`${created.title} created — now add its categories`);
          }}
        />
      )}

      {tab === 'upgrades' && <UpgradesPanel versions={versions} showToast={showToast} />}

      {version && (
        <BuffetView
          key={version.id}
          version={version}
          categories={categories.filter(c => c.buffet_version_id === version.id).sort(byPosition)}
          items={items}
          canEdit={canEdit}
          images={images}
          setImages={setImages}
          setVersions={setVersions}
          setCategories={setCategories}
          setItems={setItems}
          showToast={showToast}
          onDeleted={() => {
            const rest = versions.filter(v => v.id !== version.id);
            setVersions(rest);
            setTab(rest[0]?.id ?? 'new');
          }}
        />
      )}

      {versions.length === 0 && !canEdit && <div className="notice">No buffets set up yet.</div>}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ===== ONE BUFFET: price, categories and items =====
function BuffetView({ version, categories, items, canEdit, images, setImages, setVersions, setCategories, setItems, showToast, onDeleted }) {
  const { api } = useAdmin();
  const [editingBuffet, setEditingBuffet] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const deleteBuffet = async () => {
    const catIds = new Set(categories.map(c => c.id));
    const itemCount = items.filter(i => catIds.has(i.category_id)).length;
    if (!confirm(`Delete "${version.title}"?\n\nIts ${categories.length} categories and ${itemCount} items go too, and customers can no longer order it. Past orders are not affected.`)) return;
    const data = await api(`/api/buffet-versions/manage/${version.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      setCategories(prev => prev.filter(c => c.buffet_version_id !== version.id));
      onDeleted();
      showToast(`${version.title} deleted`);
    } else {
      alert(data.message || 'Could not delete this buffet');
    }
  };

  const reorder = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = categories.findIndex(c => c.id === active.id);
    const to = categories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(categories, from, to).map((c, position) => ({ ...c, position }));
    setCategories(prev => prev.map(c => reordered.find(r => r.id === c.id) ?? c));
    const data = await api('/api/menu/manage/categories/reorder', {
      method: 'PATCH',
      body: reordered.map(c => ({ id: c.id, position: c.position })),
    }).catch(() => null);
    if (data?.return_code !== 'SUCCESS') showToast('Could not save the new order — please refresh and try again');
  };

  return (
    <>
      {editingBuffet ? (
        <BuffetForm
          existing={version}
          onCancel={() => setEditingBuffet(false)}
          onSaved={(updated) => {
            setVersions(prev => prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
            setEditingBuffet(false);
            showToast('Buffet saved');
          }}
        />
      ) : (
        <div className="card">
          <div className="card-head" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="card-title">{version.title}</h2>
              {version.description && <p className="card-sub">{version.description}</p>}
              <p className="price-line"><strong>{money(version.price_per_person)}</strong> per person</p>
            </div>
            {canEdit && (
              <div className="page-actions">
                <button className="btn" onClick={() => setEditingBuffet(true)}>Edit name / price</button>
                <button className="btn btn-danger" onClick={deleteBuffet}>Delete buffet</button>
              </div>
            )}
          </div>
        </div>
      )}

      {categories.length === 0 && <div className="notice">No categories yet{canEdit ? ' — add the first one below.' : '.'}</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              version={version}
              items={items.filter(i => i.category_id === category.id).sort((a, b) => a.name.localeCompare(b.name))}
              canEdit={canEdit}
              images={images}
              setImages={setImages}
              setCategories={setCategories}
              setItems={setItems}
              showToast={showToast}
            />
          ))}
        </SortableContext>
      </DndContext>

      {canEdit && (addingCategory ? (
        <CategoryForm
          version={version}
          nextPosition={categories.length ? Math.max(...categories.map(c => c.position ?? 0)) + 1 : 0}
          images={images}
          setImages={setImages}
          onCancel={() => setAddingCategory(false)}
          onSaved={(created) => {
            setCategories(prev => [...prev, created]);
            setAddingCategory(false);
            showToast(`${created.name} added`);
          }}
        />
      ) : (
        <button className="btn" onClick={() => setAddingCategory(true)}>+ Add category</button>
      ))}
    </>
  );
}

// ===== CATEGORY CARD with its items =====
function CategoryCard({ category, version, items, canEdit, images, setImages, setCategories, setItems, showToast }) {
  const { api } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null); // an item id, or 'new'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: !canEdit || editing,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative', zIndex: isDragging ? 10 : 'auto' };

  const outOfStock = items.filter(i => !i.is_active).length;
  const pictures = (isKidsBuffet(version) ? IMAGE_FIELDS.slice(0, 1) : IMAGE_FIELDS).map(f => category[f]);

  const deleteCategory = async () => {
    if (!confirm(`Delete the "${category.name}" category and its ${items.length} items?\n\nPast orders are not affected.`)) return;
    const data = await api(`/api/menu/manage/categories/${category.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      setCategories(prev => prev.filter(c => c.id !== category.id));
      showToast(`${category.name} deleted`);
    } else {
      alert(data.message || 'Could not delete this category');
    }
  };

  const toggleStock = async (item) => {
    const data = await api(`/api/menu/manage/${item.id}`, { method: 'PATCH', body: { is_active: !item.is_active } });
    if (data.return_code === 'SUCCESS') {
      setItems(prev => prev.map(i => (i.id === item.id ? { ...i, is_active: !item.is_active } : i)));
    } else {
      alert(data.message || 'Could not change stock');
    }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}" from the menu?\n\nIf it is just sold out, use "Out of stock" instead. Past orders are not affected.`)) return;
    const data = await api(`/api/menu/manage/items/${item.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast(`${item.name} deleted`);
    } else {
      alert(data.message || 'Could not delete this item');
    }
  };

  if (editing) {
    return (
      <div ref={setNodeRef} style={style}>
        <CategoryForm
          existing={category}
          version={version}
          images={images}
          setImages={setImages}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setCategories(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)));
            setEditing(false);
            showToast(`${updated.name} saved`);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="card menu-cat">
      <div className="menu-cat-head">
        {canEdit && <span className="drag-handle" {...attributes} {...listeners} title="Drag to move this category up or down">⠿</span>}
        <div className="grow">
          <h3>{category.name}</h3>
          {category.is_required && <span className="badge">Required</span>}
          {outOfStock > 0 && <span className="badge badge-unpaid">{outOfStock} out of stock</span>}
        </div>
        {canEdit && (
          <>
            <div className="thumbs">
              {pictures.map((img, i) => (img ? <img key={i} src={`${WEB_URL}${img}`} alt="" /> : <span key={i} className="thumb-empty" />))}
            </div>
            <button className="btn-link" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-link danger" onClick={deleteCategory}>Delete</button>
          </>
        )}
      </div>

      <div className="menu-cat-body">
        {items.length === 0 && <p className="card-sub" style={{ padding: '0.5rem 0' }}>No items yet.</p>}
        {items.map(item => (
          editingItemId === item.id ? (
            <ItemForm
              key={item.id}
              existing={item}
              category={category}
              onCancel={() => setEditingItemId(null)}
              onSaved={(updated) => {
                setItems(prev => prev.map(i => (i.id === updated.id ? { ...i, ...updated } : i)));
                setEditingItemId(null);
                showToast(`${updated.name} saved`);
              }}
            />
          ) : (
            <div key={item.id} className={`menu-item${item.is_active ? '' : ' out'}`}>
              <div className="grow">
                <div className="menu-item-name">{item.name}</div>
                {(item.description || item.dietary_info || item.allergens) && (
                  <div className="menu-item-info">
                    {[item.description, item.dietary_info, item.allergens && `Allergens: ${item.allergens}`].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <button className={`stock-toggle ${item.is_active ? 'in' : 'out'}`} onClick={() => toggleStock(item)} title="Click to change">
                {item.is_active ? 'In stock' : 'Out of stock'}
              </button>
              {canEdit && (
                <>
                  <button className="btn-link" onClick={() => setEditingItemId(item.id)}>Edit</button>
                  <button className="btn-link danger" onClick={() => deleteItem(item)}>Delete</button>
                </>
              )}
            </div>
          )
        ))}

        {canEdit && (editingItemId === 'new' ? (
          <ItemForm
            category={category}
            onCancel={() => setEditingItemId(null)}
            onSaved={(created) => {
              setItems(prev => [...prev, created]);
              setEditingItemId(null);
              showToast(`${created.name} added`);
            }}
          />
        ) : (
          <button className="btn btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setEditingItemId('new')}>+ Add item</button>
        ))}
      </div>
    </div>
  );
}

// ===== FORMS =====
function BuffetForm({ existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const [form, setForm] = useState({
    title: existing?.title || '',
    price: existing ? parseFloat(existing.price_per_person).toFixed(2) : '',
    description: existing?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.title.trim()) return setFormError('Give the buffet a name');
    if (isNaN(price) || price < 0) return setFormError('Enter a price per person, e.g. 12.50');
    setSaving(true);
    setFormError('');
    try {
      const body = { title: form.title.trim(), description: form.description.trim() || null, price_per_person: price };
      const data = existing
        ? await api(`/api/buffet-versions/manage/${existing.id}`, { method: 'PATCH', body })
        : await api('/api/buffet-versions/manage', { method: 'POST', body });
      if (data.return_code === 'SUCCESS') onSaved(data.data);
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>{existing ? `Edit ${existing.title}` : 'New buffet'}</h2>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="bv-title">Name</label>
          <input id="bv-title" className="input" placeholder="e.g. Premium Buffet" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="bv-price">Price per person (£)</label>
          <input id="bv-price" className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div className="field field-wide">
          <label htmlFor="bv-desc">Description (optional)</label>
          <input id="bv-desc" className="input" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Create buffet'}</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>}
      </div>
    </form>
  );
}

function CategoryForm({ existing, version, nextPosition, images, setImages, onCancel, onSaved }) {
  const { api } = useAdmin();
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    is_required: existing?.is_required === true,
    image_url: existing?.image_url || null,
    image_url_2: existing?.image_url_2 || null,
    image_url_3: existing?.image_url_3 || null,
    image_url_4: existing?.image_url_4 || null,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const slots = isKidsBuffet(version) ? IMAGE_FIELDS.slice(0, 1) : IMAGE_FIELDS;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Give the category a name');
    setSaving(true);
    setFormError('');
    try {
      const body = { ...form, name: form.name.trim(), description: form.description.trim() || null };
      const data = existing
        ? await api(`/api/menu/manage/categories/${existing.id}`, { method: 'PATCH', body: { ...body, position: existing.position ?? 0 } })
        : await api('/api/menu/manage/categories', { method: 'POST', body: { ...body, buffet_version_id: version.id, position: nextPosition } });
      if (data.return_code === 'SUCCESS') onSaved(data.data);
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>{existing ? `Edit ${existing.name}` : `New category in ${version.title}`}</h2>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="cat-name">Name</label>
          <input id="cat-name" className="input" placeholder="e.g. Sandwiches" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="cat-desc">Description (optional)</label>
          <input id="cat-desc" className="input" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="field field-wide">
          <label className="check">
            <input type="checkbox" checked={form.is_required} onChange={e => setForm(p => ({ ...p, is_required: e.target.checked }))} />
            Customers must pick from this category
          </label>
        </div>
        <div className="field field-wide">
          <label>{slots.length === 1 ? 'Picture' : 'Pictures (shown on the website)'}</label>
          <div className="img-slots">
            {slots.map((field, i) => (
              <ImagePicker
                key={field}
                label={`Picture ${i + 1}`}
                value={form[field]}
                onChange={url => setForm(p => ({ ...p, [field]: url }))}
                images={images}
                onImagesChange={setImages}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add category'}</button>
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

function ItemForm({ existing, category, onCancel, onSaved }) {
  const { api } = useAdmin();
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    dietary_info: existing?.dietary_info || '',
    allergens: existing?.allergens || '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Give the item a name');
    setSaving(true);
    setFormError('');
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        dietary_info: form.dietary_info.trim() || null,
        allergens: form.allergens.trim() || null,
        category_id: category.id,
        is_included_in_base: true,
      };
      const data = existing
        ? await api(`/api/menu/manage/items/${existing.id}`, { method: 'PATCH', body })
        : await api('/api/menu/manage/items', { method: 'POST', body });
      if (data.return_code === 'SUCCESS') onSaved({ ...data.data, category_id: category.id, category_name: category.name });
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Name</label>
          <input className="input" placeholder="e.g. Egg Mayo" value={form.name} onChange={set('name')} autoFocus />
        </div>
        <div className="field">
          <label>Description (optional)</label>
          <input className="input" value={form.description} onChange={set('description')} />
        </div>
        <div className="field">
          <label>Dietary (optional)</label>
          <input className="input" placeholder="e.g. Vegetarian" value={form.dietary_info} onChange={set('dietary_info')} />
        </div>
        <div className="field">
          <label>Allergens (optional)</label>
          <input className="input" placeholder="e.g. Gluten, Egg" value={form.allergens} onChange={set('allergens')} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add item'}</button>
        <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
