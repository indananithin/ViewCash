import React, { memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import PullToRefresh from './PullToRefresh';

const Layout = memo(() => {
  const location = useLocation();
  
  // Disable pull-to-refresh on specific pages
  const disabledPages = ['/wallet', '/profile', '/games'];
  const isPullDisabled = disabledPages.includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ flex: 1 }}>
        <PullToRefresh disabled={isPullDisabled}>
          <Outlet />
        </PullToRefresh>
      </div>
      <BottomNav />
    </div>
  );
});

export default Layout;
