import React, { useState } from "react";
import "./LandingDetails.css";
import TrustStandards from "./trust";
import { ArrowRight, Star } from "lucide-react";
import bottleImg from "../home/bottles.png";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryCartItem } from "../services/productCatalog";
import useMenuStore from "../useMenuStore";
import useCartActions from "../hooks/useCartActions";

const LandingDetails = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const openCheckout = useMenuStore((state) => state.openCheckout);
  const { product } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();

  const testimonials = [
    {
      name: "Naina Sharma",
      text: "My insulin levels have never been so balanced, totally recommend glycomics!! Worth every penny!!",
    },
    {
      name: "Hisham Damudi.",
      text: "The quality is exceptional. I appreciate the transparency in ingredients and the natural formulation. Highly recommended!",
    },
    {
      name: "Rahul Verma",
      text: "I've tried many supplements, but Beyond Bound stands out. The results are noticeable and I love that it's all-natural.",
    },
  ];

  const faqs = [
    {
      q: "Is Glycomics safe to use along other medication?",
      a: "Always consult with your healthcare provider before starting any new supplement...",
    },
    {
      q: "How long before I start seeing results?",
      a: "Most users report feeling a difference in energy levels within 2-3 weeks...",
    },
    {
      q: "Can I take this with Metformin?",
      a: "Glycomics is designed to support blood sugar, but check with your doctor for interactions...",
    },
    {
      q: "What HbA1c range is this for?",
      a: "This is suitable for individuals looking to maintain healthy glucose levels...",
    },
    {
      q: "Is it safe for long-term daily use?",
      a: "Yes, our natural formulation is designed for daily nutritional support...",
    },
  ];

  const handleShopNow = async () => {
    await addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: "20",
        quantity: 1,
        fallbackImage: bottleImg,
      }),
    );
    openCheckout();
  };

  return (
    <div className="landing-container-ld">
      {/* Testimonial Header */}
      <section className="py-12 md:py-20">
        <h2 className="text-center text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight max-w-4xl mx-auto mb-6 md:mb-10">
          “My blood sugar used to spike after every meal and I'd feel exhausted.
          After 3 weeks on Glycomics, that afternoon crash is completely gone.
          My doctor noticed the difference too”
        </h2>
        <p className="text-center text-gray-600 mb-8 flex flex-wrap items-center justify-center gap-2 text-base md:text-lg">
          <Star size={20} fill="#0d7377" color="#0d7377" />
          <Star size={20} fill="#0d7377" color="#0d7377" />
          <Star size={20} fill="#0d7377" color="#0d7377" />
          <Star size={20} fill="#0d7377" color="#0d7377" />
          <Star size={20} fill="#0d7377" color="#0d7377" />
          <span>~Naina Sharma</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex gap-1 mb-4">
                <Star size={18} fill="#c9a87c" color="#c9a87c" />
                <Star size={18} fill="#c9a87c" color="#c9a87c" />
                <Star size={18} fill="#c9a87c" color="#c9a87c" />
                <Star size={18} fill="#c9a87c" color="#c9a87c" />
                <Star size={18} fill="#c9a87c" color="#c9a87c" />
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section-ld">
        <p className="trust-text-ld">
          Backed by 200+ peer-reviewed studies on berberine · Clinical trial in
          progress at Somaiya Hospital · AYUSH certified
        </p>
        <TrustStandards />
      </section>

      {/* FAQ Section */}
      <section className="faq-section-ld">
        <div className="faq-left-ld">
          <h2 className="faq-title-ld">
            What You
            <br /> Should Know About Glycomics
          </h2>
          <button type="button" className="cart-btn-ld" onClick={handleShopNow}>
            Buy Now <ArrowRight />
          </button>
        </div>
        <div className="faq-right-ld">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="faq-item-ld"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="faq-question-ld">
                {faq.q}
                <span>{openIndex === i ? "−" : "⌵"}</span>
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
