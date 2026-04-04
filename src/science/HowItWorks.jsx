import { useRef, useEffect } from "react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <section className="science-how-it-works">
      <h2 className="section-title text-center">How it works?</h2>

      <div className="how-it-works-container">
        <div className="how-it-works-box">
          <p className="how-it-works-subtitle">
            From one botanical compound to stable blood sugar
          </p>

          <div className="how-it-works-flow" ref={containerRef}>
            {/* Step 1 */}
            <div className="flow-step">
              <span className="flow-label">INPUT</span>
              <h3 className="flow-title">Berberine 500mg</h3>
            </div>

            <div className="flow-arrow">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flow-step">
              <span className="flow-label">TRIGGER</span>
              <h3 className="flow-title">AMPK activated</h3>
            </div>

            <div className="flow-arrow">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flow-step">
              <span className="flow-label">LIVER</span>
              <h3 className="flow-title">Glucose output reduced</h3>
            </div>

            <div className="flow-arrow">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flow-step">
              <span className="flow-label">LIVER</span>
              <h3 className="flow-title">Glucose output reduced</h3>
            </div>

            <div className="flow-arrow">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Step 5 */}
            <div className="flow-step">
              <span className="flow-label">LIVER</span>
              <h3 className="flow-title">Glucose output reduced</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
