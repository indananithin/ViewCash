import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Login from './pages/Login';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './contexts/AuthContext';

import Home from './pages/Home';

// Lazy load other secondary pages to improve initial load speed
const Products = lazy(() => import('./pages/Products'));
const Draws = lazy(() => import('./pages/Draws'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Referral = lazy(() => import('./pages/Referral'));
const Settings = lazy(() => import('./pages/Settings'));
const Games = lazy(() => import('./pages/Games'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Support = lazy(() => import('./pages/Support'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-light)' }}>
      <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid rgba(250, 204, 21, 0.2)', borderTopColor: 'var(--primary-orange)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Verifying account...</p>
    </div>
  );
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-orange)' }}>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.isAdmin !== true) {
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    if (showSplash && !loading) {
      // If we've determined auth status, wait a tiny bit more for branding then hide
      const timer = setTimeout(() => {
        sessionStorage.setItem('splashShown', 'true');
        setShowSplash(false);
      }, 200); // Super fast transition once auth is ready
      return () => clearTimeout(timer);
    }
  }, [showSplash, loading]);

  const [notificationPermission, setNotificationPermission] = useState(() => {
    return ("Notification" in window) ? Notification.permission : 'granted';
  });

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  if (showSplash || notificationPermission === 'default') {
    return <Splash />;
  }

  if (notificationPermission !== 'granted') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff', padding: '20px', textAlign: 'center' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '64px', height: '64px', marginBottom: '20px', color: 'var(--primary-orange, #f97316)'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 style={{ marginBottom: '10px' }}>Notifications Required</h2>
        <p style={{ color: '#aaa', marginBottom: '20px', maxWidth: '300px', lineHeight: '1.5' }}>
          You must allow notifications to use ViewCash. Please enable them in your device settings and reload.
        </p>
        <button 
          onClick={() => { window.location.reload(); }}
          style={{ padding: '12px 24px', background: 'var(--primary-orange, #f97316)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Reload App
        </button>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-light)' }}><div className="loader" style={{width: '30px', height: '30px'}}></div></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Main App Routes wrapped in Layout (contains BottomNav) */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="draws" element={<Draws />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="referral" element={<Referral />} />
            <Route path="settings" element={<Settings />} />
            <Route path="games" element={<Games />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="support" element={<Support />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
