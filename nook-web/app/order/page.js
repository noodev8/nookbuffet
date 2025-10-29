'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './order.css';

export default function OrderPage() {
  const router = useRouter();
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [numPeople, setNumPeople] = useState(1);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pricePerPerson, setPricePerPerson] = useState(0);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const deselectSection = (sectionItems) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      sectionItems.forEach(item => {
        updated[item.id] = false;
      });
      return updated;
    });
  };

  const validateSelections = () => {
    // Check if all required sections have at least one item selected
    for (const section of menuSections) {
      if (section.is_required && section.items && section.items.length > 0) {
        const hasSelection = section.items.some(item => selectedItems[item.id]);
        if (!hasSelection) {
          setModalMessage(`Please select at least one item from "${section.name}" (required)`);
          setShowModal(true);
          return false;
        }
      }
    }

    // Check Sandwiches and Wraps sections individually - each can't exceed number of people
    const restrictedSections = ['Sandwiches', 'Wraps'];
    for (const section of menuSections) {
      if (restrictedSections.includes(section.name) && section.items) {
        let sectionCount = 0;
        section.items.forEach(item => {
          if (selectedItems[item.id]) {
            sectionCount++;
          }
        });

        if (sectionCount > numPeople) {
          setModalMessage(`You cannot select more ${section.name} (${sectionCount}) than people (${numPeople}). Please adjust your selections.`);
          setShowModal(true);
          return false;
        }
      }
    }

    return true;
  };

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
          const sections = data.data || [];
          setMenuSections(sections);

          // Extract price per person from the first section
          if (sections.length > 0 && sections[0].price_per_person) {
            const price = parseFloat(sections[0].price_per_person);
            setPricePerPerson(price);
          }

          // Initialize all items as selected, except Bread items (which start unselected)
          const initialSelected = {};
          sections.forEach(section => {
            if (section.items && section.items.length > 0) {
              section.items.forEach(item => {
                // Bread items start unselected, all others start selected
                initialSelected[item.id] = section.name !== 'Bread';
              });
            }
          });
          setSelectedItems(initialSelected);
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
      <div className="order-page-container">
        <div className="order-content-wrapper">
         

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
            <div key={section.id}>
              {/* Regular section with images */}
              {section.name !== 'Bread' && (
                <div className="section-card">
                  <div className="section-layout">
                    <div className="section-text-area">
                      <div className="section-header">
                        <div className="section-title-wrapper">
                          <h2 className="section-heading">{section.name}</h2>
                          {section.is_required && (
                            <span className="required-badge">Required</span>
                          )}
                        </div>
                        {section.items && section.items.length > 0 && (
                          <button
                            className="deselect-section-button"
                            onClick={() => deselectSection(section.items)}
                            title="Deselect all items in this section"
                          >
                            Deselect All
                          </button>
                        )}
                      </div>
                      <div className="section-description">
                        {section.description && <p>{section.description}</p>}

                        {section.items && section.items.length > 0 && (
                          <div className="items-list-container">
                            <ul>
                              {section.items.map((item) => (
                                <li
                                  key={item.id}
                                  className={`menu-item ${selectedItems[item.id] ? 'selected' : 'deselected'}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedItems[item.id] || false}
                                    onChange={() => toggleItemSelection(item.id)}
                                    className="item-checkbox"
                                  />
                                  <div
                                    className="item-text-wrapper"
                                    onClick={() => toggleItemSelection(item.id)}
                                  >
                                    <strong>{item.name}</strong>
                                    {item.description && <span> - {item.description}</span>}
                                    {item.dietary_info && (
                                      <span className="dietary-badge">{item.dietary_info}</span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="section-images-area">
                      <div className="section-images-grid">
                        {[0, 1, 2, 3].map((index) => (
                          <Image
                            key={index}
                            src={getCategoryImage(section.name, index)}
                            alt={`${section.name} - Image ${index + 1}`}
                            className={`section-image-item ${index === 3 ? 'hide-on-mobile' : ''}`}
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
              )}

              {/* Show bread section right after sandwiches */}
              {section.name === 'Sandwiches' && menuSections.find(s => s.name === 'Bread') && (
                (() => {
                  const breadSection = menuSections.find(s => s.name === 'Bread');
                  return (
                    <div className="bread-section-card">
                      <div className="bread-section-header">
                        <div className="bread-title-wrapper">
                          <h3 className="bread-section-title">{breadSection.name}</h3>
                          {breadSection.is_required && (
                            <span className="required-badge">Required</span>
                          )}
                        </div>
                      </div>
                      {breadSection.items && breadSection.items.length > 0 && (
                        <div className="bread-items-container">
                          <ul>
                            {breadSection.items.map((item) => {
                              const isSelected = selectedItems[item.id] === true;
                              return (
                                <li
                                  key={item.id}
                                  className={`bread-item ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    // Deselect all bread items first
                                    const updated = { ...selectedItems };
                                    breadSection.items.forEach(i => {
                                      updated[i.id] = false;
                                    });
                                    // Select only this item
                                    updated[item.id] = true;
                                    setSelectedItems(updated);
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="bread-selection"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="bread-item-radio"
                                  />
                                  <span className="bread-item-name">{item.name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ))}

          {!loading && !error && menuSections.length === 0 && (
            <div className="no-data-state">
              <p>No menu sections found. Please add some categories to your database.</p>
            </div>
          )}

          {!loading && !error && menuSections.length > 0 && (
            <div className="people-count-section">
              <div className="people-count-wrapper">
                <label htmlFor="order-people">How many people?</label>
                <input
                  id="order-people"
                  type="number"
                  min="1"
                  max="100"
                  value={numPeople}
                  onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  className="people-count-input-order"
                />
              </div>
              <button
                className="next-step-button"
                onClick={() => {
                  // Validate required sections and item count
                  if (!validateSelections()) {
                    return;
                  }
                  // Pass selected items, people count, buffet version, and price to more info page via URL params
                  const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
                  // Get the buffet version ID from the first section (they should all be the same)
                  const buffetVersionId = menuSections[0]?.buffet_version_id || '';
                  router.push(`/more-info?items=${selectedItemIds.join(',')}&people=${numPeople}&buffetVersionId=${buffetVersionId}&pricePerPerson=${pricePerPerson}`);
                }}
              >
                Next Step
              </button>
            </div>
          )}


        </div>
      </div>

      {/* Modal for validation messages */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">{modalMessage}</p>
            <button
              className="modal-button"
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

