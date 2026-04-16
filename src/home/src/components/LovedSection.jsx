import "../css/lovedSection.css";

import starIcon from "../../Icon (7).png";

const testimonials = [
  {
    id: "sarah",
    name: "Naina Sharma",
    role: "Verified Customer",
    quote:
      "My insulin levels have never been so balanced, totally recommend glycomics!! Worth every penny!!",
  },
  {
    id: "james",
    name: "Hisham Damudi.",
    role: "Verified Customer",
    quote:
      '"The quality is exceptional. I appreciate the transparency in ingredients and the natural formulation. Highly recommended!"',
  },
  {
    id: "emily",
    name: "Rahul Verma",
    role: "Verified Customer",
    quote:
      "I've tried many supplements, but Beyond Bound stands out. The results are noticeable and I love that it's all-natural.",
  },
];

function LovedSection() {
  return (
    <section className="loved-section" aria-labelledby="loved-title">
      <div className="loved-container">
        <div className="loved-frame">
          <header className="loved-header">
            <div className="loved-stars" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={`loved-star-${index}`}
                  src={starIcon}
                  alt=""
                  aria-hidden="true"
                  className="loved-star"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>

            <div className="loved-heading-block">
              <h2 id="loved-title" className="loved-title">
                Loved by 10,000+
              </h2>
              <p className="loved-subtitle">Real stories from our community</p>
            </div>
          </header>

          <div className="loved-cards" role="list">
            {testimonials.map((item) => (
              <article key={item.id} className="loved-card" role="listitem">
                <div className="loved-card-stars" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <img
                      key={`${item.id}-star-${starIndex}`}
                      src={starIcon}
                      alt=""
                      className="loved-card-star"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
                <p className="loved-quote">{item.quote}</p>
                <div className="loved-profile">
                  <div
                    className="loved-avatar"
                  />
                  <div className="loved-meta">
                    <p className="loved-name">{item.name}</p>
                    <p className="loved-role">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LovedSection;
