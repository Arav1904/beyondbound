import Product from './product/Product.jsx'
import AboutUs from './about/components/AboutUs.jsx'
import Home from './home/src//App.jsx'
import Science from './science/Science.jsx'
import './App.css'
import Navbar from './navbar.jsx'
import Footer from './footer.jsx'
import Contact from './contact/contact.jsx'
import useMenuStore from './useMenuStore';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Login from './login/components/login.jsx';
import Signup from './login/components/Signup.jsx';
import AccountModal from './login/components/AccountModal.jsx';
import bottleImg from './home/bottle.jpeg';

function App() {
  const activePage = useMenuStore((state) => state.activePage);
  const isLoginModalOpen = useMenuStore((state) => state.isLoginModalOpen);
  const setIsLoginModalOpen = useMenuStore((state) => state.setIsLoginModalOpen);
  const authMode = useMenuStore((state) => state.authMode);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const isAccountModalOpen = useMenuStore((state) => state.isAccountModalOpen);
  const setIsAccountModalOpen = useMenuStore((state) => state.setIsAccountModalOpen);

  return (
    <div className="app" style={{position: 'relative'}}>
      <Navbar />
      <div /* className='scaled-wrapper' */>
   
        <div /* className='scaled-wrapper' */>

        {activePage === 'products' && <Product />}
        </div>

        {activePage === 'about' && <AboutUs />}
        {activePage === 'home' && <Home />}
        {activePage === 'science' && <Science />}
        {activePage === 'contact' && <Contact />}
      </div>
      <Footer />

      <button
        type="button"
        className="cart-fab-2"
        aria-label="Shopping Cart"
        
      >
        <FontAwesomeIcon icon={faShoppingCart} />
      </button>

      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="login-modal-content" onClick={(event) => event.stopPropagation()}>
            <button
              className="login-modal-close"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close"
            >
              x
            </button>
            {authMode === 'login' ? (
              <Login imageUrl={bottleImg} isModal={true} onSwitchToSignup={() => setAuthMode('signup')} />
            ) : (
              <Signup imageUrl={bottleImg} isModal={true} onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}

      {isAccountModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsAccountModalOpen(false)}>
          <div className="login-modal-content" onClick={(event) => event.stopPropagation()}>
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
    </div>
  )
}

export default App

