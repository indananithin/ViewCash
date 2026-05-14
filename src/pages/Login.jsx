import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone, KeyRound } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedPhone = localStorage.getItem('viewCashRegisteredPhone');
    if (savedPhone) {
      setPhone(savedPhone);
      setIsSignUp(false);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10 || password.length < 6) {
      setError('Please enter a valid 10-digit mobile number and a password of at least 6 characters.');
      return;
    }

    const savedPhone = localStorage.getItem('viewCashRegisteredPhone');
    if (savedPhone && savedPhone !== phone) {
      setError('Strict Login Enforced: This device is already permanently bound to another mobile number.');
      return;
    }
    
    if (isSignUp && savedPhone) {
      setError('You already have an account on this device. Please login instead.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // We convert the phone number to an email structure so Firebase accepts it without billing
    const fakeEmail = `${phone}@viewcash.app`;
    const result = await loginWithEmail(fakeEmail, password, isSignUp);
    
    if (result.success) {
      localStorage.setItem('viewCashRegisteredPhone', phone);
      navigate('/');
    } else {
      let msg = result.error || 'Authentication Failed';
      if (msg.includes('auth/invalid-credential')) msg = 'Incorrect mobile number or password.';
      if (msg.includes('auth/email-already-in-use')) msg = 'An account already exists with this mobile number.';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container page-container">
      <div className="login-header">
        <img src="/logo.png" alt="ViewCash Logo" className="logo-image" />
        <h2>Welcome to ViewCash</h2>
        <p>{isSignUp ? 'Create an account to start earning' : 'Login to start earning rewards'}</p>
      </div>

      <div className="login-card">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group">
            <Phone size={20} className="input-icon" />
            <input 
              type="tel" 
              placeholder="Enter Mobile Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting || (localStorage.getItem('viewCashRegisteredPhone') && localStorage.getItem('viewCashRegisteredPhone') !== phone)}
              required
            />
          </div>

          <div className="input-group">
            <KeyRound size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Enter Password (min 6 chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{background: 'none', border: 'none', color: 'var(--primary-orange)', cursor: 'pointer', fontWeight: 'bold'}}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>

      <div className="security-notice">
        <p>🔒 Strict Login Enforced</p>
        <small>One account per device policy is active. You cannot create multiple accounts on this device.</small>
      </div>
    </div>
  );
};

export default Login;
