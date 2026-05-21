import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

// Use requestAnimationFrame to defer React mount until AFTER the browser
// has painted the HTML preloader at least once.
// This guarantees: HTML preloader shows on frame 1, React takes over on frame 2.
// Without this, on slow devices React can mount before the first paint,
// causing a blank white frame during hydration.
requestAnimationFrame(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
});
