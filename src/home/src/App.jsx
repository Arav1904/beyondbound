import "./App.css";
import HowItWorks from "./components/Howit";
import Trust from "./components/trust";
import AboutBeyond from "./components/AboutBeyond";
import MeetGlycomicsShowcase from "./components/MeetGlycomicsShowcase";
import WhoGlycomics from "./components/WhoGlyco";
import ProductPage from "../../product/ProductPage";
import PurchaseAssurance from "./components/PurchaseAssurance";
import WhyDifferentSection from "./components/WhyDifferentSection";
import FAQ from "./components/faq";
import Meet from "./components/MeetGlyco";
import LovedSection from "./components/LovedSection";
import TransformationSection from "./components/TransformationSection";

function App() {
  return (
    <div className="page-container">
      <Meet />
      <Trust />
      <AboutBeyond />
      <MeetGlycomicsShowcase />
      <WhoGlycomics />
      <ProductPage />
      <PurchaseAssurance />
      <WhyDifferentSection />
      <FAQ />
      <HowItWorks />
      <LovedSection />
      <TransformationSection />
    </div>
  );
}
export default App;
