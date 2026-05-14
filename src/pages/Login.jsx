import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Phone, KeyRound } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
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
    
    if (isSignUp && !name) {
      setError('Please enter your name.');
      return;
    }

    const savedPhone = localStorage.getItem('viewCashRegisteredPhone');
    if (savedPhone && savedPhone !== phone) {
      setError('Strict Login Enforced: You can only login with your original registered number (' + savedPhone + ') on this device.');
      return;
    }
    
    if (isSignUp && savedPhone) {
      setError('You already have an account on this device. Please login instead.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    if (isSignUp) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError('This username is already taken. Please choose another one.');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Error checking username uniqueness:", err);
      }
    }
    
    const fakeEmail = `${phone}@viewcash.app`;
    // Pass extra data (name and referral) using the 4th parameter of loginWithEmail
    const result = await loginWithEmail(fakeEmail, password, isSignUp, { name, referralCode });
    
    if (result.success) {
      localStorage.setItem('viewCashRegisteredPhone', phone);
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
            <input 
              type="tel" 
              placeholder="Enter Mobile Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
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
