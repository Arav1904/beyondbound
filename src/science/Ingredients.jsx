import "./Ingredients.css";
import berberineImg from "../product/assets/berberine.png";
import gurmarImg from "../product/assets/gurmar.png";
import vijaysarImg from "../product/assets/vijaysar.png";
import { useRef, useEffect } from "react";
import amlaImg from "../product/assets/amla.png";
import haldiImg from "../product/assets/haldi.png";
import jambuImg from "../product/assets/jambuseeds.png";
import karelaImg from "../product/assets/karela.png";

const Ingredients = () => {
  const ingredients = [
    {
      image: berberineImg,
      isHero: true,
      name: "Berberine",
      dosage: "500 mg",
      description: "Guides your cells to use glucose better",
    },
    {
      image: gurmarImg,
      isHero: false,
      name: "Gurmar",
      dosage: "80 mg",
      description: "Stops sugar rushing into your blood",
    },
    {
      image: vijaysarImg,
      isHero: false,
      name: "Vijaysar",
      dosage: "60 mg",
      description: "Keeps your insulin-making cells healthy",
    },
    {
      image: jambuImg,
      isHero: false,
      name: "Jambu Seeds",
      dosage: "40 mg",
      description: "Slows down how fast carbs digest",
    },
    {
      image: karelaImg,
      isHero: false,
      name: "Karela",
      dosage: "30 mg",
      description: "Moves sugar into cells without insulin",
    },
    {
      image: haldiImg,
      isHero: false,
      name: "Haldi",
      dosage: "20 mg",
      description: "Cools the inflammation blocking your metabolism",
    },
    {
      image: amlaImg,
      isHero: false,
      name: "Amla",
      dosage: "20 mg",
      description: "Protects cells that process your energy",
    },
  ];
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
    <section className="science-ingredients">
      <h2 className="section-title text-center">Key ingredients</h2>

      <div className="ingredients-header">
        <div className="ingredients-title-wrapper">
          <h3 className="ingredients-subtitle">
            7 ingredients.
            <br />
            Zero fillers.
          </h3>
        </div>
        <div className="ingredients-desc-wrapper">
          <p className="ingredients-desc">
            Each ingredient has a specific, evidence-backed role. Tap any to see
            how it fits the mechanism.
          </p>
        </div>
      </div>

      <div className="scroll-wrap" ref={containerRef}>
        <div className="grid-is">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="card-outer-wrapper-is">
              <div className="card-bg-is"></div> {/* The Teal Shadow Element */}
              <div className="card-content-is">
                {ingredient.isHero && (
                  <span className="hero-badge-is">Hero Ingredient</span>
                )}
                <div className="img-container-is">
                  <div className="img-circle-is"></div>
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="ingredient-img-is"
                  />
                </div>
                <div className="content-is">
                  <h3 className="ingredient-name-is">{ingredient.name}</h3>
                  <p className="ingredient-dosage-is">{ingredient.dosage}</p>
                  <p className="ingredient-description-is">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="ingredients-grid">
        {ingredients.map(ing => (
          <div className="ingredient-card-wrapper" key={ing.id}>
            <div className="ingredient-card">
              {ing.badge && <div className="ingredient-badge">{ing.badge}</div>}
              
              <div className="ingredient-img-container">
                <div className="ingredient-img-bg"></div>
                <img src={ing.img} alt={ing.name} className="ingredient-img" />
              </div>
              
              <h4 className="ingredient-name">{ing.name}</h4>
              <span className="ingredient-amount">{ing.amount}</span>
              <p className="ingredient-feature">{ing.desc}</p>
            </div>
          </div>
        ))}
      </div> */}
    </section>
  );
};

export default Ingredients;
