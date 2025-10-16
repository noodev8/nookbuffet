// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'
import buildingImage from '../assets/building.png'
import nookImage from '../assets/nook.jpg'

// Import main styles (for navigation and global styles)
import '../style.css'

// Import AboutPage specific styles
import './AboutPage.css'

/**
 * About Page Component - Information about The Nook Buffet
 * This will contain company information and details
 */
function AboutPage() {
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



  const goToAbout = () => {
    navigate('/about'); // Go to about page
  };

  const goToMenu = () => {
    navigate('/menu'); // Go to menu page
  };

  const goToOrder = () => {
    navigate('/order'); // Go to order page
  };

  const goToContact = () => {
    navigate('/contact'); // Go to contact page
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

      {/* Main About Page Content */}
      <div className="about-page-container">
        <div className="about-content-wrapper">
          <h1 className="about-page-title">About The Little Nook Buffet</h1>

          {/* Introduction Section */}
          <div className="about-intro">
            <p>Welcome to The Little Nook Buffet, where we specialize in creating exceptional workplace dining experiences with fresh, customizable sandwich buffets. We're passionate about bringing quality, convenience, and flavor directly to your office or event.</p>

            <div className="ordering-info">
              <h3>How We Work</h3>
              <p><strong>Easy Ordering:</strong> Place your orders before 4pm for next-day delivery or pickup. We believe in giving you the freshest experience possible, which is why we prepare everything the morning of your order.</p>

              <p><strong>Flexible Options:</strong> Choose between convenient pickup from our Welshpool location or delivery straight to your workplace. For deliveries, select your preferred time slot between 9am and 7pm - we'll work around your schedule.</p>

              <p><strong>Fresh & Quality:</strong> Every sandwich buffet is crafted with the freshest ingredients, sourced locally where possible. From premium meats and artisan breads to crisp vegetables and gourmet cheeses, we never compromise on quality. Our team prepares everything fresh each morning to ensure maximum taste and nutritional value.</p>

              <p><strong>Perfect for:</strong> Office meetings, corporate events, team lunches, training sessions, or any occasion where you want to impress with quality food that brings people together.</p>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="about-sections-grid">

            {/* Opening Hours Section */}
            <div className="about-section">
              <h3>Opening Hours</h3>
              <ul className="hours-list">
                <li><span className="day">Monday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Tuesday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Wednesday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Thursday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Friday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Saturday</span><span className="time">10:00 - 15:00</span></li>
                <li><span className="day">Sunday</span><span className="time">Closed</span></li>
              </ul>
            </div>
            {/* Location Section */}
            <div className="about-section location-section">
              <h3>Where to Find Us</h3>
              <div className="location-image">
                <img src={buildingImage} alt="The Little Nook Buffet Building" className="building-photo" />
              </div>
              
              <p>42 High Street<br/>
                 Welshpool SY21 7JQ<br/>
                 Wales</p>
              <p>Phone: +44 7551 428162<br/>
                 </p>
            </div>




          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
