import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, LogOut, Settings, HelpCircle, Shield, Share2, ShieldAlert, Edit2, Check } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveName = async () => {
    setNameError('');
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    try {
      // Check if name is already taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('name', '==', newName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setNameError('This name is already taken.');
        setIsSaving(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: newName });
      setUser({ ...user, name: newName });
      setIsEditingName(false);
    } catch (err) {
      console.error("Error updating name:", err);
      setNameError('Error updating name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container page-container">
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {user?.name?.charAt(0) || 'U'}
        </div>
        
        {isEditingName ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value.toUpperCase())} 
                autoFocus
                style={{padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px'}}
                disabled={isSaving}
              />
              <button onClick={handleSaveName} disabled={isSaving} style={{background: 'var(--primary-orange)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer'}}>
                {isSaving ? '...' : <Check size={16} />}
              </button>
            </div>
            {nameError && <p style={{color: 'red', fontSize: '12px', marginTop: '5px'}}>{nameError}</p>}
          </div>
        ) : (
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}} onClick={() => setIsEditingName(true)} title="Click to edit name">
            {user?.name || 'User'} <Edit2 size={14} color="#666" />
          </h3>
        )}
        <p className="phone-number">{user?.phone || 'No phone linked'}</p>
        <div className="device-badge">
          <Shield size={12} /> Device Locked
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-group">
          <div className="menu-item" onClick={() => setIsEditingName(true)}>
            <div className="menu-icon"><User size={20} /></div>
            <span>Edit Profile (Name)</span>
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

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
