import { useRef, useState } from 'react';
import '../css/login.css';
import GoogleSignIn from '../../GoogleSignIn';
import useMenuStore from '../../useMenuStore';

const Login = ({ imageUrl = 'https://via.placeholder.com/300', isCard = false, isModal = false, onSwitchToSignup = () => {} }) => {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const setSignedInUser = useMenuStore((state) => state.setSignedInUser);
  const [formData, setFormData] = useState({
    email: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleGenerateOTP = () => {
    if (!formData.email) {
      alert('Please enter your email');
      return;
    }
    console.log('Generating OTP for:', formData.email);
    setOtpSent(true);
    // Add OTP generation logic here
  };

  const handleVerifyOTP = () => {
    const otpCode = otp.join('');
    console.log('Verifying OTP:', otpCode);
    // Add OTP verification logic here
  };

  const handleResendOTP = () => {
    console.log('Resending OTP to:', formData.email);
    setOtp(['', '', '', '', '', '']);
    otpInputRefs.current[0]?.focus();
    // Add resend logic here
  };

  const handleSendOtpEmail = () => {
    console.log('Sending OTP to email:', formData.email);
    // Add email OTP logic here
  };

  const handleGoogleUserChange = (nextUser) => {
    setSignedInUser(nextUser ?? null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Please enter your email');
      return;
    }
    console.log('Form submitted:', formData);
    // Add form submission logic
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
            {otpSent ? (
              <>
                <div className="otp-header">VERIFY YOUR NUMBER</div>
                <h1 className="form-title">Enter the code</h1>
                <p className="otp-info">We sent a 6-digit code to {formData.email}</p>

                {/* OTP Input Boxes */}
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input"
                    />
                  ))}
                </div>

                {/* Resend Link */}
                <p className="otp-resend">
                  Didn't receive it? <button className="otp-resend-link" onClick={handleResendOTP}>Resend code now</button>
                </p>

                {/* Verify Button */}
                <button 
                  type="button" 
                  className="btn-submit"
                  onClick={handleVerifyOTP}
                >
                  Verify & Continue <span className="arrow">→</span>
                </button>

                {/* Send OTP to Email */}
                <button 
                  type="button" 
                  className="btn-send-email"
                  onClick={handleSendOtpEmail}
                >
                  Send OTP to email
                </button>

                {/* Back to Email */}
                <p className="otp-back">
                  <button className="otp-back-link" onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}>
                    Back to email
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="form-title">Smarter Blood Sugar Starts Here</h1>
                <p className="form-subtitle">Science-Backed Nutrition to Support Glucose Balance</p>

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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                  {/* Generate OTP Button */}
                  <button 
                    type="button" 
                    className="btn-submit"
                    onClick={handleGenerateOTP}
                  >
                    Continue With OTP
                  </button>
                </form>

                {/* Signup Link */}
                <p className="signup-prompt">
                  New to Beyond Bound? <button className="signup-link" onClick={onSwitchToSignup}>Create a free account</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
