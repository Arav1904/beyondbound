import "./Product.css";
import BeforeAfterSlider from "./BeforeAfter";
import GlycomicsCard from "./GlycomicsCard";
import LandingDetails from "./LandingDetails";
import ProductPage from "./ProductPage";
import SoundFamiliar from "./SoundFamiliar";
import IngredientsSection from "./IngredientsSection";
import beforeImg from "./assets/before.jpg";
import afterImg from "./assets/after.jpg";
import GlycomicsComparison from "./GlycomicsComparison";

function App() {
  return (
    <>
      <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(40px, 8vw, 80px)',
      }}>
 
        <ProductPage />
        <SoundFamiliar />
        <IngredientsSection />
        <div className="spiking-section">
          <div
            style={{
              fontFamily: "'Bree Serif', 'Inter'",
              fontWeight: 200,
              fontSize: "64px",
              lineHeight: "82px",
            }}
          >
            Spiking Yesterday.
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
            
              fontSize: "56px",
              lineHeight: "56px",
              marginBottom: "32px",
            }}
          >
            Stable Today
          </div>
        </div>
        <BeforeAfterSlider
          beforeImg={afterImg}
          afterImg={beforeImg}
        />
        <GlycomicsComparison />
      
        <LandingDetails />
      </div>
    </>
  );
}

export default App;

