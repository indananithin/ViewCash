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

  const handleBuyTicket = async (product) => {
    if (!user) return;
    
    // In a real app, buying a ticket might cost coins, or require watching an ad first.
    // The prompt says "Watch 6 ads = 1 ticket". For now, clicking "Buy Ticket" simulates watching an ad or earning a ticket.
    
    try {
      // Update user document to increment tickets
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        tickets: increment(1)
      });
      setUser({ ...user, tickets: (user.tickets || 0) + 1 });
      alert(`Ticket acquired for ${product.title}!`);
    } catch (error) {
      console.error("Error buying ticket:", error);
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
            // Simplified progress logic for the user based on global tickets
            const ticketsEarned = user?.tickets || 0;
            const ticketsRequired = product.ticketsRequired || 6;
            const progressPercent = Math.min((ticketsEarned / ticketsRequired) * 100, 100);
            const isQualified = ticketsEarned >= ticketsRequired;
            
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

                <div className="ticket-progress-container">
                  <div className="progress-labels">
                    <span>Your Tickets: {ticketsEarned}</span>
                    <span>{ticketsEarned}/{ticketsRequired} tickets</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  {!isQualified && (
                    <p className="bonus-hint">
                      Earn {ticketsRequired - ticketsEarned} more tickets to qualify
                    </p>
                  )}
                  {isQualified && (
                    <p className="bonus-hint" style={{color: 'green'}}>
                      You are qualified for this draw!
                    </p>
                  )}
                </div>

                <div className="action-box-product">
                  <div className="ads-info">
                    <PlayCircle size={18} />
                    <span>Watch {product.adsRequiredPerTicket || 6} Ads = 1 Ticket</span>
                  </div>
                  <button 
                    className="btn-buy" 
                    onClick={() => handleBuyTicket(product)}
                  >
                    Earn Ticket
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
