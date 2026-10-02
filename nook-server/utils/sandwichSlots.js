/*
=======================================================================================================================================
SANDWICH SLOTS - Collection times for sandwich orders
=======================================================================================================================================
Sandwiches are collected in 5-minute slots between the opening and closing times staff set in the admin
portal (e.g. 11:00, 11:05 ... 13:55 when open 11:00 - 14:00). Each slot takes up to slot_capacity orders.
=======================================================================================================================================
*/

const SLOT_MINUTES = 5;

const toMinutes = (time) => {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// Every slot from open_time up to (not including) close_time
const slotTimes = (openTime, closeTime) => {
  const times = [];
  for (let t = toMinutes(openTime); t < toMinutes(closeTime); t += SLOT_MINUTES) times.push(fromMinutes(t));
  return times;
};

/**
 * The slots a customer can pick for one day.
 * @param {object} settings - sandwich settings (open_time, close_time, slot_capacity)
 * @param {object} counts - { "12:30": 3, ... } orders already booked per slot that day
 * @param {string|null} afterTime - "HH:MM" - only slots after this (now, when the day is today)
 * @returns {array} [{ time: "12:30", available: true }, ...]
 */
const buildSlots = (settings, counts, afterTime = null) =>
  slotTimes(settings.open_time, settings.close_time)
    .filter(time => !afterTime || time > afterTime)
    .map(time => ({ time, available: (counts[time] || 0) < settings.slot_capacity }));

module.exports = { SLOT_MINUTES, slotTimes, buildSlots, toMinutes };
