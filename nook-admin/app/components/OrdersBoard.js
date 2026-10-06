'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from './AdminShell';
import {
  dayKey, dayLabel, isPast, formatDate, money, peopleCount, sandwichCount, isPaid, paymentLabel,
  groupByCategory, describeSandwich
} from '../lib/format';

export const hasBuffets = (order) => (order.buffets || []).length > 0;
export const hasSandwiches = (order) => (order.sandwiches || []).length > 0;

const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`;

// The settings for each screen. An order with both buffets and sandwiches shows on both.
const KINDS = {
  buffet: {
    title: 'Buffet Orders',
    includes: hasBuffets,
    empty: 'No open buffet orders right now.',
    size: (order) => plural(peopleCount(order), 'person', 'people'),
    // Mixed orders: flag the sandwiches so they aren't missed
    other: (order) => hasSandwiches(order) && `+ ${plural(sandwichCount(order), 'sandwich', 'sandwiches')}`,
  },
  sandwich: {
    title: 'Sandwich Orders',
    includes: hasSandwiches,
    empty: 'No open sandwich orders right now.',
    size: (order) => plural(sandwichCount(order), 'sandwich', 'sandwiches'),
    other: (order) => hasBuffets(order) && `+ ${plural(peopleCount(order), 'person', 'people')} buffet`,
  },
};

/**
 * The open orders list, grouped by collection day. kind is 'buffet' or 'sandwich'.
 * Sandwich orders are sorted by collection time and show what to make right in the list.
 */
export default function OrdersBoard({ kind }) {
  const config = KINDS[kind];
  const { api } = useAdmin();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Open orders only (not ready and ready) - collected and cancelled ones are in the archive
  useEffect(() => {
    api('/api/orders')
      .then(data => {
        if (data.return_code === 'SUCCESS') setAllOrders(data.data || []);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="notice">Loading orders...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  const orders = allOrders.filter(config.includes);

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
  if (kind === 'sandwich') {
    for (const key of groupKeys) {
      groups[key].sort((a, b) => (a.fulfillment_time || '').localeCompare(b.fulfillment_time || ''));
    }
  }

  const unpaid = orders.filter(o => !isPaid(o));
  const unpaidTotal = unpaid.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{config.title}</h1>
          <div className="summary-strip">
            <span><strong>{orders.length}</strong> open order{orders.length !== 1 ? 's' : ''}</span>
            {unpaid.length > 0 && <span><strong>{money(unpaidTotal)}</strong> still to be paid</span>}
          </div>
        </div>
        <div className="page-actions no-print">
          {orders.length > 0 && <button className="btn" onClick={() => window.print()}>Print all</button>}
          <Link href="/archive" className="btn">Archive</Link>
        </div>
      </div>

      {orders.length === 0 && <div className="notice">{config.empty}</div>}

      <div className="no-print">
        {groupKeys.map(key => (
          <section key={key} className="day-group">
            <h2 className={`day-heading${key === 'overdue' ? ' overdue' : ''}`}>
              {key === 'overdue' ? 'Overdue — collection date has passed' : key === 'none' ? 'No date set' : dayLabel(key)}
              <span className="day-count">{plural(groups[key].length, 'order')}</span>
            </h2>
            {groups[key].map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="order-row">
                <div className="order-row-main">
                  <span className="order-row-number">
                    {kind === 'sandwich' && order.fulfillment_time && <span className="order-row-time">{order.fulfillment_time}</span>}
                    {order.order_number}
                    {order.status === 'ready' && <span className="badge badge-status-ready">Ready</span>}
                  </span>
                  <span className="order-row-business">
                    {order.notes || order.customer_email}
                    {key === 'overdue' && ` · was due ${formatDate(order.fulfillment_date)}`}
                  </span>
                </div>
                <span className="order-row-people">
                  {config.size(order)}
                  {config.other(order) && <span className="order-row-other">{config.other(order)}</span>}
                </span>
                <span className="order-row-total">{money(order.total_price)}</span>
                <span className={`badge ${isPaid(order) ? 'badge-paid' : 'badge-unpaid'}`}>{paymentLabel(order)}</span>

                {kind === 'sandwich' && (
                  <ul className="order-row-sandwiches">
                    {order.sandwiches.map(sandwich => (
                      <li key={sandwich.id}>
                        <strong>{sandwich.quantity} ×</strong> {describeSandwich(sandwich)}
                        {sandwich.notes && <em> — {sandwich.notes}</em>}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            ))}
          </section>
        ))}
      </div>

      {/* Full details of every order, only shown when printing */}
      <div className="print-only">
        {orders.map(order => <PrintedOrder key={order.id} order={order} kind={kind} />)}
      </div>
    </>
  );
}

function PrintedOrder({ order, kind }) {
  const config = KINDS[kind];
  return (
    <div className="print-order">
      <h2>{order.order_number} — {formatDate(order.fulfillment_date)}{order.fulfillment_time ? ` at ${order.fulfillment_time}` : ''}</h2>
      <p>
        {order.notes && <><strong>{order.notes}</strong> · </>}
        {order.customer_email}{order.customer_phone && ` · ${order.customer_phone}`}
      </p>
      <p>{config.size(order)} · {money(order.total_price)} · {paymentLabel(order)}</p>
      {config.other(order) && <p><strong>Also in this order:</strong> {config.other(order).replace(/^\+ /, '')}</p>}
      {order.staff_notes && <p><strong>Staff notes:</strong> {order.staff_notes}</p>}

      {kind === 'buffet' && (order.buffets || []).map((buffet, i) => (
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

      {kind === 'sandwich' && (order.sandwiches || []).map((sandwich, i) => (
        <div key={i} style={{ marginTop: '0.4rem' }}>
          <p><strong>{sandwich.quantity} × Sandwich</strong> — {describeSandwich(sandwich)}</p>
          {sandwich.notes && <p><strong>Notes:</strong> {sandwich.notes}</p>}
        </div>
      ))}
    </div>
  );
}
