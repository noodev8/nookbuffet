'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../components/AdminShell';
import { money } from '../lib/format';

/**
 * Upgrades are optional extras (e.g. Continental) offered after a customer builds a buffet.
 * Each upgrade has categories of items; a category either includes everything or lets the
 * customer choose a set number.
 */
export default function UpgradesPanel({ versions, showToast }) {
  const { api } = useAdmin();
  const [upgrades, setUpgrades] = useState([]);
  const [links, setLinks] = useState({}); // { upgradeId: Set of buffet ids it is offered with }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/upgrades/manage');
      if (data.return_code !== 'SUCCESS') {
        setError(data.message || 'Failed to load upgrades');
        return;
      }
      const list = data.data || [];
      const linkResults = await Promise.all(list.map(u => api(`/api/upgrades/manage/${u.id}/buffets`)));
      setLinks(Object.fromEntries(list.map((u, i) => [
        u.id,
        new Set((linkResults[i].data || []).filter(bv => bv.is_linked).map(bv => bv.id)),
      ])));
      setUpgrades(list);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load only sets state after its fetches resolve
    load();
  }, [load]);

  if (loading) return <div className="notice">Loading upgrades...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const updateUpgrade = (id, change) => setUpgrades(prev => prev.map(u => (u.id === id ? change(u) : u)));

  return (
    <>
      <p className="page-sub" style={{ marginBottom: '1rem' }}>
        Extras customers are offered after building their buffet. Tick which buffets each upgrade is offered with.
      </p>

      {adding ? (
        <UpgradeForm
          onCancel={() => setAdding(false)}
          onSaved={(created) => {
            setUpgrades(prev => [...prev, { ...created, categories: [] }]);
            setLinks(prev => ({ ...prev, [created.id]: new Set() }));
            setAdding(false);
            showToast(`${created.name} created`);
          }}
        />
      ) : (
        <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setAdding(true)}>+ New upgrade</button>
      )}

      {upgrades.length === 0 && !adding && <div className="notice">No upgrades yet.</div>}

      {upgrades.map(upgrade => (
        <UpgradeCard
          key={upgrade.id}
          upgrade={upgrade}
          versions={versions}
          linked={links[upgrade.id] || new Set()}
          setLinked={(set) => setLinks(prev => ({ ...prev, [upgrade.id]: set }))}
          update={(change) => updateUpgrade(upgrade.id, change)}
          onDeleted={() => setUpgrades(prev => prev.filter(u => u.id !== upgrade.id))}
          showToast={showToast}
        />
      ))}
    </>
  );
}

