import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ children, onRefresh, disabled }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 150;

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].pageY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;

      if (diff > 0 && window.scrollY === 0) {
        // Prevent default scrolling when pulling down
        if (e.cancelable) e.preventDefault();
        
        // Resistance effect
        const distance = Math.min(diff * 0.4, MAX_PULL);
        setPullDistance(distance);
      } else {
        isPulling.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
      isPulling.current = false;
    };

    const triggerRefresh = () => {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      // Call the refresh handler
      if (onRefresh) {
        onRefresh();
      } else {
        // Default behavior: reload page after a small delay for visual feedback
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, disabled, onRefresh]);

  return (
    <div ref={containerRef} style={{ position: 'relative', touchAction: disabled ? 'auto' : 'pan-x' }}>
      {/* Pull Indicator - Centered like in the picture */}
      {!disabled && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 20, 
            left: '50%', 
            transform: `translateX(-50%) translateY(${pullDistance}px)`,
            opacity: pullDistance > 20 ? 1 : 0,
            transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <RefreshCw 
              size={22} 
              color="#7c3aed" // Purple-ish color from the pic
              style={{ 
                transform: `rotate(${pullDistance * 5}deg)`,
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
              }} 
            />
          </div>
          {isRefreshing && (
            <div style={{
              marginTop: '8px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              backdropFilter: 'blur(4px)'
            }}>
              Refreshing...
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div 
        style={{ 
          transform: !disabled ? `translateY(${pullDistance * 0.5}px)` : 'none',
          transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PullToRefresh;
