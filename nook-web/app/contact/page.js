'use client';

import { useState } from 'react';
import './contact.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitMessage('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage(data.message);

        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitError(data.message || 'Failed to send message. Please try again.');
      }

    } catch (error) {
      setSubmitError('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-content-wrapper">
        <h1 className="contact-page-title">Get In Touch</h1>

        <div className="contact-intro">
          <p>Have a question about our buffet services? Want to discuss your catering needs? We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.</p>
        </div>

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
                placeholder="Tell us about your event, dietary requirements, number of people, or any other details..."
              ></textarea>
            </div>

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

