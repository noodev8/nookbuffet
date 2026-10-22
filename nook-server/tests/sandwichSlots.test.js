// Unit tests for sandwich collection slots

const { slotTimes, buildSlots } = require('../utils/sandwichSlots');

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

  test('leaves out slots that have passed', () => {
    expect(buildSlots(settings, {}, '11:05').map(s => s.time)).toEqual(['11:10', '11:15']);
  });
});
