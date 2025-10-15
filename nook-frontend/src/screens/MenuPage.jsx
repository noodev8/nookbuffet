// Import React library and hooks
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'
import sandwichesImg from '../assets/sandwiches.png'
import wrapsImg from '../assets/wraps.png'
import savouryImg from '../assets/savoury.png'
import dipsImg from '../assets/dipsandsticks.png'
import fruitImg from '../assets/fruit.png'
import cakeImg from '../assets/cake.png'

// Import main styles (for navigation and global styles)
import '../style.css'

// Import MenuPage specific styles
import './MenuPage.css'

/**
 * Menu Page Component - Display buffet menu options
 * Shows all available menu sections and options
 */
function MenuPage() {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State for menu data from API
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook for navigation between pages
  const navigate = useNavigate();

  // Function to fetch menu data from API
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call your API endpoint
      const response = await fetch('http://localhost:3013/api/menu');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned success
      if (data.success) {
        setMenuSections(data.data || []);
        console.log('✅ Menu data loaded:', data.data);
      } else {
        throw new Error(data.message || 'Failed to load menu data');
      }

    } catch (err) {
      console.error('❌ Error fetching menu data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu data when component mounts
  useEffect(() => {
    fetchMenuData();
  }, []);

  // Function to get the appropriate image for each category
  const getCategoryImage = (categoryName) => {
    // Map category names to images
    const imageMap = {
      'Sandwiches': sandwichesImg,
      'Wraps': wrapsImg,
      'Savoury Tray': savouryImg,
      'Dips and Sticks': dipsImg,
      'Fruit': fruitImg,
      'Cakes': cakeImg,
      'Continental Tray': savouryImg, // Using savoury image for continental
    };

    // Return the mapped image or a default
    return imageMap[categoryName] || savouryImg;
  };

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navigation functions
  const goHome = () => {
    navigate('/'); // Go to home page
  };

  const goToOrder = () => {
    navigate('/order'); // Go to order page
  };

  const goToAbout = () => {
    navigate('/about'); // Go to about page
  };

  const goToMenu = () => {
    navigate('/menu'); // Go to menu page
  };

  const goToContact = () => {
    navigate('/contact'); // Go to contact page
  };

  return (
    <div className="welcome-page-option3">
      {/* Navigation - Same as other pages */}
      <nav className="navbar-option3">
        <div className="nav-container-option3">
          <div className="logo-option3" onClick={goHome} style={{cursor: 'pointer'}}>
            <img src={logoImage} alt="The Nook Buffet" className="logo-image-option3" />
            <span className="logo-text-option3">The Nook Buffet</span>
          </div>
          <div className="nav-links-option3">
            <a href="#" onClick={goHome}>Home</a>
            <a href="#" onClick={goToMenu}>Menu</a>
            <a href="#" onClick={goToAbout}>About</a>
            <a href="#" onClick={goToContact}>Contact</a>
          </div>
          <button className="hamburger-menu-option3" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span> 
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
          </button>
          <div className={`mobile-menu-option3 ${isMenuOpen ? 'active' : ''}`}>
            <a href="#" onClick={() => {toggleMenu(); goHome();}}>Home</a>
            <a href="#" onClick={() => {toggleMenu(); goToMenu();}}>Menu</a>
            <a href="#" onClick={() => {toggleMenu(); goToAbout();}}>About</a>
            <a href="#" onClick={() => {toggleMenu(); goToContact();}}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Menu Page Content */}
      <div className="menu-page-container">
        <div className="menu-content-wrapper">

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
              <p>Loading menu sections...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
              <p>Error loading menu: {error}</p>
              <button
                onClick={fetchMenuData}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#444',
                  color: 'white',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Dynamic Menu Sections */}
          {!loading && !error && menuSections.map((section) => (
            <div key={section.id} className="buffet-section">
              <div className="section-content">
                <div className="section-info">
                  <h2 className="section-title">{section.name}</h2>
                  <div className="section-description">
                    {section.description && (
                      <p>{section.description}</p>
                    )}

                    {/* Display menu items if they exist */}
                    {section.items && section.items.length > 0 && (
                      <div className="menu-items-list">
                        <h4 style={{ color: '#ccc', marginTop: '1rem', marginBottom: '0.5rem' }}>
                          Available Items:
                        </h4>
                        <ul style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {section.items.map((item) => (
                            <li key={item.id} style={{ marginBottom: '0.3rem' }}>
                              <strong>{item.name}</strong>
                              {item.description && (
                                <span> - {item.description}</span>
                              )}
                              {item.dietary_info && (
                                <span style={{ color: '#90EE90', fontSize: '0.8rem' }}>
                                  {' '}({item.dietary_info})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="section-image">
                  <img
                    src={getCategoryImage(section.name)}
                    alt={section.name}
                    className="menu-image"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Show message if no sections found */}
          {!loading && !error && menuSections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
              <p>No menu sections found. Please add some categories to your database.</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="menu-cta">
            <h3>Ready to Order?</h3>
            <p>Contact us to discuss your requirements and place your order.</p>
            <button className="cta-button" onClick={goToOrder}>
              Place Your Order
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MenuPage;
