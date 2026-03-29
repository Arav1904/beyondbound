import React from 'react';
import '../css/feedform.css';
import ContactForm from './ContactForm';
import ContactFAQ from './ContactFAQ';

const FeedForm = () => {
  return (
    <div className="feedform-container">
      <div className="feedform-wrapper">
        {/* Form Section */}
        <ContactForm />

        {/* FAQ Section */}
        <ContactFAQ />
      </div>
    </div>
  );
};

export default FeedForm;

