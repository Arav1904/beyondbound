import "./IngredientsSection.css"; // Importing the corresponding CSS file
import berberineImg from "./assets/berberine.png";
import gurmarImg from "./assets/gurmar.png";
import vijaysarImg from "./assets/vijaysar.png";
import { useRef, useEffect } from "react";
import amlaImg from "./assets/amla.png";
import haldiImg from "./assets/haldi.png";
import jambuImg from "./assets/jambuseeds.png";
import karelaImg from "./assets/karela.png";


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
  }
  ,
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
  },{
    image: haldiImg,
    isHero: false,
    name: "Haldi",
    dosage: "20 mg",
    description: "Cools the inflammation blocking your metabolism",
  },{
    image: amlaImg,
    isHero: false,
    name: "Amla",
    dosage: "20 mg",
    description: "Protects cells that process your energy",
  },

];

function IngredientsSection() {
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
    <div className="body-is">
      <section className="ingredients-container-is">
        <header className="header-is">
          <h2 className="title-is">Curated with Care.</h2>
          <h2 className="title-alt-is">Backed by Nature.</h2>
        </header>

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
      </section>
    </div>
  );
}

export default IngredientsSection;

