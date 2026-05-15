import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { PlayCircle, Clock, Calendar, Gift, X } from 'lucide-react';
import './Products.css';

const Products = () => {
  const { user, setUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adState, setAdState] = useState({
    isOpen: false,
    timeLeft: 30,
    product: null
  });

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter out inactive ones or just show all
        setProducts(productsList.filter(p => p.active !== false));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (loading) {
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading products...</div>;
  }

  return (
    <div className="products-container page-container">
      <header className="page-header">
        <h2><Gift size={24} color="var(--primary-orange)" style={{ verticalAlign: 'middle', marginRight: '6px' }} />Products</h2>
        <p>Watch ads to earn tickets for lucky draws</p>
      </header>

      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: 'var(--action-gradient)', padding: '6px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Gift size={20} color="white" />
        </div>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          Active Products
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e', marginLeft: '8px', animation: 'pulse 2s infinite' }}></span>
        </h3>
      </div>

      <div className="products-list">
        {products.length === 0 ? (
          <p>No products available right now.</p>
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
            // If they just hit a multiple of 6 (and it's not 0), show 6/6 and qualified
            const isQualifiedForBonus = currentQualifyingDays === 0 && daysClaimed > 0;
            const qualifyingDaysDisplay = isQualifiedForBonus ? qualifyingTarget : currentQualifyingDays;

            const ticketsEarned = productData.tickets || 0;
            const isTodayBrought = adsWatchedToday >= adsRequired;
            
            return (
              <div key={product.id} className="product-card">
                <div className="product-info-header">
                  <div className="product-title-group">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></span>
                      {product.title}
                    </h4>
                    <span className="prize-amount">Prize: {product.prizeAmount}</span>
                  </div>
                  <div className="draw-date">
                    <Calendar size={14} />
                    <span>Draw: {product.drawDate}</span>
                  </div>
                </div>

                {/* Progress 1: Qualifying Tickets (Days) */}
                <div className="ticket-progress-container">
                  <div className="progress-labels">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} color="var(--primary-orange)" /> Qualifying Tickets Bonus</span>
                    <span>{qualifyingDaysDisplay}/{qualifyingTarget} Days</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(qualifyingDaysDisplay / qualifyingTarget) * 100}%` }}
                    ></div>
                  </div>
                  <p className="bonus-hint" style={{ color: isQualifiedForBonus ? 'green' : 'var(--text-muted)' }}>
                    {isQualifiedForBonus 
                      ? "You qualified and received 3 bonus tickets!" 
                      : `Claim tickets for ${qualifyingTarget} days to get 3 bonus tickets!`}
                  </p>
                </div>

                {/* Progress 2: Today's Ticket */}
                <div className="ticket-progress-container">
                  <div className="progress-labels">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><PlayCircle size={14} color="var(--accent-green)" /> Today's Ticket (Ads)</span>
                    <span>{adsWatchedToday}/{adsRequired} Ads</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(adsWatchedToday / adsRequired) * 100}%` }}
                    ></div>
                  </div>
                  <p className="bonus-hint" style={{ color: isTodayBrought ? 'green' : 'var(--text-muted)' }}>
                    {isTodayBrought ? "Already brought today's ticket!" : "Watch ads to claim today's ticket"}
                  </p>
                </div>

                <div className="action-box-product">
                  <div className="ads-info">
                    <Gift size={18} color="var(--primary-yellow)" />
                    <span>Total Tickets: {ticketsEarned}</span>
                  </div>
                  <button 
                    className="btn-buy" 
                    onClick={() => handleStartAd(product)}
                    disabled={isTodayBrought}
                    style={{ 
                      background: isTodayBrought ? '#ccc' : 'var(--primary-gradient)',
                      color: isTodayBrought ? '#666' : 'white',
                      cursor: isTodayBrought ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isTodayBrought ? 'Already Brought' : 'Watch Ad'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="coming-soon-section">
        <div className="section-header">
          <h3><Clock size={18} color="var(--primary-yellow)" style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Coming Soon</h3>
        </div>
        <div className="coming-soon-card">
          <Gift size={28} color="var(--primary-orange)" className="coming-soon-icon" style={{ marginBottom: '12px' }} />
          <p>More exciting rewards!</p>
          <span>Stay tuned for premium prizes.</span>
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
