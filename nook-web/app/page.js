'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import './page.css';

const CONFIG = {
  hero: {
    title: 'THE LITTLE NOOK BUFFET',
    description: 'Crafting exceptional workplace dining experiences with fresh, customizable sandwich buffets',
    ctaText: 'Start Your Order',
    ctaLink: '/order',
    backgroundImage: '/assets/nook.jpg',
  },
  infoCards: [
    {
      number: '01',
      title: 'Custom Buffets',
      description: 'Build your perfect buffet with premium meats, fresh vegetables, artisan breads, and gourmet cheeses.',
    },
    {
      number: '02',
      title: 'Professional Service',
      description: 'White-glove setup and service that respects your workspace and schedule requirements.',
    },
    {
      number: '03',
      title: 'Fresh Daily',
      description: 'All ingredients sourced and prepared fresh every morning for maximum quality and taste.',
    },
  ],
  gallery: {
    title: 'Our Creations',
    items: [
      { src: '/assets/fullbuffet1.png', alt: 'Buffets' },
      { src: '/assets/fullbuffet2.png', alt: 'Sandwiches' },
      { src: '/assets/savoury3.png', alt: 'Savoury' },
      { src: '/assets/dips3.png', alt: 'Dips' },
    ],
  },
};

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
    <div className="home-page">
      {/* ========== HERO SECTION ========== */}
      <section className="hero-section" ref={heroSectionRef}>
        <div className="hero-background">
          <Image
            src={CONFIG.hero.backgroundImage}
            alt="The Nook Sandwich Bar and Buffets"
            className="hero-bg-image"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text-center">
            <h1 className="hero-title">
              {CONFIG.hero.title.split(' ').slice(0, 2).join(' ')} <br />
              {CONFIG.hero.title.split(' ').slice(2).join(' ')}
            </h1>

            <p className="hero-description">
              {CONFIG.hero.description}
            </p>
            <Link href={CONFIG.hero.ctaLink} className="cta-button">
              {CONFIG.hero.ctaText}
            </Link>
          </div>
        </div>

        <div className="scroll-indicator" ref={scrollIndicatorRef}>
          <div className="scroll-arrow">↓</div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ========== INFO CARDS SECTION ========== */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-grid">
            {CONFIG.infoCards.map((card, index) => (
              <div key={index} className="info-card">
                <div className="card-number">{card.number}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PHOTO GALLERY SECTION ========== */}
      <section className="photo-gallery-section">
        <div className="gallery-container">
          <h2 className="gallery-title">{CONFIG.gallery.title}</h2>
          <div className="gallery-grid">
            {CONFIG.gallery.items.map((item, index) => (
              <div key={index} className="gallery-item">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
