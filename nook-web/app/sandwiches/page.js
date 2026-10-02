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
        const entry = readBasket()[index];
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
  if (!menu.enabled || menu.sold_out || menu.steps.length === 0) {
    return (
      <div className="sandwich-state">
        <p>{menu.sold_out ? 'Sorry, we have sold out of sandwiches for now.' : 'Sorry, sandwiches are not available to order online right now.'}</p>
        <Link href="/select-buffet" className="sandwich-secondary-button">Order a Buffet Instead</Link>
      </div>
    );
  }

  const steps = menu.steps;
  const pickedOptions = steps.flatMap(step =>
    step.options.filter(o => (selected[step.id] || []).includes(o.id)).map(o => ({ step, option: o }))
  );
  const unitPrice = parseFloat(menu.base_price) + pickedOptions.reduce((sum, p) => sum + parseFloat(p.option.extra_price), 0);
  const unitPence = Math.round(unitPrice * 100);
  const totalPrice = (unitPence * quantity) / 100;
  const missingSteps = steps.filter(step => (selected[step.id] || []).length < step.min_choices);

  const handleAddToBasket = () => {
    if (missingSteps.length > 0) {
      setShowMissing(true);
      document.getElementById(`step-${missingSteps[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const entry = {
      type: 'sandwich',
      quantity,
      optionIds: pickedOptions.map(p => p.option.id),
      picks: pickedOptions.map(p => ({
        stepName: p.step.name,
        optionName: p.option.name,
        extraPrice: parseFloat(p.option.extra_price)
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
        Build it your way, from <strong>{money(menu.base_price)}</strong>. Collect it today if you order before {menu.cutoff_time}.
      </p>

      <div className="sandwich-steps">
        {steps.map((step, index) => {
          const picked = selected[step.id] || [];
          const full = step.max_choices !== null && step.max_choices > 1 && picked.length >= step.max_choices;
          const isMissing = showMissing && picked.length < step.min_choices;
          return (
            <section key={step.id} id={`step-${step.id}`} className={`sandwich-step${isMissing ? ' missing' : ''}`}>
              <div className="sandwich-step-head">
                <span className="sandwich-step-number">{index + 1}</span>
                <div>
                  <h2 className="sandwich-step-title">{step.name}</h2>
                  <span className="sandwich-step-hint">{stepHint(step)}</span>
                </div>
              </div>
              {step.description && <p className="sandwich-step-description">{step.description}</p>}
              {isMissing && <p className="sandwich-step-error">Please make a choice here</p>}

              <div className="sandwich-options">
                {step.options.map(option => {
                  const isSelected = picked.includes(option.id);
                  const extra = parseFloat(option.extra_price);
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
        <div className="sandwich-bar-inner">
          <div className="sandwich-quantity" aria-label="Quantity">
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="One less">−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity(q => Math.min(MAX_QUANTITY, q + 1))} disabled={quantity >= MAX_QUANTITY} aria-label="One more">+</button>
          </div>
          <div className="sandwich-bar-price">
            <span className="sandwich-bar-total">{money(totalPrice)}</span>
            {quantity > 1 && <span className="sandwich-bar-each">{money(unitPence / 100)} each</span>}
          </div>
          <button type="button" className="sandwich-add-button" onClick={handleAddToBasket}>
            {editIndex !== null ? 'Update Basket' : 'Add to Basket'}
          </button>
        </div>
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
