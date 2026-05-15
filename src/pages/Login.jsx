import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Phone, KeyRound } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithEmail, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    
    if (isSignUp && !name) {
      setError('Please enter your name.');
      return;
    }

    // Sanitize phone: remove all non-numeric characters except leading +
    let sanitizedPhone = phone.trim().replace(/[^\d+]/g, '');
    
    // If it's a mobile number without country code, add it
    let finalPhone = sanitizedPhone;
    if (!sanitizedPhone.startsWith('+')) {
      // Remove leading zero if present (common in some regions)
      if (sanitizedPhone.startsWith('0')) {
        sanitizedPhone = sanitizedPhone.substring(1);
      }
      finalPhone = `${countryCode}${sanitizedPhone}`;
    }

    const savedPhone = localStorage.getItem('viewCashRegisteredPhone');
    // Basic check: if device is locked, must match saved number for login
    if (!isSignUp && savedPhone && savedPhone !== finalPhone) {
      // Allow if the input without country code matches saved (for legacy users)
      if (savedPhone !== sanitizedPhone) {
        setError('Strict Login Enforced: You can only login with your original registered number (' + savedPhone + ') on this device.');
        return;
      }
    }
    
    setIsSubmitting(true);
    setError('');

    if (isSignUp) {
      // If they are trying to sign up, check if this phone already exists in Firestore
      try {
        const usersRef = collection(db, 'users');
        const qPhone = query(usersRef, where('phone', '==', finalPhone));
        const phoneSnap = await getDocs(qPhone);
        
        if (!phoneSnap.empty) {
          setError('An account with this mobile number already exists. Please login instead.');
          setIsSubmitting(false);
          return;
        }

        const qName = query(usersRef, where('name', '==', name));
        const nameSnap = await getDocs(qName);
        if (!nameSnap.empty) {
          setError('This username is already taken. Please choose another one.');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Error checking account existence:", err);
      }
    }
    
    const fakeEmail = `${finalPhone}@viewcash.app`;
    // Pass extra data (name and referral) using the 4th parameter of loginWithEmail
    const result = await loginWithEmail(fakeEmail, password, isSignUp, { name, referralCode });
    
    if (result.success) {
      localStorage.setItem('viewCashRegisteredPhone', finalPhone);
      navigate('/');
    } else {
      let msg = result.error || 'Authentication Failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid password or mobile number.';
      }
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
          {isSignUp && (
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                placeholder="Enter Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                required={isSignUp}
              />
            </div>
          )}

          <div className="input-group">
            <Phone size={20} className="input-icon" />
            <select 
              value={countryCode} 
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={isSubmitting}
              style={{
                position: 'absolute',
                left: '45px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontWeight: 'bold',
                color: 'var(--text-main)',
                appearance: 'none',
                zIndex: 2,
                cursor: 'pointer'
              }}
            >
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+61">+61 (AU)</option>
              <option value="+971">+971 (AE)</option>
            </select>
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
              style={{ paddingLeft: '110px' }}
            />
          </div>
          {isSignUp && (
            <p style={{fontSize: '11px', color: 'var(--primary-orange)', marginTop: '-10px', marginBottom: '15px', lineHeight: '1.2'}}>
              * Note: Please make sure to provide your active WhatsApp number. We use this to contact you for settling your withdrawal payments.
            </p>
          )}

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

          {isSignUp && (
            <div className="input-group">
              <span className="input-icon">🎁</span>
              <input 
                type="text" 
                placeholder="Referral Code (Optional)" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}
          
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
