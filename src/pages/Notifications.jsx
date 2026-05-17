import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Bell, Gift, IndianRupee, Trophy, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Notifications.css';

const Notifications = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const allNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = allNotifs.filter(n => !n.userId || n.userId === user?.uid);
      setNotifications(filtered);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    });

    // Mark all as read by updating lastCheckedNotifications
    if (user?.uid) {
      const now = new Date().toISOString();
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, {
        lastCheckedNotifications: now
      }).then(() => {
        // Update local user state so Home page reflects it immediately
        setUser(prev => ({ ...prev, lastCheckedNotifications: now }));
      }).catch(err => console.error("Error updating lastCheckedNotifications:", err));
    }

    return () => unsub();
  }, [user?.uid]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'promo': return <Gift />;
      case 'alert': return <Trophy />;
      default: return <Bell />;
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMin = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMin < 60) return `${diffInMin} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return <div className="page-container" style={{ padding: '20px', textAlign: 'center' }}>Loading notifications...</div>;
  }

  return (
    <div className="notifications-container page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Notifications</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner">
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Your recent alerts and updates</p>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Bell size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={`notification-card ${notification.type || 'info'}`}>
                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
