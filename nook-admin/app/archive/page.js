'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { formatDate, money, orderSize, isPaid, paymentLabel, statusLabel } from '../lib/format';

export default function ArchivePage() {
  return (
    <AdminShell>
      <Archive />
    </AdminShell>
  );
}

/**
 * Collected and cancelled orders, most recently archived first (the server sends the last 200).
 * Opening one shows the full order, with a button to restore it to the orders list.
 */
function Archive() {
  const { api } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('/api/orders?archived=true')
      .then(data => {
        if (data.return_code === 'SUCCESS') setOrders(data.data || []);
        else setError(data.message || 'Failed to load the archive');
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="notice">Loading archive...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  // Match the order number, name or email
  const term = search.trim().toLowerCase();
  const shown = term
    ? orders.filter(o => [o.order_number, o.notes, o.customer_email].some(v => v && v.toLowerCase().includes(term)))
    : orders;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Archive</h1>
          <p className="page-sub">Collected and cancelled orders, most recent first. Open one to see it in full or restore it.</p>
        </div>
      </div>

      {orders.length > 0 && (
        <input
          className="input"
          style={{ marginBottom: '1rem', maxWidth: '24rem' }}
          placeholder="Search by order number, name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {orders.length === 0 && <div className="notice">Nothing archived yet.</div>}
      {orders.length > 0 && shown.length === 0 && <div className="notice">No archived orders match “{search}”.</div>}

      {shown.map(order => (
        <Link key={order.id} href={`/orders/${order.id}`} className="order-row">
          <div className="order-row-main">
            <span className="order-row-number">
              {order.order_number}
              <span className={`badge badge-status-${order.status}`}>{statusLabel(order)}</span>
            </span>
            <span className="order-row-business">
              {order.notes || order.customer_email} · collection {formatDate(order.fulfillment_date)}
            </span>
          </div>
          <span className="order-row-people">{orderSize(order)}</span>
          <span className="order-row-total">{money(order.total_price)}</span>
          <span className={`badge ${isPaid(order) ? 'badge-paid' : 'badge-unpaid'}`}>{paymentLabel(order)}</span>
        </Link>
      ))}
    </>
  );
}
