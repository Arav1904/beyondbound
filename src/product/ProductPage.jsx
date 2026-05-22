import { useState } from "react";
import frontImg from "../home/bottles.png";
import backImg from "../home/back.jpg";
import sideImg from "../home/side.jpg";
import labelImg from "../home/101.png";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryCartItem, getPrimaryImage } from "../services/productCatalog";
import useMenuStore from "../useMenuStore";
import useCartActions from "../hooks/useCartActions";

import "./ProductPage.css";
const ProductPage = () => {
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const { product, packSizes } = usePrimaryProduct();
  const { addProductToCart } = useCartActions();
  const images = [frontImg, backImg, sideImg, labelImg];
  const [mainImage, setMainImage] = useState(frontImg);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("20");
  const [activeAccordion, setActiveAccordion] = useState(null);

  const sizes = packSizes;
  const resolvedSelectedSize = sizes.some((size) => size.value === selectedSize)
    ? selectedSize
    : sizes[sizes.length - 1]?.value || "20";
  const currentPrice =
    sizes.find((size) => size.value === resolvedSelectedSize)?.price ||
    product.price;
  const primaryImage = getPrimaryImage(product, frontImg);

  const accordionData = [
    {
      title: "Information",
      content:
        "This premium supplement is crafted in a GMP-certified facility. Each batch undergoes rigorous third-party testing to ensure purity and potency.",
    },
    {
      title: "Benefits",
      content:
        "Supports healthy insulin sensitivity, reduces sugar cravings, and provides sustained energy levels throughout the day without the crash.",
    },
    {
      title: "Ingredients",
      content:
        "Contains a proprietary blend of Gymnema Sylvestre, Bitter Melon, Fenugreek, and Chromium Picolinate for maximum metabolic support.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleBuyNow = async () => {
    await addProductToCart(
      buildPrimaryCartItem(product, {
        sizeValue: resolvedSelectedSize,
        quantity,
        fallbackImage: primaryImage,
      }),
    );
    setIsCartOpen(true);
  };

  return (
    <div className="body-pp">
      <div className="product-container">
        {/* Left: Image Gallery */}
        <div className="gallery-section">
          <div
            className="thumbnails"
            role="tablist"
            aria-label="Product image thumbnails"
          >
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                className={`thumb-box ${mainImage === img ? "active" : ""}`}
                onClick={() => setMainImage(img)}
                role="tab"
                aria-selected={mainImage === img}
                aria-label={`View product image ${index + 1}`}
              >
                <img src={img} alt="" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="main-display">
            <img src={mainImage} alt={`${product.name} supplement`} />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="details-section">
          <div className="badge-row">
            <span className="badge stock-badge">Available Now</span>
          </div>

          <h1 className="product-title">{product.name}</h1>
          <p className="price">₹ {currentPrice}</p>

          <p className="description">
            Experience the power of scientifically-validated Ayurvedic
            ingredients. Glycomics is formulated to support healthy glucose
            metabolism and overall metabolic wellness.
          </p>

          <div className="size-selector">
            <label>Size</label>
            <div className="size-buttons-group">
              {sizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={`size-btn ${resolvedSelectedSize === size.value ? "active" : ""}`}
                  onClick={() => setSelectedSize(size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="purchase-actions">
            <div className="quantity-counter" aria-label="Quantity selector">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="add-to-cart-btn"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          <a href="#" className="shipping-link">
            Shipping and return policy
          </a>

          <div className="accordion-section" role="list">
            {accordionData.map((item, index) => (
              <div key={index} className="accordion-item-wrapper">
                <button
                  type="button"
                  className="accordion-item"
                  role="listitem"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.title}</span>
                </button>
                <span
                  className="accordion-plus-icon"
                  aria-hidden="true"
                  onClick={() => toggleAccordion(index)}
                >
                  {activeAccordion === index ? "-" : "+"}
                </span>
                {activeAccordion === index && (
                  <div className="accordion-content">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
