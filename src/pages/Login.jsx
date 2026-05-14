import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import { RecaptchaVerifier } from 'firebase/auth';
import { Phone, Mail, KeyRound } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithPhone, verifyOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Recaptcha once when the component mounts
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
      } catch (err) {
        console.error("Recaptcha Init Error", err);
      }
    }
    
    // Do not clear it on unmount because if the user navigates away and back, it can cause issues if not fully cleared.
    // Firebase handles singleton instances internally.
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    const result = await loginWithPhone(phone, 'recaptcha-container');
    
    if (result.success) {
      setShowOtp(true);
    } else {
      setError(result.error || 'Failed to send OTP. Please check Firebase config and Recaptcha.');
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await verifyOtp(otp);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid OTP');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    if (result.success) {
      navigate('/');
    } else {
      setError('Google Login Failed. Check Firebase config.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container page-container">
      <div className="login-header">
        <img src="/logo.png" alt="ViewCash Logo" className="logo-image" />
        <h2>Welcome to ViewCash</h2>
        <p>Login to start earning rewards</p>
      </div>

      <div className="login-card">
        {error && <div className="error-message">{error}</div>}
        
        {!showOtp ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="input-group">
              <Phone size={20} className="input-icon" />
              <input 
                type="tel" 
                placeholder="Enter Phone Number (e.g. 9876543210)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="input-group">
              <KeyRound size={20} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}

        {/* Recaptcha Container is now in index.html to prevent React unmounting errors */}

        <div className="divider">
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn-outline"
          disabled={isSubmitting}
        >
          <Mail size={20} />
          Continue with Google
        </button>
      </div>

      <div className="security-notice">
        <p>🔒 Secure Login</p>
        <small>One account per device policy is enforced to ensure fair rewards.</small>
      </div>
    </div>
  );
};

export default Login;
