import React, { useState } from 'react';
import '../css/contact-faq.css';

const ContactFAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order using the tracking number sent to your email. Visit our "Track Order" section and enter your order ID or phone number.'
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused products in original packaging. Please contact our customer service for return authorization.'
    },
    {
      id: 3,
      question: 'Is Glycomics safe to take with other medications?',
      answer: 'Glycomics is a natural supplement. However, we recommend consulting with your healthcare provider before combining it with other medications.'
    },
    {
      id: 4,
      question: 'Is it vegetarian / vegan?',
      answer: 'Yes, our Glycomics products are 100% vegetarian and vegan-friendly. All ingredients are plant-based and ethically sourced.'
    },
    {
      id: 5,
      question: 'Do you offer COD?',
      answer: 'Yes, we offer Cash on Delivery (COD) for selected locations in India. Available payment modes depend on your delivery area.'
    },
    {
      id: 6,
      question: 'Wholesale or stockist enquiries?',
      answer: 'For wholesale and stockist inquiries, please email us at wholesale@beyondbound.in or call +91 98765 43210.'
    },
    {
      id: 7,
      question: 'When will I receive my order?',
      answer: 'Standard delivery takes 5-7 business days. Express delivery is available for 1-2 business days delivery in major cities.'
    }
  ];

  const handleToggle = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="faq-section">
      <div className="section-header">
        <h2 className="section-title">COMMON QUESTIONS</h2>
        <div className="header-line"></div>
      </div>

      <div className="accordion">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className={`accordion__item ${openItem === item.id ? 'accordion__item--open' : ''}`}
            open={openItem === item.id}
            onClick={(e) => {
              e.preventDefault();
              handleToggle(item.id);
            }}
          >
            <summary className="accordion__header">
              <span className="accordion__title">{item.question}</span>
              <svg className="accordion__toggle" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" />
              </svg>
            </summary>
            <div className="accordion__content">
              <div className="accordion__content-inner">
                <p className="accordion__text">{item.answer}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default ContactFAQ;
