'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { formatDateTime } from '../lib/format';

const ADMINS_ONLY = ['admin'];

const ROLES = [
  { value: 'general', label: 'General', help: 'orders and prep summary' },
  { value: 'admin', label: 'Admin', help: 'everything, including the menu, prices, upgrades and staff accounts' },
];

const EMPTY_FORM = { full_name: '', username: '', email: '', password: '', role: 'general' };

export default function StaffPage() {
  return (
    <AdminShell roles={ADMINS_ONLY}>
      <StaffList />
    </AdminShell>
  );
}

function StaffList() {
  const { api, user } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // null = no form open, 'new' = adding, otherwise the staff member being edited
  const [editing, setEditing] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api('/api/auth/users');
      if (data.return_code === 'SUCCESS') {
        setUsers(data.data || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to load staff');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadUsers only sets state after its fetch resolves
    loadUsers();
  }, [loadUsers]);

  const deleteUser = async (staffUser) => {
    if (!confirm(`Delete ${staffUser.full_name}? They will no longer be able to log in. This cannot be undone.`)) return;
    try {
      const data = await api(`/api/auth/users/${staffUser.id}`, { method: 'DELETE' });
      if (data.return_code === 'SUCCESS') setUsers(prev => prev.filter(u => u.id !== staffUser.id));
      else alert(data.message || 'Could not delete this staff member');
    } catch {
      alert('Could not reach the server. Please try again.');
    }
  };

  if (loading) return <div className="notice">Loading staff...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-sub">Who can log in to this portal.</p>
        </div>
        {editing === null && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Add staff member</button>
          </div>
        )}
      </div>

      {editing === 'new' && (
        <StaffForm onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); loadUsers(); }} />
      )}

      <div className="card">
        {users.length === 0 && <p className="card-sub">No staff yet.</p>}
        {users.map(staffUser => (
          editing?.id === staffUser.id ? (
            <StaffForm
              key={staffUser.id}
              existing={staffUser}
              onCancel={() => setEditing(null)}
              onSaved={() => { setEditing(null); loadUsers(); }}
            />
          ) : (
            <div key={staffUser.id} className="staff-row">
              <div>
                <div className="staff-name">
                  {staffUser.full_name}{' '}
                  <span className="badge">{ROLES.find(r => r.value === staffUser.role)?.label || staffUser.role}</span>{' '}
                  {!staffUser.is_active && <span className="badge badge-unpaid">Inactive</span>}
                </div>
                <div className="staff-info">{staffUser.email} · username {staffUser.username}</div>
              </div>
              <div className="staff-info">Last login: {formatDateTime(staffUser.last_login)}</div>
              <div>
                <button className="btn-link" onClick={() => setEditing(staffUser)}>Edit</button>
                {staffUser.email !== user.email && (
                  <button className="btn-link danger" onClick={() => deleteUser(staffUser)}>Delete</button>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
}

function StaffForm({ existing, onCancel, onSaved }) {
  const { api } = useAdmin();
  const [form, setForm] = useState(existing
    ? { full_name: existing.full_name, username: existing.username, email: existing.email, password: '', role: existing.role }
    : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const body = { ...form };
      if (existing && !body.password) delete body.password; // blank = keep current password
      const data = existing
        ? await api(`/api/auth/users/${existing.id}`, { method: 'PUT', body })
        : await api('/api/auth/users', { method: 'POST', body });
      if (data.return_code === 'SUCCESS') onSaved();
      else setFormError(data.message || 'Could not save');
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>{existing ? `Edit ${existing.full_name}` : 'Add staff member'}</h2>
      {formError && <div className="form-error">{formError}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" className="input" value={form.full_name} onChange={set} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" value={form.email} onChange={set} required />
          <span className="field-hint">Their login code is sent here</span>
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" className="input" value={form.username} onChange={set} required />
        </div>
        <div className="field">
          <label htmlFor="password">{existing ? 'New password' : 'Password'}</label>
          <input
            id="password" name="password" type="password" className="input" minLength={6}
            value={form.password} onChange={set} required={!existing}
            placeholder={existing ? 'Leave blank to keep current' : 'At least 6 characters'}
          />
        </div>
        <div className="field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" className="input" value={form.role} onChange={set}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="field field-wide role-help">
          {ROLES.map(r => <div key={r.value}><strong>{r.label}:</strong> {r.help}</div>)}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : existing ? 'Save changes' : 'Add staff member'}</button>
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
