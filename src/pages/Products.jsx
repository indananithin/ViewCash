import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, increment, onSnapshot, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { PlayCircle, Clock, Calendar, Gift, X, RefreshCw, ArrowLeft, Target, Sparkles, Hourglass, AlertTriangle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import PullToRefresh from '../components/PullToRefresh';
import './Products.css';

// Google AdMob Smart Banner Unit
// Collapses completely to 0px height if no ad is filled.
// Re-polls and re-loads every 5 seconds if the slot remains empty.
const AdMobBanner = () => {
  const [adKey, setAdKey] = useState(0);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const insRef = React.useRef(null);

  // Dynamically load Google AdMob / AdSense script on mount
  useEffect(() => {
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544"; // Replace with your publisher client ID
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  // Initialize and observe standard responsive ads
  useEffect(() => {
    setIsAdLoaded(false);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdMob script push warning:", e);
    }

    const targetIns = insRef.current;
    if (!targetIns) return;

    let reloadTimeout = null;

    // Observe changes in Google ins attributes to handle collapse & reload
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const status = targetIns.getAttribute('data-ad-status');
          const style = targetIns.getAttribute('style') || '';

          if (status === 'unfilled' || style.includes('display: none')) {
            setIsAdLoaded(false);
            
            // Reload by mounting a fresh ins element after 5 seconds if no ad returned
            if (!reloadTimeout) {
              reloadTimeout = setTimeout(() => {
                setAdKey(prev => prev + 1);
              }, 5000);
            }
          } else if (status === 'filled') {
            setIsAdLoaded(true);
            if (reloadTimeout) {
              clearTimeout(reloadTimeout);
              reloadTimeout = null;
            }
          }
        }
      });
    });

    observer.observe(targetIns, {
      attributes: true,
      attributeFilter: ['style', 'data-ad-status']
    });

    return () => {
      observer.disconnect();
      if (reloadTimeout) clearTimeout(reloadTimeout);
    };
  }, [adKey]);

  return (
    <div className={`banner-ad-container ${isAdLoaded ? 'loaded' : 'collapsed'}`}>
      <ins
        key={adKey}
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-3940256099942544" // Google AdMob/AdSense Test Publisher ID. Replace with ca-pub-XXXXXXXXXXXXXXXX.
        data-ad-slot="2904096689"                 // Google test banner slot ID. Replace with your active slot ID.
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {isAdLoaded && <div className="banner-ad-badge">Ad</div>}
    </div>
  );
};


