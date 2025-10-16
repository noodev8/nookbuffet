// Import React library and hooks
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Import API configuration
import { API_BASE_URL } from '../config.js'

// Import your custom images
import logoImage from '../assets/logo.jpg'
import sandwichesImg from '../assets/sandwiches.png'
import sandwiches3Img from '../assets/sandwiches3.png'
import sandwiches2Img from '../assets/sandwiches2.png'
import wrapsImg from '../assets/wraps.png'
import wraps2Img from '../assets/wraps2.png'
import wraps3Img from '../assets/wraps3.png'
import savouryImg from '../assets/savoury.png'
import savoury2Img from '../assets/savoury2.png'
import savoury3Img from '../assets/savoury3.png'
import dipsImg from '../assets/dipsandsticks.png'
import fruitImg from '../assets/fruit.png'
import cakeImg from '../assets/cake.png'
import food2Img from '../assets/food2.png'
import nookImg from '../assets/nook.jpg'

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

      // Call your API endpoint using config file
      // TO CHANGE IP: Edit the config.js file
      const response = await fetch(`${API_BASE_URL}/api/menu`);

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

  // Function to get different images for each position in each category
  const getCategoryImage = (categoryName, position = 0) => {
    // Map category names to arrays of 4 different images
    const imageArrays = {
      'Sandwiches': [sandwichesImg, nookImg, sandwiches2Img, sandwiches3Img],
      'Wraps': [wrapsImg, wraps2Img, wraps3Img, savouryImg],
      'Savoury Tray': [savouryImg, savoury2Img, savoury3Img, sandwichesImg],
      'Dips and Sticks': [dipsImg, food2Img, nookImg, savouryImg],
      'Fruit': [fruitImg, food2Img, nookImg, savouryImg],
      'Cakes': [cakeImg, food2Img, nookImg, savouryImg],
      'Continental Tray': [savouryImg, food2Img, nookImg, sandwichesImg],
    };

    // Get the image array for this category, or use default array
    const images = imageArrays[categoryName] || [savouryImg, food2Img, nookImg, sandwichesImg];

    // Return the image at the specified position, or first image if position is invalid
    return images[position] || images[0];
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
            <a href="#" onClick={() => {toggleMenu(); goToOrder();}}>Order</a>
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
            <div className="loading-state">
              <p>Loading menu sections...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p>Error loading menu: {error}</p>
              <button
                onClick={fetchMenuData}
                className="retry-button"
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
                        <h4>Available Items:</h4>
                        <ul>
                          {section.items.map((item) => (
                            <li key={item.id}>
                              <strong>{item.name}</strong>
                              {item.description && (
                                <span> - {item.description}</span>
                              )}
                              {item.dietary_info && (
                                <span className="dietary-info">
                                  {item.dietary_info}
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
                  <div className="image-grid">
                    <img
                      src={getCategoryImage(section.name, 0)}
                      alt={`${section.name} - Image 1`}
                      className="menu-image"
                    />
                    <img
                      src={getCategoryImage(section.name, 1)}
                      alt={`${section.name} - Image 2`}
                      className="menu-image"
                    />
                    <img
                      src={getCategoryImage(section.name, 2)}
                      alt={`${section.name} - Image 3`}
                      className="menu-image"
                    />
                    <img
                      src={getCategoryImage(section.name, 3)}
                      alt={`${section.name} - Image 4`}
                      className="menu-image fourth-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show message if no sections found */}
          {!loading && !error && menuSections.length === 0 && (
            <div className="no-data-state">
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
