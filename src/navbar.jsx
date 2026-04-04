import { useEffect, useRef, useState } from "react";
import "./navbar.css";
import beyondLogo from "./assets/beyond.svg";
import useMenuStore from "./useMenuStore";
import { ArrowUpRight } from "lucide-react";

function Navbar() {
  const activeMenu = useMenuStore((state) => state.activeMenu);
  const setActiveMenu = useMenuStore((state) => state.setActiveMenu);
  const activePage = useMenuStore((state) => state.activePage);
  const setActivePage = useMenuStore((state) => state.setActivePage);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const openAccountModal = useMenuStore((state) => state.openAccountModal);
  const logout = useMenuStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileMenuOpen]);

  const openAuthModal = () => {
    setAuthMode("signup");
    setIsLoginModalOpen(true);
    setProfileMenuOpen(false);
    setMobileProfileOpen(false);
  };

  const openAccountSection = (section) => {
    openAccountModal(section);
    setProfileMenuOpen(false);
    setMobileProfileOpen(false);
    setMobileOpen(false);
  };

  const handleSignOut = () => {
    window.google?.accounts?.id?.disableAutoSelect?.();

    if (signedInUser?.email) {
      window.google?.accounts?.id?.revoke?.(signedInUser.email, () => {});
    }

    logout();
    setProfileMenuOpen(false);
    setMobileProfileOpen(false);
    setMobileOpen(false);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileOpen(false);
    setMobileProfileOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (activePage === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActivePage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setMobileOpen(false);
    setMobileProfileOpen(false);
    setProfileMenuOpen(false);
  };

  const avatarText = signedInUser?.name || signedInUser?.email || "A";
  const avatarInitial = avatarText.charAt(0).toUpperCase();
  const isAdmin = signedInUser?.role === "admin";

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
          <div
            className="navbar-brand"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <img src={beyondLogo} alt="Beyond Bound" className="navbar-logo" />
            BEYOND BOUND<span>®</span>
          </div>

          <ul className="navbar-links">
            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => navigateTo("home")}
              >
                Home
              </button>
            </li>

            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => navigateTo("products")}
              >
                Products
              </button>
            </li>

            {isAdmin ? (
              <li className="menu-item">
                <button
                  type="button"
                  className="menu-trigger"
                  onClick={() => navigateTo("admin")}
                >
                  Admin
                </button>
              </li>
            ) : null}

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
                onClick={() => navigateTo("science")}
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
                onClick={() => navigateTo("about")}
                aria-expanded={activeMenu === "about"}
              >
                About
              </button>
            </li>

            <li className="menu-item">
              <button
                type="button"
                className="menu-trigger"
                onClick={() => navigateTo("contact")}
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="navbar-actions">
            <button type="button" className="nav-contact-us-btn">
              Contact Us
              <ArrowUpRight size={"18px"} />
            </button>

            {signedInUser ? (
              <div className="profile-menu-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className="profile-avatar-btn"
                  aria-label="Open account menu"
                  aria-expanded={profileMenuOpen}
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  {signedInUser.picture ? (
                    <img
                      src={signedInUser.picture}
                      alt={signedInUser.name || "Profile"}
                      className="profile-avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      className="profile-avatar-fallback"
                      aria-hidden="true"
                    >
                      {avatarInitial}
                    </span>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown" role="menu">
                    <div className="profile-dropdown-summary">
                      <p className="profile-dropdown-name">
                        {signedInUser.name || "Beyond Bound User"}
                      </p>
                      <p className="profile-dropdown-email">
                        {signedInUser.email || "Google account"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => openAccountSection("profile")}
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => openAccountSection("address")}
                    >
                      Manage Address
                    </button>
                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => openAccountSection("orders")}
                    >
                      Order History
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        className="profile-dropdown-item"
                        onClick={() => navigateTo("admin")}
                      >
                        Admin Dashboard
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="profile-dropdown-item profile-dropdown-item--danger"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="nav-signup-btn"
                onClick={openAuthModal}
              >
                Sign Up
              </button>
            )}
          </div>

          <button
            type="button"
            className={`hamburger${mobileOpen ? " hamburger--open" : ""}`}
            onClick={() => {
              setMobileOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setMobileProfileOpen(false);
                }

                return next;
              });
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
                navigateTo("home");
              }}
            >
              Home
            </button>
            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                navigateTo("products");
              }}
            >
              Products
            </button>

            {isAdmin ? (
              <button
                type="button"
                className="mobile-link"
                onClick={() => {
                  navigateTo("admin");
                }}
              >
                Admin
              </button>
            ) : null}

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                navigateTo("science");
              }}
            >
              Science
            </button>

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                navigateTo("about");
              }}
            >
              About
            </button>

            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                navigateTo("contact");
              }}
            >
              Contact
            </button>

            <br />

            {signedInUser ? (
              <div className="mobile-profile-block">
                <button
                  type="button"
                  className="mobile-profile-trigger"
                  onClick={() => setMobileProfileOpen((prev) => !prev)}
                  aria-expanded={mobileProfileOpen}
                >
                  <span className="mobile-profile-avatar" aria-hidden="true">
                    {signedInUser.picture ? (
                      <img
                        src={signedInUser.picture}
                        alt={signedInUser.name || "Profile"}
                        className="mobile-profile-avatar-img"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="mobile-profile-avatar-fallback">
                        {avatarInitial}
                      </span>
                    )}
                  </span>
                  <span className="mobile-profile-label">Account</span>
                  <span
                    className={`mobile-caret${mobileProfileOpen ? " mobile-caret--open" : ""}`}
                  >
                    ⌄
                  </span>
                </button>

                {mobileProfileOpen && (
                  <div className="mobile-profile-actions">
                    <button
                      type="button"
                      className="mobile-link"
                      onClick={() => openAccountSection("profile")}
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="mobile-link"
                      onClick={() => openAccountSection("address")}
                    >
                      Manage Address
                    </button>
                    <button
                      type="button"
                      className="mobile-link"
                      onClick={() => openAccountSection("orders")}
                    >
                      Order History
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        className="mobile-link"
                        onClick={() => navigateTo("admin")}
                      >
                        Admin Dashboard
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="mobile-link"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-actions">
                <button
                  type="button"
                  className="nav-signup-btn"
                  onClick={openAuthModal}
                >
                  Sign Up
                </button>
              </div>
            )}
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
