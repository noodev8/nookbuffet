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

// "Choose 1", "Choose 1–3", "Optional — up to 2" ...
const ruleLabel = ({ min_choices: min, max_choices: max }) => {
  if (min === 0) return max ? `Optional — up to ${max}` : 'Optional — any number';
  if (max === min) return `Choose ${min}`;
  return max ? `Choose ${min}–${max}` : `Choose at least ${min}`;
};

const extraLabel = (price) => (parseFloat(price) > 0 ? `+${money(price)}` : 'No extra charge');

/**
 * The build-your-own sandwich menu. Customers go through the steps in order
 * (bread, fillings, sauce, toasted...), picking options within each step's limits.
 * A sandwich costs the base price plus the extras on whatever they pick.
 */
function Sandwiches() {
  const { api } = useAdmin();
  const [settings, setSettings] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingStep, setAddingStep] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api('/api/sandwiches/manage')
      .then(data => {
        if (data.return_code !== 'SUCCESS') {
          setError(data.message || 'Failed to load the sandwich menu');
          return;
        }
        setSettings(data.data.settings);
        setSteps(data.data.steps);
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

  const updateStep = (id, change) => setSteps(prev => prev.map(s => (s.id === id ? change(s) : s)));

  // Swap a step with its neighbour and save the new order
  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const withPositions = reordered.map((s, position) => ({ ...s, position }));
    setSteps(withPositions);
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
          <h1 className="page-title">Sandwiches</h1>
          <p className="page-sub">
            Customers build a sandwich by going through these steps in order. Each option can add to the base price.
          </p>
        </div>
      </div>

      <SettingsCard settings={settings} setSettings={setSettings} showToast={showToast} />

      {steps.length === 0 && !addingStep && <div className="notice">No steps yet — add the first one below, e.g. Bread.</div>}

      {steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          number={index + 1}
          isFirst={index === 0}
          isLast={index === steps.length - 1}
          onMove={(direction) => move(index, direction)}
          update={(change) => updateStep(step.id, change)}
          onDeleted={() => setSteps(prev => prev.filter(s => s.id !== step.id))}
          showToast={showToast}
        />
      ))}

      {addingStep ? (
        <div className="card">
          <StepForm
            onCancel={() => setAddingStep(false)}
            onSaved={(created) => {
              setSteps(prev => [...prev, { ...created, options: [] }]);
              setAddingStep(false);
              showToast(`${created.name} added`);
            }}
          />
        </div>
      ) : (
        <button className="btn" onClick={() => setAddingStep(true)}>+ Add step</button>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ===== BASE PRICE + ON/OFF =====
function SettingsCard({ settings, setSettings, showToast }) {
  const { api } = useAdmin();
  const [editing, setEditing] = useState(false);
  const { saving, formError, setFormError, save } = useSave((saved) => {
    setSettings(saved);
    setEditing(false);
    showToast('Settings saved');
  });
  const [form, setForm] = useState({ price: '', enabled: false });

  const startEditing = () => {
    setForm({ price: parseFloat(settings.base_price).toFixed(2), enabled: settings.enabled });
    setFormError('');
    setEditing(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return setFormError('Enter the price of a sandwich before extras, e.g. 5.00');
    save(() => api('/api/sandwiches/manage/settings', { method: 'PATCH', body: { base_price: price, enabled: form.enabled } }));
  };

  if (editing) {
    return (
      <form className="card" onSubmit={submit}>
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Sandwich settings</h2>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="base-price">Base price (£)</label>
            <input id="base-price" className="input" type="number" step="0.01" min="0" value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))} autoFocus />
            <span className="field-hint">What a sandwich costs before any extras</span>
          </div>
          <div className="field" style={{ justifyContent: 'center' }}>
            <label className="check">
              <input type="checkbox" checked={form.enabled} onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))} />
              Customers can order sandwiches
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="card">
      <div className="card-head" style={{ marginBottom: 0 }}>
        <div>
          <p className="price-line"><strong>{money(settings.base_price)}</strong> per sandwich, plus extras</p>
          <span className={`badge ${settings.enabled ? 'badge-paid' : 'badge-unpaid'}`}>
            {settings.enabled ? 'Taking sandwich orders' : 'Not taking sandwich orders'}
          </span>
        </div>
        <button className="btn" onClick={startEditing}>Edit price / on-off</button>
      </div>
    </div>
  );
}

