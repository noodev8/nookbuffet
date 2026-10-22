'use client';

import { useEffect, useState } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { money } from '../lib/format';
import useSave from '../lib/useSave';

export default function SandwichesPage() {
  return (
    <AdminShell roles={['admin']}>
      <Sandwiches />
    </AdminShell>
  );
}

// Staff see "sections" (Bread, Meat...) and "items" (Ham, Chicken...).
// In the API these are steps and options.

const hasCharge = (section) =>
  section.included_choices !== null && section.included_choices !== undefined && parseFloat(section.extra_choice_price) > 0;

// "Customers must choose 1 · Free" / "Optional · First 1 free, then £0.40 each"
const describeSection = (section) => {
  const choose = section.min_choices > 0
    ? (section.max_choices === 1 ? 'Customers must choose 1' : 'Customers must choose at least 1')
    : (section.max_choices === 1 ? 'Optional · choose 1' : 'Optional');
  let price = 'Free';
  if (hasCharge(section)) {
    price = section.included_choices === 0
      ? `${money(section.extra_choice_price)} each`
      : `First ${section.included_choices} free, then ${money(section.extra_choice_price)} each`;
  }
  return `${choose} · ${price}`;
};

/**
 * The build-your-own sandwich menu. Day to day, staff tap an item to mark it sold out
 * or back in stock. "Change" on a section opens everything else about it.
 */
