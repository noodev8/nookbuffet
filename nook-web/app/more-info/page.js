'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import './more-info.css';

function MoreInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [numPeople, setNumPeople] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [dietaryInfo, setDietaryInfo] = useState('');
  const [allergens, setAllergens] = useState('');
  const [loading, setLoading] = useState(false);
  const [buffetVersionId, setBuffetVersionId] = useState(null);
  const [pricePerPerson, setPricePerPerson] = useState(0);

  // Get selected items, people count, buffet version, and price from URL params
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const peopleParam = searchParams.get('people');
    const buffetVersionParam = searchParams.get('buffetVersionId');
    const priceParam = searchParams.get('pricePerPerson');

    console.log('URL params:', { itemsParam, peopleParam, buffetVersionParam, priceParam });

    if (itemsParam) {
      const items = itemsParam.split(',').map(id => parseInt(id));
      setSelectedItems(items);
    }

    if (peopleParam) {
      setNumPeople(Math.max(1, parseInt(peopleParam) || 1));
    }

    if (buffetVersionParam) {
      const versionId = parseInt(buffetVersionParam);
      console.log('Setting buffet version ID to:', versionId);
      setBuffetVersionId(versionId);
    }

    if (priceParam) {
      const price = parseFloat(priceParam);
      console.log('Setting price per person to:', price);
      console.log('Raw priceParam:', priceParam);
      setPricePerPerson(price);
    } else {
      console.warn('No pricePerPerson param in URL');
    }
  }, [searchParams]);



  const handleContinue = () => {
    setLoading(true);

    // Get existing basket to check if we have business details
    const existingBasket = localStorage.getItem('basketData');
    let basket = [];
    let businessDetails = {};

    if (existingBasket) {
      try {
        const parsed = JSON.parse(existingBasket);
        basket = Array.isArray(parsed) ? parsed : [parsed];
        // Get business details from first order if it exists
        if (basket.length > 0 && basket[0].businessName) {
          businessDetails = {
            businessName: basket[0].businessName,
            address: basket[0].address,
            email: basket[0].email,
            phone: basket[0].phone,
            fulfillmentType: basket[0].fulfillmentType,
            deliveryDate: basket[0].deliveryDate,
            deliveryTime: basket[0].deliveryTime
          };
        }
      } catch (e) {
        basket = [];
      }
    }

    // Add this order to the basket (support multiple buffets)
    const newOrder = {
      items: selectedItems,
      numPeople,
      notes,
      dietaryInfo,
      allergens,
      buffetVersionId,
      pricePerPerson,
      totalPrice: pricePerPerson * numPeople,
      timestamp: new Date().toISOString(),
      ...businessDetails
    };

    // Add new order to basket
    basket.push(newOrder);
    localStorage.setItem('basketData', JSON.stringify(basket));
    router.push('/');
  };

  return (
    <div className="welcome-page-option3">
      <div className="more-info-page-container">
        <div className="more-info-content-wrapper">
          <h1 className="more-info-title">Additional Information</h1>

          {/* Notes Section */}
          <div className="more-info-section">
            <h2 className="more-info-section-title">Special Requests</h2>
            <div className="form-group">
              <label htmlFor="notes">Add any notes:</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Special requests, preferences..."
                className="more-info-textarea"
              />
            </div>
          </div>

          {/* Dietary & Allergen Info Section */}
          <div className="more-info-section">
            <h2 className="more-info-section-title">Dietary & Allergen Information</h2>
            
            <div className="form-group">
              <label htmlFor="dietary">Dietary Requirements:</label>
              <input
                id="dietary"
                type="text"
                value={dietaryInfo}
                onChange={(e) => setDietaryInfo(e.target.value)}
                placeholder="e.g., Vegetarian, Vegan, Gluten-free..."
                className="more-info-input"
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
                className="more-info-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="more-info-actions">
            <button 
              className="more-info-back-button"
              onClick={() => router.back()}
              disabled={loading}
            >
              Back
            </button>
            <button 
              className="more-info-submit-button"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoreInfoPage() {
  return (
    <Suspense fallback={
      <div className="welcome-page-option3">
        <div className="more-info-page-container">
          <div className="more-info-content-wrapper">
            <div className="loading-state">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <MoreInfoContent />
    </Suspense>
  );
}
