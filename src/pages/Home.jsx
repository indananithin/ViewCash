import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Coins, ChevronRight, Gift, Trophy, LogOut } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      // Count notifications from last 24 hours as "new"
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const count = docs.filter(n => n.createdAt > yesterday).length;
      setUnreadCount(count);
      
      // Also show a local browser notification for the very latest one if it's brand new (last 30 seconds)
      const latest = docs[0];
      if (latest && latest.createdAt > new Date(Date.now() - 30000).toISOString()) {
         if (Notification.permission === "granted") {
           new Notification(latest.title, { body: latest.message, icon: '/logo.png' });
         }
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="home-container page-container">
      {/* Header Profile Section */}
      <header className="home-header">
        <div className="profile-info">
          <div className="avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="greeting">Hello, {user?.name || 'User'}</p>
            <p className="status">Ready to win today?</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => navigate('/notifications')} title="Notifications">
            <Bell size={24} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button className="icon-btn" onClick={handleLogout} title="Logout">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Coin Balance Card */}
      <section className="balance-card">
        <div className="balance-info">
          <p>Total Balance</p>
          <h2><Coins size={28} className="coin-icon" /> {user?.coins || 0} Coins</h2>
          <small>1 Coin = ₹1.00</small>
        </div>
        <button className="redeem-btn" onClick={() => navigate('/wallet')}>
          Redeem <ChevronRight size={16} />
        </button>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <div className="action-box" onClick={() => navigate('/referral')}>
          <div className="action-icon referral-bg">
            <Gift size={28} color="white" />
          </div>
          <h3>Refer & Earn</h3>
          <p>Get 5 Coins</p>
        </div>
        <div className="action-box" onClick={() => navigate('/products')}>
          <div className="action-icon gift-bg">
            <Gift size={28} color="white" />
          </div>
          <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Active Products
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e', marginLeft: '6px', animation: 'pulse 2s infinite' }}></span>
          </h3>
          <p>Earn tickets now</p>
        </div>
        <div className="action-box" style={{ gridColumn: 'span 2' }} onClick={() => navigate('/draws')}>
          <div className="action-icon trophy-bg" style={{ margin: '0 auto 12px' }}>
            <Trophy size={28} color="white" />
          </div>
          <h3>Lucky Draws</h3>
          <p>Check results & winners</p>
        </div>
      </section>

      {/* Recent Activity / Announcements */}
      <section className="announcements">
        <div className="section-title">
          <h3><Bell size={20} color="var(--primary-orange)" style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Latest Updates</h3>
        </div>
        <div className="announcement-card">
          <div className="announcement-content">
            <h4><Trophy size={16} color="var(--primary-yellow)" style={{ verticalAlign: 'middle', marginRight: '4px' }}/> New BookMyShow Voucher Draw!</h4>
            <p>Participate now with just 6 tickets to win a brand new BookMyShow voucher.</p>
          </div>
        </div>
        <div className="announcement-card success">
          <div className="announcement-content">
            <h4><Coins size={16} color="var(--accent-green)" style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Withdrawals Processed</h4>
            <p>All pending UPI withdrawals from yesterday have been successfully processed.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
