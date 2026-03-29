import React from 'react';
import './Hero.css';
import topImg from '../home/top.png';

const Hero = () => {
  return (
    <section className="science-hero" style={{ backgroundImage: `url(${topImg})` }}>
      <div className="science-hero-overlay">
        <div className="science-hero-content">
          <h1 className="science-hero-title">
            THE SCIENCE<br />
            BEHIND<br />
            GLYCOMICS
          </h1>
        </div>
        <div className="science-hero-stats">
          <div className="science-stat-box">
            <h2 className="science-stat-value">200+</h2>
            <p className="science-stat-label">Peer-reviewed studies on Berberine</p>
          </div>
          <div className="science-stat-box">
            <h2 className="science-stat-value">97.2%</h2>
            <p className="science-stat-label">Standardised Berberine<br/>purity (GC-MS validated)</p>
          </div>
          <div className="science-stat-box border-none">
            <h2 className="science-stat-value">7</h2>
            <p className="science-stat-label">Active Ayurvedic ingredients</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
