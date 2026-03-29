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

function App() {
  const activePage = useMenuStore((state) => state.activePage);

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
    </div>
  )
}

export default App

