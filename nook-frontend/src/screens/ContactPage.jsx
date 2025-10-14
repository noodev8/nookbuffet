// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'

// Import main styles (for navigation and global styles)
import '../style.css'

// Import ContactPage specific styles
import './ContactPage.css'

/**
 * Contact Page Component - Contact form for customer inquiries
 * Allows customers to send messages to the company
 */
function ContactPage() {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Navigation hook
  const navigate = useNavigate();

  // Toggle mobile menu
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (placeholder for now)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Integrate with Resend later
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page-container">
      {/* Navigation */}
      <nav className="navbar-option3">
        <div className="nav-container-option3">
          <div className="logo-option3">
            <img src={logoImage} alt="The Nook Buffet" className="logo-image-option3" />
            <span className="logo-text-option3">The Nook Buffet</span>
          </div>
          <div className="nav-links-option3">
            <a href="#" onClick={goHome}>Home</a>
            <a href="#" onClick={goToMenu}>Menu</a>
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
            <a href="#" onClick={() => {toggleMenu(); goToMenu();}}>Menu</a>
            <a href="#" onClick={() => {toggleMenu(); goToAbout();}}>About</a>
            <a href="#" onClick={() => {toggleMenu(); goToContact();}}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="contact-content-wrapper">
        <h1 className="contact-page-title">Get In Touch</h1>

        <div className="contact-intro">
          <p>Have a question about our buffet services? Want to discuss your catering needs? We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.</p>
        </div>

        {/* Contact Form */}
        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="catering-inquiry">Catering Inquiry</option>
                  <option value="menu-questions">Menu Questions</option>
                  <option value="pricing">Pricing Information</option>
                  <option value="booking">Booking Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Tell us about your event, dietary requirements, number of people, or any other details..."
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="contact-info-section">
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <h3>Phone</h3>
              <p>01938 555 123</p>
            </div>
            
            <div className="contact-info-item">
              <h3>Email</h3>
              <p>hello@littlenookbuffet.co.uk</p>
            </div>
            
            <div className="contact-info-item">
              <h3>Location</h3>
              <p>Welshpool, Powys, Wales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
