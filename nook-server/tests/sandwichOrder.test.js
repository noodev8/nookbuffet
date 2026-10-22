// Unit tests for pricing sandwiches by step: base price covers any bread, 1 meat and 3 salad,
// cheese is 40p each, a second meat or fourth salad is 40p, sauce and toasted are free.

const { checkSandwiches } = require('../utils/sandwichOrder');

const option = (id, name) => ({ id, name, extra_price: '0.00' });

const STEPS = [
  { id: 1, name: 'Bread', min_choices: 1, max_choices: 1, included_choices: null, extra_choice_price: '0.00',
    options: [option(1, 'White'), option(2, 'Ciabatta')] },
  { id: 2, name: 'Meat', min_choices: 0, max_choices: 2, included_choices: 1, extra_choice_price: '0.40',
    options: [option(10, 'Ham'), option(11, 'Chicken')] },
  { id: 3, name: 'Cheese', min_choices: 0, max_choices: 2, included_choices: 0, extra_choice_price: '0.40',
    options: [option(20, 'Cheddar'), option(21, 'Brie')] },
  { id: 4, name: 'Salad', min_choices: 0, max_choices: null, included_choices: 3, extra_choice_price: '0.40',
    options: [option(30, 'Lettuce'), option(31, 'Tomato'), option(32, 'Onion'), option(33, 'Cucumber'), option(34, 'Peppers')] },
  { id: 5, name: 'Sauce', min_choices: 0, max_choices: 3, included_choices: null, extra_choice_price: '0.00',
    options: [option(40, 'Mayo'), option(41, 'Mustard')] },
];

const price = (optionIds, quantity = 1) => checkSandwiches([{ quantity, optionIds }], STEPS, '5.00');

describe('checkSandwiches pricing by step', () => {
  test('bread, 1 meat, 3 salad and sauces are all in the base price', () => {
    expect(price([2, 10, 30, 31, 32, 40, 41]).total).toBe(5);
  });

  test('every cheese is 40p', () => {
    expect(price([1, 20]).total).toBe(5.4);
    expect(price([1, 20, 21]).total).toBe(5.8);
  });

  test('a second meat is 40p', () => {
    expect(price([1, 10, 11]).total).toBe(5.4);
  });

  test('each salad after 3 is 40p', () => {
    expect(price([1, 30, 31, 32, 33, 34]).total).toBe(5.8);
  });

  test('saves what each pick added, putting the extra on the picks after the included ones', () => {
    const { sandwiches } = price([1, 11, 10, 20], 2);
    expect(sandwiches[0].options.map(o => [o.optionName, o.extraPrice])).toEqual([
      ['White', 0], ['Ham', 0], ['Chicken', 0.4], ['Cheddar', 0.4]
    ]);
    expect(sandwiches[0]).toMatchObject({ unitPrice: 5.8, subtotal: 11.6 });
  });

  test('an option can still have its own extra on top', () => {
    const steps = STEPS.map(s => (s.id === 1 ? { ...s, options: [{ ...s.options[1], extra_price: '0.50' }] } : s));
    expect(checkSandwiches([{ quantity: 1, optionIds: [2] }], steps, '5.00').total).toBe(5.5);
  });
});
