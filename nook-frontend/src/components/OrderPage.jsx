// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'

// Import OrderPage specific styles
import './OrderPage.css'

/**
 * Order Page Component - Where customers place their orders
 * This will contain the ordering form and menu items
 */
function OrderPage() {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hook for navigation between pages
  const navigate = useNavigate();

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to go back to home page
  const goHome = () => {
    navigate('/'); // This will take user back to home page
  };

  return (
    <div className="welcome-page-option3">
      {/* Navigation - Same as home page */}
      <nav className="navbar-option3">
        <div className="nav-container-option3">
          <div className="logo-option3" onClick={goHome} style={{cursor: 'pointer'}}>
            <img src={logoImage} alt="The Nook Buffet" className="logo-image-option3" />
            <span className="logo-text-option3">The Nook Buffet</span>
          </div>
          <div className="nav-links-option3">
            <a href="#" onClick={goHome}>Home</a>
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="hamburger-menu-option3" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
          </button>
          <div className={`mobile-menu-option3 ${isMenuOpen ? 'active' : ''}`}>
            <a href="#" onClick={() => {toggleMenu(); goHome();}}>Home</a>
            <a href="#menu" onClick={toggleMenu}>Menu</a>
            <a href="#about" onClick={toggleMenu}>About</a>
            <a href="#contact" onClick={toggleMenu}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Order Page Content */}
      <div className="order-page-container">
        <div className="order-content-wrapper">
          <h1 className="order-page-title">
            Place Your Order
          </h1>

          <div className="order-card">
            <h2 className="order-card-title">
              Coming Soon!
            </h2>
            <p className="order-card-description">
              We're working hard to bring you an amazing online ordering experience.
              In the meantime, please call us directly to place your order.
            </p>

            <div className="order-contact-section">
              <h3 className="order-contact-title">Contact Us:</h3>
              <p className="order-contact-details">
                📞 Phone: (555) 123-4567<br/>
                📧 Email: orders@nookbuffet.com
              </p>
            </div>

            <button
              onClick={goHome}
              className="order-back-button"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
