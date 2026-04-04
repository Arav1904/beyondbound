import { useEffect, useState } from "react";
import "../css/login.css";
import useMenuStore from "../../useMenuStore";
import { updateProfile } from "../../services/cartApi";

const EMPTY_ADDRESS = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function AccountModal() {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const authToken = useMenuStore((state) => state.authToken);
  const accountProfile = useMenuStore((state) => state.accountProfile);
  const accountModalSection = useMenuStore(
    (state) => state.accountModalSection,
  );
  const cartTotalItems = useMenuStore((state) => state.cartTotalItems);
  const cartSubtotal = useMenuStore((state) => state.cartSubtotal);
  const setAccountModalSection = useMenuStore(
    (state) => state.setAccountModalSection,
  );
  const setIsAccountModalOpen = useMenuStore(
    (state) => state.setIsAccountModalOpen,
  );
  const setSignedInUser = useMenuStore((state) => state.setSignedInUser);
  const updateAccountProfile = useMenuStore(
    (state) => state.updateAccountProfile,
  );

  const [draft, setDraft] = useState(accountProfile);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(accountProfile);
  }, [accountProfile]);

  useEffect(() => {
    if (!saveStatus) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSaveStatus(""), 1800);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  if (!signedInUser) {
    return null;
  }

  const displayName = draft.name || signedInUser.name || "Account";
  const avatarInitial = (displayName || signedInUser.email || "A")
    .charAt(0)
    .toUpperCase();

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressFieldChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({
      ...prev,
      address: {
        ...(prev.address || EMPTY_ADDRESS),
        [name]: value,
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (authToken) {
        const response = await updateProfile(authToken, {
          name: draft.name,
          phone: draft.phone,
          address: draft.address,
        });

        const nextUser = response.user;
        if (nextUser) {
          setSignedInUser(nextUser);
          updateAccountProfile({
            name: nextUser.name || "",
            email: nextUser.email || draft.email || "",
            phone: nextUser.phone || "",
            address: {
              ...EMPTY_ADDRESS,
              ...(nextUser.address || {}),
            },
          });
          setSaveStatus("Saved to your account.");
        } else {
          updateAccountProfile(draft);
          setSaveStatus("Saved on this device.");
        }
      } else {
        updateAccountProfile(draft);
        setSaveStatus("Saved on this device.");
      }
    } catch (error) {
      setSaveStatus(error.message || "Could not save right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsAccountModalOpen(false);
  };

  return (
    <section className="account-modal-panel" aria-label="Account settings">
      <header className="account-modal-header">
        <div className="account-avatar-wrap" aria-hidden="true">
          {signedInUser.picture ? (
            <img
              src={signedInUser.picture}
              alt={displayName}
              className="account-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="account-avatar account-avatar--fallback">
              {avatarInitial}
            </span>
          )}
        </div>
        <div>
          <p className="account-title">My Account</p>
          <p className="account-subtitle">
            {signedInUser.email || "Signed in with Google"}
          </p>
        </div>
      </header>

      <div
        className="account-modal-tabs"
        role="tablist"
        aria-label="Account sections"
      >
        <button
          type="button"
          className={`account-tab${accountModalSection === "profile" ? " account-tab--active" : ""}`}
          onClick={() => setAccountModalSection("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          className={`account-tab${accountModalSection === "address" ? " account-tab--active" : ""}`}
          onClick={() => setAccountModalSection("address")}
        >
          Address
        </button>
        <button
          type="button"
          className={`account-tab${accountModalSection === "orders" ? " account-tab--active" : ""}`}
          onClick={() => setAccountModalSection("orders")}
        >
          Orders
        </button>
      </div>

      {accountModalSection === "orders" ? (
        <div className="account-placeholder">
          <p className="account-placeholder-title">
            Cart is linked to your signed-in account.
          </p>
          <p className="account-placeholder-copy">
            Current cart: {cartTotalItems} item{cartTotalItems === 1 ? "" : "s"} ·
            subtotal ₹{cartSubtotal.toFixed(2)}. Checkout timeline can be added
            next.
          </p>
          <button
            type="button"
            className="account-btn account-btn--primary"
            onClick={closeModal}
          >
            Done
          </button>
        </div>
      ) : (
        <form className="account-form" onSubmit={handleSave}>
          {accountModalSection === "profile" ? (
            <>
              <label className="account-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  value={draft.name || ""}
                  onChange={handleProfileFieldChange}
                  placeholder="Enter your full name"
                />
              </label>

              <label className="account-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={draft.email || signedInUser.email || ""}
                  readOnly
                  className="account-input-readonly"
                />
              </label>

              <label className="account-field">
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={draft.phone || ""}
                  onChange={handleProfileFieldChange}
                  placeholder="Enter your phone number"
                />
              </label>
            </>
          ) : (
            <>
              <label className="account-field">
                <span>Address line 1</span>
                <input
                  type="text"
                  name="line1"
                  value={draft.address?.line1 || ""}
                  onChange={handleAddressFieldChange}
                  placeholder="House no, building, street"
                />
              </label>

              <label className="account-field">
                <span>Address line 2</span>
                <input
                  type="text"
                  name="line2"
                  value={draft.address?.line2 || ""}
                  onChange={handleAddressFieldChange}
                  placeholder="Landmark, area"
                />
              </label>

              <div className="account-grid-two">
                <label className="account-field">
                  <span>City</span>
                  <input
                    type="text"
                    name="city"
                    value={draft.address?.city || ""}
                    onChange={handleAddressFieldChange}
                    placeholder="City"
                  />
                </label>

                <label className="account-field">
                  <span>State</span>
                  <input
                    type="text"
                    name="state"
                    value={draft.address?.state || ""}
                    onChange={handleAddressFieldChange}
                    placeholder="State"
                  />
                </label>
              </div>

              <div className="account-grid-two">
                <label className="account-field">
                  <span>Postal code</span>
                  <input
                    type="text"
                    name="postalCode"
                    value={draft.address?.postalCode || ""}
                    onChange={handleAddressFieldChange}
                    placeholder="Postal code"
                  />
                </label>

                <label className="account-field">
                  <span>Country</span>
                  <input
                    type="text"
                    name="country"
                    value={draft.address?.country || "India"}
                    onChange={handleAddressFieldChange}
                    placeholder="Country"
                  />
                </label>
              </div>
            </>
          )}

          <div className="account-form-actions">
            <button
              type="button"
              className="account-btn account-btn--ghost"
              onClick={closeModal}
              disabled={isSaving}
            >
              Close
            </button>
            <button
              type="submit"
              className="account-btn account-btn--primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>

          {saveStatus ? (
            <p className="account-save-status">{saveStatus}</p>
          ) : null}
        </form>
      )}
    </section>
  );
}

export default AccountModal;
