'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

// "Required — choose 1", "Optional", "Required" ...
const ruleLabel = ({ min_choices: min, max_choices: max }) => {
  const label = min > 0 ? 'Required' : 'Optional';
  return max === 1 ? `${label} — choose 1` : label;
};

// "All included", "1 included, then +£0.40 each", "+£0.40 each"
const pricingLabel = ({ included_choices: included, extra_choice_price: price }) => {
  if (included === null || included === undefined || !(parseFloat(price) > 0)) return 'All included';
  return included === 0 ? `+${money(price)} each` : `${included} included, then +${money(price)} each`;
};

// An option's own extra, on top of the step's pricing - most have none
const extraLabel = (price) => (parseFloat(price) > 0 ? `+${money(price)} on top` : null);

/**
 * The build-your-own sandwich menu. Customers go through the steps in order
 * (bread, fillings, sauce, toasted...), picking options within each step's limits.
 * A sandwich costs the base price plus the extras on whatever they pick.
 */
function Sandwiches() {
  const { api } = useAdmin();
  const [basePrice, setBasePrice] = useState(null);
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
        setBasePrice(data.data.settings.base_price);
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
          <h1 className="page-title">Sandwich Menu</h1>
          <p className="page-sub">
            The build-your-own sandwich menu. Customers build a sandwich by going through these steps in order. Each option can add to the base price.
          </p>
        </div>
      </div>

      {/* Price and collection rules live on their own Settings page */}
      <div className="card">
        <div className="card-head" style={{ marginBottom: 0 }}>
          <p className="price-line"><strong>{money(basePrice)}</strong> per sandwich, plus extras</p>
          <Link href="/sandwich-settings" className="btn">Price and collection settings</Link>
        </div>
      </div>

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
            <span className="badge">{ruleLabel(step)}</span>{' '}
            <span className="badge">{pricingLabel(step)}</span>
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
    required: existing ? existing.min_choices > 0 : false,
    included: existing?.included_choices != null ? String(existing.included_choices) : '',
    extraPrice: existing && parseFloat(existing.extra_choice_price) > 0 ? parseFloat(existing.extra_choice_price).toFixed(2) : '',
  });
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    // Required means at least 1 pick. The most a customer can pick isn't edited here any more:
    // existing steps keep theirs (Bread and Toasted? are choose 1), new steps have no limit.
    const min = form.required ? 1 : 0;
    const max = existing ? existing.max_choices : null;
    const included = form.included === '' ? null : Number(form.included);
    const extraPrice = form.extraPrice === '' ? 0 : parseFloat(form.extraPrice);
    if (!form.name.trim()) return setFormError('Give the step a name, e.g. Bread');
    if (included !== null && (!Number.isInteger(included) || included < 0)) {
      return setFormError('"Included in the base price" should be 0 or more, or blank for all of them');
    }
    if (isNaN(extraPrice) || extraPrice < 0) return setFormError('Enter what each extra costs, e.g. 0.40, or leave it blank');
    if (included !== null && extraPrice === 0) return setFormError('Enter what each extra costs, or leave "Included in the base price" blank');
    const body = {
      name: form.name.trim(), description: form.description.trim() || null, min_choices: min, max_choices: max,
      included_choices: included, extra_choice_price: included === null ? 0 : extraPrice
    };
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
          <label htmlFor="step-included">Included in the base price</label>
          <input id="step-included" name="included" className="input" type="number" min="0" placeholder="All of them" value={form.included} onChange={set} />
          <span className="field-hint">How many picks are free. 0 means every pick costs extra. Leave blank if they&apos;re all free</span>
        </div>
        <div className="field">
          <label htmlFor="step-extra-price">Each extra costs (£)</label>
          <input id="step-extra-price" name="extraPrice" className="input" type="number" step="0.01" min="0" placeholder="0.00"
            value={form.extraPrice} onChange={set} disabled={form.included === ''} />
          <span className="field-hint">For every pick after the free ones</span>
        </div>
        <div className="field field-wide">
          <label htmlFor="step-description">Note for customers (optional)</label>
          <input id="step-description" name="description" className="input" placeholder="e.g. Pick up to 3 fillings" value={form.description} onChange={set} />
        </div>
        <div className="field field-wide">
          <label className="check">
            <input type="checkbox" checked={form.required} onChange={e => setForm(p => ({ ...p, required: e.target.checked }))} />
            Required — customers must pick from this step
          </label>
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
          <label htmlFor={`option-extra-${existing?.id ?? 'new'}`}>Extra on top (£)</label>
          <input id={`option-extra-${existing?.id ?? 'new'}`} name="extra" className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.extra} onChange={set} />
          <span className="field-hint">Only for an option that costs more than the rest, on top of the step&apos;s price. Usually blank</span>
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
