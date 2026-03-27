'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

      // Try customer login first
      const customerRes = await fetch(`${apiUrl}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const customerData = await customerRes.json();

      if (customerData.return_code === 'SUCCESS') {
        localStorage.setItem('customer_token', customerData.token);
        localStorage.setItem('customer', JSON.stringify(customerData.customer));
        router.push('/account');
        return;
      }

      // If the credentials were wrong, try staff login
      if (customerData.return_code === 'INVALID_CREDENTIALS') {
        const staffRes = await fetch(`${apiUrl}/api/auth/staff-web-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const staffData = await staffRes.json();

        if (staffData.return_code === 'SUCCESS') {
          // Store as the same keys the rest of the app uses, with accountType so i know they're staff
          localStorage.setItem('customer_token', staffData.token);
          localStorage.setItem('customer', JSON.stringify({
            ...staffData.staff,
            first_name: staffData.staff.full_name.split(' ')[0],
            last_name:  staffData.staff.full_name.split(' ').slice(1).join(' '),
            accountType: 'staff'
          }));
          router.push('/account');
          return;
        }

        if (staffData.return_code === 'ACCOUNT_DISABLED') {
          setError(staffData.message);
          return;
        }
      }

      // Everything failed - show the original customer error
      setError(customerData.message || 'Login failed. Please try again.');

    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page-option3">
      <div className="auth-page-container">
        <div className="auth-card">

          <div className="auth-header">
            <h1 className="auth-title">My Account</h1>
            <p className="auth-subtitle">Sign in to manage your orders</p>
          </div>

          {error && <p className="auth-error">{error}</p>}

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

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
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

