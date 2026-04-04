import React, { useState } from 'react';
import '../css/track-order.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faRotateLeft, faFileInvoice } from '@fortawesome/free-solid-svg-icons';

const TrackOrder = ({ isOpen, orderId, onToggle }) => {
  const [searchInput, setSearchInput] = useState(orderId);

  // Mock order data - replace with actual API call
  const orders = {
    '#1092': {
      id: '#1092',
      product: 'Glycomics x 2',
      price: '₹3,850',
      date: '15 Mar',
      status: 'shipped',
      steps: [
        { label: 'Pre-order requested', completed: true },
        { label: 'Pre-order confirmed', completed: true },
        { label: 'Processing', completed: true },
        { label: 'Shipped', completed: true },
        { label: 'Delivered', completed: false }
      ]
    }
  };

  const orderData = orders[searchInput] || orders['#1092'];

  const handleCheckStatus = () => {
    onToggle(searchInput);
  };

  return (
    <div className="track-order-box">
      {/* Search Section */}
      <div className="track-order-search-section">
        <div className="search-container">
          <input
            type="text"
            className="track-search-input"
            placeholder="Pre-order ID (e.g. #1092) or registered phone number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            className="check-status-btn"
            onClick={handleCheckStatus}
          >
            Check pre-order status
          </button>
        </div>
      </div>

      {/* Order Details Section - Collapsible */}
      {isOpen && (
        <div className="order-details-section">
          {/* Order Header */}
          <div className="order-header">
            <div className="order-info">
              <h3 className="order-id">{orderData.id}</h3>
              <p className="order-product">
                {orderData.product} · {orderData.price} · {orderData.date}
              </p>
            </div>
            <div className={`status-badge status-${orderData.status}`}>
              {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-container">
            {orderData.steps.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className={`timeline-dot ${step.completed ? 'completed' : ''}`}>
                  {step.completed && <span className="checkmark">✓</span>}
                </div>
                {index < orderData.steps.length - 1 && (
                  <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
                )}
                <div className={`timeline-label ${step.completed ? 'completed' : ''}`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn">
              <FontAwesomeIcon icon={faExclamationCircle} className="action-icon" />
              <span>Report delivery issue</span>
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faRotateLeft} className="action-icon" />
              <span>Request a return</span>
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faFileInvoice} className="action-icon" />
              <span>Get invoice</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
