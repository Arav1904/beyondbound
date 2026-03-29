import React, { useState } from 'react';
import '../css/contact-form.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="message-section">
      <div className="section-header">
        <h2 className="section-title">SEND A MESSAGE</h2>
        <div className="header-line"></div>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        {/* Name and Phone Row */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">NAME</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">PHONE</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group full-width">
          <label className="form-label">EMAIL</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="you@email.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Subject */}
        <div className="form-group full-width">
          <label className="form-label">SUBJECT</label>
          <input
            type="text"
            name="subject"
            className="form-input"
            placeholder="What is this about?"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Message */}
        <div className="form-group full-width">
          <label className="form-label">MESSAGE</label>
          <textarea
            name="message"
            className="form-textarea"
            placeholder="Tell us how we can help..."
            value={formData.message}
            onChange={handleInputChange}
            rows="5"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Send message
        </button>

        {/* Footer Text */}
        <p className="form-footer">We'll reply to your email within 24 hours.</p>
      </form>
    </div>
  );
};

export default ContactForm;
