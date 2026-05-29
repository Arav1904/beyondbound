import React from "react";
import "./CTA.css";
import useMenuStore from "../useMenuStore";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryCartItem } from "../services/productCatalog";
import useCartActions from "../hooks/useCartActions";

const CTA = () => {
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const { product } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();

  const benefits = [
    "100% refund guarantee",
    "Priority dispatch",
    "Secure checkout",
    "AYUSH certified",
  ];

  const handleBuyNow = async () => {
    await addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: "20",
        quantity: 1,
      }),
    );
    setIsCartOpen(true);
  };

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
            ₹1599 · 60 vegetarian capsules · Free expert consultation
          </p>

          <div className="cta-buttons">
            <button className="cta-btn primary" onClick={handleBuyNow}>
              Buy Glycomics
            </button>
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
