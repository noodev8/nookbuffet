'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import './upgrade.css';

export default function UpgradePage() {
  const router = useRouter();
  const hasFetched = useRef(false);
  const hasAddedToBasket = useRef(false);

  const [pendingOrder, setPendingOrder] = useState(null);
  const [upgrade, setUpgrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({}); // { categoryId: [itemIds] }

  // Toggle item selection within a category
  const toggleItem = (categoryId, itemId, numChoices) => {
    setSelectedItems(prev => {
      const categoryItems = prev[categoryId] || [];

      let newCategoryItems;
      if (categoryItems.includes(itemId)) {
        newCategoryItems = categoryItems.filter(id => id !== itemId);
      } else {
        if (numChoices && categoryItems.length >= numChoices) {
          // Replace oldest selection
          newCategoryItems = [...categoryItems.slice(1), itemId];
        } else {
          newCategoryItems = [...categoryItems, itemId];
        }
      }

      return { ...prev, [categoryId]: newCategoryItems };
    });
  };

  // Load pending order and fetch upgrade details
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true; // Set immediately to prevent double execution

    const pending = localStorage.getItem('pendingOrder');
    if (!pending) {
      router.push('/select-buffet');
      return;
    }

    const order = JSON.parse(pending);
    setPendingOrder(order);

    const fetchUpgrade = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        // Fetch upgrades for this buffet
        const response = await fetch(`${apiUrl}/api/upgrades/buffet/${order.buffetVersionId}`);
        if (!response.ok) throw new Error('Failed to fetch upgrades');

        const data = await response.json();
        if (data.return_code === 'SUCCESS' && data.data && data.data.length > 0) {
          // Get full details for the first upgrade
          const upgradeId = data.data[0].id;
          const detailsResponse = await fetch(`${apiUrl}/api/upgrades/${upgradeId}/full`);

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData.return_code === 'SUCCESS') {
              setUpgrade(detailsData.data);
            }
          }
        } else {
          // No upgrades available, go straight to basket
          addToBasketAndRedirect(order, null);
        }
      } catch (err) {
        console.error('Error fetching upgrade:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpgrade();
  }, [router]);

  // Add order to basket and go to basket page
  const addToBasketAndRedirect = (order, upgradeData) => {
    // Guard against double execution
    if (hasAddedToBasket.current) return;

    // Double-check pendingOrder still exists (hasn't been cleared already)
    const pendingCheck = localStorage.getItem('pendingOrder');
    if (!pendingCheck) {
      console.log('pendingOrder already cleared - skipping duplicate add');
      return;
    }

    hasAddedToBasket.current = true;

    const finalOrder = { ...order };

    if (upgradeData) {
      // Collect all selected item IDs
      const allSelectedItems = [];
      for (const categoryId in selectedItems) {
        allSelectedItems.push(...selectedItems[categoryId]);
      }

      const upgradeSubtotal = parseFloat(upgrade.price_per_person) * order.numPeople;

      finalOrder.upgrades = [{
        upgradeId: upgrade.id,
        upgradeName: upgrade.name,
        pricePerPerson: parseFloat(upgrade.price_per_person),
        subtotal: upgradeSubtotal,
        selectedItems: allSelectedItems
      }];
      finalOrder.totalPrice = order.totalPrice + upgradeSubtotal;
    }

    // Clear pendingOrder FIRST to prevent any race conditions
    localStorage.removeItem('pendingOrder');

    // Get existing basket
    const existingBasket = localStorage.getItem('basketData');
    let basket = [];
    if (existingBasket) {
      try {
        const parsed = JSON.parse(existingBasket);
        basket = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        basket = [];
      }
    }

    basket.push(finalOrder);
    localStorage.setItem('basketData', JSON.stringify(basket));
    router.push('/basket');
  };

  // Skip upgrade - no thanks
  const handleNoThanks = () => {
    if (pendingOrder) {
      addToBasketAndRedirect(pendingOrder, null);
    }
  };

  // Add with upgrade
  const handleAddUpgrade = () => {
    // Validate required selections
    if (upgrade && upgrade.categories) {
      for (const category of upgrade.categories) {
        if (category.is_required && category.num_choices) {
          const selectedCount = selectedItems[category.id]?.length || 0;
          if (selectedCount < category.num_choices) {
            alert(`Please select ${category.num_choices} item(s) from "${category.name}"`);
            return;
          }
        }
      }
    }
    addToBasketAndRedirect(pendingOrder, upgrade);
  };

  if (loading) {
    return (
      <div className="welcome-page-option3">
        <div className="upgrade-page-container">
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!upgrade) {
    return null; // Will redirect
  }

  const upgradeTotal = parseFloat(upgrade.price_per_person) * (pendingOrder?.numPeople || 1);
  const buffetSubtotal = pendingOrder?.totalPrice || 0;
  const grandTotal = buffetSubtotal + upgradeTotal;

  return (
    <div className="welcome-page-option3">
      <div className="upgrade-page-container">
        <div className="upgrade-content-wrapper">

          {/* Header */}
          <div className="upgrade-page-header">
            <h1 className="upgrade-page-title">Would You Like To Add An Upgrade?</h1>
          </div>

          {/* Current Order Summary */}
          <div className="current-order-summary">
            <div className="summary-label">Your Current Total</div>
            <div className="summary-row">
              <span>Buffet ({pendingOrder?.numPeople} people)</span>
              <span>£{buffetSubtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="upgrade-showcase">
            {/* Images */}
            <div className="upgrade-images">
              <Image
                src="/assets/continental1.png"
                alt={upgrade.name}
                className="upgrade-image"
                width={400}
                height={300}
                style={{ objectFit: 'cover' }}
              />
              <Image
                src="/assets/continental2.png"
                alt={upgrade.name}
                className="upgrade-image"
                width={400}
                height={300}
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Upgrade Info */}
            <div className="upgrade-info">
              <h2 className="upgrade-name">{upgrade.name}</h2>
              {upgrade.description && (
                <p className="upgrade-description">{upgrade.description}</p>
              )}
              <div className="upgrade-pricing">
                <span className="upgrade-price-per-person">£{parseFloat(upgrade.price_per_person).toFixed(2)} per person</span>
                <span className="upgrade-total-price">Total: £{upgradeTotal.toFixed(2)} for {pendingOrder?.numPeople} people</span>
              </div>
            </div>

            {/* Categories and Items */}
            {upgrade.categories && upgrade.categories.length > 0 && (
              <div className="upgrade-categories">
                {upgrade.categories.map((category) => {
                  const selectedInCategory = selectedItems[category.id] || [];
                  const needsSelection = category.num_choices !== null;

                  return (
                    <div key={category.id} className="upgrade-category">
                      <div className="upgrade-category-header">
                        <h3 className="upgrade-category-name">{category.name}</h3>
                        {needsSelection ? (
                          <span className="upgrade-category-info">
                            Choose {category.num_choices} ({selectedInCategory.length}/{category.num_choices})
                          </span>
                        ) : (
                          <span className="upgrade-category-info included">All included</span>
                        )}
                      </div>

                      {category.items && category.items.length > 0 && (
                        <div className="upgrade-items-grid">
                          {category.items.map((item) => {
                            const isSelected = selectedInCategory.includes(item.id);
                            const isAutoIncluded = !needsSelection;

                            return (
                              <div
                                key={item.id}
                                className={`upgrade-item ${isSelected ? 'selected' : ''} ${isAutoIncluded ? 'auto-included' : 'selectable'}`}
                                onClick={() => needsSelection && toggleItem(category.id, item.id, category.num_choices)}
                              >
                                {needsSelection && (
                                  <span className="item-checkbox">{isSelected ? '✓' : ''}</span>
                                )}
                                {isAutoIncluded && <span className="item-check">✓</span>}
                                <span className="item-name">{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="upgrade-actions">
            <button className="no-thanks-button" onClick={handleNoThanks}>
              No Thanks
            </button>
            <button className="add-upgrade-button" onClick={handleAddUpgrade}>
              Add {upgrade.name} (+£{upgradeTotal.toFixed(2)})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
