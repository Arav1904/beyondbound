import { useEffect } from "react";
import Product from "./product/Product.jsx";
import AboutUs from "./about/components/AboutUs.jsx";
import Home from "./home/src//App.jsx";
import Science from "./science/Science.jsx";
import "./App.css";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";
import Contact from "./contact/contact.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import CustomerProfilePage from "./profile/CustomerProfilePage.jsx";
import useMenuStore from "./useMenuStore";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Login from "./login/components/login.jsx";
import Signup from "./login/components/Signup.jsx";
import AccountModal from "./login/components/AccountModal.jsx";
import CartDrawer from "./cart/CartDrawer.jsx";
import bottleImg from "./home/bottle.jpeg";
import { getCurrentSession } from "./services/cartApi";
import PreOrderModal from "./preorder/PreOrderModal.jsx";

function App() {
  const activePage = useMenuStore((state) => state.activePage);
  const isLoginModalOpen = useMenuStore((state) => state.isLoginModalOpen);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const authMode = useMenuStore((state) => state.authMode);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const isAccountModalOpen = useMenuStore((state) => state.isAccountModalOpen);
  const setIsAccountModalOpen = useMenuStore(
    (state) => state.setIsAccountModalOpen,
  );
  const authToken = useMenuStore((state) => state.authToken);
  const setAuthSession = useMenuStore((state) => state.setAuthSession);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const logout = useMenuStore((state) => state.logout);
  const isCartOpen = useMenuStore((state) => state.isCartOpen);
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const isPreOrderModalOpen = useMenuStore(
    (state) => state.isPreOrderModalOpen,
  );
  const cartTotalItems = useMenuStore((state) => state.cartTotalItems);
  const cartMessage = useMenuStore((state) => state.cartMessage);
  const clearCartMessage = useMenuStore((state) => state.clearCartMessage);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const isAuthenticated = Boolean(signedInUser);

  useEffect(() => {
    let cancelled = false;

    if (!authToken) {
      return undefined;
    }

    const loadSession = async () => {
      setCartSyncing(true);

      try {
        const session = await getCurrentSession(authToken);

        if (cancelled) {
          return;
        }

        setAuthSession({
          token: authToken,
          user: session.user,
          cart: session.cart,
        });
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setCartSyncing(false);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [authToken, logout, setAuthSession, setCartSyncing]);

  useEffect(() => {
    if (!isAuthenticated || !isLoginModalOpen) {
      return;
    }

    setIsLoginModalOpen(false);
  }, [isAuthenticated, isLoginModalOpen, setIsLoginModalOpen]);

  useEffect(() => {
    if (!cartMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      clearCartMessage();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [cartMessage, clearCartMessage]);

  return (
    <div className="app" style={{ position: "relative" }}>
      <Navbar />
      <div>
        {activePage === "products" && <Product />}
        {activePage === "about" && <AboutUs />}
        {activePage === "home" && <Home />}
        {activePage === "science" && <Science />}
        {activePage === "contact" && <Contact />}
        {activePage === "admin" && <AdminDashboard />}
        {activePage === "profile" && <CustomerProfilePage />}
      </div>
      <Footer />

      <button
        type="button"
        className="cart-fab-2"
        aria-label="Shopping Cart"
        onClick={() => setIsCartOpen(true)}
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        {cartTotalItems > 0 ? (
          <span className="cart-fab-badge">
            {cartTotalItems > 99 ? "99+" : cartTotalItems}
          </span>
        ) : null}
      </button>

      {cartMessage ? <div className="cart-toast">{cartMessage}</div> : null}

      {isLoginModalOpen && (
        <div
          className="login-modal-overlay"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="login-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="login-modal-close"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close"
            >
              x
            </button>
            {authMode === "login" ? (
              <Login
                imageUrl={bottleImg}
                isModal={true}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <Signup
                imageUrl={bottleImg}
                isModal={true}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
      )}

      {isAccountModalOpen && (
        <div
          className="login-modal-overlay"
          onClick={() => setIsAccountModalOpen(false)}
        >
          <div
            className="login-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="login-modal-close"
              onClick={() => setIsAccountModalOpen(false)}
              aria-label="Close account modal"
            >
              x
            </button>
            <AccountModal />
          </div>
        </div>
      )}

      {isCartOpen ? <CartDrawer /> : null}
      {isPreOrderModalOpen ? <PreOrderModal /> : null}
    </div>
  );
}

export default App;
