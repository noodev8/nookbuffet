'use client';

import { useEffect, useState } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { dayKey, dayLabel } from '../lib/format';

export default function SandwichSlotsPage() {
  return (
    <AdminShell>
      <TimeSlots />
    </AdminShell>
  );
}

/**
 * Every collection time on the chosen day, coloured by how booked it is.
 * Staff tap a time to block it, e.g. to stop sandwich orders
 * between 13:00 and 13:30. A blocked time is full for customers, like it had filled up with
 * orders. Orders already booked in it stay as they are.
 */
function TimeSlots() {
  const { api } = useAdmin();
  const today = dayKey(new Date());
  const [date, setDate] = useState(today);
  // { date, capacity, slots: [{ time, orders, blocked, passed }] }
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);
  const [busyTime, setBusyTime] = useState(null);

  useEffect(() => {
    api(`/api/sandwiches/manage/slots?date=${date}`)
      .then(data => {
        if (data.return_code !== 'SUCCESS') return setError(data.message || 'Could not load collection times');
        setError(null);
        setDay({ date, capacity: data.data.slot_capacity, slots: data.data.slots });
      })
      .catch(() => setError('Could not reach the server. Please try again.'));
  }, [api, date]);

  const toggle = async (slot) => {
    setBusyTime(slot.time);
    try {
      const data = await api('/api/sandwiches/manage/slots', {
        method: 'PATCH',
        body: { date, time: slot.time, blocked: !slot.blocked },
      });
      if (data.return_code !== 'SUCCESS') {
        alert(data.message || 'Could not update that time');
        return;
      }
      setDay(prev => prev.date !== data.data.date ? prev : {
        ...prev,
        slots: prev.slots.map(s => ({ ...s, blocked: data.data.blocked.includes(s.time) })),
      });
    } catch {
      alert('Could not reach the server. Please try again.');
    } finally {
      setBusyTime(null);
    }
  };

  const slots = day?.date === date ? day.slots : null; // null while loading
  const blockedCount = (slots || []).filter(s => s.blocked).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Time slots</h1>
          <p className="page-sub">
            How booked each collection time is on a day. Tap a time to block it so customers can&apos;t pick it,
            and tap it again to open it back up. Orders already booked stay as they are.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-head" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label htmlFor="block-date">Day</label>
            <input id="block-date" className="input" type="date" min={today} value={date}
              onChange={e => e.target.value && setDate(e.target.value)} />
          </div>
          {slots && (
            <p className="card-sub">
              {dayLabel(date)}{blockedCount > 0 && ` · ${blockedCount} blocked`}
            </p>
          )}
        </div>

        {error && <div className="notice notice-error">{error}</div>}
        {!error && slots === null && <div className="notice">Loading collection times...</div>}
        {!error && slots && slots.length === 0 && <div className="notice">No collection times are set up.</div>}

        {!error && slots && slots.length > 0 && (
          <div className="slot-grid">
            {slots.map(slot => {
              // Red when blocked, green when full of orders, amber with some, white when empty
              const state = slot.blocked ? ' blocked' : slot.orders >= day.capacity ? ' full' : slot.orders > 0 ? ' booked' : '';
              return (
                <button
                  key={slot.time}
                  type="button"
                  className={`slot-btn${state}`}
                  disabled={slot.passed || busyTime === slot.time}
                  onClick={() => toggle(slot)}
                  aria-pressed={slot.blocked}
                >
                  <span className="slot-time">{slot.time}</span>
                  <span className="slot-info">
                    {slot.blocked ? 'Blocked' : `${slot.orders}/${day.capacity} orders`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
