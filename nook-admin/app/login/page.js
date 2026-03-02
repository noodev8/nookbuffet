'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [step, setStep] = useState('credentials'); // 'credentials' or 'verify'
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Step 1 - check email/password, trigger 2FA email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.return_code === 'TWO_FA_REQUIRED') {
        // Credentials were good - move to the code entry step
        setTempToken(data.temp_token);
        setStep('verify');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - submit the code from the email
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempToken, code }),
      });

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>the little nook buffet</h1>
          <p>Admin Portal</p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email or username"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>
              A 6-digit code has been sent to your email. Enter it below to continue.
            </p>

            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              className="login-button"
              style={{ marginTop: '10px', background: 'transparent', color: '#555', border: '1px solid #ddd' }}
              onClick={() => { setStep('credentials'); setError(''); setCode(''); }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

