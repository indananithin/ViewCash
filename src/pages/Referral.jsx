import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDocs, updateDoc, increment, collection, query, where } from 'firebase/firestore';
import { Share2, Copy, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Referral.css';

const Referral = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  // Real referral code based on user UID
  const referralCode = user ? user.uid.substring(0, 6).toUpperCase() : 'LOGIN';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ViewCash',
          text: `Use my referral code ${referralCode} to get 5 bonus coins on ViewCash!`,
          url: 'https://viewcash.app',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  const applyReferralCode = async () => {
    if (!user) return;
    if (!inputCode) {
      setStatusMsg('Please enter a referral code.');
      return;
    }
    if (inputCode === referralCode) {
      setStatusMsg('You cannot use your own code!');
      return;
    }
    if (user.referredBy) {
      setStatusMsg('You have already used a referral code.');
      return;
    }

    try {
      // Find the user with this referral code (UID starts with this code)
      // For simplicity, we search users where UID starts with inputCode.
      // In a real app, you might store referralCode as a field in the document.
      // Here we will do a query to find the referrer
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '>=', inputCode.toLowerCase()), where('uid', '<=', inputCode.toLowerCase() + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      
      let referrerDoc = null;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id.toUpperCase().startsWith(inputCode.toUpperCase())) {
          referrerDoc = docSnap;
        }
      });

      if (!referrerDoc) {
        setStatusMsg('Invalid referral code.');
        return;
      }

      // Update current user
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        coins: increment(5),
        referredBy: referrerDoc.id
      });

      // Update referrer
      const referrerRef = doc(db, 'users', referrerDoc.id);
      await updateDoc(referrerRef, {
        coins: increment(5),
        referralsCount: increment(1)
      });

      setUser({ ...user, coins: user.coins + 5, referredBy: referrerDoc.id });
      setStatusMsg('Referral code applied! You got 5 coins.');
      setInputCode('');
    } catch (error) {
      console.error(error);
      setStatusMsg('Error applying code.');
    }
  };

  return (
    <div className="referral-container page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Refer & Earn</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner">
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Invite friends and earn bonus coins</p>

      <div className="referral-hero-card">
        <div className="hero-icon">
          <GiftIcon />
        </div>
        <h3>Get 5 Coins Per Friend</h3>
        <p>When your friend signs up and watches their first ad, you both get 5 coins!</p>
      </div>

      <div className="referral-code-section">
        <p className="code-label">Your Referral Code</p>
        <div className="code-box">
          <span className="code">{referralCode}</span>
          <button className="btn-copy" onClick={handleCopy}>
            {copied ? <CheckCircle size={20} color="#166534" /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      <button className="btn-share" onClick={handleShare}>
        <Share2 size={20} /> Share Link
      </button>

      <div className="apply-code-section" style={{marginTop: '20px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px'}}>
        <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Have a referral code?</h3>
        {statusMsg && <p style={{fontSize: '14px', marginBottom: '10px', color: statusMsg.includes('got 5 coins') ? 'green' : 'red'}}>{statusMsg}</p>}
        <div style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            placeholder="Enter code" 
            value={inputCode} 
            onChange={(e) => setInputCode(e.target.value)}
            style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc'}}
            disabled={user?.referredBy}
          />
          <button onClick={applyReferralCode} disabled={user?.referredBy} style={{padding: '10px 16px', background: 'var(--primary-orange)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold'}}>
            Apply
          </button>
        </div>
      </div>

      <div className="referral-stats">
        <h3>Your Referrals</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <Users size={24} className="stat-icon-ref" />
            <div className="stat-content">
              <h4>{user?.referralsCount || 0}</h4>
              <p>Friends Invited</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-ref coin-bg">₹</div>
            <div className="stat-content">
              <h4>{(user?.referralsCount || 0) * 5}</h4>
              <p>Coins Earned</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const GiftIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

export default Referral;
