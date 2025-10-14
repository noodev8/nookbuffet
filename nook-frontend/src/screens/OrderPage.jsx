// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'

// Import main styles (for navigation and global styles)
import '../style.css'

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

  // Navigation functions
  const goHome = () => {
    navigate('/'); // take user back to home page
  };

  const goToAbout = () => {
    navigate('/about'); // Go to about page
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
            <a href="#" onClick={goToAbout}>About</a>
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
            <a href="#" onClick={() => {toggleMenu(); goToAbout();}}>About</a>
            <a href="#contact" onClick={toggleMenu}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Order Page Content */}
      <div className="order-page-content">
        <h1 className="order-page-title">COMING SOON</h1>
      </div>
    </div>
  );
}

export default OrderPage;
