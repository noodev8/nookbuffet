'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../login/login.css';
import './register.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Save your details and track your orders</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-form-row">
              <div className="auth-form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="auth-input"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="auth-input"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="auth-input"
                placeholder="Email Address"
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
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className="auth-input"
                placeholder="Repeat your password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-submit-button">
              Create Account
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-links">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="auth-link">
                Sign in
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

