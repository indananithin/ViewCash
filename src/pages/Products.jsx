import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { PlayCircle, Clock, Calendar, Gift } from 'lucide-react';
import './Products.css';

const Products = () => {
  const { user, setUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h2>Products</h2>
        <p>Watch ads to earn tickets for lucky draws</p>
      </header>

      <div className="section-header">
        <h3>Active Products</h3>
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
                    <h4>{product.title}</h4>
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
                    <span>Qualifying Tickets Bonus</span>
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
                    <span>Today's Ticket (Ads)</span>
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
                    <Gift size={18} />
                    <span>Your Total Tickets: {ticketsEarned}</span>
                  </div>
                  <button 
                    className="btn-buy" 
                    onClick={() => handleWatchAd(product)}
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
          <h3>Coming Soon</h3>
        </div>
        <div className="coming-soon-card">
          <Clock size={24} className="coming-soon-icon" />
          <p>More exciting rewards!</p>
          <span>Stay tuned.</span>
        </div>
      </div>
    </div>
  );
};

export default Products;
