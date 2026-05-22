import React from "react";
import "./GlycomicsCard.css";
import bottleImg from "../home/bottles.png";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryCartItem } from "../services/productCatalog";
import useMenuStore from "../useMenuStore";
import useCartActions from "../hooks/useCartActions";

const GlycomicsCard = () => {
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const { product } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();

  const data = [
    { bad: "Energy crashes after meals", good: "Steady energy all day" },
    { bad: "Constant sugar cravings", good: "Cravings noticeably reduced" },
    { bad: "Sluggish after carbs", good: "Digest meals comfortably" },
    { bad: "Belly fat that won't shift", good: "Metabolism working again" },
    { bad: "Restless, broken sleep", good: "More consistent sleep" },
  ];

  const handleAddToCart = async () => {
    await addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: "20",
        quantity: 1,
        fallbackImage: bottleImg,
      }),
    );
    setIsCartOpen(true);
  };

  return (
    <div className="container">
      <div className="card-wrapper">
        {/* Left Column */}
        <div className="column">
          <h2 className="title muted">Without Glycomics</h2>
          <div className="card card-muted">
            {data.map((item, i) => (
              <div key={i} className="list-item">
                <span className="icon icon-cross">✕</span>
                <p>{item.bad}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="column">
          <h2 className="title">With Glycomics</h2>
          <div className="card card-active">
            {data.map((item, i) => (
              <div key={i} className="list-item">
                <span className="icon icon-check">✓</span>
                <p>{item.good}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="cart-button" onClick={handleAddToCart}>
        <span className="cart-icon">🛒</span> BUY NOW
      </button>
    </div>
  );
};

export default GlycomicsCard;
