import React from "react";
import "./CTA.css";

const CTA = () => {
  const benefits = [
    "100% refund guarantee",
    "Priority pre-order dispatch",
    "Secure reservation",
    "AYUSH certified",
  ];

  return (
    <section className="science-cta">
      <div className="cta-bg-text">BB</div>
      <div className="cta-container">
        <div className="cta-content">
          <p className="cta-guarantee">30-DAY GUARANTEE</p>

          <h2 className="cta-title">
            The science is solid.
            <br />
            Try it for 10 days.
          </h2>

          <p className="cta-info">
            ₹1925 · 60 vegetarian capsules · Free expert consultation
          </p>

          <div className="cta-buttons">
            <button className="cta-btn primary">Pre-order Glycomics</button>
            <button className="cta-btn secondary">
              Book a free consultation
            </button>
          </div>

          <div className="cta-benefits">
            {benefits.map((benefit, index) => (
              <span className="benefit-item" key={index}>
                <span className="bullet">•</span> {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