const Products = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReload = () => {
    setIsRefreshing(true);
    // Increment retryCount to force the onSnapshot to re-evaluate or sync
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Products updated!");
    }, 1200);
  };
  const [adState, setAdState] = useState({
    isOpen: false,
    timeLeft: 30,
    product: null
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [congratsState, setCongratsState] = useState({
    isOpen: false,
    title: '',
    message: '',
    ticketsEarned: 0,
    coinsEarned: 0
  });
  const [isAdPaused, setIsAdPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  const handleWatchAd = async (product) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', user.uid);
    
    // Default structure for product progress
    const productData = user.productProgress?.[product.id] || { 
      adsWatchedToday: 0, 
      lastAdDate: '', 
      tickets: 0,
      daysClaimed: 0
    };
    
    let { adsWatchedToday, lastAdDate, tickets, daysClaimed } = productData;
    
    // Reset if it's a new day
    if (lastAdDate !== today) {
      adsWatchedToday = 0;
      lastAdDate = today;
    }
    
    const adsRequiredPerTicket = product.adsRequiredPerTicket || 6;

    if (adsWatchedToday >= adsRequiredPerTicket) {
      alert("You have already brought today's ticket! Come back tomorrow.");
      return;
    }
    
    // Simulate watching an ad
    adsWatchedToday += 1;
    
    let newTickets = tickets;
    let newDaysClaimed = daysClaimed;
    let coinsEarnedToday = 0;
    
    if (adsWatchedToday >= adsRequiredPerTicket) {
      newTickets += 1;
      newDaysClaimed += 1; // Claims 1 ticket for the day
      coinsEarnedToday += 1; // 1 coin for daily ticket watch
      
      // Bonus logic: 6 days claimed = bonus 3 tickets
      if (newDaysClaimed === 6) {
         newTickets += 3;
         
         setCongratsState({
           isOpen: true,
           title: '🎉 Streak Qualified!',
           message: `congratulations u earned 3 more tickets and qualified for the draw`,
           ticketsEarned: 3,
           coinsEarned: 1
         });

         try {
           await addDoc(collection(db, 'notifications'), {
             userId: user.uid,
             title: '🎉 Streak Reward Unlocked!',
             message: `congratulations u earned 3 more tickets and qualified for the draw`,
             type: 'success',
             createdAt: new Date().toISOString()
           });
         } catch (e) {
           console.error("Error creating streak notification:", e);
         }
      } else {
         setCongratsState({
           isOpen: true,
           title: '🎉 Ticket Earned!',
           message: `ticket earned successfully and 1 coin earned`,
           ticketsEarned: 1,
           coinsEarned: 1
         });
      }
    } else {
      setCongratsState({
        isOpen: true,
        title: '📺 Ad Watched!',
        message: `ad watchd! progress[${adsWatchedToday}/${adsRequiredPerTicket}]`,
        ticketsEarned: 0,
        coinsEarned: 0
      });
    }
    
    const updatedProductData = {
      adsWatchedToday,
      lastAdDate,
      tickets: newTickets,
      daysClaimed: newDaysClaimed
    };

    try {
      const updateFields = {
        [`productProgress.${product.id}`]: updatedProductData
      };
      if (coinsEarnedToday > 0) {
        updateFields.coins = (user.coins || 0) + coinsEarnedToday;
      }
      
      await updateDoc(userRef, updateFields);
      
      setUser(prev => {
        const nextUser = {
          ...prev,
          productProgress: {
            ...(prev.productProgress || {}),
            [product.id]: updatedProductData
          }
        };
        if (coinsEarnedToday > 0) {
          nextUser.coins = (prev.coins || 0) + coinsEarnedToday;
        }
        return nextUser;
      });
    } catch (error) {
      console.error("Error updating ad progress:", error);
    }
  };

  const handleStartAd = (product) => {
    setAdState({
      isOpen: true,
      timeLeft: 30, // Strict 30 seconds ad time
      product: product
    });
  };

  const handleCancelAd = () => {
    setShowExitConfirm(true);
  };

  const confirmExitAd = () => {
    setAdState({ isOpen: false, timeLeft: 0, product: null });
    setShowExitConfirm(false);
  };

  // Auto-clear toast message after 3.5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Manage visibility/focus pausing for strict ad watching
  useEffect(() => {
    if (!adState.isOpen) {
      setIsAdPaused(false);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsAdPaused(true);
      } else {
        setIsAdPaused(false);
      }
    };

    const handleWindowBlur = () => {
      setIsAdPaused(true);
    };

    const handleWindowFocus = () => {
      setIsAdPaused(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Initial check
    if (document.hidden) {
      setIsAdPaused(true);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [adState.isOpen]);

  // Handle strict ad timer
  useEffect(() => {
    let timer;
    if (adState.isOpen && adState.timeLeft > 0 && !isAdPaused) {
      timer = setInterval(() => {
        setAdState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (adState.isOpen && adState.timeLeft === 0) {
      // Ad finished!
      handleWatchAd(adState.product);
      setAdState({ isOpen: false, timeLeft: 0, product: null });
    }
    return () => clearInterval(timer);
  }, [adState.isOpen, adState.timeLeft, isAdPaused]);

  // Prevent back-button navigation during ad
  useEffect(() => {
    if (adState.isOpen) {
      // Push a dummy state to the history to capture back button
      window.history.pushState({ adOpen: true }, '', window.location.href);
      
      const handlePopState = (e) => {
        if (adState.isOpen) {
          // If they press back, show confirmation
          setShowExitConfirm(true);
          // Stay on current page for now
          window.history.pushState({ adOpen: true }, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [adState.isOpen]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const productsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeProducts = productsList.filter(p => p.active !== false);
      setProducts(activeProducts);
      setLoading(false);

      // Auto-refresh logic if no ads are available
      if (activeProducts.length === 0 && retryCount < 5) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000); // Retry every 5 seconds if empty
        return () => clearTimeout(timer);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [retryCount]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      const filtered = docs.filter(n => !n.userId || n.userId === user?.uid);
      const lastChecked = user?.lastCheckedNotifications || new Date(0).toISOString();
      const count = filtered.filter(n => n.createdAt > lastChecked).length;
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user?.lastCheckedNotifications, user?.uid]);



  if (loading) {
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading products...</div>;
  }

  return (
    <PullToRefresh onRefresh={handleReload}>
      <div className="products-container page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ margin: 0 }}>Products</h2>
        </div>
        <button 
          onClick={() => navigate('/notifications')} 
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <Bell size={24} color="#666" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              background: '#EF4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>{unreadCount}</span>
          )}
        </button>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner">
        <AdMobBanner />

        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎟️ Active Products
          </h3>
        </div>

        <div className="products-list">
          {products.length === 0 ? (
            <div className="no-ads-container" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>No ad available right now.</p>
              <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-muted)' }}>Auto-retrying in a few seconds or refresh manually</p>
              <button 
                className="btn-buy" 
                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={handleReload}
                disabled={isRefreshing}
              >
                <RefreshCw 
                  size={16} 
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }} 
                /> 
                {isRefreshing ? "Refreshing..." : "Reload Now"}
              </button>
            </div>
          ) : (
            products.map(product => {
              const productData = user?.productProgress?.[product.id] || { 
                adsWatchedToday: 0, 
                lastAdDate: '', 
                tickets: 0,
                daysClaimed: 0
              };
              
              const today = new Date().toISOString().split('T')[0];
              const adsWatchedToday = productData.lastAdDate === today ? productData.adsWatchedToday : 0;
              const adsRequired = product.adsRequiredPerTicket || 6;
              
              const daysClaimed = productData.daysClaimed || 0;
              const qualifyingTarget = 6;
              const isQualifiedForBonus = daysClaimed >= 6;
              const qualifyingDaysDisplay = isQualifiedForBonus ? 6 : daysClaimed;

              const ticketsEarned = productData.tickets || 0;
              const isTodayBrought = adsWatchedToday >= adsRequired;

              let streakMessage = "";
              if (isQualifiedForBonus) {
                streakMessage = "Congratulations! You have qualified for the draw.";
              } else {
                const remainingDays = 6 - qualifyingDaysDisplay;
                streakMessage = `Earn ${remainingDays} more tickets to get 3 FREE tickets! and qualify for draw`;
              }
              
              return (
                <div key={product.id} className="product-card" style={{ background: '#FFFBEB', borderColor: '#FEF3C7' }}>
                  <div className="product-info-header">
                    <div className="product-title-group">
                      <h4 style={{ color: '#92400E', fontSize: '20px' }}>{product.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#B45309' }}>
                          🎁 Prize: {product.prizeAmount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#B45309' }}>
                          🗓️ Draw Date: {product.drawDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress 1: Today's Ticket */}
                  <div className="ticket-progress-container" style={{ background: '#ECFDF5', padding: '12px', borderRadius: '12px', border: '1px solid #D1FAE5', marginTop: '16px' }}>
                    <div className="progress-labels" style={{ color: '#065F46', fontWeight: '600', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ {isTodayBrought ? "Already Bought Ticket Today" : "Today's Ticket Progress"}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ background: '#A7F3D0', height: '10px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${(adsWatchedToday / adsRequired) * 100}%`, background: '#10B981' }}
                      ></div>
                    </div>
                    <p style={{ color: '#047857', fontSize: '12px', marginTop: '8px', fontWeight: '500' }}>
                      {isTodayBrought ? "🎯 Today's ticket already earned! Come back tomorrow." : `🎯 Watch ${adsRequired - adsWatchedToday} more ads to get today's ticket.`}
                    </p>
                  </div>

                  {/* Progress 2: Qualifying Tickets */}
                  <div className="ticket-progress-container" style={{ background: '#FFF7ED', padding: '12px', borderRadius: '12px', border: '1px solid #FFEDD5', marginTop: '16px' }}>
                    <div className="progress-labels" style={{ color: '#9A3412', fontWeight: '600', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎫 Your Tickets: {ticketsEarned}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ background: '#FED7AA', height: '10px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${(qualifyingDaysDisplay / qualifyingTarget) * 100}%`, background: '#F97316' }}
                      ></div>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ color: '#C2410C', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                        🎯 Progress: {qualifyingDaysDisplay}/{qualifyingTarget} tickets ({(qualifyingDaysDisplay / qualifyingTarget * 100).toFixed(0)}%)
                      </p>
                      <p style={{ 
                        color: isQualifiedForBonus ? '#059669' : '#3B82F6', 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}>
                        {isQualifiedForBonus ? '🥳' : '🎁'} {streakMessage}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{adsRequired} Ads / Ticket</span>
                    <button 
                      className="btn-buy" 
                      onClick={() => handleStartAd(product)}
                      disabled={isTodayBrought}
                      style={{ 
                        background: isTodayBrought ? '#E5E7EB' : 'var(--primary-gradient)',
                        color: isTodayBrought ? '#9CA3AF' : 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        boxShadow: isTodayBrought ? 'none' : '0 4px 14px rgba(255, 128, 8, 0.3)'
                      }}
                    >
                      {isTodayBrought ? 'Already Bought' : 'Watch Ad'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="coming-soon-section" style={{ marginTop: '40px' }}>
          <div className="section-header">
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏳ Coming Soon
            </h3>
          </div>
          <div className="coming-soon-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none', textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No upcoming Products</p>
          </div>
        </div>
      </div>

      {/* Strict Ad Modal - Rendered via Portal to escape stacking contexts */}
      {adState.isOpen && createPortal(
        <div className="ad-modal-overlay">
          <div className="ad-modal-content" style={{ position: 'relative', overflow: 'hidden' }}>
            {isAdPaused ? (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px',
                zIndex: 20
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '16px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  <AlertTriangle size={32} color="#D97706" />
                </div>
                <h3 style={{ color: '#92400E', fontSize: '20px', marginBottom: '8px', textAlign: 'center' }}>Ad Paused!</h3>
                <p style={{ color: '#B45309', fontSize: '13px', lineHeight: '1.5', textAlign: 'center', margin: 0 }}>
                  Please stay on the ad screen to continue earning. The timer will resume automatically once you return.
                </p>
              </div>
            ) : null}
            <h3>Watching Ad...</h3>
            <p>Please wait to claim your ticket.</p>
            <div className="ad-timer-circle">
              {adState.timeLeft}s
            </div>
            <p className="ad-strict-warning">Do not close this window until the timer ends!</p>
            <button className="btn-cancel-ad" onClick={handleCancelAd}>
              <X size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/>
              Cancel Ad
            </button>
          </div>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
      )}

      {/* Toast Notification - Rendered via Portal */}
      {toastMessage && createPortal(
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 12000,
          animation: 'slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: '90%',
          width: 'max-content',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            📺
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '0.2px' }}>
            {toastMessage}
          </span>
          <style>{`
            @keyframes slideUpFadeIn {
              from { opacity: 0; transform: translate(-50%, 15px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>,
        document.body
      )}

      {createPortal(
        <ConfirmModal 
          isOpen={showExitConfirm}
          onClose={() => setShowExitConfirm(false)}
          onConfirm={confirmExitAd}
          title="Quit Ad?"
          message="If you quit now, you will lose your progress for this ad. Are you sure you want to stop?"
          confirmText="Yes, Stop Ad"
          cancelText="Keep Watching"
          iconType="warning"
        />,
        document.body
      )}

      {/* Congrats Streak Modal - Rendered via Portal */}
      {congratsState.isOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 11000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '340px',
            padding: '32px 24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            textAlign: 'center',
            border: '2px solid #FEF3C7'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 20px rgba(255, 165, 0, 0.4)',
              position: 'relative'
            }}>
              <Sparkles size={38} color="white" />
            </div>

            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#92400E', 
              marginBottom: '12px',
              fontFamily: '"Outfit", sans-serif'
            }}>
              {congratsState.title}
            </h3>

            <p style={{ 
              fontSize: '14px', 
              color: '#6B7280', 
              lineHeight: '1.6', 
              marginBottom: '24px',
              whiteSpace: 'pre-wrap'
            }}>
              {congratsState.message}
            </p>

            {(congratsState.ticketsEarned > 0 || congratsState.coinsEarned > 0) && (
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  flex: 1,
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '20px' }}>🎫</span>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#B45309' }}>+{congratsState.ticketsEarned} Ticket{congratsState.ticketsEarned > 1 ? 's' : ''}</span>
                </div>
                <div style={{
                  flex: 1,
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '20px' }}>🪙</span>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#B45309' }}>+{congratsState.coinsEarned} Coin{congratsState.coinsEarned > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setCongratsState(prev => ({ ...prev, isOpen: false }))}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(255, 128, 8, 0.3)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Awesome!
            </button>
          </div>
        </div>,
        document.body
      )}
      </div>
    </PullToRefresh>
  );
};

export default Products;
