'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './select-buffet.css';

export default function SelectBuffetPage() {
  const router = useRouter();
  const [buffetVersions, setBuffetVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  // Re-fetch buffet versions when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/buffet-versions?branch_id=${selectedBranch}`)
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
  }, [selectedBranch]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

    // Fetch branches — setting selectedBranch will trigger the buffet versions fetch above
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/branches`);
        const data = await res.json();
        if (data.return_code === 'SUCCESS') {
          setBranches(data.data || []);
          // Default to the first branch
          if (data.data && data.data.length > 0) {
            setSelectedBranch(data.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };

    fetchBranches();
  }, []);

  const handleSelectBuffet = (buffetVersionId) => {
    // Navigate to order page with the selected buffet version ID and branch
    const branchParam = selectedBranch ? `&branch_id=${selectedBranch}` : '';
    router.push(`/order?buffetVersionId=${buffetVersionId}${branchParam}`);
  };

  return (
    <div className="welcome-page-option3">
      <div className="select-buffet-container">
        <div className="select-buffet-content">
          <h1 className="select-buffet-title">Choose Your Buffet</h1>
          <p className="select-buffet-subtitle">Select the buffet package that&apos;s right for you</p>

          {/* Branch Selector */}
          {branches.length > 0 && (
            <div className="branch-selector-wrapper">
              <label htmlFor="branch-select" className="branch-selector-label">Where are you ordering from?</label>
              <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="branch-selector-select"
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Beta Warning Banner */}
          <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of our ordering system. No real orders will be processed and no payments will be charged.</p>
          </div>

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
                <div key={version.id} className="buffet-version-card">
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
                  
                  <button
                    className="select-buffet-button"
                    onClick={() => handleSelectBuffet(version.id)}
                  >
                    Select This Buffet
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

