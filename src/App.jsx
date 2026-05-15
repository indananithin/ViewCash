import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy load pages to improve performance and scalability
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Draws = lazy(() => import('./pages/Draws'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Referral = lazy(() => import('./pages/Referral'));
const Settings = lazy(() => import('./pages/Settings'));
const Games = lazy(() => import('./pages/Games'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-orange)' }}>Loading...</div>;
  
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
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('splashShown', 'true');
        setShowSplash(false);
      }, 2500); // Show splash for 2.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-orange)' }}>Loading...</div>}>
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
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
