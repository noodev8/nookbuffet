// Import React library and hooks
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import your custom images
import logoImage from '../assets/logo.jpg'

// Import main styles (for navigation and global styles)
import '../style.css'

// Import ContactPage specific styles
import './ContactPage.css'

// Import API configuration
import { API_BASE_URL } from '../config.js'

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

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSubmitMessage('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      console.log('Submitting contact form:', formData);

      // Send form data to backend API
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('Contact form submitted successfully');
        setSubmitMessage(data.message);

        // Reset form on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        console.error('Contact form submission failed:', data.message);
        setSubmitError(data.message || 'Failed to send message. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <a href="#" onClick={() => {toggleMenu(); goToOrder();}}>Order</a>
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
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your inquiry"
                />
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

            {/* Success/Error Messages */}
            {submitMessage && (
              <div className="form-message success-message">
                {submitMessage}
              </div>
            )}

            {submitError && (
              <div className="form-message error-message">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
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
