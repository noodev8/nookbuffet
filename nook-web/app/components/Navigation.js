'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import './Navigation.css';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accountHref, setAccountHref] = useState('/login');
  const pathname = usePathname();

  // Re-check login state on every route change so the icon always points to the right place
  useEffect(() => {
    const customer = localStorage.getItem('customer');
    setAccountHref(customer ? '/account' : '/login');
  }, [pathname]);

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
          <Link href={accountHref} className="nav-account-link" aria-label="My Account">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </Link>
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
          <Link href="/select-buffet" onClick={closeMenu}>
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
          <Link href={accountHref} onClick={closeMenu}>
            My Account
          </Link>
        </div>
      </div>
    </nav>
  );
}