function UpgradeCard({ upgrade, versions, linked, setLinked, update, onDeleted, showToast }) {
  const { api } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // category id or 'new'
  const [editingItem, setEditingItem] = useState(null); // item id or `new-${catId}`

  const toggleLink = async (buffetId) => {
    const isLinked = linked.has(buffetId);
    const data = await api(`/api/upgrades/manage/buffet/${buffetId}/upgrade/${upgrade.id}`, { method: isLinked ? 'DELETE' : 'POST' });
    if (data.return_code === 'SUCCESS') {
      const next = new Set(linked);
      if (isLinked) next.delete(buffetId); else next.add(buffetId);
      setLinked(next);
    } else {
      alert(data.message || 'Could not change this');
    }
  };

  const remove = async (path, question, onDone) => {
    if (!confirm(question)) return;
    const data = await api(path, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') onDone();
    else alert(data.message || 'Could not delete');
  };

  if (editing) {
    return (
      <UpgradeForm
        existing={upgrade}
        onCancel={() => setEditing(false)}
        onSaved={(saved) => { update(u => ({ ...u, ...saved })); setEditing(false); showToast(`${saved.name} saved`); }}
      />
    );
  }

  return (
    <div className="card menu-cat">
      <div className="menu-cat-head">
        <div className="grow">
          <h3>{upgrade.name}</h3>
          <span className="card-sub">+{money(upgrade.price_per_person)} per person</span>
        </div>
        <button className="btn-link" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn-link danger" onClick={() => remove(
          `/api/upgrades/manage/${upgrade.id}`,
          `Delete the "${upgrade.name}" upgrade? Customers will no longer be offered it. Past orders are not affected.`,
          () => { onDeleted(); showToast(`${upgrade.name} deleted`); }
        )}>Delete</button>
      </div>

      <div className="menu-cat-body">
        {upgrade.description && <p className="card-sub" style={{ marginTop: '0.5rem' }}>{upgrade.description}</p>}

        <div style={{ margin: '0.75rem 0' }}>
          <div className="detail-label" style={{ marginBottom: '0.3rem' }}>Offered with</div>
          <div className="link-list">
            {versions.map(v => (
              <label key={v.id} className="check">
                <input type="checkbox" checked={linked.has(v.id)} onChange={() => toggleLink(v.id)} />
                {v.title}
              </label>
            ))}
          </div>
        </div>

        {upgrade.categories.map(cat => (
          <div key={cat.id} style={{ marginTop: '0.75rem' }}>
            {editingCat === cat.id ? (
              <UpgradeCategoryForm
                upgradeId={upgrade.id}
                existing={cat}
                onCancel={() => setEditingCat(null)}
                onSaved={(saved) => {
                  update(u => ({ ...u, categories: u.categories.map(c => (c.id === saved.id ? { ...c, ...saved } : c)) }));
                  setEditingCat(null);
                }}
              />
            ) : (
              <div className="menu-item" style={{ borderBottom: 'none' }}>
                <div className="grow">
                  <strong>{cat.name}</strong>{' '}
                  <span className="badge">{cat.num_choices ? `Choose ${cat.num_choices}` : 'All included'}</span>{' '}
                  {cat.is_required && <span className="badge">Required</span>}
                </div>
                <button className="btn-link" onClick={() => setEditingCat(cat.id)}>Edit</button>
                <button className="btn-link danger" onClick={() => remove(
                  `/api/upgrades/manage/categories/${cat.id}`,
                  `Delete "${cat.name}" and its items from this upgrade?`,
                  () => update(u => ({ ...u, categories: u.categories.filter(c => c.id !== cat.id) }))
                )}>Delete</button>
              </div>
            )}

            <div style={{ paddingLeft: '1rem' }}>
              {cat.items.map(item => (
                editingItem === item.id ? (
                  <UpgradeItemForm
                    key={item.id}
                    catId={cat.id}
                    existing={item}
                    onCancel={() => setEditingItem(null)}
                    onSaved={(saved) => {
                      update(u => ({ ...u, categories: u.categories.map(c => (c.id === cat.id ? { ...c, items: c.items.map(i => (i.id === saved.id ? { ...i, ...saved } : i)) } : c)) }));
                      setEditingItem(null);
                    }}
                  />
                ) : (
                  <div key={item.id} className="menu-item">
                    <div className="grow">
                      <span className="menu-item-name">{item.name}</span>
                      {item.description && <span className="menu-item-info"> · {item.description}</span>}
                    </div>
                    <button className="btn-link" onClick={() => setEditingItem(item.id)}>Edit</button>
                    <button className="btn-link danger" onClick={() => remove(
                      `/api/upgrades/manage/items/${item.id}`,
                      `Delete "${item.name}"?`,
                      () => update(u => ({ ...u, categories: u.categories.map(c => (c.id === cat.id ? { ...c, items: c.items.filter(i => i.id !== item.id) } : c)) }))
                    )}>Delete</button>
                  </div>
                )
              ))}
              {editingItem === `new-${cat.id}` ? (
                <UpgradeItemForm
                  catId={cat.id}
                  onCancel={() => setEditingItem(null)}
                  onSaved={(created) => {
                    update(u => ({ ...u, categories: u.categories.map(c => (c.id === cat.id ? { ...c, items: [...c.items, created] } : c)) }));
                    setEditingItem(null);
                  }}
                />
              ) : (
                <button className="btn-link" onClick={() => setEditingItem(`new-${cat.id}`)}>+ Add item</button>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '0.75rem' }}>
          {editingCat === 'new' ? (
            <UpgradeCategoryForm
              upgradeId={upgrade.id}
              onCancel={() => setEditingCat(null)}
              onSaved={(created) => {
                update(u => ({ ...u, categories: [...u.categories, { ...created, items: [] }] }));
                setEditingCat(null);
              }}
            />
          ) : (
            <button className="btn btn-sm" onClick={() => setEditingCat('new')}>+ Add category</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Small shared submit helper for the three upgrade forms
function useSave(onSaved) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const save = async (request) => {
    setSaving(true);
    setFormError('');
    try {
      const data = await request();
      if (data.return_code === 'SUCCESS') onSaved(data.data);
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return { saving, formError, setFormError, save };
}

function UpgradeForm({ existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave(onSaved);
  const [form, setForm] = useState({
    name: existing?.name || '',
    price: existing ? parseFloat(existing.price_per_person).toFixed(2) : '',
    description: existing?.description || '',
  });

  const submit = (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name.trim()) return setFormError('Give the upgrade a name');
    if (isNaN(price) || price < 0) return setFormError('Enter the extra price per person, e.g. 3.50');
    const body = { name: form.name.trim(), description: form.description.trim() || null, price_per_person: price };
    save(() => (existing
      ? api(`/api/upgrades/manage/${existing.id}`, { method: 'PATCH', body })
      : api('/api/upgrades/manage', { method: 'POST', body })));
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>{existing ? `Edit ${existing.name}` : 'New upgrade'}</h2>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Name</label>
          <input className="input" placeholder="e.g. Continental" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="field">
          <label>Extra price per person (£)</label>
          <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div className="field field-wide">
          <label>Description (optional)</label>
          <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Create upgrade'}</button>
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

function UpgradeCategoryForm({ upgradeId, existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave(onSaved);
  const [form, setForm] = useState({
    name: existing?.name || '',
    numChoices: existing?.num_choices ? String(existing.num_choices) : '',
    isRequired: existing?.is_required === true,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Give the category a name');
    const body = {
      name: form.name.trim(),
      description: existing?.description || null,
      num_choices: form.numChoices ? parseInt(form.numChoices) : null,
      is_required: form.isRequired,
    };
    save(() => (existing
      ? api(`/api/upgrades/manage/categories/${existing.id}`, { method: 'PATCH', body })
      : api(`/api/upgrades/manage/${upgradeId}/categories`, { method: 'POST', body })));
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Category name</label>
          <input className="input" placeholder="e.g. Pastries" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
        </div>
        <div className="field">
          <label>How many can they choose?</label>
          <input className="input" type="number" min="1" placeholder="Blank = all included" value={form.numChoices}
            onChange={e => setForm(p => ({ ...p, numChoices: e.target.value }))} />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <label className="check">
            <input type="checkbox" checked={form.isRequired} onChange={e => setForm(p => ({ ...p, isRequired: e.target.checked }))} />
            Must choose the full amount
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add category'}</button>
        <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

function UpgradeItemForm({ catId, existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave(onSaved);
  const [form, setForm] = useState({ name: existing?.name || '', description: existing?.description || '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Give the item a name');
    const body = { name: form.name.trim(), description: form.description.trim() || null };
    save(() => (existing
      ? api(`/api/upgrades/manage/items/${existing.id}`, { method: 'PATCH', body })
      : api(`/api/upgrades/manage/categories/${catId}/items`, { method: 'POST', body })));
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Item name</label>
          <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
        </div>
        <div className="field">
          <label>Description (optional)</label>
          <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add item'}</button>
        <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
