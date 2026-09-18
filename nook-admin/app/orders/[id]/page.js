'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { useAdmin } from '../../components/AdminShell';
import {
  formatDate, formatDateTime, money, peopleCount, isPaid, paymentLabel, groupByCategory
} from '../../lib/format';

export default function OrderPage() {
  return (
    <AdminShell>
      <OrderDetails />
    </AdminShell>
  );
}

function OrderDetails() {
  const { api } = useAdmin();
  const router = useRouter();
  const { id: orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    api(`/api/orders/${orderId}`)
      .then(data => {
        if (data.return_code === 'SUCCESS') {
          setOrder(data.data);
          setStaffNotes(data.data.staff_notes || '');
        } else {
          setError(data.return_code === 'NOT_FOUND' ? 'Order not found' : data.message || 'Failed to load order');
        }
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api, orderId]);

  if (loading) return <div className="notice">Loading order...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const isOpen = order.status !== 'completed' && order.status !== 'cancelled';

  const togglePaid = async () => {
    const newStatus = order.payment_status === 'paid' ? 'unpaid' : 'paid';
    if (newStatus === 'unpaid' && !confirm('Mark this order as unpaid?')) return;
    setBusy(true);
    try {
      const data = await api(`/api/orders/${orderId}/payment-status`, { method: 'PATCH', body: { payment_status: newStatus } });
      if (data.return_code === 'SUCCESS') setOrder(prev => ({ ...prev, payment_status: data.data.payment_status }));
      else alert(data.message || 'Could not update payment');
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // 'completed' emails the customer that their order is ready to collect
  const setStatus = async (status, question) => {
    if (!confirm(question)) return;
    setBusy(true);
    try {
      const data = await api(`/api/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
      if (data.return_code === 'SUCCESS') router.push('/');
      else alert(data.message || 'Could not update the order');
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveNotes = async () => {
    setBusy(true);
    try {
      const data = await api(`/api/orders/${orderId}/staff-notes`, { method: 'PATCH', body: { staff_notes: staffNotes } });
      if (data.return_code === 'SUCCESS') {
        setOrder(prev => ({ ...prev, staff_notes: staffNotes }));
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 3000);
      } else {
        alert(data.message || 'Could not save the note');
      }
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link href="/" className="back-link no-print">← All orders</Link>

      <div className="page-head">
        <div>
          <h1 className="page-title">
            {order.order_number}{' '}
            <span className={`badge ${isPaid(order) ? 'badge-paid' : 'badge-unpaid'}`}>{paymentLabel(order)}</span>{' '}
            {!isOpen && <span className="badge">{order.status === 'completed' ? 'Completed' : 'Cancelled'}</span>}
          </h1>
          <p className="page-sub">
            Collect <strong>{formatDate(order.fulfillment_date)}{order.fulfillment_time ? ` at ${order.fulfillment_time}` : ''}</strong>
            {' · '}{peopleCount(order)} people · {money(order.total_price)}
          </p>
        </div>
      </div>

      <div className="card action-bar no-print">
        <button className={order.payment_status === 'paid' ? 'btn' : 'btn btn-success'} onClick={togglePaid} disabled={busy}>
          {order.payment_status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
        </button>
        {isOpen && (
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => setStatus('completed', 'Mark this order as ready?\n\nThe customer will be emailed that it is ready to collect, and it will leave the orders list.')}
          >
            Order ready — email customer
          </button>
        )}
        <button className="btn" onClick={() => window.print()}>Print</button>
        <span className="spacer" />
        {isOpen && (
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={() => setStatus('cancelled', 'Cancel this order? It will leave the orders list. The customer is not emailed.')}
          >
            Cancel order
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Customer</h2>
        <div className="detail-grid">
          <Detail label="Business" value={order.notes || '—'} />
          <Detail label="Email" value={<a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>} />
          <Detail label="Phone" value={order.customer_phone ? <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a> : '—'} />
          <Detail label="Address" value={order.fulfillment_address || '—'} />
          <Detail label="Ordered" value={formatDateTime(order.created_at)} />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Note to customer</h2>
        <p className="card-sub" style={{ marginBottom: '0.5rem' }}>The customer sees this in their order history.</p>
        <div className="no-print">
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. We have swapped your wraps for sandwiches today"
            value={staffNotes}
            onChange={e => setStaffNotes(e.target.value)}
          />
          <div className="form-actions">
            <button className="btn btn-sm" onClick={saveNotes} disabled={busy || staffNotes === (order.staff_notes || '')}>Save note</button>
            {notesSaved && <span className="badge badge-paid" style={{ alignSelf: 'center' }}>Saved</span>}
          </div>
        </div>
        <p className="print-only">{order.staff_notes || '—'}</p>
      </div>

      {(order.buffets || []).map((buffet, i) => (
        <div key={buffet.id || i} className="card">
          <h2 className="card-title">{buffet.buffet_name || `Buffet ${i + 1}`}</h2>
          <p className="buffet-meta">
            {buffet.num_people} people × {money(buffet.price_per_person)} = {money(buffet.subtotal)}
          </p>

          {buffet.dietary_info && <div className="note-box"><strong>Dietary:</strong> {buffet.dietary_info}</div>}
          {buffet.allergens && <div className="note-box"><strong>Allergens:</strong> {buffet.allergens}</div>}
          {buffet.notes && <div className="note-box"><strong>Notes:</strong> {buffet.notes}</div>}

          <div className="item-columns">
            {Object.entries(groupByCategory(buffet.items)).map(([cat, items]) => (
              <div key={cat}>
                <div className="item-cat">{cat}</div>
                <ul className="item-list">
                  {items.map(item => <li key={item.id}>{item.item_name}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {(buffet.upgrades || []).filter(u => u.upgrade_name).map(upgrade => (
            <div key={upgrade.id} className="upgrade-box">
              <strong>+ {upgrade.upgrade_name}</strong> — {upgrade.num_people} × {money(upgrade.price_per_person)} = {money(upgrade.subtotal)}
              {Object.entries(groupByCategory(upgrade.selectedItems)).map(([cat, items]) => (
                <div key={cat}>{cat}: {items.map(item => item.item_name).join(', ')}</div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}
