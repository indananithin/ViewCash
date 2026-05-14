import React, { useState } from 'react';
import { PlayCircle, Clock, Calendar, Gift } from 'lucide-react';
import './Products.css';

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'BookMyShow Voucher',
    prizeAmount: '₹200',
    drawDate: 'Oct 30, 2026',
    ticketsEarned: 3,
    ticketsRequired: 6,
    adsRequiredPerTicket: 6,
    isBoughtToday: true,
  },
  {
    id: 2,
    title: 'UPI Cash',
    prizeAmount: '₹150',
    drawDate: 'Nov 05, 2026',
    ticketsEarned: 0,
    ticketsRequired: 5,
    adsRequiredPerTicket: 6,
    isBoughtToday: false,
  }
];

const Products = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const handleBuyTicket = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return { ...p, isBoughtToday: true, ticketsEarned: p.ticketsEarned + 1 };
      }
      return p;
    }));
  };

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
        {products.map(product => {
          const progressPercent = Math.min((product.ticketsEarned / product.ticketsRequired) * 100, 100);
          
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
                  <span>Your Tickets: {product.ticketsEarned}</span>
                  <span>{product.ticketsEarned}/{product.ticketsRequired} tickets</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                {product.ticketsEarned < product.ticketsRequired && (
                  <p className="bonus-hint">
                    Earn {product.ticketsRequired - product.ticketsEarned} more tickets to qualify
                  </p>
                )}
              </div>

              {product.isBoughtToday ? (
                <div className="status-box bought">
                  <div className="status-content">
                    <strong>Already Bought Ticket Today</strong>
                    <p>Today's ticket already earned! Come back tomorrow.</p>
                  </div>
                </div>
              ) : (
                <div className="action-box-product">
                  <div className="ads-info">
                    <PlayCircle size={18} />
                    <span>Watch {product.adsRequiredPerTicket} Ads = 1 Ticket</span>
                  </div>
                  <button 
                    className="btn-buy" 
                    onClick={() => handleBuyTicket(product.id)}
                  >
                    Buy Ticket
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="coming-soon-section">
        <div className="section-header">
          <h3>Coming Soon</h3>
        </div>
        <div className="coming-soon-card">
          <Clock size={24} className="coming-soon-icon" />
          <p>No upcoming products</p>
          <span>Stay tuned for more exciting rewards!</span>
        </div>
      </div>
    </div>
  );
};

export default Products;
