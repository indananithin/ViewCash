import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, HelpCircle, Shield, Share2, ShieldAlert } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="profile-container page-container">
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h3>{user?.name || 'User'}</h3>
        <p className="phone-number">{user?.phone || 'No phone linked'}</p>
        <div className="device-badge">
          <Shield size={12} /> Device Locked
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-group">
          <div className="menu-item">
            <div className="menu-icon"><User size={20} /></div>
            <span>Edit Profile</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/referral')}>
            <div className="menu-icon"><Share2 size={20} /></div>
            <span>Refer & Earn</span>
          </div>
        </div>

        <div className="menu-group">
          <div className="menu-item" onClick={() => navigate('/settings')}>
            <div className="menu-icon"><Settings size={20} /></div>
            <span>Settings</span>
          </div>
          {user?.isAdmin === true && (
            <div className="menu-item" onClick={() => navigate('/admin')}>
              <div className="menu-icon"><ShieldAlert size={20} /></div>
              <span>Admin Panel</span>
            </div>
          )}
          <div className="menu-item">
            <div className="menu-icon"><HelpCircle size={20} /></div>
            <span>Help & Support</span>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
