'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import './menu.css';

export default function MenuPage() {
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategoryImage = (categoryName, position = 0) => {
    const imageArrays = {
      'Sandwiches': ['/assets/sandwiches.png', '/assets/nook.jpg', '/assets/sandwiches2.png', '/assets/sandwiches3.png'],
      'Wraps': ['/assets/wraps.png', '/assets/wraps2.png', '/assets/wraps3.png', '/assets/wraps4.png'],
      'Savoury': ['/assets/savoury3.png', '/assets/savoury2.png', '/assets/savoury.png', '/assets/savoury4.png'],
      'Dips and Sticks': ['/assets/dips3.png','/assets/dipsandsticks.png', '/assets/dips2.png', '/assets/dips4.png'],
      'Fruit': ['/assets/fruit4.png','/assets/fruit3.png','/assets/fruit.png', '/assets/fruit2.png'],
      'Cake': ['/assets/cake3.png', '/assets/cake4.png','/assets/cake.png', '/assets/cake2.png'],
      'Continental Tray': ['/assets/savoury.png', '/assets/food2.png', '/assets/nook.jpg', '/assets/sandwiches.png'],
    };

    const images = imageArrays[categoryName] || ['/assets/savoury.png', '/assets/food2.png', '/assets/nook.jpg', '/assets/sandwiches.png'];
    return images[position] || images[0];
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        const response = await fetch(`${apiUrl}/api/menu`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.return_code === 'SUCCESS') {
          setMenuSections(data.data || []);
        } else {
          // Handle API-level errors without throwing - let caller decide what to do
          setError(data.message || 'Failed to load menu data');
        }
      } catch (err) {
        // Only network/connection errors reach here
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <div className="welcome-page-option3">
      <div className="menu-page-container">
        <div className="menu-content-wrapper">
         

          {loading && (
            <div className="loading-state">
              <p>Loading menu sections...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error loading menu: {error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && menuSections.map((section) => (
            <div key={section.id} className="buffet-section">
              <div className="section-content">
                <div className="section-info">
                  <h2 className="section-title">{section.name}</h2>
                  <div className="section-description">
                    {section.description && <p>{section.description}</p>}

                    {section.items && section.items.length > 0 && (
                      <div className="menu-items-list">
                        <ul>
                          {section.items.map((item) => (
                            <li key={item.id}>
                              <strong>{item.name}</strong>
                              {item.description && <span> - {item.description}</span>}
                              {item.dietary_info && (
                                <span className="dietary-info">{item.dietary_info}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="section-image">
                  <div className="image-grid">
                    {[0, 1, 2, 3].map((index) => (
                      <Image
                        key={index}
                        src={getCategoryImage(section.name, index)}
                        alt={`${section.name} - Image ${index + 1}`}
                        className={`menu-image ${index === 3 ? 'fourth-image' : ''}`}
                        width={300}
                        height={200}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && !error && menuSections.length === 0 && (
            <div className="no-data-state">
              <p>No menu sections found. Please add some categories to your database.</p>
            </div>
          )}

          <div className="menu-cta">
            <h3>Ready to Order?</h3>
            <p>Contact us to discuss your requirements and place your order.</p>
            <Link href="/order" className="cta-button">
              Place Your Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

