/*
=======================================================================================================================================
SANDWICH SLOTS - Collection times for sandwich orders
=======================================================================================================================================
Sandwiches are collected in slots between the opening and closing times staff set in the admin portal. Staff
also set how long each slot is (slot_minutes) and how many orders each slot takes (slot_capacity), e.g. 15-minute
slots when open 11:00 - 14:00 gives 11:00, 11:15 ... 13:45.
=======================================================================================================================================
*/

// Collection hours and slot lengths are always on 5-minute marks
const TIME_STEP = 5;

const toMinutes = (time) => {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// Every slot from open_time up to (not including) close_time
const slotTimes = (openTime, closeTime, slotMinutes) => {
  const times = [];
  for (let t = toMinutes(openTime); t < toMinutes(closeTime); t += slotMinutes) times.push(fromMinutes(t));
  return times;
};

/**
 * The slots a customer can pick for one day.
 * @param {object} settings - sandwich settings (open_time, close_time, slot_minutes, slot_capacity)
 * @param {object} counts - { "12:30": 3, ... } orders already booked per slot that day
 * @param {string|null} afterTime - "HH:MM" - only slots after this (now, when the day is today)
 * @returns {array} [{ time: "12:30", available: true }, ...]
 */
const buildSlots = (settings, counts, afterTime = null) =>
  slotTimes(settings.open_time, settings.close_time, settings.slot_minutes)
    .filter(time => !afterTime || time > afterTime)
    .map(time => ({ time, available: (counts[time] || 0) < settings.slot_capacity }));

module.exports = { TIME_STEP, slotTimes, buildSlots, toMinutes };
