import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import './Draws.css';

const MOCK_DRAWS = [
  {
    id: 1,
    title: 'BookMyShow ₹200 Voucher',
    date: 'Oct 15, 2026',
    winner: 'Rahul M.',
    winnerPhone: 'XXXXX-XX892',
    status: 'Claimed'
  },
  {
    id: 2,
    title: 'UPI ₹150 Cash',
    date: 'Oct 10, 2026',
    winner: 'Priya K.',
    winnerPhone: 'XXXXX-XX431',
    status: 'Processing'
  }
];

const Draws = () => {
  return (
    <div className="draws-container page-container">
      <header className="page-header">
        <h2>Draws & Results</h2>
        <p>Recent lucky draw winners</p>
      </header>

      <div className="draws-list">
        {MOCK_DRAWS.map(draw => (
          <div key={draw.id} className="draw-card">
            <div className="draw-header">
              <h4>{draw.title}</h4>
              <div className="draw-date-badge">
                <Calendar size={12} /> {draw.date}
              </div>
            </div>
            
            <div className="winner-info">
              <div className="winner-icon">
                <Trophy size={20} />
              </div>
              <div className="winner-details">
                <p className="winner-name">Winner: {draw.winner}</p>
                <p className="winner-phone">{draw.winnerPhone}</p>
              </div>
              <div className={`reward-status ${draw.status.toLowerCase()}`}>
                {draw.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Draws;
