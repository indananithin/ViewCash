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

// Orange fallback — prevents any white flash during lazy route loading
const OrangeFallback = () => (
  <div style={{
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #FFC837 0%, #FF8008 100%)',
  }}>
    <div className="loader" style={{ width: '32px', height: '32px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Splash />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Splash />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.isAdmin !== true) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();

  // Minimum splash display time — prevents an instant flicker if auth
  // resolves faster than the splash animation can play.
  // Uses sessionStorage so it only blocks on FIRST open per session.
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('vcSplashDone') === '1';
  });

  useEffect(() => {
    if (splashDone) return;
    // Show splash for at least 1500ms for premium branded experience,
    // but also wait until Firebase auth has resolved (loading = false).
    const minTime = 1500;
    const start = Date.now();

    if (!loading) {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minTime - elapsed);
      const timer = setTimeout(() => {
        sessionStorage.setItem('vcSplashDone', '1');
        setSplashDone(true);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [loading, splashDone]);

  // Keep showing splash while auth is loading OR minimum time hasn't elapsed
  if (!splashDone || loading) {
    return <Splash />;
  }

  // Handle stable orange status bar
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', '#FF8008');

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<OrangeFallback />}>
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
