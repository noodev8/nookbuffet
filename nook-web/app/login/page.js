'use client';

import { useState } from 'react';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="welcome-page-option3">
      <div className="auth-page-container">
        <div className="auth-card">

          <div className="auth-header">
            <h1 className="auth-title">My Account</h1>
            <p className="auth-subtitle">Sign in to manage your orders</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="auth-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="auth-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="auth-forgot-link">
                <a href="#">Forgot password?</a>
              </div>
            </div>

            <button type="submit" className="auth-submit-button">
              Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-links">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="auth-link">
                Create one
              </Link>
            </p>
            <p>
              <Link href="/select-buffet" className="auth-link-muted">
                Continue as guest →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

