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
import Login from "../../login/components/login";
import Signup from "../../login/components/Signup";
import bottleImg from "../bottle.jpeg";
import useMenuStore from "../../useMenuStore";

function App() {
  const isLoginModalOpen = useMenuStore((state) => state.isLoginModalOpen);
  const setIsLoginModalOpen = useMenuStore((state) => state.setIsLoginModalOpen);
  const authMode = useMenuStore((state) => state.authMode);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  return (
    <div className="page-container">
      {/*  <Navbar /> */}
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
      
      {/* Login/Signup Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="login-modal-close" 
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            {authMode === 'login' ? (
              <Login imageUrl={bottleImg} isModal={true} onSwitchToSignup={() => setAuthMode('signup')} />
            ) : (
              <Signup imageUrl={bottleImg} isModal={true} onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
}
export default App;