function Sandwiches() {
  const { api } = useAdmin();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changing, setChanging] = useState(null); // id of the section being changed
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api('/api/sandwiches/manage')
      .then(data => {
        if (data.return_code !== 'SUCCESS') {
          setError(data.message || 'Failed to load the sandwich menu');
          return;
        }
        setSections(data.data.steps);
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="notice">Loading sandwich menu...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const updateSection = (id, change) => setSections(prev => prev.map(s => (s.id === id ? change(s) : s)));

  // Swap a section with its neighbour and save the new order
  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const withPositions = reordered.map((s, position) => ({ ...s, position }));
    setSections(withPositions);
    const data = await api('/api/sandwiches/manage/steps/reorder', {
      method: 'PATCH',
      body: withPositions.map(s => ({ id: s.id, position: s.position })),
    }).catch(() => null);
    if (data?.return_code !== 'SUCCESS') showToast('Could not save the new order — please refresh and try again');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Sandwich Menu</h1>
          <p className="page-sub">
            <strong>Tap an item to mark it sold out.</strong> Tap it again when it&apos;s back in stock.
            To add, rename or remove items, press <strong>Change</strong> on that section.
          </p>
        </div>
      </div>

      {sections.length === 0 && !adding && <div className="notice">The menu is empty — add the first section below, e.g. Bread.</div>}

      {sections.map((section, index) => (
        changing === section.id ? (
          <ChangeSection
            key={section.id}
            section={section}
            isFirst={index === 0}
            isLast={index === sections.length - 1}
            onMove={(direction) => move(index, direction)}
            update={(change) => updateSection(section.id, change)}
            onDeleted={() => { setSections(prev => prev.filter(s => s.id !== section.id)); setChanging(null); }}
            onDone={() => setChanging(null)}
            showToast={showToast}
          />
        ) : (
          <SectionCard
            key={section.id}
            section={section}
            update={(change) => updateSection(section.id, change)}
            onChange={() => setChanging(section.id)}
          />
        )
      ))}

      {adding ? (
        <AddSection
          onCancel={() => setAdding(false)}
          onAdded={(created) => {
            setSections(prev => [...prev, { ...created, options: [] }]);
            setAdding(false);
            setChanging(created.id); // straight into adding its items
            showToast(`${created.name} added — now add its items`);
          }}
        />
      ) : (
        <button className="btn" onClick={() => setAdding(true)}>+ Add a new section</button>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ===== A SECTION, AS STAFF SEE IT DAY TO DAY =====
// Each item is a big button that switches between in stock and sold out
function SectionCard({ section, update, onChange }) {
  const { api } = useAdmin();
  const [busy, setBusy] = useState(null);

  const toggleStock = async (item) => {
    setBusy(item.id);
    try {
      const data = await api(`/api/sandwiches/manage/options/${item.id}/stock`, { method: 'PATCH', body: { is_active: !item.is_active } });
      if (data.return_code === 'SUCCESS') update(s => ({ ...s, options: s.options.map(o => (o.id === item.id ? data.data : o)) }));
      else alert(data.message || 'Could not change that item');
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const soldOut = section.options.filter(o => !o.is_active).length;

  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h2 className="card-title">{section.name}</h2>
          <p className="card-sub">{describeSection(section)}</p>
        </div>
        {soldOut > 0 && <span className="badge badge-unpaid">{soldOut} sold out</span>}
        <button className="btn" onClick={onChange}>Change</button>
      </div>

      {section.options.length === 0 ? (
        <p className="card-sub">No items yet — press Change to add some.</p>
      ) : (
        <div className="item-grid">
          {section.options.map(item => (
            <button
              key={item.id}
              type="button"
              className={`item-tile${item.is_active ? '' : ' sold-out'}`}
              onClick={() => toggleStock(item)}
              disabled={busy === item.id}
              aria-pressed={!item.is_active}
            >
              <span className="item-tile-name">{item.name}</span>
              <span className="item-tile-state">{item.is_active ? 'In stock' : 'Sold out'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== CHANGING A SECTION =====
// The section's details and price at the top, saved with one button. Items below are
// added, renamed and removed straight away.
function ChangeSection({ section, isFirst, isLast, onMove, update, onDeleted, onDone, showToast }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave((saved) => {
    update(s => ({ ...s, ...saved }));
    showToast(`${saved.name} saved`);
  });
  const toForm = (s) => ({
    name: s.name,
    required: s.min_choices > 0,
    charge: hasCharge(s),
    free: hasCharge(s) ? String(s.included_choices) : '0',
    price: hasCharge(s) ? parseFloat(s.extra_choice_price).toFixed(2) : '0.40',
    note: s.description || '',
  });
  const [form, setForm] = useState(() => toForm(section));
  const saved = toForm(section);
  const changed = Object.keys(form).some(key => form[key] !== saved[key]);
  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Give the section a name, e.g. Meat');
    const free = Number(form.free);
    const price = parseFloat(form.price);
    if (form.charge) {
      if (form.free === '' || !Number.isInteger(free) || free < 0) return setFormError('Enter how many are free — 0 if every one costs extra');
      if (isNaN(price) || price <= 0) return setFormError('Enter what each extra costs, e.g. 0.40');
    }
    save(() => api(`/api/sandwiches/manage/steps/${section.id}`, {
      method: 'PATCH',
      body: {
        name: form.name.trim(),
        description: form.note.trim() || null,
        min_choices: form.required ? 1 : 0,
        max_choices: section.max_choices, // Bread and Toasted? stay choose 1
        included_choices: form.charge ? free : null,
        extra_choice_price: form.charge ? price : 0,
      }
    }));
  };

  const deleteSection = async () => {
    if (!confirm(`Delete the whole "${section.name}" section and its ${section.options.length} items?\n\nCustomers won't see it any more.`)) return;
    const data = await api(`/api/sandwiches/manage/steps/${section.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      onDeleted();
      showToast(`${section.name} deleted`);
    } else {
      alert(data.message || 'Could not delete this section');
    }
  };

  return (
    <div className="card section-changing">
      <div className="section-head">
        <h2 className="card-title">Changing {section.name}</h2>
        <button className="btn btn-primary" onClick={onDone}>Done</button>
      </div>

      <form onSubmit={submit}>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor={`section-name-${section.id}`}>Section name</label>
            <input id={`section-name-${section.id}`} className="input" value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor={`section-note-${section.id}`}>Note for customers (optional)</label>
            <input id={`section-note-${section.id}`} className="input" placeholder="e.g. Ask us about gluten free" value={form.note} onChange={set('note')} />
          </div>
          <div className="field field-wide">
            <label className="check">
              <input type="checkbox" checked={form.required} onChange={set('required')} />
              Customers must choose from this section
            </label>
          </div>
          <div className="field field-wide">
            <label className="check">
              <input type="checkbox" checked={form.charge} onChange={set('charge')} />
              Charge extra for this section
            </label>
            {form.charge && (
              <div className="price-sentence">
                The first
                <input className="input" type="number" min="0" step="1" value={form.free} onChange={set('free')} aria-label="How many are free" />
                are free, then each one costs £
                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} aria-label="Price of each extra" />
              </div>
            )}
            <span className="field-hint">
              {form.charge ? 'Put 0 free if every one costs extra, like cheese' : 'Everything in this section is included in the sandwich price'}
            </span>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving || !changed}>{saving ? 'Saving...' : 'Save changes'}</button>
          {changed && <button className="btn" type="button" onClick={() => { setForm(saved); setFormError(''); }}>Undo</button>}
        </div>
      </form>

      <h3 className="section-subtitle">Items</h3>
      {section.options.map(item => (
        <ItemRow key={item.id} item={item} update={update} showToast={showToast} />
      ))}
      <AddItem sectionId={section.id} update={update} showToast={showToast} />

      <div className="section-footer">
        <span className="card-sub">Where it shows on the menu:</span>
        <button className="btn btn-sm" onClick={() => onMove(-1)} disabled={isFirst}>↑ Move up</button>
        <button className="btn btn-sm" onClick={() => onMove(1)} disabled={isLast}>↓ Move down</button>
        <span className="spacer" />
        <button className="btn btn-sm btn-danger" onClick={deleteSection}>Delete section</button>
      </div>
    </div>
  );
}

// One item while changing a section: its name can be changed, or it can be removed
function ItemRow({ item, update, showToast }) {
  const { api } = useAdmin();
  const [name, setName] = useState(item.name);
  const [busy, setBusy] = useState(false);
  const renamed = name.trim() && name.trim() !== item.name;

  const rename = async (e) => {
    e.preventDefault();
    if (!renamed) return;
    setBusy(true);
    try {
      // Send the rest back as it is
      const data = await api(`/api/sandwiches/manage/options/${item.id}`, {
        method: 'PATCH',
        body: { name: name.trim(), description: item.description, extra_price: item.extra_price },
      });
      if (data.return_code === 'SUCCESS') {
        update(s => ({ ...s, options: s.options.map(o => (o.id === item.id ? data.data : o)) }));
        showToast(`Renamed to ${data.data.name}`);
      } else {
        alert(data.message || 'Could not rename this item');
      }
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Remove "${item.name}" from the menu?\n\nIf it has just run out, press Done and tap it to mark it sold out instead.`)) return;
    const data = await api(`/api/sandwiches/manage/options/${item.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      update(s => ({ ...s, options: s.options.filter(o => o.id !== item.id) }));
      showToast(`${item.name} removed`);
    } else {
      alert(data.message || 'Could not remove this item');
    }
  };

  return (
    <form className="item-row" onSubmit={rename}>
      <input className="input" value={name} onChange={e => setName(e.target.value)} aria-label={`Name of ${item.name}`} />
      {renamed && <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>Save name</button>}
      <button className="btn btn-sm btn-danger" type="button" onClick={remove} disabled={busy}>Remove</button>
    </form>
  );
}

function AddItem({ sectionId, update, showToast }) {
  const { api } = useAdmin();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const data = await api(`/api/sandwiches/manage/steps/${sectionId}/options`, { method: 'POST', body: { name: name.trim() } });
      if (data.return_code === 'SUCCESS') {
        update(s => ({ ...s, options: [...s.options, data.data] }));
        setName('');
        showToast(`${data.data.name} added`);
      } else {
        alert(data.message || 'Could not add this item');
      }
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="item-row item-row-add" onSubmit={add}>
      <input className="input" placeholder="New item, e.g. Pastrami" value={name} onChange={e => setName(e.target.value)} />
      <button className="btn btn-primary btn-sm" type="submit" disabled={busy || !name.trim()}>+ Add</button>
    </form>
  );
}

// A new section only needs a name to start with - the rest is set while changing it
function AddSection({ onCancel, onAdded }) {
  const { api } = useAdmin();
  const [name, setName] = useState('');
  const { saving, formError, setFormError, save } = useSave(onAdded);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Give the section a name, e.g. Pickles');
    save(() => api('/api/sandwiches/manage/steps', { method: 'POST', body: { name: name.trim(), min_choices: 0 } }));
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>New section</h2>
      {formError && <div className="form-error">{formError}</div>}
      <div className="item-row">
        <input className="input" placeholder="e.g. Pickles" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add section'}</button>
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
