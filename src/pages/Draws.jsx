import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Trophy, Calendar } from 'lucide-react';
import './Draws.css';

const Draws = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const q = query(collection(db, 'draws'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const drawsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDraws(drawsList);
      } catch (error) {
        console.error("Error fetching draws:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDraws();
  }, []);

  if (loading) {
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading results...</div>;
  }

  return (
    <div className="draws-container page-container">
      <header className="page-header">
        <h2>Draws & Results</h2>
        <p>Recent lucky draw winners</p>
      </header>

      <div className="draws-list">
        {draws.length === 0 ? (
          <p>No draw results available yet.</p>
        ) : (
          draws.map(draw => (
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
                <div className={`reward-status ${draw.status ? draw.status.toLowerCase() : ''}`}>
                  {draw.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Draws;
