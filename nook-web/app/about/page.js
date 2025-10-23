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
              Welcome to The Little Nook Buffet, where we specialize in creating exceptional workplace dining experiences with fresh, customizable sandwich buffets. We're passionate about bringing quality, convenience, and flavor directly to your office or event.
            </p>

            <div className="ordering-info">
              <h3>How We Work</h3>
              <p>
                <strong>Easy Ordering:</strong> Place your orders before 4pm for next-day delivery or pickup. We believe in giving you the freshest experience possible, which is why we prepare everything the morning of your order.
              </p>

              <p>
                <strong>Flexible Options:</strong> Choose between convenient pickup from our Welshpool location or delivery straight to your workplace. For deliveries, select your preferred time slot between 9am and 7pm - we'll work around your schedule.
              </p>

              <p>
                <strong>Fresh & Quality:</strong> Every sandwich buffet is crafted with the freshest ingredients, sourced locally where possible. From premium meats and artisan breads to crisp vegetables and gourmet cheeses, we never compromise on quality. Our team prepares everything fresh each morning to ensure maximum taste and nutritional value.
              </p>

              <p>
                <strong>Perfect for:</strong> Office meetings, corporate events, team lunches, training sessions, or any occasion where you want to impress with quality food that brings people together.
              </p>
            </div>

            <div className="info-cards-grid">
              <div className="info-card">
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

              <div className="info-card location-card">
                <h3>Where to Find Us</h3>
                <div className="location-image">
                  <Image
                    src="/assets/building.png"
                    alt="The Little Nook Buffet Building"
                    className="building-photo"
                    width={400}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <p>42 High Street<br />
                   Welshpool SY21 7JQ<br />
                   Wales</p>
                <p>Phone: +44 7551 428162</p>
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

