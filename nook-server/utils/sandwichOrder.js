/*
=======================================================================================================================================
SANDWICH ORDER - Checks and prices the sandwiches in an order
=======================================================================================================================================
The website sends each sandwich as the option IDs the customer picked. Prices are worked out here from
the current menu, never taken from the browser, and every step's min/max picks are checked again.
=======================================================================================================================================
*/

const MAX_QUANTITY = 50;

const toPennies = (value) => Math.round(parseFloat(value) * 100);

/**
 * @param {array} rawSandwiches - [{ quantity, notes, optionIds: [1, 5, 9] }] from the request
 * @param {array} steps - the customer sandwich menu (in-stock options only), from sandwichModel.getMenuForCustomers
 * @param {string|number} basePrice - price of a sandwich before extras
 * @returns {{ error: string } | { sandwiches: array, total: number }}
 */
const checkSandwiches = (rawSandwiches, steps, basePrice) => {
  // Look up every in-stock option, remembering which step it belongs to and where it sits on the menu
  const optionsById = new Map();
  let menuIndex = 0;
  for (const step of steps) {
    for (const option of step.options) optionsById.set(option.id, { option, step, menuIndex: menuIndex++ });
  }

  const sandwiches = [];
  let totalPennies = 0;

  for (const raw of rawSandwiches) {
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: `Each sandwich needs a quantity between 1 and ${MAX_QUANTITY}` };
    }

    const optionIds = Array.isArray(raw.optionIds) ? raw.optionIds.map(Number) : [];
    if (new Set(optionIds).size !== optionIds.length) return { error: 'A sandwich has the same option picked twice' };

    const picked = [];
    for (const id of optionIds) {
      const found = optionsById.get(id);
      if (!found) return { error: 'Something in one of your sandwiches is no longer available. Please rebuild it.' };
      picked.push(found);
    }

    for (const step of steps) {
      const count = picked.filter(p => p.step === step).length;
      if (count < step.min_choices) {
        return { error: `Please choose ${step.min_choices === 1 ? 'an option' : `at least ${step.min_choices}`} for ${step.name}` };
      }
      if (step.max_choices !== null && count > step.max_choices) {
        return { error: `You can choose up to ${step.max_choices} for ${step.name}` };
      }
    }

    // Keep the picks in menu order, whatever order they were sent in
    picked.sort((a, b) => a.menuIndex - b.menuIndex);

    const unitPennies = toPennies(basePrice) + picked.reduce((sum, p) => sum + toPennies(p.option.extra_price), 0);
    const subtotalPennies = unitPennies * quantity;
    totalPennies += subtotalPennies;

    sandwiches.push({
      quantity,
      unitPrice: unitPennies / 100,
      subtotal: subtotalPennies / 100,
      notes: typeof raw.notes === 'string' && raw.notes.trim() ? raw.notes.trim() : null,
      options: picked.map((p, position) => ({
        optionId: p.option.id,
        stepName: p.step.name,
        optionName: p.option.name,
        extraPrice: parseFloat(p.option.extra_price),
        position
      }))
    });
  }

  return { sandwiches, total: totalPennies / 100 };
};

module.exports = { checkSandwiches, MAX_QUANTITY };
