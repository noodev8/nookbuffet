'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import './select-buffet.css';

export default function SelectBuffetPage() {
  const router = useRouter();
  const [buffetVersions, setBuffetVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sandwichMenu, setSandwichMenu] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

    // Offer sandwiches too. If they have sold out the box still shows, so people know
    // sandwiches are generally on offer, but there is no button to build one
    fetch(`${apiUrl}/api/sandwiches`)
      .then(res => res.json())
      .then(data => {
        if (data.return_code === 'SUCCESS') setSandwichMenu(data.data);
      })
      .catch(() => {});

    fetch(`${apiUrl}/api/buffet-versions`)
      .then(res => res.json())
      .then(data => {
        if (data.return_code === 'SUCCESS') {
          setBuffetVersions(data.data || []);
        } else {
          setError(data.message || 'Failed to load buffet versions');
        }
      })
      .catch(() => setError('Failed to load buffet versions. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectBuffet = (buffetVersionId) => {
    // Navigate to order page with the selected buffet version ID
    router.push(`/order?buffetVersionId=${buffetVersionId}`);
  };

  return (
    <div className="welcome-page-option3">
      <div className="select-buffet-container">
        <div className="select-buffet-content">
          <h1 className="select-buffet-title">Choose Your Buffet</h1>
          <p className="select-buffet-subtitle">Select the buffet package that&apos;s right for you</p>

          {/* Beta Warning Banner */}
          {/* <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of our ordering system. No real orders will be processed and no payments will be charged.</p>
          </div> */}

          {sandwichMenu && (
            <div className="sandwich-offer">
              <div>
                <h2 className="sandwich-offer-title">Just want a sandwich?</h2>
                <p className="sandwich-offer-text">
                  Build your own from £{parseFloat(sandwichMenu.base_price).toFixed(2)}.{' '}
                  {sandwichMenu.sold_out
                    ? <>We&apos;ve sold out for now - please check back soon.</>
                    : <>Collect it today between {sandwichMenu.open_time} and {sandwichMenu.close_time}.</>}
                </p>
              </div>
              {sandwichMenu.sold_out
                ? <span className="sandwich-offer-button sandwich-offer-sold-out">Sold Out</span>
                : <Link href="/sandwiches" className="sandwich-offer-button">Build a Sandwich</Link>}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <p>Loading buffet options...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && buffetVersions.length === 0 && (
            <div className="empty-state">
              <p>No buffet options available at the moment.</p>
            </div>
          )}

          {!loading && !error && buffetVersions.length > 0 && (
            <div className="buffet-versions-grid">
              {buffetVersions.map((version) => (
                <div key={version.id} className={`buffet-version-card${version.sold_out ? ' buffet-version-sold-out' : ''}`}>
                  <div className="buffet-version-header">
                    <h2 className="buffet-version-title">{version.title}</h2>
                    <div className="buffet-version-price">
                      £{parseFloat(version.price_per_person).toFixed(2)}
                      <span className="price-label">per person</span>
                    </div>
                  </div>
                  
                  {version.description && (
                    <p className="buffet-version-description">{version.description}</p>
                  )}
                  
                  {/* Sold out buffets stay on the page so people know we do them, but can't be picked */}
                  {version.sold_out && (
                    <p className="buffet-version-sold-out-note">Sold out for now - please check back soon.</p>
                  )}
                  <button
                    className="select-buffet-button"
                    onClick={() => handleSelectBuffet(version.id)}
                    disabled={version.sold_out}
                  >
                    {version.sold_out ? 'Sold Out' : 'Select This Buffet'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

