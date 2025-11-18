'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import './about.css';

export default function AboutPage() {
  useEffect(() => {
    // Load Juicer script when component mounts
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.juicer.io/embed/_thenooksandwichbar-2ae03aed-f6c4-4629-b200-887df65f70bd/embed-code.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="juicer.io"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="welcome-page-option3">
      <div className="about-page-container">
        <div className="about-content-wrapper">
          <h1 className="about-page-title">About The Little Nook Buffet</h1>

          <div className="about-intro">
            <p className="intro-text">
              Welcome to The Little Nook Buffet, where we specialize in creating exceptional workplace dining experiences with fresh, customizable sandwich buffets. We&apos;re passionate about bringing quality, convenience, and flavor directly to your office or event.
            </p>

            <div className="ordering-info">
              <h3>How We Work</h3>
              <p>
                <strong>Easy Ordering:</strong> Place your orders before 4pm for next-day delivery or pickup. We believe in giving you the freshest experience possible, which is why we prepare everything the morning of your order.
              </p>

              <p>
                <strong>Flexible Options:</strong> Choose between convenient pickup from our Welshpool location or delivery straight to your workplace. For deliveries, select your preferred time slot between 9am and 7pm - we&apos;ll work around your schedule.
              </p>

              <p>
                <strong>Fresh & Quality:</strong> Every sandwich buffet is crafted with the freshest ingredients, sourced locally where possible. From premium meats and breads to crisp veg sticks and gourmet cheeses, we never compromise on quality. Our team prepares everything fresh each morning to ensure maximum taste and nutritional value.
              </p>

              <p>
                <strong>Perfect for:</strong> Office meetings, corporate events, team lunches, training sessions, or any occasion where you want to impress with quality food that brings people together.
              </p>
            </div>

            <div className="info-cards-grid">
              <div className="info-card">
                <h3>Contact Hours</h3>
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

              <div className="info-card location-card">
                <h3>Where to Find Us</h3>
                <p>42 High Street<br />
                   Welshpool SY21 7JQ<br />
                   Wales</p>
                <p>Phone: +44 7551 428162</p>

                <div className="social-links">
                  <a href="https://www.facebook.com/profile.php?id=61555788602413" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a href="https://www.instagram.com/_thenooksandwichbar/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="social-feed-section">
            <h2>Follow Our Journey</h2>
            <p>Stay up to date with our latest creations, behind-the-scenes moments, and customer favorites!</p>
            <div className="juicer-feed-container">
              <ul className="juicer-feed" data-feed-id="_thenooksandwichbar-2ae03aed-f6c4-4629-b200-887df65f70bd" data-per="3" data-gutter="20"></ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

