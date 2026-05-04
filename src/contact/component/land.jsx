import React, { useState } from 'react';
import '../css/land.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import TrackOrder from './TrackOrder';

const ContactLand = () => {
  const [orderId, setOrderId] = useState('');
  const [showTrackOrderDetails, setShowTrackOrderDetails] = useState(false);

  const handleToggleTrackOrder = (id) => {
    setOrderId(id);
    setShowTrackOrderDetails(!showTrackOrderDetails);
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
            <a href="mailto:beyondbound889@gmail.com" className="card-email">
              beyondbound889@gmail.com
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
            <a href="https://instagram.com/beyondbound_" className="card-handle">
              @beyondbound_
            </a>
            <p className="card-description">
              DMs open · product questions welcome
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Track Order Component */}
      <div className="track-order-section">
        <h2 className="track-order-title">TRACK YOUR ORDER</h2>
        <TrackOrder 
          isOpen={showTrackOrderDetails}
          orderId={orderId}
          onToggle={handleToggleTrackOrder}
        />
      </div>
    </div>
  );
};

export default ContactLand;
