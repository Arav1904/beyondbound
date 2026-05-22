import React from "react";
import { CircleX, CircleCheck, ArrowRight } from "lucide-react";
import "./GlycomicsComparison.css";
import bottleImg from "../home/bottles.png";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryCartItem } from "../services/productCatalog";
import useMenuStore from "../useMenuStore";
import useCartActions from "../hooks/useCartActions";

const ComparisonCard = ({ title, items, variant }) => {
  const isPositive = variant === "with";

  return (
    <div className={`comparison-card-gc ${variant}`}>
      <h2 className="card-title-gc">{title}</h2>
      <div className="card-content-gc">
        <ul className="item-list-gc">
          {items.map((item, index) => (
            <li key={index} className="list-item-gc">
              <span className="icon-wrapper-gc">
                {isPositive ? (
                  <CircleCheck
                    size={28}
                    className="icon-check-gc"
                    fill="currentColor"
                    stroke="white"
                  />
                ) : (
                  <CircleX
                    size={28}
                    className="icon-x-gc"
                    fill="currentColor"
                    stroke="white"
                  />
                )}
              </span>
              <span className="item-text-gc">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const GlycomicsComparison = () => {
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const { product } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();

  const data = {
    without: [
      "Energy crashes after meals",
      "Constant sugar cravings",
      "Sluggish after carbs",
      "Belly fat that won't shift",
      "Restless, broken sleep",
    ],
    with: [
      "Steady energy all day",
      "Cravings noticeably reduced",
      "Digest meals comfortably",
      "Metabolism working again",
      "More consistent sleep",
    ],
  };

  const handleShopNow = async () => {
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
    <div className="comparison-container-sup-gc">
      <div className="comparison-container-gc">
        <ComparisonCard
          title="Without Glycomics"
          items={data.without}
          variant="without"
        />
        <ComparisonCard
          title="With Glycomics"
          items={data.with}
          variant="with"
        />
      </div>

      <button type="button" className="cart-button-gc" onClick={handleShopNow}>
        Buy Now <ArrowRight />
      </button>
    </div>
  );
};

export default GlycomicsComparison;
