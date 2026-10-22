'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { readBasket, saveBasket, money, isSandwich } from '../lib/basket';
import './sandwiches.css';

const MAX_QUANTITY = 50;

// "Choose 1", "Choose up to 3", "Optional - up to 2"...
const stepHint = (step) => {
  const { min_choices: min, max_choices: max } = step;
  if (max === 1) return min === 1 ? 'Choose 1' : 'Optional - choose 1';
  if (min === 0) return max ? `Optional - up to ${max}` : 'Optional - choose any';
  if (max === null) return min === 1 ? 'Choose at least 1' : `Choose at least ${min}`;
  if (min === max) return `Choose ${min}`;
  return `Choose ${min} to ${max}`;
};

const toPence = (value) => Math.round(parseFloat(value || 0) * 100);
const hasIncludedLimit = (step) => step.included_choices !== null && step.included_choices !== undefined;

// "1 included, then +£0.40 each", "+£0.40 each", or nothing when every pick is included
const priceHint = (step) => {
  if (!hasIncludedLimit(step) || toPence(step.extra_choice_price) === 0) return null;
  const each = `+${money(step.extra_choice_price)} each`;
  return step.included_choices === 0 ? each : `${step.included_choices} included, then ${each}`;
};

// What each pick in a step adds, in pence, in menu order - the same rule the server uses.
// The first included_choices picks only cost their own extra_price.
const pickPence = (step, options) =>
  options.map((option, i) =>
    toPence(option.extra_price) + (hasIncludedLimit(step) && i >= step.included_choices ? toPence(step.extra_choice_price) : 0));

function SandwichBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState({}); // { stepId: [optionId, ...] }
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  // Sandwiches already in the basket, not counting the one being edited
  const [inBasket, setInBasket] = useState(0);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    fetch(`${apiUrl}/api/sandwiches`)
      .then(res => res.json())
      .then(data => {
        if (data.return_code !== 'SUCCESS') {
          setError(data.message || 'Failed to load the sandwich menu');
          return;
        }
        setMenu(data.data);

        // Editing a sandwich already in the basket - put its picks back, skipping anything no longer available
        const index = editParam === null ? NaN : parseInt(editParam);
        const basket = readBasket();
        const entry = basket[index];
        setInBasket(basket.reduce((sum, e, i) => sum + (isSandwich(e) && i !== index ? e.quantity : 0), 0));
        if (isSandwich(entry)) {
          const restored = {};
          for (const step of data.data.steps) {
            const ids = step.options.map(o => o.id).filter(id => entry.optionIds.includes(id));
            if (ids.length) restored[step.id] = ids;
          }
          setSelected(restored);
          setQuantity(entry.quantity);
          setNotes(entry.notes || '');
          setEditIndex(index);
        }
      })
      .catch(() => setError('Failed to load the sandwich menu. Please try again.'))
      .finally(() => setLoading(false));
  }, [editParam]);

  const toggleOption = (step, optionId) => {
    setSelected(prev => {
      const current = prev[step.id] || [];
      let next;
      if (current.includes(optionId)) {
        next = current.filter(id => id !== optionId);
      } else if (step.max_choices === 1) {
        next = [optionId]; // works like a radio button
      } else if (step.max_choices !== null && current.length >= step.max_choices) {
        return prev; // full - the other options are disabled anyway
      } else {
        next = [...current, optionId];
      }
      return { ...prev, [step.id]: next };
    });
  };

  if (loading) return <div className="sandwich-state">Loading the sandwich menu...</div>;
  if (error) {
    return (
      <div className="sandwich-state sandwich-state-error">
        <p>{error}</p>
        <button className="sandwich-secondary-button" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  if (menu.sold_out || menu.steps.length === 0) {
    return (
      <div className="sandwich-state">
        <p>{menu.sold_out ? 'Sorry, we have sold out of sandwiches for now.' : 'Sorry, sandwiches are not available to order online right now.'}</p>
        {/* Buffets are ordered by phone for now. Online ordering label: Order a Buffet Instead */}
        <Link href="/select-buffet" className="sandwich-secondary-button">See Our Buffets</Link>
      </div>
    );
  }

  const steps = menu.steps;
  // Picks in menu order, each with what it adds to the price
  const pickedOptions = steps.flatMap(step => {
    const options = step.options.filter(o => (selected[step.id] || []).includes(o.id));
    const pence = pickPence(step, options);
    return options.map((option, i) => ({ step, option, pence: pence[i] }));
  });
  // Only so many sandwiches can be ordered online in one order, counting what's already in the basket
  const maxSandwiches = menu.max_sandwiches || MAX_QUANTITY;
  const room = Math.min(MAX_QUANTITY, maxSandwiches - inBasket);
  const qty = Math.max(1, Math.min(quantity, room));
  const unitPence = toPence(menu.base_price) + pickedOptions.reduce((sum, p) => sum + p.pence, 0);
  const totalPrice = (unitPence * qty) / 100;
  const missingSteps = steps.filter(step => (selected[step.id] || []).length < step.min_choices);

  const handleAddToBasket = () => {
    if (room < 1) return;
    if (missingSteps.length > 0) {
      setShowMissing(true);
      document.getElementById(`step-${missingSteps[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const entry = {
      type: 'sandwich',
      quantity: qty,
      optionIds: pickedOptions.map(p => p.option.id),
      picks: pickedOptions.map(p => ({
        stepName: p.step.name,
        optionName: p.option.name,
        extraPrice: p.pence / 100
      })),
      unitPrice: unitPence / 100,
      totalPrice,
      notes: notes.trim()
    };

    const basket = readBasket();
    if (editIndex !== null && isSandwich(basket[editIndex])) basket[editIndex] = entry;
    else basket.push(entry);
    saveBasket(basket);
    router.push('/basket');
  };

  return (
    <>
      <p className="sandwich-subtitle">
        Build it your way, from <strong>{money(menu.base_price)}</strong>. Collect today or another day,
        between {menu.open_time} and {menu.close_time}.
      </p>

      <div className="sandwich-steps">
        {steps.map((step, index) => {
          const picked = selected[step.id] || [];
          const full = step.max_choices !== null && step.max_choices > 1 && picked.length >= step.max_choices;
          const isMissing = showMissing && picked.length < step.min_choices;
          const pricing = priceHint(step);
          // Picking one more would be pick number picksBefore + 1 (a choose-1 step swaps instead)
          const picksBefore = step.max_choices === 1 ? 0 : picked.length;
          const addsExtra = hasIncludedLimit(step) && picksBefore >= step.included_choices;
          return (
            <section key={step.id} id={`step-${step.id}`} className={`sandwich-step${isMissing ? ' missing' : ''}`}>
              <div className="sandwich-step-head">
                <span className="sandwich-step-number">{index + 1}</span>
                <div>
                  <h2 className="sandwich-step-title">{step.name}</h2>
                  <span className="sandwich-step-hint">{stepHint(step)}{pricing && ` · ${pricing}`}</span>
                </div>
              </div>
              {step.description && <p className="sandwich-step-description">{step.description}</p>}
              {isMissing && <p className="sandwich-step-error">Please make a choice here</p>}

              <div className="sandwich-options">
                {step.options.map(option => {
                  const isSelected = picked.includes(option.id);
                  // Picked: what it adds now. Not picked: what picking it would add.
                  const extra = isSelected
                    ? pickedOptions.find(p => p.option.id === option.id).pence / 100
                    : (toPence(option.extra_price) + (addsExtra ? toPence(step.extra_choice_price) : 0)) / 100;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`sandwich-option${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleOption(step, option.id)}
                      disabled={full && !isSelected}
                      aria-pressed={isSelected}
                    >
                      <span className="sandwich-option-name">{option.name}</span>
                      {extra > 0 && <span className="sandwich-option-extra">+{money(extra)}</span>}
                      {option.description && <span className="sandwich-option-description">{option.description}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="sandwich-step">
          <div className="sandwich-step-head">
            <span className="sandwich-step-number">{steps.length + 1}</span>
            <div>
              <h2 className="sandwich-step-title">Anything else?</h2>
              <span className="sandwich-step-hint">Optional</span>
            </div>
          </div>
          <label htmlFor="sandwich-notes" className="sandwich-label">Notes for the kitchen</label>
          <textarea
            id="sandwich-notes"
            className="sandwich-notes"
            rows={2}
            maxLength={300}
            placeholder="e.g. cut in half, no butter"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </section>
      </div>

      {/* Sticky bar with the running price */}
      <div className="sandwich-bar">
        {room < 1 ? (
          <div className="sandwich-bar-inner sandwich-bar-limit">
            You already have {maxSandwiches} sandwiches in your basket, the most for one online order.
            For more, please call the shop.
          </div>
        ) : (
          <div className="sandwich-bar-inner">
            <div className="sandwich-quantity" aria-label="Quantity">
              <button type="button" onClick={() => setQuantity(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="One less">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQuantity(Math.min(room, qty + 1))} disabled={qty >= room} aria-label="One more">+</button>
            </div>
            <div className="sandwich-bar-price">
              <span className="sandwich-bar-total">{money(totalPrice)}</span>
              {qty > 1 && <span className="sandwich-bar-each">{money(unitPence / 100)} each</span>}
              {qty >= room && <span className="sandwich-bar-each">Up to {maxSandwiches} per order</span>}
            </div>
            <button type="button" className="sandwich-add-button" onClick={handleAddToBasket}>
              {editIndex !== null ? 'Update Basket' : 'Add to Basket'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function SandwichesPage() {
  return (
    <div className="welcome-page-option3">
      <div className="sandwich-page-container">
        <div className="sandwich-content">
          <h1 className="sandwich-title">Build Your Sandwich</h1>
          <Suspense fallback={<div className="sandwich-state">Loading the sandwich menu...</div>}>
            <SandwichBuilder />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
