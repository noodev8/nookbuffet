'use client';

import { useEffect, useState } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import useSave from '../lib/useSave';

export default function SandwichSettingsPage() {
  return (
    <AdminShell roles={['admin']}>
      <SandwichSettings />
    </AdminShell>
  );
}

// Lengths staff can choose for a collection time slot, in minutes
const SLOT_LENGTHS = [5, 10, 15, 20, 30, 45, 60];
// How long before their collection time customers must order, in minutes
const NOTICE_LENGTHS = [0, 10, 15, 20, 30, 45, 60, 90, 120];
const noticeLabel = (m) => (m === 0 ? 'No minimum' : m < 60 ? `${m} minutes` : m === 60 ? '1 hour' : `${m / 60} hours`);

const toForm = (settings) => ({
  price: parseFloat(settings.base_price).toFixed(2),
  open: settings.open_time,
  close: settings.close_time,
  minutes: String(settings.slot_minutes),
  capacity: String(settings.slot_capacity),
  notice: String(settings.notice_minutes),
  maxSandwiches: String(settings.max_sandwiches),
});

/**
 * Rules for sandwich orders: the base price, the opening times, and how collection
 * slots work. The sandwich steps and options are on the Menu page.
 */
function SandwichSettings() {
  const { api } = useAdmin();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const { saving, formError, setFormError, save } = useSave((settings) => {
    setSaved(toForm(settings));
    setForm(toForm(settings));
    setToast('Settings saved');
    setTimeout(() => setToast(''), 3000);
  });

  useEffect(() => {
    api('/api/sandwiches/manage')
      .then(data => {
        if (data.return_code !== 'SUCCESS') {
          setError(data.message || 'Failed to load the sandwich settings');
          return;
        }
        setSaved(toForm(data.data.settings));
        setForm(toForm(data.data.settings));
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="notice">Loading sandwich settings...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const changed = Object.keys(form).some(key => form[key] !== saved[key]);

  const capacity = Number(form.capacity);

  const submit = (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return setFormError('Enter the price of a sandwich before extras, e.g. 5.00');
    if (!form.open || !form.close) return setFormError('Enter the collection hours, e.g. 11:00 to 14:00');
    if (form.open >= form.close) return setFormError('Collection must finish after it starts');
    const onFiveMinutes = (time) => Number(time.split(':')[1]) % 5 === 0;
    if (!onFiveMinutes(form.open) || !onFiveMinutes(form.close)) {
      return setFormError('Collection hours must be on a 5-minute mark, e.g. 11:00 or 13:45');
    }
    if (!Number.isInteger(capacity) || capacity < 1) return setFormError('Orders per time slot must be 1 or more');
    const maxSandwiches = Number(form.maxSandwiches);
    if (!Number.isInteger(maxSandwiches) || maxSandwiches < 1 || maxSandwiches > 100) {
      return setFormError('Most sandwiches in one order must be between 1 and 100');
    }
    save(() => api('/api/sandwiches/manage/settings', {
      method: 'PATCH',
      body: {
        base_price: price,
        open_time: form.open,
        close_time: form.close,
        slot_minutes: Number(form.minutes),
        slot_capacity: capacity,
        notice_minutes: Number(form.notice),
        max_sandwiches: maxSandwiches
      }
    }));
  };

  return (
    <form onSubmit={submit}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Sandwich Settings</h1>
          <p className="page-sub">
            Price and collection rules for sandwich orders. To change the breads, fillings and extras, use the Menu page.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Price</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="base-price">Base price (£)</label>
            <input id="base-price" className="input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
            <span className="field-hint">What a sandwich costs before any extras</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Opening times</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="open-time">Collection from</label>
            <input id="open-time" className="input" type="time" step="300" value={form.open} onChange={set('open')} />
            <span className="field-hint">First time customers can collect</span>
          </div>
          <div className="field">
            <label htmlFor="close-time">Collection until</label>
            <input id="close-time" className="input" type="time" step="300" value={form.close} onChange={set('close')} />
            <span className="field-hint">The last time slot starts before this</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Collection rules</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="slot-minutes">Time slot length</label>
            <select id="slot-minutes" className="input" value={form.minutes} onChange={set('minutes')}>
              {SLOT_LENGTHS.map(m => <option key={m} value={m}>{m} minutes</option>)}
            </select>
            <span className="field-hint">Customers pick a collection time every this many minutes</span>
          </div>
          <div className="field">
            <label htmlFor="slot-capacity">Orders per time slot</label>
            <input id="slot-capacity" className="input" type="number" min="1" step="1" value={form.capacity} onChange={set('capacity')} />
            <span className="field-hint">Once a time slot has this many orders, customers have to pick another time</span>
          </div>
          <div className="field">
            <label htmlFor="notice-minutes">Order at least</label>
            <select id="notice-minutes" className="input" value={form.notice} onChange={set('notice')}>
              {NOTICE_LENGTHS.map(m => <option key={m} value={m}>{noticeLabel(m)}</option>)}
            </select>
            <span className="field-hint">How long before their collection time customers must order, so there is time to make it</span>
          </div>
          <div className="field">
            <label htmlFor="max-sandwiches">Most sandwiches in one order</label>
            <input id="max-sandwiches" className="input" type="number" min="1" max="100" step="1" value={form.maxSandwiches} onChange={set('maxSandwiches')} />
            <span className="field-hint">Customers wanting more than this are asked to call the shop</span>
          </div>
        </div>
      </div>

      {formError && <div className="form-error">{formError}</div>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving || !changed}>{saving ? 'Saving...' : 'Save settings'}</button>
        {changed && (
          <button className="btn" type="button" onClick={() => { setForm(saved); setFormError(''); }} disabled={saving}>Undo changes</button>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </form>
  );
}
