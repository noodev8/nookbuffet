// Unit tests for sandwich collection slots

const { slotTimes, buildSlots } = require('../utils/sandwichSlots');

const settings = { open_time: '11:00', close_time: '11:20', slot_capacity: 2 };

describe('slotTimes', () => {
  test('lists every 5 minutes from opening up to closing', () => {
    expect(slotTimes('11:00', '11:20')).toEqual(['11:00', '11:05', '11:10', '11:15']);
  });
});

describe('buildSlots', () => {
  test('says how many more sandwiches each slot can take', () => {
    expect(buildSlots(settings, { '11:05': 2, '11:10': 1 })).toEqual([
      { time: '11:00', remaining: 2 },
      { time: '11:05', remaining: 0 },
      { time: '11:10', remaining: 1 },
      { time: '11:15', remaining: 2 },
    ]);
  });

  test('never goes below 0 if a slot was booked before the capacity was lowered', () => {
    expect(buildSlots(settings, { '11:00': 5 })[0].remaining).toBe(0);
  });

  test('leaves out slots that have passed', () => {
    expect(buildSlots(settings, {}, '11:05').map(s => s.time)).toEqual(['11:10', '11:15']);
  });
});
