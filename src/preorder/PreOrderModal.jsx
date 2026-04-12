import { useEffect, useMemo, useState } from "react";
import useMenuStore from "../useMenuStore";
import usePrimaryProduct from "../hooks/usePrimaryProduct";
import { buildPrimaryPreorderDraft } from "../services/productCatalog";
import { submitPreorderForm } from "../services/cartApi";
import "./PreOrderModal.css";

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

function PreOrderModal() {
  const authToken = useMenuStore((state) => state.authToken);
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const accountProfile = useMenuStore((state) => state.accountProfile);
  const preOrderDraft = useMenuStore((state) => state.preOrderDraft);
  const closePreOrderModal = useMenuStore((state) => state.closePreOrderModal);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const setCartMessage = useMenuStore((state) => state.setCartMessage);

  const { product } = usePrimaryProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    productId: "",
    productSlug: "",
    productName: "",
    size: "60",
    quantity: 1,
    notes: "",
    name: "",
    email: "",
    phone: "",
    address: emptyAddress(),
  });

  const fallbackDraft = useMemo(
    () => buildPrimaryPreorderDraft(product, { sizeValue: "60", quantity: 1 }),
    [product],
  );

  const effectiveDraft = useMemo(() => {
    if (
      preOrderDraft &&
      (preOrderDraft.productId || preOrderDraft.productSlug)
    ) {
      return {
        ...fallbackDraft,
        ...preOrderDraft,
      };
    }

    return fallbackDraft;
  }, [fallbackDraft, preOrderDraft]);

  useEffect(() => {
    const nextAddress = {
      ...emptyAddress(),
      ...(accountProfile?.address || {}),
    };

    setFormData((previous) => ({
      ...previous,
      productId: String(
        effectiveDraft.productId || effectiveDraft.productSlug || "",
      ),
      productSlug: String(effectiveDraft.productSlug || ""),
      productName: String(effectiveDraft.productName || "Glycomics"),
      size: String(effectiveDraft.size || "60"),
      quantity: toPositiveInt(effectiveDraft.quantity, 1),
      name: String(accountProfile?.name || signedInUser?.name || ""),
      email: String(accountProfile?.email || signedInUser?.email || ""),
      phone: String(accountProfile?.phone || signedInUser?.phone || ""),
      address: {
        ...nextAddress,
      },
    }));

    setError("");
  }, [accountProfile, effectiveDraft, signedInUser]);

  const isAuthenticated = Boolean(authToken && signedInUser);

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
    closePreOrderModal();
    setAuthMode("login");
    setIsLoginModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const requiredFields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.address.line1,
      formData.address.city,
      formData.address.state,
      formData.address.postalCode,
      formData.productId,
    ].map((value) => String(value || "").trim());

    if (requiredFields.some((value) => value.length === 0)) {
      setError("Please fill all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitPreorderForm(authToken, {
        productId: formData.productId,
        productSlug: formData.productSlug,
        productName: formData.productName,
        productIdentifier:
          String(formData.productSlug || "").trim() ||
          String(formData.productId || "").trim() ||
          String(formData.productName || "").trim(),
        size: formData.size,
        quantity: toPositiveInt(formData.quantity, 1),
        notes: formData.notes,
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
      });

      const orderNumber =
        response?.data?.orderNumber ||
        response?.orderNumber ||
        response?.data?.id ||
        "requested";
      setCartMessage(`Pre-order ${orderNumber} submitted successfully.`);
      closePreOrderModal();
    } catch (submitError) {
      setError(submitError.message || "Could not submit pre-order right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="preorder-modal-overlay" onClick={closePreOrderModal}>
      <div
        className="preorder-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="preorder-modal-header">
          <h2>Pre-Order Form</h2>
          <button
            type="button"
            className="preorder-close-btn"
            onClick={closePreOrderModal}
          >
            x
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="preorder-auth-state">
            <p>Please sign in to submit your pre-order.</p>
            <button
              type="button"
              className="preorder-submit-btn"
              onClick={openLogin}
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <form className="preorder-form" onSubmit={handleSubmit}>
            <div className="preorder-grid preorder-grid-two">
              <label>
                Product
                <input type="text" value={formData.productName} readOnly />
              </label>
              <label>
                Size
                <input
                  type="text"
                  value={formData.size}
                  onChange={(event) => updateField("size", event.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                max="20"
                value={formData.quantity}
                onChange={(event) =>
                  updateField("quantity", event.target.value)
                }
                required
              />
            </label>

            <div className="preorder-grid preorder-grid-two">
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

            <div className="preorder-grid preorder-grid-three">
              <label>
                City
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(event) =>
                    updateAddress("city", event.target.value)
                  }
                  required
                />
              </label>
              <label>
                State
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(event) =>
                    updateAddress("state", event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Postal Code
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(event) =>
                    updateAddress("postalCode", event.target.value)
                  }
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

            {error ? <p className="preorder-error">{error}</p> : null}

            <button
              type="submit"
              className="preorder-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Pre-Order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PreOrderModal;
