'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import './page.css';

export default function Home() {
  const scrollIndicatorRef = useRef(null);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroSectionRef.current || !scrollIndicatorRef.current) return;

      const heroBottom = heroSectionRef.current.getBoundingClientRect().bottom;

      // Hide indicator when hero section is no longer in view
      if (heroBottom < 0) {
        scrollIndicatorRef.current.style.opacity = '0';
        scrollIndicatorRef.current.style.pointerEvents = 'none';
      } else {
        scrollIndicatorRef.current.style.opacity = '1';
        scrollIndicatorRef.current.style.pointerEvents = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="welcome-page-option3">
      {/* Hero Section */}
      <section className="hero-section-option3" ref={heroSectionRef}>
        <div className="hero-background-option3">
          <Image
            src="/assets/nook.jpg"
            alt="The Nook Sandwich Bar and Buffets"
            className="hero-bg-image-option3"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
          <div className="hero-overlay-option3"></div>
        </div>

        <div className="hero-content-option3">
          <div className="hero-text-center-option3">
            <h1 className="hero-title-option3">
              THE LITTLE NOOK <br />
              BUFFET
            </h1>

            <p className="hero-description-option3">
              Crafting exceptional workplace dining experiences with fresh, customizable sandwich buffets
            </p>
            <Link href="/order" className="cta-button-option3">
              Start Your Order
            </Link>
          </div>
        </div>

        <div className="scroll-indicator-option3" ref={scrollIndicatorRef}>
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

      {/* Photo Gallery Section */}
      <section className="photo-gallery-section">
        <div className="gallery-container">
          <h2 className="gallery-title">Our Creations</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <Image
                src="/assets/sandwiches.png"
                alt="Sandwiches"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/assets/wraps.png"
                alt="Wraps"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/assets/savoury.png"
                alt="Savoury"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/assets/fruit.png"
                alt="Fruit"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/assets/cake.png"
                alt="Cake"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/assets/dipsandsticks.png"
                alt="Dips and Sticks"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
