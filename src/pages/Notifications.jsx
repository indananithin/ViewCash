import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Bell, Gift, IndianRupee, Trophy, CheckCircle, Info } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getIcon = (type) => {
    switch(type) {
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
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading notifications...</div>;
  }

  return (
    <div className="notifications-container page-container">
      <header className="page-header">
        <h2>Notifications</h2>
        <p>Your recent alerts and updates</p>
      </header>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
            <Bell size={48} style={{opacity: 0.2, marginBottom: '10px'}} />
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
  );
};

export default Notifications;
