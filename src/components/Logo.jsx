import React from 'react';

const Logo = ({ size = 60, showText = true, className = "", variant = "colored" }) => {
  const isWhite = variant === "white";

  return (
    <div className={`logo-wrapper ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Background Glow */}
          <circle cx="50" cy="50" r="48" fill={isWhite ? "rgba(255,255,255,0.15)" : "url(#vc_pro_glow)"} />
          
          {/* Sleek Eye Path (View) */}
          <path 
            d="M12 50C12 50 28 28 50 28C72 28 88 50 88 50C88 50 72 72 50 72C28 72 12 50 12 50Z" 
            stroke={isWhite ? "white" : "var(--primary-orange)"} 
            strokeWidth={isWhite ? "3.5" : "4"} 
            strokeLinecap="round" 
          />
          
          {/* Centered Premium Coin (Cash) */}
          <circle cx="50" cy="50" r="22" fill={isWhite ? "rgba(255,255,255,0.9)" : "url(#vc_pro_coin)"} />
          
          {/* Refined Rupee Symbol */}
          <text x="50" y="59" textAnchor="middle" fill={isWhite ? "#FF8008" : "white"} style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
          }}>₹</text>

          <defs>
            <radialGradient id="vc_pro_glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(48)">
              <stop stopColor="var(--primary-yellow)" stopOpacity="0.2" />
              <stop offset="1" stopColor="var(--primary-yellow)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="vc_pro_coin" x1="28" y1="28" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--primary-yellow)" />
              <stop offset="1" stopColor="var(--primary-orange)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: size * 0.35, 
            margin: 0, 
            color: isWhite ? "white" : "var(--text-main)", 
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            View<span style={{ color: isWhite ? "rgba(255,255,255,0.85)" : "var(--primary-orange)" }}>Cash</span>
          </h1>
        </div>
      )}
    </div>
  );
};

export default Logo;
