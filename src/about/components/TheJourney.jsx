import React, { useState } from "react";
import "../css/TheJourney.css";

const timelineData = [
  {
    year: "2026",
    title: "Market Launch",
    date: "(March - April 2026)",
  },
  {
    year: "2025",
    title: "Ayush certified & product ready for Clinical trial",
    date: "(Sep 2024 - Oct 2025)",
  },
  {
    year: "2024",
    title: "Invitro, Formulation & development",
    date: "(May 2024 - Sep 2024)",
  },
  {
    year: "2023",
    title: "Ideation & R&D",
    date: "(Nov 2023 - Dec 2023)",
  },
];

const TheJourney = () => {
  const [activeIndex, setActiveIndex] = useState(0); 

  return (
    <section className="the-journey">
      
      {/* HEADER */}
      <div className="journey-container">
        <h2>Our Journey</h2>
        <p className="journey-subtitle">
          From pharmacological hypothesis to market-ready formulation in under
          24 months.
        </p>
      </div>

      {/* TIMELINE */}
      <div className="timeline">
        {timelineData.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              className={`timeline-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              
              
              <div
                className="timeline-line"
                style={{
                  background: isActive ? "#2a7c7c" : "#d0d0d0",
                }}
              ></div>

              {/* YEAR */}
              <div className="timeline-year">{item.year}</div>

              {/* CONTENT */}
              <div className="timeline-content">
                <h3>{item.title}</h3>
                <p>{item.date}</p>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};

export default TheJourney;