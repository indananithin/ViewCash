import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import Draws from './pages/Draws';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Referral from './pages/Referral';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // or a spinner
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.isAdmin !== true) {
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }
  
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <AuthProvider>
      <Router>
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
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
