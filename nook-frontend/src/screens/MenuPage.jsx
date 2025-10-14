// Import React library and hooks
import React, { useState } from 'react'
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
  
  // Hook for navigation between pages
  const navigate = useNavigate();

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
          

          {/* Sandwiches Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Sandwiches</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={sandwichesImg} alt="Sandwiches" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Wraps Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Wraps</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={wrapsImg} alt="Wraps" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Savoury Tray Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Savoury Tray</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={savouryImg} alt="Savoury Tray" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Dips and Sticks Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Dips and Sticks</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={dipsImg} alt="Dips and Sticks" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Fruit Tray Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Fruit</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={fruitImg} alt="Fruit Tray" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Cakes Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Cakes</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={cakeImg} alt="Cakes" className="menu-image" />
              </div>
            </div>
          </div>

          {/* Continental Upgrade Section */}
          <div className="buffet-section">
            <div className="section-content">
              <div className="section-info">
                <h2 className="section-title">Continental Tray</h2>
                <div className="section-description">
                  {/* Content will be added later */}
                </div>
              </div>
              <div className="section-image">
                <img src={savouryImg} alt="Continental Tray" className="menu-image" />
              </div>
            </div>
          </div>

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
