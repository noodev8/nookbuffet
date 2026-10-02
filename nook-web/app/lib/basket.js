// The basket lives in localStorage under 'basketData' as an array of entries.
// Buffet entries are the original shape (no type). Sandwich entries look like:
// {
//   type: 'sandwich',
//   quantity: 2,
//   optionIds: [3, 8, 12],                                   // what is sent to the server
//   picks: [{ stepName: 'Bread', optionName: 'White', extraPrice: 0 }, ...],  // for display
//   unitPrice: 5.5,
//   totalPrice: 11,
//   notes: ''
// }

export const isSandwich = (entry) => entry?.type === 'sandwich';

export const readBasket = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('basketData'));
    if (!parsed) return [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
};

export const saveBasket = (basket) => {
  if (basket.length === 0) localStorage.removeItem('basketData');
  else localStorage.setItem('basketData', JSON.stringify(basket));
};

export const money = (value) => `£${(Number(value) || 0).toFixed(2)}`;

// "Bread: White · Fillings: Ham, Cheese"
export const describeSandwich = (picks) => {
  const byStep = [];
  for (const pick of picks || []) {
    const last = byStep[byStep.length - 1];
    if (last && last.step === pick.stepName) last.names.push(pick.optionName);
    else byStep.push({ step: pick.stepName, names: [pick.optionName] });
  }
  return byStep.map(s => `${s.step}: ${s.names.join(', ')}`).join(' · ');
};
