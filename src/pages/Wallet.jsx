import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { Coins, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import './Wallet.css';

const Wallet = () => {
  const { user, setUser } = useAuth();
  const [upiId, setUpiId] = useState(user?.upi || '');
  const [amount, setAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!upiId.includes('@')) {
      setStatusMsg('Please enter a valid UPI ID');
      return;
    }
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      setStatusMsg('Minimum withdrawal is 50 Coins');
      return;
    }
    if (numAmount > user.coins) {
      setStatusMsg('Insufficient coin balance');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Deduct coins in Firestore
      const userRef = doc(db, 'users', user.uid);
      const newBalance = user.coins - numAmount;
      await updateDoc(userRef, { coins: newBalance });

      // 2. Add withdrawal request to Firestore
      await addDoc(collection(db, 'withdrawals'), {
        uid: user.uid,
        userName: user.name,
        amount: numAmount,
        upiId: upiId,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      // 3. Update local state
      setUser({ ...user, coins: newBalance });
      
      setStatusMsg('Withdrawal request submitted successfully! Processing time: 24-48 hours.');
      setAmount('');
    } catch (error) {
      console.error("Withdrawal error:", error);
      setStatusMsg('Failed to submit withdrawal. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wallet-container page-container">
      <header className="page-header">
        <h2>Wallet & Redemption</h2>
      </header>

      <div className="balance-card-wallet">
        <p>Available Balance</p>
        <h2><Coins size={28} /> {user?.coins || 0} Coins</h2>
        <div className="conversion-rate">
          <IndianRupee size={14} /> 1 Coin = ₹1
        </div>
      </div>

      <div className="withdrawal-form-card">
        <h3>Withdraw to UPI</h3>
        <p className="rules-text">Minimum 50 coins required.</p>

        {statusMsg && (
          <div className={`status-msg ${statusMsg.includes('successfully') ? 'success' : 'error'}`}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleWithdraw}>
          <div className="input-group-wallet">
            <label>UPI ID</label>
            <input 
              type="text" 
              placeholder="e.g. yourname@upi" 
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group-wallet">
            <label>Coins to Withdraw</label>
            <input 
              type="number" 
              placeholder="Min. 50" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="btn-withdraw" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Withdraw Cash'}
          </button>
        </form>
      </div>

      <div className="history-section">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          {/* We keep mock transactions here for visual structure, but in a real app, we'd fetch them from Firestore */}
          <div className="transaction-item">
            <div className="tx-info">
              <div className="tx-icon withdraw"><IndianRupee size={16} /></div>
              <div>
                <p className="tx-title">UPI Withdrawal</p>
                <small className="tx-date">Oct 24, 2026</small>
              </div>
            </div>
            <div className="tx-status">
              <span className="tx-amount negative">-100 Coins</span>
              <span className="badge-status pending"><Clock size={12}/> Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
