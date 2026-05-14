import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Coins, ChevronRight, Gift, Trophy, LogOut } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <span className="badge">2</span>
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
          <div className="action-icon" style={{background: '#fef08a'}}>
            <Gift size={28} color="#eab308" />
          </div>
          <h3>Refer & Earn</h3>
          <p>Get 5 Coins</p>
        </div>
        <div className="action-box" onClick={() => navigate('/products')}>
          <div className="action-icon gift-bg">
            <Gift size={28} color="#F39F5A" />
          </div>
          <h3>Active Products</h3>
          <p>Earn tickets now</p>
        </div>
        <div className="action-box" onClick={() => navigate('/draws')}>
          <div className="action-icon trophy-bg">
            <Trophy size={28} color="#4ADE80" />
          </div>
          <h3>Lucky Draws</h3>
          <p>Check results</p>
        </div>
      </section>

      {/* Recent Activity / Announcements */}
      <section className="announcements">
        <div className="section-title">
          <h3>Latest Updates</h3>
        </div>
        <div className="announcement-card">
          <div className="announcement-content">
            <h4>New BookMyShow ₹200 Voucher Draw!</h4>
            <p>Participate now with just 6 tickets to win a brand new BookMyShow voucher.</p>
          </div>
        </div>
        <div className="announcement-card success">
          <div className="announcement-content">
            <h4>Withdrawals Processed</h4>
            <p>All pending UPI withdrawals from yesterday have been processed.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
