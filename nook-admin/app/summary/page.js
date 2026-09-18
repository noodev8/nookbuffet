'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { dayKey, dayLabel, isPast, peopleCount } from '../lib/format';

export default function SummaryPage() {
  return (
    <AdminShell>
      <PrepSummary />
    </AdminShell>
  );
}

// Totals up every item across a day's orders: { category: { item: { orders, people } } }
const buildSummary = (dayOrders) => {
  const summary = {};
  const add = (cat, name, people) => {
    summary[cat] = summary[cat] || {};
    summary[cat][name] = summary[cat][name] || { orders: 0, people: 0 };
    summary[cat][name].orders += 1;
    summary[cat][name].people += people;
  };

  for (const order of dayOrders) {
    for (const buffet of order.buffets || []) {
      const people = buffet.num_people || 0;
      for (const item of buffet.items || []) add(item.category_name || 'Other', item.item_name || 'Unknown item', people);
      for (const upgrade of buffet.upgrades || []) {
        for (const item of upgrade.selectedItems || []) add(item.category_name || 'Upgrades', item.item_name || 'Unknown item', people);
      }
    }
  }
  return summary;
};

function PrepSummary() {
  const { api } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/orders')
      .then(data => {
        if (data.return_code === 'SUCCESS') setOrders(data.data || []);
        else setError(data.message || 'Failed to load orders');
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="notice">Loading prep summary...</div>;
  if (error) return <div className="notice notice-error">{error}</div>;

  // Only today onwards - overdue orders are flagged on the Orders page instead
  const days = {};
  let overdue = 0;
  for (const order of orders) {
    const key = dayKey(order.fulfillment_date) || 'none';
    if (isPast(key)) { overdue += 1; continue; }
    (days[key] = days[key] || []).push(order);
  }
  const dayKeys = Object.keys(days).sort();

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Prep Summary</h1>
          <p className="page-sub">Everything that needs making, added up per collection day.</p>
        </div>
        {dayKeys.length > 0 && (
          <div className="page-actions no-print">
            <button className="btn" onClick={() => window.print()}>Print</button>
          </div>
        )}
      </div>

      {overdue > 0 && (
        <div className="note-box no-print">
          {overdue} overdue order{overdue !== 1 ? 's are' : ' is'} not included here — see <Link href="/" style={{ textDecoration: 'underline' }}>Orders</Link>.
        </div>
      )}

      {dayKeys.length === 0 && <div className="notice">Nothing to prepare — no upcoming orders.</div>}

      {dayKeys.map(key => {
        const dayOrders = days[key];
        const summary = buildSummary(dayOrders);
        const people = dayOrders.reduce((sum, o) => sum + peopleCount(o), 0);

        return (
          <div key={key} className="card">
            <div className="card-head">
              <h2 className="card-title">{key === 'none' ? 'No date set' : dayLabel(key)}</h2>
              <span className="card-sub">
                {dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''} · {people} people
              </span>
            </div>

            <div className="prep-grid">
              {Object.keys(summary).sort().map(cat => (
                <div key={cat} className="prep-cat">
                  <h3>{cat}</h3>
                  {Object.entries(summary[cat])
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([name, info]) => (
                      <div key={name} className="prep-row">
                        <span>{name}</span>
                        <span>{info.people} people · {info.orders} order{info.orders !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            <div className="chip-list no-print">
              {dayOrders.map(order => (
                <Link key={order.id} href={`/orders/${order.id}`} className="chip">
                  {order.order_number}{order.fulfillment_time ? ` · ${order.fulfillment_time}` : ''}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
