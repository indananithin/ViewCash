import React, { useEffect, useRef } from 'react';
import './Splash.css';
import Logo from '../components/Logo';

const Splash = () => {
  const containerRef = useRef(null);

  // Remove the HTML preloader div smoothly when React splash mounts
  useEffect(() => {
    // Hide the static HTML preloader so there's no duplicate content visible
    // The CSS transition on the preloader handles the fade
    const htmlPreloader = document.querySelector('#html-preloader');
    if (htmlPreloader) {
      htmlPreloader.style.opacity = '0';
      htmlPreloader.style.transition = 'opacity 0.15s ease';
      setTimeout(() => {
        if (htmlPreloader.parentNode) {
          htmlPreloader.parentNode.removeChild(htmlPreloader);
        }
      }, 150);
    }

    // Fade in our React splash
    const el = containerRef.current;
    if (el) {
      el.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
      });
    }
  }, []);

  return (
    <div className="splash-container" ref={containerRef}>
      <div className="splash-logo-wrapper">
        <Logo size={110} />
      </div>
      <div className="splash-tagline">Watch. Win. Redeem.</div>
      <div className="splash-loader-wrapper">
        <div className="splash-loader" />
      </div>
    </div>
  );
};

export default Splash;
