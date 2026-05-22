import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import useMenuStore from "../useMenuStore";
import {
  clearServerCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartApi";
import "./CartDrawer.css";

function CartDrawer() {
  const cartItems = useMenuStore((state) => state.cartItems);
  const cartSubtotal = useMenuStore((state) => state.cartSubtotal);
  const cartTotalItems = useMenuStore((state) => state.cartTotalItems);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const authToken = useMenuStore((state) => state.authToken);
  const isCartSyncing = useMenuStore((state) => state.isCartSyncing);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const setCartFromServer = useMenuStore((state) => state.setCartFromServer);
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const openCheckout = useMenuStore((state) => state.openCheckout);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const updateLocalCartItemQuantity = useMenuStore(
    (state) => state.updateLocalCartItemQuantity,
  );
  const removeLocalCartItem = useMenuStore(
    (state) => state.removeLocalCartItem,
  );
  const clearCartLocal = useMenuStore((state) => state.clearCartLocal);
  const setCartMessage = useMenuStore((state) => state.setCartMessage);

  const isAuthenticated = Boolean(signedInUser && authToken);

  const syncServerUpdate = async (action, fallbackAction) => {
    setCartSyncing(true);
    try {
      const cart = await action();
      setCartFromServer(cart);
    } catch (error) {
      fallbackAction?.();
      setCartMessage(
        error.message || "Cart sync failed. Saved locally instead.",
      );
    } finally {
      setCartSyncing(false);
    }
  };

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      await handleRemove(item);
      return;
    }

    if (isAuthenticated && item._id) {
      await syncServerUpdate(
        () => updateCartItem(authToken, item._id, nextQuantity),
        () => updateLocalCartItemQuantity(item.id, nextQuantity),
      );
      return;
    }

    updateLocalCartItemQuantity(item.id, nextQuantity);
  };

  const handleRemove = async (item) => {
    if (isAuthenticated && item._id) {
      await syncServerUpdate(
        () => removeCartItem(authToken, item._id),
        () => removeLocalCartItem(item.id),
      );
      return;
    }

    removeLocalCartItem(item.id);
  };

  const handleClear = async () => {
    if (isAuthenticated) {
      await syncServerUpdate(
        () => clearServerCart(authToken),
        () => clearCartLocal(),
      );
      return;
    }

    clearCartLocal();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setCartMessage("Please sign in to continue checkout.");
      setAuthMode("login");
      setIsLoginModalOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setIsCartOpen(false);
    openCheckout();
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <aside
        className="cart-drawer"
        aria-label="Cart"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer-header">
          <div>
            <p className="cart-drawer-title">Your Cart</p>
            <p className="cart-drawer-subtitle">
              {cartTotalItems} item{cartTotalItems === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        {isCartSyncing ? (
          <p className="cart-syncing-text">Syncing your cart...</p>
        ) : null}

        <div className="cart-drawer-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={34} />
              <p>Your cart is empty</p>
              <span>Add Glycomics to get started.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="cart-line-item">
                <div className="cart-line-image-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="cart-line-image"
                    />
                  ) : (
                    <span
                      className="cart-line-image cart-line-image--fallback"
                      aria-hidden="true"
                    >
                      BB
                    </span>
                  )}
                </div>

                <div className="cart-line-main">
                  <p className="cart-line-name">{item.productName}</p>
                  {item.size ? (
                    <p className="cart-line-meta">Size: {item.size}</p>
                  ) : null}
                  <p className="cart-line-price">₹{item.price.toFixed(2)}</p>

                  <div className="cart-line-actions">
                    <div className="cart-qty-control">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => handleRemove(item)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="cart-drawer-footer">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Items</span>
            <span>{cartTotalItems}</span>
          </div>

          <button
            type="button"
            className="cart-clear-btn"
            onClick={handleClear}
            disabled={cartItems.length === 0}
          >
            Clear Cart
          </button>

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default CartDrawer;
