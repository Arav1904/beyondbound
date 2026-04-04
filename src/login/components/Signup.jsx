import { useState } from 'react';
import '../css/login.css';
import GoogleSignIn from '../../GoogleSignIn';
import useMenuStore from '../../useMenuStore';

const Signup = ({ imageUrl = 'https://via.placeholder.com/300', isCard = false, isModal = false, onSwitchToLogin = () => {} }) => {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const setSignedInUser = useMenuStore((state) => state.setSignedInUser);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    agreeToTerms: false,
    receiveUpdates: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGoogleUserChange = (nextUser) => {
    setSignedInUser(nextUser ?? null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile) {
      alert('Please fill in all fields');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    console.log('Signup submitted:', formData);
    // Add form submission logic here
  };

  const container = isModal ? 'login-modal-card' : isCard ? 'login-card-wrapper' : 'login-container';

  return (
    <div className={container}>
      <div className="login-card">
        {/* Left Side - Visual Section */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-circle">
              <img 
                src={imageUrl} 
                alt="Product" 
                className="visual-image"
              />
            </div>
            <h3 className="visual-text">SIGN UP NOW!</h3>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="login-form-section">
          <div className="form-content">
            <div className="signup-header">NEW ACCOUNT</div>
            <h1 className="form-title">Create account</h1>
            <p className="signup-tagline">Free to join. No spam, ever.</p>

            {/* Google Sign In Button */}
            <GoogleSignIn
              onUserChange={handleGoogleUserChange}
              initialUser={signedInUser}
              className="google-signin-button--auth"
              buttonOptions={{ text: 'signup_with', shape: 'rectangular' }}
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

              <p className="form-note">We'll send your OTP and order updates here.</p>

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
                    I agree to the <a href="#" className="link">Terms of Service</a> and{' '}
                    <a href="#" className="link">Privacy Policy</a>. I understand Glycomics is a
                    supplement, not medical treatment.
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
                  <span>Send me order updates and exclusive offers on WhatsApp & email.</span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit">
                Create account & verify <span className="arrow">→</span>
              </button>
            </form>

            {/* Already Member Link */}
            <p className="login-prompt">
              Already a member? <button className="login-link" onClick={onSwitchToLogin}>Log in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
