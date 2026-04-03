import { useState } from "react";
import "./navbar.css";
import beyondLogo from "./assets/beyond.svg";
import GoogleSignIn from "./GoogleSignIn";
import useMenuStore from './useMenuStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { ArrowUpRight } from "lucide-react";

const aboutItems = [
  { title: "Our Story", subtitle: "How Beyond Bound began" },
  { title: "Mission & Values", subtitle: "What drives us" },
  { title: "Certifications", subtitle: "Quality standards" },
];

const accountMenuItems = [
  "View Details",
  "Delivery Status",
  "Order History",
  "Address",
  "Help",
  "Settings",
];

function Navbar() {
  const activeMenu = useMenuStore((state) => state.activeMenu);
  const setActiveMenu = useMenuStore((state) => state.setActiveMenu);
  const activePage = useMenuStore((state) => state.activePage);
  const setActivePage = useMenuStore((state) => state.setActivePage);
  const setIsLoginModalOpen = useMenuStore((state) => state.setIsLoginModalOpen);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [signedInUser, setSignedInUser] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleLogoClick = () => {
    if (activePage === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActivePage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className="navbar-wrapper"
        onMouseLeave={() => {
          // Close any open dropdown menus when the cursor leaves the navbar.
          if (["science", "about", "login"].includes(activeMenu)) {
            setActiveMenu(null);
          }
        }}
      >
        <nav className="navbar">
          <img 
            src={beyondLogo} 
            alt="Beyond Bound" 
            className="navbar-logo-separate"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          />
          <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
            <img src={beyondLogo} alt="Beyond Bound" className="navbar-logo" />
            BEYOND BOUND<span>®</span>
          </div>

          <ul className="navbar-links">
            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => setActivePage("home")}
              >
                Home
              </button>
            </li>

            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => setActivePage("products")}
              >
                Products
              </button>
            </li>

            {/* Add Product button only visible after login */}
            {signedInUser && (
              <li className="menu-item">
                <button type="button" className="menu-trigger add-product-btn">
                  Add Product
                </button>
              </li>
            )}

            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => setActivePage("science")}
              >
                Science
              </button>
            </li>

            <li
              className="menu-item"
              onMouseEnter={() => setActiveMenu("about")}
            >
              <button
                type="button"
                className="menu-trigger"
                onClick={() => setActivePage("about")}
                aria-expanded={activeMenu === "about"}
              >
                About
              </button>
            </li>

            <li className="menu-item">
              <button 
                type="button" 
                className="menu-trigger"
                onClick={() => setActivePage("contact")}
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="navbar-actions">
            <button type="button" className="nav-contact-us-btn">
              Contact Us 
              <ArrowUpRight size={'18px'} />
            </button>

            <button type="button" className="nav-signup-btn" onClick={() => setIsLoginModalOpen(true)}>
              Sign Up
            </button>
          </div>


           

          <button
            type="button"
            className={`hamburger${mobileOpen ? " hamburger--open" : ""}`}
            onClick={() => {
              setMobileOpen((prev) => !prev);
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActivePage("home");
            }}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </nav>

        {mobileOpen && (
          <div className="mobile-menu">
          

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                setActivePage("home");
                setMobileOpen(false);
                setMobileSubMenu(null);
              }}
            >
              Home
            </button>
            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                setActivePage("products");
                setMobileOpen(false);
                setMobileSubMenu(null);
              }}
            >
              Products
            </button>

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                setActivePage("science");
                setMobileOpen(false);
                setMobileSubMenu(null);
              }}
            >
              Science
            </button>

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                setActivePage("about");
                setMobileOpen(false);
                setMobileSubMenu(null);
              }}
            >
              About
            </button>

            <button 
              type="button" 
              className="mobile-link"
              onClick={() => {
                setActivePage("contact");
                setMobileOpen(false);
                setMobileSubMenu(null);
              }}
            >
              Contact
            </button>

<br />
              <div className="navbar-actions">
            
              <button type="button" className="nav-signup-btn" onClick={() => setIsLoginModalOpen(true)}>
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* <button
        type="button"
        className="cart-fab-2"
        aria-label="Shopping Cart"
      >
        <FontAwesomeIcon icon={faShoppingCart} />
      </button> */}
    </>
  );
}

export default Navbar;

