import { useEffect, useRef, useState } from "react";
import "../css/login.css";
import GoogleSignIn from "../../GoogleSignIn";
import useMenuStore from "../../useMenuStore";
import { signInWithGoogle } from "../../services/cartApi";

const Signup = ({
  imageUrl = "https://via.placeholder.com/300",
  isCard = false,
  isModal = false,
  onSwitchToLogin = () => {},
}) => {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const cartItems = useMenuStore((state) => state.cartItems);
  const setAuthSession = useMenuStore((state) => state.setAuthSession);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const setCartMessage = useMenuStore((state) => state.setCartMessage);
  const setIsLoginModalOpen = useMenuStore(
    (state) => state.setIsLoginModalOpen,
  );
  const [authSuccessUser, setAuthSuccessUser] = useState(null);
  const [authStage, setAuthStage] = useState("idle");
  const [authError, setAuthError] = useState("");
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

  const handleGoogleUserChange = async (nextUser) => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
    }

    if (!nextUser?.credential) {
      if (!isAuthenticated) {
        setAuthStage("idle");
        setAuthSuccessUser(null);
      }
      return;
    }

    setAuthStage("authenticating");
    setAuthError("");
    setCartSyncing(true);

    try {
      const session = await signInWithGoogle({
        credential: nextUser.credential,
        guestCartItems: cartItems,
      });

      setAuthSession({
        token: session.token,
        user: session.user,
        cart: session.cart,
      });

      setAuthSuccessUser(session.user || nextUser);
      setAuthStage("success");
      setCartMessage("Signed in successfully. Cart synced to your account.");

      if (isModal) {
        successTimerRef.current = window.setTimeout(() => {
          setIsLoginModalOpen(false);
        }, 1600);
      }
    } catch (error) {
      const message = error.message || "Sign in failed. Please try again.";
      setAuthError(message);
      setCartMessage(message);
      setAuthStage("idle");
      setAuthSuccessUser(null);
    } finally {
      setCartSyncing(false);
    }
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