// ===== ONE STEP with its options =====
function StepCard({ step, number, isFirst, isLast, onMove, update, onDeleted, showToast }) {
  const { api } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [editingOption, setEditingOption] = useState(null); // an option id, or 'new'

  const outOfStock = step.options.filter(o => !o.is_active).length;

  const deleteStep = async () => {
    if (!confirm(`Delete the "${step.name}" step and its ${step.options.length} options?`)) return;
    const data = await api(`/api/sandwiches/manage/steps/${step.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      onDeleted();
      showToast(`${step.name} deleted`);
    } else {
      alert(data.message || 'Could not delete this step');
    }
  };

  const toggleStock = async (option) => {
    const data = await api(`/api/sandwiches/manage/options/${option.id}/stock`, { method: 'PATCH', body: { is_active: !option.is_active } });
    if (data.return_code === 'SUCCESS') {
      update(s => ({ ...s, options: s.options.map(o => (o.id === option.id ? data.data : o)) }));
    } else {
      alert(data.message || 'Could not change stock');
    }
  };

  const deleteOption = async (option) => {
    if (!confirm(`Delete "${option.name}"?\n\nIf it has just run out, use "Out of stock" instead.`)) return;
    const data = await api(`/api/sandwiches/manage/options/${option.id}`, { method: 'DELETE' });
    if (data.return_code === 'SUCCESS') {
      update(s => ({ ...s, options: s.options.filter(o => o.id !== option.id) }));
      showToast(`${option.name} deleted`);
    } else {
      alert(data.message || 'Could not delete this option');
    }
  };

  return (
    <div className="card menu-cat">
      {editing ? (
        <div style={{ padding: '0 1.1rem' }}>
          <StepForm
            existing={step}
            onCancel={() => setEditing(false)}
            onSaved={(saved) => { update(s => ({ ...s, ...saved })); setEditing(false); showToast(`${saved.name} saved`); }}
          />
        </div>
      ) : (
        <div className="menu-cat-head">
          <div className="grow">
            <h3>{number}. {step.name}</h3>
            <span className="badge">{ruleLabel(step)}</span>
            {outOfStock > 0 && <span className="badge badge-unpaid">{outOfStock} out of stock</span>}
          </div>
          <button className="btn-link" onClick={() => onMove(-1)} disabled={isFirst} title="Move up" aria-label="Move up">↑</button>
          <button className="btn-link" onClick={() => onMove(1)} disabled={isLast} title="Move down" aria-label="Move down">↓</button>
          <button className="btn-link" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn-link danger" onClick={deleteStep}>Delete</button>
        </div>
      )}

      <div className="menu-cat-body">
        {step.description && !editing && <p className="card-sub" style={{ padding: '0.5rem 0 0' }}>{step.description}</p>}
        {step.options.length === 0 && <p className="card-sub" style={{ padding: '0.5rem 0' }}>No options yet.</p>}

        {step.options.map(option => (
          editingOption === option.id ? (
            <OptionForm
              key={option.id}
              stepId={step.id}
              existing={option}
              onCancel={() => setEditingOption(null)}
              onSaved={(saved) => {
                update(s => ({ ...s, options: s.options.map(o => (o.id === saved.id ? saved : o)) }));
                setEditingOption(null);
                showToast(`${saved.name} saved`);
              }}
            />
          ) : (
            <div key={option.id} className={`menu-item${option.is_active ? '' : ' out'}`}>
              <div className="grow">
                <div className="menu-item-name">{option.name}</div>
                <div className="menu-item-info">
                  {[extraLabel(option.extra_price), option.description].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button className={`stock-toggle ${option.is_active ? 'in' : 'out'}`} onClick={() => toggleStock(option)} title="Click to change">
                {option.is_active ? 'In stock' : 'Out of stock'}
              </button>
              <button className="btn-link" onClick={() => setEditingOption(option.id)}>Edit</button>
              <button className="btn-link danger" onClick={() => deleteOption(option)}>Delete</button>
            </div>
          )
        ))}

        {editingOption === 'new' ? (
          <OptionForm
            stepId={step.id}
            onCancel={() => setEditingOption(null)}
            onSaved={(created) => {
              update(s => ({ ...s, options: [...s.options, created] }));
              setEditingOption(null);
              showToast(`${created.name} added`);
            }}
          />
        ) : (
          <button className="btn btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setEditingOption('new')}>+ Add option</button>
        )}
      </div>
    </div>
  );
}

// ===== FORMS =====
function StepForm({ existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave(onSaved);
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    min: existing ? String(existing.min_choices) : '1',
    max: existing?.max_choices ? String(existing.max_choices) : existing ? '' : '1',
  });
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const min = form.min === '' ? 0 : parseInt(form.min);
    const max = form.max === '' ? null : parseInt(form.max);
    if (!form.name.trim()) return setFormError('Give the step a name, e.g. Bread');
    if (isNaN(min) || min < 0) return setFormError('"Must pick at least" should be 0 or more');
    if (max !== null && (isNaN(max) || max < 1)) return setFormError('"Can pick up to" should be 1 or more, or blank for no limit');
    if (max !== null && max < min) return setFormError('"Can pick up to" cannot be less than "Must pick at least"');
    const body = { name: form.name.trim(), description: form.description.trim() || null, min_choices: min, max_choices: max };
    save(() => (existing
      ? api(`/api/sandwiches/manage/steps/${existing.id}`, { method: 'PATCH', body })
      : api('/api/sandwiches/manage/steps', { method: 'POST', body })));
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="step-name">Step name</label>
          <input id="step-name" name="name" className="input" placeholder="e.g. Bread" value={form.name} onChange={set} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="step-min">Must pick at least</label>
          <input id="step-min" name="min" className="input" type="number" min="0" value={form.min} onChange={set} />
          <span className="field-hint">0 makes the step optional</span>
        </div>
        <div className="field">
          <label htmlFor="step-max">Can pick up to</label>
          <input id="step-max" name="max" className="input" type="number" min="1" placeholder="No limit" value={form.max} onChange={set} />
          <span className="field-hint">Leave blank for no limit</span>
        </div>
        <div className="field field-wide">
          <label htmlFor="step-description">Note for customers (optional)</label>
          <input id="step-description" name="description" className="input" placeholder="e.g. Pick up to 3 fillings" value={form.description} onChange={set} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add step'}</button>
        <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

function OptionForm({ stepId, existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const { saving, formError, setFormError, save } = useSave(onSaved);
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    extra: existing && parseFloat(existing.extra_price) > 0 ? parseFloat(existing.extra_price).toFixed(2) : '',
  });
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const extra = form.extra === '' ? 0 : parseFloat(form.extra);
    if (!form.name.trim()) return setFormError('Give the option a name');
    if (isNaN(extra) || extra < 0) return setFormError('Enter the extra price, e.g. 0.50, or leave it blank');
    const body = { name: form.name.trim(), description: form.description.trim() || null, extra_price: extra };
    save(() => (existing
      ? api(`/api/sandwiches/manage/options/${existing.id}`, { method: 'PATCH', body })
      : api(`/api/sandwiches/manage/steps/${stepId}/options`, { method: 'POST', body })));
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`option-name-${existing?.id ?? 'new'}`}>Option name</label>
          <input id={`option-name-${existing?.id ?? 'new'}`} name="name" className="input" placeholder="e.g. Ham" value={form.name} onChange={set} autoFocus />
        </div>
        <div className="field">
          <label htmlFor={`option-extra-${existing?.id ?? 'new'}`}>Extra price (£)</label>
          <input id={`option-extra-${existing?.id ?? 'new'}`} name="extra" className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.extra} onChange={set} />
          <span className="field-hint">Leave blank if it costs nothing extra</span>
        </div>
        <div className="field">
          <label htmlFor={`option-description-${existing?.id ?? 'new'}`}>Description (optional)</label>
          <input id={`option-description-${existing?.id ?? 'new'}`} name="description" className="input" placeholder="e.g. Contains nuts" value={form.description} onChange={set} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save' : 'Add option'}</button>
        <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
