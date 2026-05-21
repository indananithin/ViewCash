import React from 'react';
import './Splash.css';

import Logo from '../components/Logo';

const Splash = () => {
  return (
    <div className="splash-container">
      <Logo size={100} />
      <div className="loader" style={{ marginTop: '40px' }}></div>
    </div>
  );
};

export default Splash;
