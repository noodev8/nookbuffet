'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Navigation.css';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar-option3">
      <div className="nav-container-option3">
        <Link href="/" className="logo-option3" onClick={closeMenu}>
          <Image
            src="/assets/logo.jpg"
            alt="The Nook Buffet"
            className="logo-image-option3"
            width={40}
            height={40}
          />
          <span className="logo-text-option3">The Nook Buffet</span>
        </Link>

        <div className="nav-links-option3">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <button
          className="hamburger-menu-option3"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger-line-option3 ${isMenuOpen ? 'active' : ''}`}></span>
        </button>

        <div className={`mobile-menu-option3 ${isMenuOpen ? 'active' : ''}`}>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/order" onClick={closeMenu}>
            Order
          </Link>
          <Link href="/menu" onClick={closeMenu}>
            Menu
          </Link>
          <Link href="/about" onClick={closeMenu}>
            About
          </Link>
          <Link href="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

