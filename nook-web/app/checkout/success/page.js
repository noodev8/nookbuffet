'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import '../checkout.css';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="welcome-page-option3">
      <div className="checkout-page-container">
        <div className="checkout-content-wrapper">
          <div className="checkout-section" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h1 className="checkout-title" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
              Order Confirmed!
            </h1>
            {orderNumber && (
              <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '2rem' }}>
                Your order number is: <strong style={{ color: 'white' }}>{orderNumber}</strong>
              </p>
            )}
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
              Thank you for your order! You will receive a confirmation email shortly.
            </p>
            <button
              className="checkout-submit-button"
              onClick={() => router.push('/')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="welcome-page-option3">
        <div className="checkout-page-container">
          <div className="checkout-content-wrapper">
            <div className="loading-state">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

