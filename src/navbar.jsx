import { useState } from "react";
import "./navbar.css";
import beyondLogo from "./assets/beyond.svg";
import GoogleSignIn from "./GoogleSignIn";
import useMenuStore from './useMenuStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { ArrowUpRight } from "lucide-react";

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
  const setActivePage = useMenuStore((state) => state.setActivePage);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [signedInUser, setSignedInUser] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
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
          <div className="navbar-brand">
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

            <button type="button" className="nav-signup-btn">
              Sign Up
            </button>
          </div>


           

          <button
            type="button"
            className={`hamburger${mobileOpen ? " hamburger--open" : ""}`}
            onClick={() => setMobileOpen((prev) => !prev)}
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
            <div className="navbar-actions">
              <button type="button" className="nav-login-btn">
                Login
              </button>

              <button type="button" className="nav-signup-btn">
                Sign Up
              </button>
            </div>

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
              className="mobile-link mobile-link--has-sub"
              onClick={() => {
                setActivePage("science");
                setMobileOpen(false);
                setMobileSubMenu((p) => (p === "science" ? null : "science"));
              }}
              aria-expanded={mobileSubMenu === "science"}
            >
              Science
              <span
                className={`mobile-caret${mobileSubMenu === "science" ? " mobile-caret--open" : ""}`}
              >
                ⌄
              </span>
            </button>
            {mobileSubMenu === "science" && (
              <div className="mobile-submenu">
                {scienceItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="mobile-sub-item"
                  >
                    <span className="panel-title">{item.title}</span>
                    <span className="panel-subtitle">{item.subtitle}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="mobile-link mobile-link--has-sub"
              onClick={() => {
                setActivePage("about");
                setMobileOpen(false);
                setMobileSubMenu((p) => (p === "about" ? null : "about"));
              }}
              aria-expanded={mobileSubMenu === "about"}
            >
              About
            </button>
            {mobileSubMenu === "about" && (
              <div className="mobile-submenu">
                {aboutItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="mobile-sub-item"
                  >
                    <span className="panel-title">{item.title}</span>
                    <span className="panel-subtitle">{item.subtitle}</span>
                  </button>
                ))}
              </div>
            )}

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

