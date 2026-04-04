import { useEffect, useRef, useState } from "react";
import "../css/login.css";
import GoogleSignIn from "../../GoogleSignIn";
import useMenuStore from "../../useMenuStore";

const Signup = ({
  imageUrl = "https://via.placeholder.com/300",
  isCard = false,
  isModal = false,
  onSwitchToLogin = () => {},
}) => {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const setSignedInUser = useMenuStore((state) => state.setSignedInUser);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const [authSuccessUser, setAuthSuccessUser] = useState(null);
  const [authStage, setAuthStage] = useState("idle");
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    agreeToTerms: false,
    receiveUpdates: false,
  });
  const successTimerRef = useRef(null);
  const isAuthenticated = Boolean(signedInUser);

  useEffect(
    () => () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
    }

    if (!isModal) {
      return;
    }

    successTimerRef.current = window.setTimeout(() => {
      setIsLoginModalOpen(false);
    }, 1600);
  }, [isAuthenticated, isModal, setIsLoginModalOpen, signedInUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAuthError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoogleUserChange = (nextUser) => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
    }

    if (!nextUser?.credential) {
      setSignedInUser(null);
      if (!isAuthenticated) {
        setAuthStage("idle");
        setAuthSuccessUser(null);
      }
      return;
    }

    setSignedInUser(nextUser);
    setAuthError("");
    setAuthSuccessUser(nextUser);
    setAuthStage("success");

    if (isModal) {
      successTimerRef.current = window.setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 1600);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.mobile
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    console.log("Signup submitted:", formData);
    // Add form submission logic here
  };

  const container = isModal
    ? "login-modal-card"
    : isCard
      ? "login-card-wrapper"
      : "login-container";

  return (
    <div className={container}>
      <div className="login-card">
        {/* Left Side - Visual Section */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-circle">
              <img src={imageUrl} alt="Product" className="visual-image" />
            </div>
            <h3 className="visual-text">SIGN UP NOW!</h3>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="login-form-section">
          <div className="form-content">
            {authStage === "success" && authSuccessUser ? (
              <>
                <div className="signup-header">SUCCESS</div>
                <h1 className="form-title">Successfully logged in</h1>
                <p className="auth-success-note">
                  Signed in as{" "}
                  <span className="auth-success-email">
                    {authSuccessUser.email || authSuccessUser.name}
                  </span>
                </p>
                <div className="auth-success-icon" aria-hidden="true">
                  OK
                </div>
                {isModal ? (
                  <p className="auth-success-note">
                    Redirecting to your account...
                  </p>
                ) : (
                  <p className="auth-success-note">You are now signed in.</p>
                )}
              </>
            ) : authStage === "authenticating" ? (
              <>
                <div className="signup-header">VERIFYING</div>
                <h1 className="form-title">Signing you in...</h1>
                <p className="auth-success-note">
                  We are securely verifying your Google account.
                </p>
                <div className="auth-success-icon" aria-hidden="true">
                  ...
                </div>
                <p className="auth-success-note">
                  This usually takes a second.
                </p>
              </>
            ) : (
              <>
                <div className="signup-header">NEW ACCOUNT</div>
                <h1 className="form-title">Create account</h1>
                <p className="signup-tagline">Free to join. No spam, ever.</p>

                {authError ? (
                  <p className="auth-error-note" role="alert">
                    {authError}
                  </p>
                ) : null}

                {/* Google Sign In Button */}
                <GoogleSignIn
                  onUserChange={handleGoogleUserChange}
                  className="google-signin-button--auth"
                  buttonOptions={{ text: "signup_with", shape: "rectangular" }}
                  showSignedInState={false}
                />

                <div className="form-divider">
                  <span>or use email</span>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                  {/* First Name & Last Name Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group full-width">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="form-group full-width">
                    <div className="mobile-input-wrapper">
                      <div className="country-code">
                        <span className="flag">🇮🇳</span>
                        <span className="code">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="10-digit number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        maxLength="10"
                      />
                    </div>
                  </div>

                  <p className="form-note">
                    We'll send your OTP and order updates here.
                  </p>

                  {/* Checkboxes */}
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                      <span>
                        I agree to the{" "}
                        <a href="#" className="link">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="link">
                          Privacy Policy
                        </a>
                        . I understand Glycomics is a supplement, not medical
                        treatment.
                      </span>
                    </label>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="receiveUpdates"
                        checked={formData.receiveUpdates}
                        onChange={handleInputChange}
                      />
                      <span>
                        Send me order updates and exclusive offers on WhatsApp &
                        email.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn-submit">
                    Create account & verify <span className="arrow">→</span>
                  </button>
                </form>

                {/* Already Member Link */}
                <p className="login-prompt">
                  Already a member?{" "}
                  <button
                    type="button"
                    className="login-link"
                    onClick={onSwitchToLogin}
                  >
                    Log in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
