// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import nookImage from '../assets/nook.jpg'
import logoImage from '../assets/logo.jpg'

/**
 * Home Page Component - The main landing page
 * Contains hero section, info cards, and call-to-action
 */
function Home() {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hook for navigation between pages
  const navigate = useNavigate();

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle order button clicks - navigates to order page
  const handleOrderNow = () => {
    navigate('/order'); // This will take user to the order page
  };

  return (
    <div className="welcome-page-option3">
      {/* Navigation */}
      <nav className="navbar-option3">
        <div className="nav-container-option3">
          <div className="logo-option3">
            <img src={logoImage} alt="The Nook Buffet" className="logo-image-option3" />
            <span className="logo-text-option3">The Nook Buffet</span>
          </div>
          <div className="nav-links-option3">
            <a href="#home">Home</a>
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
            <a href="#home" onClick={toggleMenu}>Home</a>
            <a href="#menu" onClick={toggleMenu}>Menu</a>
            <a href="#about" onClick={toggleMenu}>About</a>
            <a href="#contact" onClick={toggleMenu}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Full Screen Hero */}
      <section className="hero-section-option3">
        <div className="hero-background-option3">
          <img src={nookImage} alt="The Nook Sandwich Bar and Buffets" className="hero-bg-image-option3" />
          <div className="hero-overlay-option3"></div>
        </div>
        
        <div className="hero-content-option3">
          <div className="hero-text-center-option3">
            <h1 className="hero-title-option3">
              THE NOOK
            </h1>
            <div className="hero-subtitle-option3">
              Sandwich Buffets
            </div>
            <p className="hero-description-option3">
              Crafting exceptional workplace dining experiences with fresh, customizable sandwich buffets
            </p>
            <button className="cta-button-option3" onClick={handleOrderNow}>
              Start Your Order
            </button>
          </div>
        </div>

        <div className="scroll-indicator-option3">
          <div className="scroll-arrow-option3">↓</div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="info-section-option3">
        <div className="info-container-option3">
          <div className="info-grid-option3">
            <div className="info-card-option3 card-1">
              <div className="card-number-option3">01</div>
              <h3>Custom Buffets</h3>
              <p>Build your perfect buffet with premium meats, fresh vegetables, artisan breads, and gourmet cheeses.</p>
            </div>
            <div className="info-card-option3 card-2">
              <div className="card-number-option3">02</div>
              <h3>Professional Service</h3>
              <p>White-glove setup and service that respects your workspace and schedule requirements.</p>
            </div>
            <div className="info-card-option3 card-3">
              <div className="card-number-option3">03</div>
              <h3>Fresh Daily</h3>
              <p>All ingredients sourced and prepared fresh every morning for maximum quality and taste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-option3">
        <div className="cta-container-option3">
          <h2>Ready to elevate your team's dining?</h2>
          <p>Join hundreds of companies who trust The Nook for their catering needs</p>
          <div className="cta-buttons-option3">
            <button className="cta-primary-option3" onClick={handleOrderNow}>
              Order Now
            </button>
            <button className="cta-secondary-option3">
              View Menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
