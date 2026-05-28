import { useEffect, useMemo, useState } from "react";
import useMenuStore from "../useMenuStore";
import { initiatePayuPayment } from "../services/cartApi";
import "./CheckoutModal.css";

const emptyAddress = () => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
});

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

function CheckoutModal() {
  const authToken = useMenuStore((state) => state.authToken);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const accountProfile = useMenuStore((state) => state.accountProfile);
  const cartItems = useMenuStore((state) => state.cartItems);
  const cartSubtotal = useMenuStore((state) => state.cartSubtotal);
  const closeCheckout = useMenuStore((state) => state.closeCheckout);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const setCartMessage = useMenuStore((state) => state.setCartMessage);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: emptyAddress(),
    notes: "",
  });

  const isAuthenticated = Boolean(authToken && signedInUser);
  const cartItemCount = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + toPositiveInt(item.quantity, 1), 0),
    [cartItems],
  );

  useEffect(() => {
    const nextAddress = {
      ...emptyAddress(),
      ...(accountProfile?.address || {}),
    };

    setFormData((previous) => ({
      ...previous,
      name: String(accountProfile?.name || signedInUser?.name || ""),
      email: String(accountProfile?.email || signedInUser?.email || ""),
      phone: String(accountProfile?.phone || signedInUser?.phone || ""),
      address: {
        ...nextAddress,
      },
    }));

    setError("");
  }, [accountProfile, signedInUser]);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateAddress = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value,
      },
    }));
  };

  const openLogin = () => {
    closeCheckout();
    setAuthMode("login");
    setIsLoginModalOpen(true);
  };

  const submitPayuForm = ({ action, fields }) => {
    if (!action || !fields) {
      throw new Error("Payment gateway is unavailable. Try again later.");
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }

    const requiredFields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.address.line1,
      formData.address.city,
      formData.address.state,
      formData.address.postalCode,
    ].map((value) => String(value || "").trim());

    if (requiredFields.some((value) => value.length === 0)) {
      setError("Please fill all required fields before placing your order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payment = await initiatePayuPayment(authToken, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          line1: formData.address.line1,
          line2: formData.address.line2,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.postalCode,
          country: formData.address.country,
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        notes: formData.notes,
      });

      setCartMessage("Redirecting to PayU for payment...");
      submitPayuForm(payment);
    } catch (submitError) {
      setError(submitError.message || "Could not place order right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={closeCheckout}>
      <div
        className="checkout-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="checkout-modal-header">
          <h2>Checkout</h2>
          <button
            type="button"
            className="checkout-close-btn"
            onClick={closeCheckout}
          >
            x
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {!isAuthenticated ? (
            <div className="checkout-auth-state">
              <p>Continue as a guest or sign in for faster checkout.</p>
              <button
                type="button"
                className="checkout-submit-btn"
                onClick={openLogin}
              >
                Sign In
              </button>
            </div>
          ) : null}

          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>Items</span>
              <span>{cartItemCount}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-grid checkout-grid-two">
            <label>
              Full Name
              <input
                type="text"
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>

          <label>
            Address Line 1
            <input
              type="text"
              value={formData.address.line1}
              onChange={(event) => updateAddress("line1", event.target.value)}
              required
            />
          </label>

          <label>
            Address Line 2
            <input
              type="text"
              value={formData.address.line2}
              onChange={(event) => updateAddress("line2", event.target.value)}
            />
          </label>

          <div className="checkout-grid checkout-grid-three">
            <label>
              City
              <input
                type="text"
                value={formData.address.city}
                onChange={(event) => updateAddress("city", event.target.value)}
                required
              />
            </label>
            <label>
              State
              <input
                type="text"
                value={formData.address.state}
                onChange={(event) => updateAddress("state", event.target.value)}
                required
              />
            </label>
            <label>
              Postal Code
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(event) => updateAddress("postalCode", event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Any special delivery notes"
            />
          </label>

          {error ? <p className="checkout-error">{error}</p> : null}

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;
