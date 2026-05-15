import React, { memo } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = memo(() => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div style={{ flex: 1, paddingBottom: '70px' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
});

export default Layout;
