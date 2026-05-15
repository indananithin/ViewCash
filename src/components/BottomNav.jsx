import React, { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gift, Trophy, Wallet, User, Gamepad2 } from 'lucide-react';
import './BottomNav.css';

const BottomNav = memo(() => {
  const navItems = useMemo(() => [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/products', icon: <Gift size={24} />, label: 'Products' },
    { to: '/games', icon: <Gamepad2 size={24} />, label: 'Games' },
    { to: '/wallet', icon: <Wallet size={24} />, label: 'Wallet' },
    { to: '/profile', icon: <User size={24} />, label: 'Profile' },
  ], []);

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink 
          key={item.to} 
          to={item.to} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
});

export default BottomNav;
