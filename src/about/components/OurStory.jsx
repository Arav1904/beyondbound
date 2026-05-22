import React, { useState } from "react";
import "../css/OurStory.css";
import bottleAbout from "../assets/bottleabout.png";
import { ChevronDown } from "lucide-react";
import usePrimaryProduct from "../../hooks/usePrimaryProduct";
import { buildPrimaryCartItem } from "../../services/productCatalog";
import useMenuStore from "../../useMenuStore";
import useCartActions from "../../hooks/useCartActions";

const OurStory = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const openCheckout = useMenuStore((state) => state.openCheckout);
  const { product } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();

  const handleShopNow = async () => {
    await addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: "20",
        quantity: 1,
        fallbackImage: bottleAbout,
      }),
    );
    openCheckout();
  };

  return (
    <section className="our-story">
      <div className="story-header-container" id="our-story-section">
        <div className="story-bg-text">OUR STORY</div>
        <h2>Our Story</h2>
      </div>

      <div className="gap-section">
        <h3>
          <span className="section-number">01</span> The Gap
        </h3>
        <div className="gap-cards">
          <div className="gap-card">
            <div className="gap-card-header"></div>
            <h4>Overpriced Supplements</h4>
            <p>
              Brands support an exorbitant pricing system with exploitation in
              the supply chain and zero brand loyalty back.
            </p>
          </div>
          <div className="gap-card">
            <div className="gap-card-header"></div>
            <h4>Poor Standardization</h4>
            <p>
              Ayurvedic supplements lack regulation, resulting in compromised
              quality, undefined potency, and trust issues.
            </p>
          </div>
          <div className="gap-card">
            <div className="gap-card-header"></div>
            <h4>Lack of Transparency</h4>
            <p>
              Ingredient sourcing, ethical practices, formulation standards, and
              supply chain remain largely undisclosed.
            </p>
          </div>
        </div>
      </div>

      <div className="solution-section">
        <h3>
          <span className="section-number">02</span> The Solution
        </h3>
        <p className="solution-description">
          We built our entire formulation philosophy around three non-negotiable
          principles.
        </p>

        <div className="solution-content">
          <div className="solution-items">
            <div className="solution-item-wrapper">
              <button
                className={`solution-item ${expandedItem === 1 ? "expanded" : ""}`}
                onClick={() => setExpandedItem(expandedItem === 1 ? null : 1)}
              >
                <div className="solution-item-left">
                  <span className="solution-number">01</span>
                  <span>Standardized Extracts</span>
                </div>
                <ChevronDown className="dropdown-icon" size={20} />
              </button>
              {expandedItem === 1 && (
                <div className="solution-content-dropdown">
                  <p>Source certified | Ratio defined | COA verified</p>
                </div>
              )}
            </div>
            <div className="solution-item-wrapper">
              <button
                className={`solution-item ${expandedItem === 2 ? "expanded" : ""}`}
                onClick={() => setExpandedItem(expandedItem === 2 ? null : 2)}
              >
                <div className="solution-item-left">
                  <span className="solution-number">02</span>
                  <span>Modern Lab Validation</span>
                </div>
                <ChevronDown className="dropdown-icon" size={20} />
              </button>
              {expandedItem === 2 && (
                <div className="solution-content-dropdown">
                  <p>GC-MS Testing | HPCL Analysis | NACL Accredited</p>
                </div>
              )}
            </div>
            <div className="solution-item-wrapper">
              <button
                className={`solution-item ${expandedItem === 3 ? "expanded" : ""}`}
                onClick={() => setExpandedItem(expandedItem === 3 ? null : 3)}
              >
                <div className="solution-item-left">
                  <span className="solution-number">03</span>
                  <span>Responsible Formulation</span>
                </div>
                <ChevronDown className="dropdown-icon" size={20} />
              </button>
              {expandedItem === 3 && (
                <div className="solution-content-dropdown">
                  <p>
                    Ethical sourcing | Sustainable practices | Quality assured
                  </p>
                </div>
              )}
            </div>
            <button onClick={handleShopNow} className="shop-now-btn">
              Buy now {"->"}
            </button>
          </div>

          <div className="solution-image">
            <div className="product-bottle">
              <img src={bottleAbout} alt="Bottle About" />
            </div>
          </div>
        </div>

        <div className="certifications">
          <div className="cert">
            <h4>100%</h4>
            <p>Batch COAs</p>
          </div>
          <div className="cert">
            <h4>All SKUs</h4>
            <p>Third-party Tested</p>
          </div>
          <div className="cert">
            <h4>Ayush</h4>
            <p>Regulatory Compliance</p>
          </div>
          <div className="cert">
            <h4>WHO-GMP</h4>
            <p>Manufacturing Standard</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
