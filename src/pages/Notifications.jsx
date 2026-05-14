import React from 'react';
import { Bell, Gift, IndianRupee, Trophy, CheckCircle } from 'lucide-react';
import './Notifications.css';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Withdrawal Approved',
    message: 'Your withdrawal of 500 Coins has been successfully processed to your UPI.',
    time: '2 hours ago',
    type: 'success',
    icon: <CheckCircle />
  },
  {
    id: 2,
    title: 'New BookMyShow Voucher Draw',
    message: 'A new product has been added! Start earning tickets now to win.',
    time: 'Yesterday',
    type: 'promo',
    icon: <Gift />
  },
  {
    id: 3,
    title: 'Draw Results Announced',
    message: 'The UPI ₹150 Cash lucky draw results are out. Check if you won!',
    time: 'Oct 10, 2026',
    type: 'alert',
    icon: <Trophy />
  }
];

const Notifications = () => {
  return (
    <div className="notifications-container page-container">
      <header className="page-header">
        <h2>Notifications</h2>
        <p>Your recent alerts and updates</p>
      </header>

      <div className="notifications-list">
        {MOCK_NOTIFICATIONS.map(notification => (
          <div key={notification.id} className={`notification-card ${notification.type}`}>
            <div className="notification-icon">
              {notification.icon}
            </div>
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
