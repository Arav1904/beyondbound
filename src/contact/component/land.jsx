import React, { useState } from 'react';
import '../css/land.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const ContactLand = () => {
  const [orderId, setOrderId] = useState('');

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      console.log('Tracking order:', orderId);
      // Add your order tracking logic here
    }
  };

  return (
    <div className="contact-container">
      {/* Main Contact Section */}
      <div className="contact-main">
        <div className="contact-badge">
          <FontAwesomeIcon icon={faPhone} className="badge-icon" />
          CONTACT US
        </div>
        
        <h1 className="contact-title">We're here to help.</h1>
        
        <p className="contact-subtitle">
          Mon–Sat, 10am–7pm IST • We reply within 24 hours.
        </p>

        {/* Contact Cards */}
        <div className="contact-cards-grid">
          {/* WhatsApp Card */}
          <div className="contact-card">
            <div className="card-icon whatsapp-icon">
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
            <h3 className="card-title">WhatsApp</h3>
            <a href="https://wa.me/919876543210" className="card-phone">
              +91 98765 43210
            </a>
            <p className="card-description">
              Fastest · usually replies in 2 hrs
            </p>
          </div>

          {/* Email Card */}
          <div className="contact-card">
            <div className="card-icon email-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h3 className="card-title">Email</h3>
            <a href="mailto:hello@beyondbound.in" className="card-email">
              hello@beyondbound.in
            </a>
            <p className="card-description">
              For detailed queries · 24 hr response
            </p>
          </div>

          {/* Instagram Card */}
          <div className="contact-card">
            <div className="card-icon instagram-icon">
              <FontAwesomeIcon icon={faInstagram} />
            </div>
            <h3 className="card-title">Instagram</h3>
            <a href="https://instagram.com/beyondbound.in" className="card-handle">
              @beyondbound.in
            </a>
            <p className="card-description">
              DMs open · product questions welcome
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Track Order Section */}
      <div className="track-order-section">
        <h2 className="track-order-title">TRACK YOUR ORDER</h2>
        
        <div className="track-order-container">
          <input
            type="text"
            className="track-order-input"
            placeholder="Order ID (e.g. #1092) or registered phone number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
          />
          <button 
            className="check-status-btn"
            onClick={handleTrackOrder}
          >
            Check status
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactLand;
