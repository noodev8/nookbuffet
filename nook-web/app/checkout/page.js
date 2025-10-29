'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './checkout.css';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [numPeople, setNumPeople] = useState(1);
  const [notes, setNotes] = useState('');
  const [dietaryInfo, setDietaryInfo] = useState('');
  const [allergens, setAllergens] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get selected items and people count from URL params
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const peopleParam = searchParams.get('people');

    if (itemsParam) {
      const items = itemsParam.split(',').map(id => parseInt(id));
      setSelectedItems(items);
    }

    if (peopleParam) {
      setNumPeople(Math.max(1, parseInt(peopleParam) || 1));
    }
  }, [searchParams]);

  const handleAddToBasket = async () => {
    setLoading(true);
    try {
      // Here you would send the order data to your backend
      const orderData = {
        items: selectedItems,
        numPeople,
        notes,
        dietaryInfo,
        allergens,
        timestamp: new Date().toISOString()
      };

      console.log('Order data:', orderData);
      // TODO: Send to API endpoint
      
      // For now, just show success and redirect
      alert('Order added to basket!');
      router.push('/');
    } catch (error) {
      console.error('Error adding to basket:', error);
      alert('Failed to add order to basket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <h1 className="checkout-title">Complete Your Order</h1>

          {/* Notes Section */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Special Requests</h2>
            <div className="form-group">
              <label htmlFor="notes">Add any notes:</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Special requests, preferences..."
                className="checkout-textarea"
              />
            </div>
          </div>

          {/* Dietary & Allergen Info Section */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Dietary & Allergen Information</h2>
            
            <div className="form-group">
              <label htmlFor="dietary">Dietary Requirements:</label>
              <input
                id="dietary"
                type="text"
                value={dietaryInfo}
                onChange={(e) => setDietaryInfo(e.target.value)}
                placeholder="e.g., Vegetarian, Vegan, Gluten-free..."
                className="checkout-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergens">Allergens:</label>
              <input
                id="allergens"
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g., Nuts, Dairy, Shellfish..."
                className="checkout-input"
              />
            </div>
          </div>



          {/* Action Buttons */}
          <div className="checkout-actions">
            <button 
              className="checkout-back-button"
              onClick={() => router.back()}
              disabled={loading}
            >
              Back
            </button>
            <button 
              className="checkout-submit-button"
              onClick={handleAddToBasket}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add to Basket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

