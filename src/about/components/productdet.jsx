import React, { useState, useRef } from 'react';
import '../css/productdet.css';
import withGlycoImg from '../assets/withglyco.jpeg';
import withoutGlycoImg from '../assets/withoutglyco.jpeg';
import useCartActions from '../../hooks/useCartActions';

export default function ProductDet() {
  const { addProductToCart } = useCartActions();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setSliderPosition(50); // Reset to center
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    
    if (newPosition >= 0 && newPosition <= 100) {
      setSliderPosition(newPosition);
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setSliderPosition(50); // Reset to center
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    
    if (newPosition >= 0 && newPosition <= 100) {
      setSliderPosition(newPosition);
    }
  };

  const handleAddToCart = () => {
    addProductToCart({
      productId: 'glycomics-60',
      productName: 'Glycomics (60 Capsules)',
      price: 1925,
      quantity: 1,
      size: '60',
      image: withGlycoImg,
    });
  };

  return (
    <div 
      id="product-det"
      ref={containerRef}
      className="product-det-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="product-content">
        <h2 className="product-title">
          <span className="title-main">Spiking Yesterday.</span>
          <span className="title-subtitle">Stable Today</span>
        </h2>

        <div 
          className="comparison-container"
        >
          {/* With Glyco Image - Background */}
          <img
            src={withGlycoImg}
            alt="After"
            className="comparison-image comparison-image--base"
          />

          {/* Without Glyco Image - Overlay */}
          <div 
            className="comparison-image-overlay"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={withoutGlycoImg}
              alt="Before"
              className="comparison-image"
            />
          </div>

          {/* Slider Divider */}
          <div 
            ref={sliderRef}
            className="slider-divider"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="slider-arrow slider-arrow--left">
              <i className="fas fa-chevron-left"></i>
            </div>
            <div className="slider-arrow slider-arrow--right">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>

          {/* Labels */}
          <div className="slider-label slider-label--left" style={{ opacity: isDragging ? 0 : 1 }}>After</div>
          <div className="slider-label slider-label--right" style={{ opacity: isDragging ? 0 : 1 }}>Before</div>

          <div className="click-hint">Drag to compare</div>
        </div>

        <div className="benefits-container">
          <div className={`benefits-column ${sliderPosition < 50 ? 'active' : ''}`}>
            <h3>With Glycomics</h3>
            <ul className="benefits-list">
              <li>
                <span className="icon">✓</span>
                <span>Steady energy all day</span>
              </li>
              <li>
                <span className="icon">✓</span>
                <span>Cravings noticeably reduced</span>
              </li>
              <li>
                <span className="icon">✓</span>
                <span>No afternoon slump</span>
              </li>
              <li>
                <span className="icon">✓</span>
                <span>Metabolism working again</span>
              </li>
              <li>
                <span className="icon">✓</span>
                <span>More consistent sleep</span>
              </li>
            </ul>
          </div>

          <div className={`benefits-column ${sliderPosition >= 50 ? 'active' : ''}`}>
            <h3>Without Glycomics</h3>
            <ul className="benefits-list">
              <li>
                <span className="icon">✗</span>
                <span>Energy crashes after meals</span>
              </li>
              <li>
                <span className="icon">✗</span>
                <span>Constant sugar cravings</span>
              </li>
              <li>
                <span className="icon">✗</span>
                <span>Sluggish after carbs</span>
              </li>
              <li>
                <span className="icon">✗</span>
                <span>Body fat that won't shift</span>
              </li>
              <li>
                <span className="icon">✗</span>
                <span>Restless, broken sleep</span>
              </li>
            </ul>
          </div>
        </div>

        <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>ADD TO CART</button>
      </div>
    </div>
  );
}

