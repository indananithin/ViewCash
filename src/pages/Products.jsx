import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { PlayCircle, Clock, Calendar, Gift, X, RefreshCw, ArrowLeft, Target, Sparkles, Hourglass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [adState, setAdState] = useState({
    isOpen: false,
    timeLeft: 30,
    product: null
  });

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
    
    if (adsWatchedToday >= adsRequiredPerTicket) {
      newTickets += 1;
      newDaysClaimed += 1; // Claims 1 ticket for the day
      
      // Bonus logic: 6 days claimed = bonus 3 tickets
      if (newDaysClaimed % 6 === 0) {
         newTickets += 3;
         alert(`Congratulations! You've claimed tickets for 6 days and earned 3 BONUS tickets!`);
      } else {
         alert(`You have watched all ads for today and earned a ticket for ${product.title}!`);
      }
    }
    
    const updatedProductData = {
      adsWatchedToday,
      lastAdDate,
      tickets: newTickets,
      daysClaimed: newDaysClaimed
    };

    try {
      await updateDoc(userRef, {
        [`productProgress.${product.id}`]: updatedProductData
      });
      setUser({
        ...user,
        productProgress: {
          ...(user.productProgress || {}),
          [product.id]: updatedProductData
        }
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
    if (window.confirm("Are you sure you want to close the ad? You won't get your reward.")) {
      setAdState({ isOpen: false, timeLeft: 0, product: null });
    }
  };

  // Handle strict ad timer
  useEffect(() => {
    let timer;
    if (adState.isOpen && adState.timeLeft > 0) {
      timer = setInterval(() => {
        setAdState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (adState.isOpen && adState.timeLeft === 0) {
      // Ad finished!
      handleWatchAd(adState.product);
      setAdState({ isOpen: false, timeLeft: 0, product: null });
    }
    return () => clearInterval(timer);
  }, [adState.isOpen, adState.timeLeft]);

  // Prevent back-button navigation during ad
  useEffect(() => {
    if (adState.isOpen) {
      // Push a dummy state to the history
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = (e) => {
        // If they press back, show confirmation and push state again to stay
        if (adState.isOpen) {
          if (window.confirm("Do you want to quit watching the ad and lose your reward?")) {
            setAdState({ isOpen: false, timeLeft: 0, product: null });
          } else {
            // Stay on page
            window.history.pushState(null, '', window.location.href);
          }
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

  if (loading) {
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading products...</div>;
  }

  return (
    <div className="products-container page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Products</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner">
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
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} /> Reload Now
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
              const currentQualifyingDays = daysClaimed % qualifyingTarget;
              const isQualifiedForBonus = currentQualifyingDays === 0 && daysClaimed > 0;
              const qualifyingDaysDisplay = isQualifiedForBonus ? qualifyingTarget : currentQualifyingDays;

              const ticketsEarned = productData.tickets || 0;
              const isTodayBrought = adsWatchedToday >= adsRequired;
              
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
                      <p style={{ color: '#C2410C', fontSize: '12px', fontWeight: '500' }}>
                        🎯 Progress: {qualifyingDaysDisplay}/{qualifyingTarget} tickets ({(qualifyingDaysDisplay / qualifyingTarget * 100).toFixed(0)}%)
                      </p>
                      {isQualifiedForBonus && (
                        <p style={{ color: '#059669', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                          🥳 You qualified for 3 FREE tickets!
                        </p>
                      )}
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

      {/* Strict Ad Modal */}
      {adState.isOpen && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
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
        </div>
      )}
    </div>
  );
};

export default Products;
