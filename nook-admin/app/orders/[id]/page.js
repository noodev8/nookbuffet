'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './order-details.css';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  // Fetch order details
  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('admin_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.return_code === 'UNAUTHORIZED' || data.return_code === 'FORBIDDEN') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/login');
          return;
        }

        if (data.return_code === 'SUCCESS') {
          setOrder(data.data);
        } else if (data.return_code === 'NOT_FOUND') {
          setError('Order not found');
        } else {
          setError(data.message || 'Failed to load order');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const markOrderAsDone = async () => {
    if (!confirm('Mark this order as completed?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.return_code === 'SUCCESS') {
        // Go back to orders list after marking as done
        router.push('/');
      } else {
        alert('Failed to update order: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const goBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={goBack} className="back-btn">Back to Orders</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="order-details-container">
      <header className="order-details-header">
        <div className="header-left">
          <button onClick={goBack} className="back-btn">← Back to Orders</button>
          <button className="print-btn" onClick={handlePrint}>Print</button>
        </div>
        <div className="header-right">
          <h1>{order.order_number}</h1>
          <div className="order-meta">
            <span className="order-date">Ordered: {formatDateTime(order.created_at)}</span>
            <span className="order-date fulfillment">
              Needed: {order.fulfillment_date ? new Date(order.fulfillment_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'Not specified'} {order.fulfillment_time ? `at ${order.fulfillment_time}` : ''}
            </span>
          </div>
          <div className="order-badges">
            <span className={`badge badge-${order.fulfillment_type}`}>{order.fulfillment_type}</span>
            <span className="badge badge-people">
              {order.buffets?.reduce((sum, b) => sum + b.num_people, 0) || 0} people
            </span>
            <span className="badge badge-total">£{parseFloat(order.total_price).toFixed(2)}</span>
          </div>
        </div>
      </header>

      <div className="order-content">
        {/* Customer Details */}
        <div className="detail-section customer-section">
          <h3>Customer Details</h3>
          <div className="info-cards">
            <div className="info-card">
              <span className="info-label">Business</span>
              <span className="info-value">{order.notes || 'N/A'}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Email</span>
              <span className="info-value">{order.customer_email}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Phone</span>
              <span className="info-value">{order.customer_phone}</span>
            </div>
            <div className="info-card full-width">
              <span className="info-label">Address</span>
              <span className="info-value">{order.fulfillment_address}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Details */}
        <div className="detail-section fulfillment-section">
          <h3>Fulfillment Details</h3>
          <div className="info-cards">
            <div className="info-card">
              <span className="info-label">Type</span>
              <span className="info-value fulfillment-type">{order.fulfillment_type}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Date</span>
              <span className="info-value">{formatDate(order.fulfillment_date)}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Time</span>
              <span className="info-value">{formatTime(order.fulfillment_time)}</span>
            </div>
          </div>
        </div>

        {/* Buffets */}
        {order.buffets && order.buffets.map((buffet, buffetIndex) => (
          <div key={buffet.id} className="detail-section buffet-section">
            <h3>{buffet.buffet_name || `Buffet #${buffetIndex + 1}`}</h3>

            <div className="buffet-summary">
              <div className="summary-item">
                <span className="summary-label">People</span>
                <span className="summary-value">{buffet.num_people}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Per Person</span>
                <span className="summary-value">£{parseFloat(buffet.price_per_person).toFixed(2)}</span>
              </div>
              <div className="summary-item highlight">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">£{parseFloat(buffet.subtotal).toFixed(2)}</span>
              </div>
            </div>

            {(buffet.dietary_info || buffet.allergens || buffet.notes) && (
              <div className="buffet-notes">
                {buffet.dietary_info && (
                  <div className="note-item dietary-note">
                    <span className="note-label">Dietary Info</span>
                    <span className="note-value">{buffet.dietary_info}</span>
                  </div>
                )}
                {buffet.allergens && (
                  <div className="note-item allergen-note">
                    <span className="note-label">Allergens</span>
                    <span className="note-value">{buffet.allergens}</span>
                  </div>
                )}
                {buffet.notes && (
                  <div className="note-item general-note">
                    <span className="note-label">Notes</span>
                    <span className="note-value">{buffet.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Menu Items */}
            {buffet.items && buffet.items.length > 0 && (
              <div className="menu-items">
                <h4>Selected Menu Items</h4>
                <div className="items-by-category">
                  {(() => {
                    const itemsByCategory = {};
                    buffet.items.forEach(item => {
                      if (!itemsByCategory[item.category_name]) {
                        itemsByCategory[item.category_name] = [];
                      }
                      itemsByCategory[item.category_name].push(item);
                    });

                    return Object.entries(itemsByCategory).map(([category, items]) => (
                      <div key={category} className="category-group">
                        <h5 className="category-title">
                          <span className="category-dot"></span>
                          {category}
                        </h5>
                        <ul className="items-list">
                          {items.map(item => (
                            <li key={item.id}>{item.item_name}</li>
                          ))}
                        </ul>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Upgrades */}
            {buffet.upgrades && buffet.upgrades.length > 0 && (
              <div className="upgrades-section">
                <h4>Upgrades</h4>
                {buffet.upgrades.map((upgrade) => (
                  <div key={upgrade.id} className="upgrade-card">
                    <div className="upgrade-header">
                      <span className="upgrade-name">{upgrade.upgrade_name}</span>
                      <span className="upgrade-price">
                        £{parseFloat(upgrade.price_per_person).toFixed(2)}/person × {upgrade.num_people} = £{parseFloat(upgrade.subtotal).toFixed(2)}
                      </span>
                    </div>
                    {upgrade.selectedItems && upgrade.selectedItems.length > 0 && (
                      <div className="upgrade-items">
                        {(() => {
                          const itemsByCategory = {};
                          upgrade.selectedItems.forEach(item => {
                            if (!itemsByCategory[item.category_name]) {
                              itemsByCategory[item.category_name] = [];
                            }
                            itemsByCategory[item.category_name].push(item);
                          });

                          return Object.entries(itemsByCategory).map(([category, items]) => (
                            <div key={category} className="upgrade-category-group">
                              <span className="upgrade-category-name">{category}:</span>
                              <span className="upgrade-category-items">
                                {items.map(item => item.item_name).join(', ')}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="page-footer">
        <button className="done-btn" onClick={markOrderAsDone}>Mark as Done</button>
      </div>
    </div>
  );
}
