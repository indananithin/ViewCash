import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, KeyRound, UserPlus, LogIn } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      setError('Please enter a valid email and a password of at least 6 characters.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    const result = await loginWithEmail(email, password, isSignUp);
    
    if (result.success) {
      navigate('/');
    } else {
      // Friendly error mapping
      let msg = result.error || 'Authentication Failed';
      if (msg.includes('auth/invalid-credential')) msg = 'Incorrect email or password.';
      if (msg.includes('auth/email-already-in-use')) msg = 'An account already exists with this email.';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    const result = await loginWithGoogle();
    if (result.success) {
      navigate('/');
    } else {
      setError('Google Login Failed. Ensure "localhost" is an authorized domain in Firebase Console.');
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
        
        <form onSubmit={handleEmailAuth} className="login-form">
          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              placeholder="Enter Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
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
