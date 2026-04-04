import './WhoIsItFor.css';
import FeatureCards from './FeatureCards';

const WhoIsItFor = () => {
  return (
    <section className="science-who-is-it-for">
      <h2 className="section-title text-center">Who is it for</h2>

      <FeatureCards />

      {/* <div className="who-cards-container">
        {cards.map(card => (
          <div className="who-card" key={card.id}>
            <div className="who-card-icon">
              {card.icon}
            </div>
            <h3 className="who-card-title">{card.title}</h3>
            <p className="who-card-desc">{card.desc}</p>
          </div>
        ))}
      </div> */}

      <div className="who-disclaimer">
        <div className="disclaimer-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div className="disclaimer-text">
          <p>Glycomics is not intended to replace prescribed medication including Metformin or other glucose-lowering drugs. If you have diagnosed diabetes or are on medication, consult your physician before use. Not intended to diagnose, treat, cure, or prevent any disease.</p>
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;
