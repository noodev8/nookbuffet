/*
=======================================================================================================================================
BUFFET ORDER - Checks and prices the buffets in an order
=======================================================================================================================================
The website sends each buffet as the buffet version, number of people, menu items and upgrades picked. Prices
are worked out here from the current buffet and upgrade prices, never taken from the browser.
=======================================================================================================================================
*/

const toPennies = (value) => Math.round((parseFloat(value) || 0) * 100);

const toIdList = (value) => (Array.isArray(value) ? value.map(Number).filter(id => Number.isInteger(id) && id > 0) : []);

const cleanText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/**
 * @param {array} rawBuffets - [{ buffetVersionId, numPeople, items, upgrades: [{ upgradeId, selectedItems }], notes, ... }]
 * @param {array} versions - active buffet versions [{ id, title, price_per_person }]
 * @param {array} upgradeLinks - active upgrades offered with those versions [{ buffet_version_id, id, name, price_per_person }]
 * @returns {{ error: string } | { buffets: array, total: number }}
 */
const checkBuffets = (rawBuffets, versions, upgradeLinks) => {
  const versionsById = new Map(versions.map(v => [v.id, v]));

  const buffets = [];
  let totalPennies = 0;

  for (const raw of rawBuffets) {
    const version = versionsById.get(Number(raw?.buffetVersionId));
    if (!version) {
      return { error: 'One of the buffets in your basket is no longer available. Please remove it and choose again.' };
    }

    const numPeople = Number(raw.numPeople);
    if (!Number.isInteger(numPeople) || numPeople < 1) {
      return { error: 'Each buffet needs the number of people' };
    }

    const items = toIdList(raw.items);
    if (items.length === 0) {
      return { error: 'Each buffet must have at least one menu item selected' };
    }

    if (raw.upgrades !== undefined && raw.upgrades !== null && !Array.isArray(raw.upgrades)) {
      return { error: 'Upgrades must be a list' };
    }

    const upgrades = [];
    for (const rawUpgrade of raw.upgrades || []) {
      const upgrade = upgradeLinks.find(u => u.buffet_version_id === version.id && u.id === Number(rawUpgrade?.upgradeId));
      if (!upgrade) {
        return { error: `An upgrade on your ${version.title} is no longer available. Please remove the buffet and choose again.` };
      }
      if (upgrades.some(u => u.upgradeId === upgrade.id)) continue;
      upgrades.push({
        upgradeId: upgrade.id,
        name: upgrade.name,
        pricePerPerson: toPennies(upgrade.price_per_person) / 100,
        subtotal: (toPennies(upgrade.price_per_person) * numPeople) / 100,
        selectedItems: toIdList(rawUpgrade.selectedItems)
      });
    }

    // The buffet's total includes its upgrades
    const perPersonPennies = toPennies(version.price_per_person) +
      upgrades.reduce((sum, u) => sum + toPennies(u.pricePerPerson), 0);
    const subtotalPennies = perPersonPennies * numPeople;
    totalPennies += subtotalPennies;

    buffets.push({
      buffetVersionId: version.id,
      buffetName: version.title,
      numPeople,
      pricePerPerson: toPennies(version.price_per_person) / 100,
      totalPrice: subtotalPennies / 100,
      items,
      upgrades,
      notes: cleanText(raw.notes),
      dietaryInfo: cleanText(raw.dietaryInfo),
      allergens: cleanText(raw.allergens)
    });
  }

  return { buffets, total: totalPennies / 100 };
};

module.exports = { checkBuffets };
