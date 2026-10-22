// Unit tests for sandwich collection slots

const { slotTimes, buildSlots, earliestSlotTime } = require('../utils/sandwichSlots');

const settings = { open_time: '11:00', close_time: '11:20', slot_minutes: 5, slot_capacity: 2 };

describe('slotTimes', () => {
  test('lists every 5 minutes from opening up to closing', () => {
    expect(slotTimes('11:00', '11:20', 5)).toEqual(['11:00', '11:05', '11:10', '11:15']);
  });

  test('uses the slot length staff set, starting each slot before closing', () => {
    expect(slotTimes('11:00', '12:00', 20)).toEqual(['11:00', '11:20', '11:40']);
    expect(slotTimes('11:00', '11:50', 20)).toEqual(['11:00', '11:20', '11:40']);
  });
});

describe('buildSlots', () => {
  test('marks slots with slot_capacity orders as full', () => {
    expect(buildSlots(settings, { '11:05': 2, '11:10': 1 })).toEqual([
      { time: '11:00', available: true },
      { time: '11:05', available: false },
      { time: '11:10', available: true },
      { time: '11:15', available: true },
    ]);
  });

  test('still full if a slot was booked before the capacity was lowered', () => {
    expect(buildSlots(settings, { '11:00': 5 })[0].available).toBe(false);
  });

  test('marks blocked slots as full', () => {
    expect(buildSlots(settings, {}, null, ['11:10']).map(s => s.available)).toEqual([true, true, false, true]);
  });

  test('only lists slots from the earliest time on', () => {
    expect(buildSlots(settings, {}, '11:10').map(s => s.time)).toEqual(['11:10', '11:15']);
  });
});

describe('earliestSlotTime', () => {
  test('adds the notice to now', () => {
    expect(earliestSlotTime('11:02', 30)).toBe('11:32');
  });

  test('with no notice, still has to be later than now', () => {
    expect(earliestSlotTime('11:05', 0)).toBe('11:06');
  });

  test('past midnight is later than every slot', () => {
    expect(earliestSlotTime('23:50', 30) > '23:55').toBe(true);
  });
});
