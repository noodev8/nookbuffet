'use client';

// import { useRouter } from 'next/navigation'; // Put back with online buffet ordering
import Link from 'next/link';
import { useState, useEffect } from 'react';
import './select-buffet.css';

// Buffets can't be ordered online for now, so this page just shows each buffet's menu
// and asks people to phone the shop to order one. The online ordering code is commented
// out below (marked "online buffet ordering") so it is easy to put back.
const PHONE_DISPLAY = '07551 428162';
const PHONE_LINK = 'tel:+447551428162';

export default function SelectBuffetPage() {
  // const router = useRouter(); // Put back with online buffet ordering
  const [buffetVersions, setBuffetVersions] = useState([]);
  const [menus, setMenus] = useState({}); // { [buffetVersionId]: [sections] }
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
      .then(async data => {
        if (data.return_code !== 'SUCCESS') {
          setError(data.message || 'Failed to load buffets');
          return;
        }
        const versions = data.data || [];
        setBuffetVersions(versions);

        // Each buffet's menu. A menu that fails to load just shows without its items
        const loaded = await Promise.all(versions.map(v =>
          fetch(`${apiUrl}/api/menu/buffet-version/${v.id}`)
            .then(res => res.json())
            .then(menu => [v.id, menu.return_code === 'SUCCESS' ? menu.data || [] : []])
            .catch(() => [v.id, []])
        ));
        setMenus(Object.fromEntries(loaded));
      })
      .catch(() => setError('Failed to load buffets. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Online buffet ordering
  // const handleSelectBuffet = (buffetVersionId) => {
  //   // Navigate to order page with the selected buffet version ID
  //   router.push(`/order?buffetVersionId=${buffetVersionId}`);
  // };

  return (
    <div className="welcome-page-option3">
      <div className="select-buffet-container">
        <div className="select-buffet-content">
          {/* Online buffet ordering heading:
          <h1 className="select-buffet-title">Choose Your Buffet</h1>
          <p className="select-buffet-subtitle">Select the buffet package that&apos;s right for you</p>
          */}
          <h1 className="select-buffet-title">Our Buffets</h1>
          <p className="select-buffet-subtitle">See what comes in each buffet</p>

          {/* Beta Warning Banner */}
          {/* <div className="beta-warning-banner">
            <strong>BETA VERSION - TESTING ONLY</strong>
            <p>This is a test version of our ordering system. No real orders will be processed and no payments will be charged.</p>
          </div> */}

          <div className="call-to-order-banner">
            <strong>Call to order a buffet</strong>
            <p>
              Buffets can&apos;t be ordered online at the moment. Give us a call on{' '}
              <a href={PHONE_LINK}>{PHONE_DISPLAY}</a> and we&apos;ll sort it for you.
            </p>
            <a href={PHONE_LINK} className="call-to-order-button">Call {PHONE_DISPLAY}</a>
          </div>

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
              <p>Loading buffets...</p>
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
              <p>No buffets to show at the moment.</p>
            </div>
          )}

          {!loading && !error && buffetVersions.length > 0 && (
            <div className="buffet-versions-grid">
              {buffetVersions.map((version) => (
                // Online buffet ordering card class:
                // className={`buffet-version-card${version.sold_out ? ' buffet-version-sold-out' : ''}`}
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

                  {(menus[version.id] || []).filter(section => section.items?.length > 0).map(section => (
                    <div key={section.id} className="buffet-menu-section">
                      <h3 className="buffet-menu-section-title">{section.name}</h3>
                      <ul className="buffet-menu-items">
                        {section.items.map(item => (
                          <li key={item.id}>
                            {item.name}
                            {item.dietary_info && <span className="buffet-menu-dietary">{item.dietary_info}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Online buffet ordering. Sold out buffets stay on the page so people know we do them, but can't be picked
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
                  */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
