import React from 'react';
import './Mechanism.css';
import bottleImg from '../product/assets/bottle.png';

const Mechanism = () => {
  const steps = [
    {
      num: '01',
      title: 'AMPK activation',
      desc: 'Berberine triggers AMPK — your body\'s cellular energy sensor. Think of it as flipping the metabolic switch that signals cells to absorb and use glucose more efficiently.'
    },
    {
      num: '02',
      title: 'Liver regulation',
      desc: 'It slows down gluconeogenesis in the liver. This simply means your liver produces and releases less excess glucose into your bloodstream, especially when fasting.'
    },
    {
      num: '03',
      title: 'Cellular glucose uptake',
      desc: 'By improving insulin sensitivity, cells naturally pull more glucose from the blood to use for energy, resulting in stabilized, safer blood sugar levels throughout the day.'
    }
  ];

  return (
    <section className="science-mechanism">
      <h2 className="section-title text-center">
        Mechanism of<br />Action
      </h2>
      
      <div className="mechanism-container">
        <div className="mechanism-content">
          <h3 className="mechanism-subtitle">3 steps.<br />One result.</h3>
          <p className="mechanism-desc">Each step builds on the last — addressing the root cause of blood sugar disruption, not just masking symptoms.</p>
          
          <div className="mechanism-steps">
            {steps.map((step) => (
              <div 
                key={step.num} 
                className="mechanism-step"
              >
                <div className="step-num">{step.num}</div>
                <div className="step-text">
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mechanism-image-wrapper">
          <img src={bottleImg} alt="Glycomics Bottle" className="mechanism-image" />
        </div>
      </div>
    </section>
  );
};

export default Mechanism;
