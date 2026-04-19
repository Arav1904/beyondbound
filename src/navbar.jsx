import { useEffect, useRef, useState } from "react";
import "./navbar.css";
import beyondLogo from "./assets/beyond.svg";
import useMenuStore from "./useMenuStore";
import { ArrowUpRight, Menu, X } from "lucide-react";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        className="navbar-wrapper !fixed !inset-x-0 !top-0 !z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
        onMouseLeave={() => {
          // Close any open dropdown menus when the cursor leaves the navbar.
          if (["science", "about", "login"].includes(activeMenu)) {
            setActiveMenu(null);
          }
        }}
      >
        <nav className="navbar !my-0 !h-14 !w-full !max-w-[1500px] !px-3 sm:!h-16 sm:!px-4 md:!h-[72px] md:!px-7 grid !grid-cols-[auto_1fr_auto] md:!grid-cols-[1fr_auto_1fr] items-center">
          <img
            src={beyondLogo}
            alt="Beyond Bound"
            className="navbar-logo-separate !block md:!hidden"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          />
          <div
            className="navbar-brand !col-start-2 !justify-self-center md:!col-start-1 md:!justify-self-start"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <img src={beyondLogo} alt="Beyond Bound" className="navbar-logo" />
            BEYOND BOUND<span>®</span>
          </div>

          <ul className="navbar-links !hidden md:!flex">
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
          </ul>

          <div className="navbar-actions !hidden md:!flex">
            <button
              type="button"
              className="nav-contact-us-btn"
              onClick={() => navigateTo("contact")}
            >
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
            className="col-start-3 inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-lg bg-transparent text-slate-700 shadow-none transition hover:bg-slate-100 md:!hidden"
            onClick={() => {
              setMobileOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setMobileProfileOpen(false);
                }

                return next;
              });
            }}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-56px)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-3 shadow-lg sm:max-h-[calc(100vh-64px)] md:hidden">
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    navigateTo("home");
                  }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    navigateTo("products");
                  }}
                >
                  Products
                </button>
              </li>

              {isAdmin ? (
                <li>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={() => {
                      navigateTo("admin");
                    }}
                  >
                    Admin
                  </button>
                </li>
              ) : null}

              <li>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    navigateTo("science");
                  }}
                >
                  Science
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    navigateTo("about");
                  }}
                >
                  About
                </button>
              </li>
            </ul>

            <button
              type="button"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              onClick={() => navigateTo("contact")}
            >
              Contact Us
              <ArrowUpRight size={16} />
            </button>

            {signedInUser ? (
              <div className="mobile-profile-block mt-3">
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
                  <div className="mobile-profile-actions mt-2">
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      onClick={() => openAccountSection("profile")}
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      onClick={() => openAccountSection("address")}
                    >
                      Manage Address
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      onClick={() => openAccountSection("orders")}
                    >
                      Order History
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        onClick={() => navigateTo("admin")}
                      >
                        Admin Dashboard
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <button
                  type="button"
                  className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  onClick={openAuthModal}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <div aria-hidden="true" className="h-14 w-full sm:h-16 md:h-[72px]" />
    </>
  );
}

export default Navbar;
