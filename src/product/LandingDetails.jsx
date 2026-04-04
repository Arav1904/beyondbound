import React, { useState } from 'react';
import './LandingDetails.css';
import TrustStandards from './trust';
import { ArrowRight, Star } from 'lucide-react';
import useCartActions from '../hooks/useCartActions';
import bottleImg from '../home/bottles.png';
import usePrimaryProduct from '../hooks/usePrimaryProduct';
import { buildPrimaryCartItem } from '../services/productCatalog';

const LandingDetails = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { addProductToCart } = useCartActions();
  const { product } = usePrimaryProduct();

  const testimonials = [
    { name: "Naina Sharma", text: "My insulin levels have never been so balanced, totally recommend glycomics!! Worth every penny!!", img: "https://i.pravatar.cc/100?u=1" },
    { name: "James K.", text: "The quality is exceptional. I appreciate the transparency in ingredients and the natural formulation. Highly recommended!", img: "https://i.pravatar.cc/100?u=2" },
    { name: "Emily R.", text: "I've tried many supplements, but Beyond Bound stands out. The results are noticeable and I love that it's all-natural.", img: "https://i.pravatar.cc/100?u=3" }
  ];

  const faqs = [
    { q: "Is Glycomics safe to use along other medication?", a: "Always consult with your healthcare provider before starting any new supplement..." },
    { q: "How long before I start seeing results?", a: "Most users report feeling a difference in energy levels within 2-3 weeks..." },
    { q: "Can I take this with Metformin?", a: "Glycomics is designed to support blood sugar, but check with your doctor for interactions..." },
    { q: "What HbA1c range is this for?", a: "This is suitable for individuals looking to maintain healthy glucose levels..." },
    { q: "Is it safe for long-term daily use?", a: "Yes, our natural formulation is designed for daily nutritional support..." }
  ];

  const handleShopNow = () => {
    addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: '60',
        quantity: 1,
        fallbackImage: bottleImg,
      }),
    );
  };

  return (
    <div className="landing-container-ld">
      {/* Testimonial Header */}
      <section className="testimonial-section-ld">
        <h2 className="main-quote-ld">
          “My blood sugar used to spike after every meal and I'd feel exhausted. After 3 weeks on Glycomics, that afternoon crash is completely gone. My doctor noticed the difference too”
        </h2>
        <p className="quote-author-ld"><Star size={'20px'} fill='#0d7377' color='#0d7377'/><Star size={'20px'} fill='#0d7377' color='#0d7377'/><Star size={'20px'} fill='#0d7377' color='#0d7377'/><Star size={'20px'} fill='#0d7377' color='#0d7377'/><Star size={'20px'} fill='#0d7377' color='#0d7377'/>&nbsp;&nbsp;~Naina Sharma</p>

        <div className="testimonial-grid-ld ">
          {testimonials.map((t, i) => (
            <div key={i} className="test-card-ld">
              <div className="stars-ld"><Star size={'16px'} fill='#c9a87c' color='#c9a87c'/><Star size={'16px'} fill='#c9a87c' color='#c9a87c'/><Star size={'16px'} fill='#c9a87c' color='#c9a87c'/><Star size={'16px'} fill='#c9a87c' color='#c9a87c'/><Star size={'16px'} fill='#c9a87c' color='#c9a87c'/></div>
              <p className="test-text-ld">"{t.text}"</p>
              <div className="user-info-ld">
                <img src={t.img} alt={t.name} className="avatar-ld" />
                <div>
                  <div className="user-name-ld">{t.name}</div>
                  <div className="verified-ld">Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section-ld">
        <p className="trust-text-ld">Backed by 200+ peer-reviewed studies on berberine · Clinical trial in progress at Somaiya Hospital · AYUSH certified</p>
        <TrustStandards/>
      </section>
      

      {/* FAQ Section */}
      <section className="faq-section-ld">
        <div className="faq-left-ld">
          <h2 className="faq-title-ld">What You<br/> Should Know About Glycomics</h2>
          <button type="button" className="cart-btn-ld" onClick={handleShopNow}>Pre-order Now <ArrowRight/></button>
        </div>
        <div className="faq-right-ld">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item-ld" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <div className="faq-question-ld">
                {faq.q}
                <span>{openIndex === i ? '−' : '⌵'}</span>
              </div>
              {openIndex === i && <div className="faq-answer-ld">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingDetails;
