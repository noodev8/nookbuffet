'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell, { useAdmin } from './components/AdminShell';
import {
  dayKey, dayLabel, isPast, formatDate, money, peopleCount, isPaid, paymentLabel, groupByCategory
} from './lib/format';

export default function OrdersPage() {
  return (
    <AdminShell>
      <Orders />
    </AdminShell>
  );
}

function Orders() {
  const { api } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Open orders only - completed and cancelled ones drop off this list
  useEffect(() => {
    api('/api/orders')
      .then(data => {
        if (data.return_code === 'SUCCESS') setOrders(data.data || []);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="notice">Loading orders...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  // Group by collection day. Anything from a past day that is still open goes under "Overdue".
  const groups = {};
  for (const order of orders) {
    const key = dayKey(order.fulfillment_date);
    const group = isPast(key) ? 'overdue' : key || 'none';
    (groups[group] = groups[group] || []).push(order);
  }
  const groupKeys = Object.keys(groups).sort((a, b) => {
    const rank = (k) => (k === 'overdue' ? '0' : k === 'none' ? '9' : `1${k}`);
    return rank(a).localeCompare(rank(b));
  });

  const unpaid = orders.filter(o => !isPaid(o));
  const unpaidTotal = unpaid.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Orders</h1>
          <div className="summary-strip">
            <span><strong>{orders.length}</strong> open order{orders.length !== 1 ? 's' : ''}</span>
            {unpaid.length > 0 && <span><strong>{money(unpaidTotal)}</strong> still to be paid</span>}
          </div>
        </div>
        {orders.length > 0 && (
          <div className="page-actions no-print">
            <button className="btn" onClick={() => window.print()}>Print all orders</button>
          </div>
        )}
      </div>

      {orders.length === 0 && <div className="notice">No open orders right now.</div>}

      <div className="no-print">
        {groupKeys.map(key => (
          <section key={key} className="day-group">
            <h2 className={`day-heading${key === 'overdue' ? ' overdue' : ''}`}>
              {key === 'overdue' ? 'Overdue — collection date has passed' : key === 'none' ? 'No date set' : dayLabel(key)}
              <span className="day-count">{groups[key].length} order{groups[key].length !== 1 ? 's' : ''}</span>
            </h2>
            {groups[key].map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="order-row">
                <div className="order-row-main">
                  <span className="order-row-number">{order.order_number}</span>
                  <span className="order-row-business">
                    {order.notes || order.customer_email}
                    {key === 'overdue' && ` · was due ${formatDate(order.fulfillment_date)}`}
                  </span>
                </div>
                <span className="order-row-people">{peopleCount(order)} people</span>
                <span className="order-row-total">{money(order.total_price)}</span>
                <span className={`badge ${isPaid(order) ? 'badge-paid' : 'badge-unpaid'}`}>{paymentLabel(order)}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>

      {/* Full details of every order, only shown when printing */}
      <div className="print-only">
        {orders.map(order => <PrintedOrder key={order.id} order={order} />)}
      </div>
    </>
  );
}

function PrintedOrder({ order }) {
  return (
    <div className="print-order">
      <h2>{order.order_number} — {formatDate(order.fulfillment_date)}{order.fulfillment_time ? ` at ${order.fulfillment_time}` : ''}</h2>
      <p>
        {order.notes && <><strong>{order.notes}</strong> · </>}
        {order.customer_email}{order.customer_phone && ` · ${order.customer_phone}`}
      </p>
      <p>{peopleCount(order)} people · {money(order.total_price)} · {paymentLabel(order)}</p>
      {order.staff_notes && <p><strong>Staff notes:</strong> {order.staff_notes}</p>}

      {(order.buffets || []).map((buffet, i) => (
        <div key={i} style={{ marginTop: '0.4rem' }}>
          <p><strong>{buffet.buffet_name}</strong> — {buffet.num_people} people</p>
          {Object.entries(groupByCategory(buffet.items)).map(([cat, items]) => (
            <p key={cat}>{cat}: {items.map(item => item.item_name).join(', ')}</p>
          ))}
          {(buffet.upgrades || []).filter(u => u.upgrade_name).map((upgrade, ui) => (
            <p key={ui}>
              + {upgrade.upgrade_name}
              {upgrade.selectedItems?.length > 0 && `: ${upgrade.selectedItems.map(item => item.item_name).join(', ')}`}
            </p>
          ))}
          {buffet.dietary_info && <p><strong>Dietary:</strong> {buffet.dietary_info}</p>}
          {buffet.allergens && <p><strong>Allergens:</strong> {buffet.allergens}</p>}
          {buffet.notes && <p><strong>Notes:</strong> {buffet.notes}</p>}
        </div>
      ))}
    </div>
  );
}
