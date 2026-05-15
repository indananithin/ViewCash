import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Coins, ChevronRight, Gift, Trophy, LogOut, User, Gamepad2, Ticket } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import ConfirmModal from '../components/ConfirmModal';
import './Home.css';

import Logo from '../components/Logo';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      const lastChecked = user?.lastCheckedNotifications || new Date(0).toISOString();
      const count = docs.filter(n => n.createdAt > lastChecked).length;
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user?.lastCheckedNotifications]);

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="home-container page-container">
      {/* Header Profile Section */}
      <header className="home-header">
        <h2 className="greeting-text">Hello! <span className="user-name">{user?.name || 'Nithin'}</span></h2>
        
        <div className="header-right">
          <button className="icon-btn-simple" onClick={() => navigate('/notifications')} style={{ position: 'relative', marginRight: '8px' }}>
            <Bell size={24} color="#666" />
            {unreadCount > 0 && (
              <span className="badge-simple">{unreadCount}</span>
            )}
          </button>

          <div className="balance-pill" onClick={() => navigate('/wallet')}>
            <div className="pill-icon">
              <Coins size={16} fill="#FACC15" color="#FACC15" />
            </div>
            <span className="pill-amount">{user?.coins || 0}</span>
          </div>
          
          <button className="profile-circle-btn" onClick={() => navigate('/profile')}>
            <div className="inner-profile-icon">
              <User size={20} fill="white" color="white" />
            </div>
          </button>
        </div>
      </header>

      <div className="section-title-simple">
        <h3>Explore & Earn</h3>
      </div>

      <div className="explore-cards-list">
        {/* Fun Games Card */}
        <div className="explore-card purple-theme" onClick={() => navigate('/games')}>
          <div className="card-icon-wrapper">
            <div className="icon-circle">
              <Gamepad2 size={24} />
            </div>
          </div>
          <div className="card-info">
            <h4>Fun Games</h4>
            <p>Play exciting games and earn bonus coins</p>
          </div>
          <ChevronRight className="card-arrow" size={20} />
        </div>

        {/* Products Card */}
        <div className="explore-card orange-theme" onClick={() => navigate('/products')}>
          <div className="card-icon-wrapper">
            <div className="icon-circle">
              <Ticket size={24} />
            </div>
          </div>
          <div className="card-info">
            <h4>Products</h4>
            <p>Buy tickets & win amazing gift cards instantly</p>
          </div>
          <ChevronRight className="card-arrow" size={20} />
        </div>

        {/* Draws & Results Card */}
        <div className="explore-card pink-theme" onClick={() => navigate('/draws')}>
          <div className="card-icon-wrapper">
            <div className="icon-circle">
              <Trophy size={24} />
            </div>
          </div>
          <div className="card-info">
            <h4>Draws & Results</h4>
            <p>Check Product results and your winning entries</p>
          </div>
          <ChevronRight className="card-arrow" size={20} />
        </div>

        {/* Coins Redemption Card */}
        <div className="explore-card green-theme" onClick={() => navigate('/wallet')}>
          <div className="card-icon-wrapper">
            <div className="icon-circle">
              <Gift size={24} />
            </div>
          </div>
          <div className="card-info">
            <h4>Coins Redemption</h4>
            <p>Redeem coins for exclusive rewards and perks</p>
          </div>
          <ChevronRight className="card-arrow" size={20} />
        </div>
      </div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
      />
    </div>
  );
};

export default Home;
