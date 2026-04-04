import { useState } from "react";
import "../css/navbar.css";
import beyondLogo from "../assets/beyond.svg";
import GoogleSignIn from "./GoogleSignIn";
import useMenuStore from "../../../useMenuStore";
import { signInWithGoogle } from "../../../services/cartApi";

const aboutItems = [
  { title: "Our Story", subtitle: "How Beyond Bound began" },
  { title: "Mission & Values", subtitle: "What drives us" },
  { title: "Certifications", subtitle: "Quality standards" },
];

const scienceItems = [
  { title: "How It Works", subtitle: "Mechanism overview" },
  { title: "Ingredients", subtitle: "Formula and dosage" },
  { title: "Research", subtitle: "Evidence and validation" },
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
  const cartItems = useMenuStore((state) => state.cartItems);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const setAuthSession = useMenuStore((state) => state.setAuthSession);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const setCartMessage = useMenuStore((state) => state.setCartMessage);
  const logout = useMenuStore((state) => state.logout);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [authError, setAuthError] = useState("");

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleGoogleUserChange = async (nextUser) => {
    if (!nextUser?.credential) {
      return;
    }

    setAuthError("");
    setCartSyncing(true);

    try {
      const session = await signInWithGoogle({
        credential: nextUser.credential,
        guestCartItems: cartItems,
      });

      setAuthSession({
        token: session.token,
        user: session.user,
        cart: session.cart,
      });
      setCartMessage("Signed in successfully. Cart synced to your account.");
    } catch (error) {
      const message = error.message || "Sign in failed. Please try again.";
      setAuthError(message);
      setCartMessage(message);
    } finally {
      setCartSyncing(false);
    }
  };

  const handleSignOut = () => {
    window.google?.accounts?.id?.disableAutoSelect?.();

    if (signedInUser?.email) {
      window.google?.accounts?.id?.revoke?.(signedInUser.email, () => {});
    }

    logout();
  };

  return (
    <>
      <header
        className="navbar-wrapper"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={beyondLogo} alt="Beyond Bound" className="navbar-logo" />
            BEYOND BOUND<sup className="logo-trademark">®</sup>
          </div>

          <ul className="navbar-links">
            <li className="menu-item">
              <button type="button" className="menu-trigger">
                Home
              </button>
            </li>

            <li className="menu-item">
              <button type="button" className="menu-trigger">
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
              <button type="button" className="menu-trigger">
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
                onClick={() => toggleMenu("about")}
                aria-expanded={activeMenu === "about"}
              >
                About
              </button>
            </li>

            <li className="menu-item">
              <button type="button" className="menu-trigger">
                Contact
              </button>
            </li>
          </ul>

          <div
            className={`navbar-icons${mobileOpen ? " navbar-icons--hidden" : ""}`}
          >
            <button type="button" className="signup-btn">
              Sign Up
            </button>
            <div className="login-menu">
              <button
                type="button"
                className="login-trigger"
                onClick={() => toggleMenu("login")}
                aria-label={signedInUser ? "Logout menu" : "Login menu"}
                aria-expanded={activeMenu === "login"}
              >
                <i className="fa-solid fa-user" aria-hidden="true" />
              </button>
              {activeMenu === "login" ? (
                <div className="dropdown-panel login-panel">
                  <GoogleSignIn
                    onUserChange={handleGoogleUserChange}
                    className="google-signin-button--auth"
                    buttonOptions={{ text: "signin_with", shape: "rectangular" }}
                    showSignedInState={false}
                  />
                  {signedInUser ? (
                    <>
                      {accountMenuItems.map((item) => (
                        <button key={item} type="button" className="login-item">
                          {item}
                        </button>
                      ))}
                      {/* Logout button after login */}
                      <button
                        type="button"
                        className="login-item logout-btn"
                        onClick={handleSignOut}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {authError ? (
                        <p className="login-hint login-hint--error">{authError}</p>
                      ) : null}
                      <p className="login-hint">
                        Sign in to access your account options.
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </div>
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
            <button type="button" className="mobile-link">
              Home
            </button>
            <button type="button" className="mobile-link">
              Products
            </button>

            <button
              type="button"
              className="mobile-link mobile-link--has-sub"
              onClick={() =>
                setMobileSubMenu((p) => (p === "science" ? null : "science"))
              }
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
              onClick={() =>
                setMobileSubMenu((p) => (p === "about" ? null : "about"))
              }
              aria-expanded={mobileSubMenu === "about"}
            >
              About
              <span
                className={`mobile-caret${mobileSubMenu === "about" ? " mobile-caret--open" : ""}`}
              >
                ⌄
              </span>
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

            <button type="button" className="mobile-link">
              Contact
            </button>
          </div>
        )}
      </header>

      <button
        type="button"
        className={`cart-fab${mobileOpen || activeMenu === "login" ? " cart-fab--hidden" : ""}`}
        aria-label="Cart"
      >
        <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
      </button>
    </>
  );
}

export default Navbar;
