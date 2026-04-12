import "../css/transformationSection.css";

import transformationImage from "../../docglycos1.jpeg";
import usePrimaryProduct from "../../../hooks/usePrimaryProduct";
import { buildPrimaryPreorderDraft } from "../../../services/productCatalog";
import useMenuStore from "../../../useMenuStore";

const metrics = [
  {
    id: "customers",
    value: "10,000+",
    label: "Happy Customers",
  },
  {
    id: "rating",
    value: "4.8",
    label: "Average Rating",
  },
  {
    id: "purity",
    value: "97%",
    label: "Purity Standard",
  },
];

function TransformationSection() {
  const openPreOrderModal = useMenuStore((state) => state.openPreOrderModal);
  const { product } = usePrimaryProduct();

  const handleShopNow = () => {
    openPreOrderModal(
      buildPrimaryPreorderDraft(product, {
        sizeValue: "60",
        quantity: 1,
        fallbackImage: transformationImage,
      }),
    );
  };

  return (
    <section className="transform-section" aria-labelledby="transform-title">
      <div className="transform-shell">
        <div className="transform-main">
          <div className="transform-left">
            <h2 id="transform-title" className="transform-title">
              Start your <br /> metabolic <br />
              transformation <br /> today
            </h2>

            <p className="transform-copy">
              Join thousands taking control of their glucose health with
              pharmaceutical-grade berberine. Pre-order today and reserve the
              next dispatch window.
            </p>

            <div className="transform-actions">
              <button
                type="button"
                className="transform-btn transform-btn--primary"
                onClick={handleShopNow}
              >
                Pre-order Now
              </button>
              <button
                type="button"
                className="transform-btn transform-btn--secondary"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="transform-right">
            <img
              src={transformationImage}
              alt="Glycomics bottle with stethoscope"
              className="transform-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div
          className="transform-metrics"
          role="list"
          aria-label="Product impact metrics"
        >
          {metrics.map((metric) => (
            <div className="transform-metric" role="listitem" key={metric.id}>
              <p className="transform-value">{metric.value}</p>
              <p className="transform-label">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TransformationSection;
