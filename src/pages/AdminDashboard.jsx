import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, increment, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Users, Gift, IndianRupee, Bell, Shield, TrendingUp, CheckCircle, XCircle, PlusCircle, Trophy, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

import Logo from '../components/Logo';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // States for Add Product
  const [productTitle, setProductTitle] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [ticketsReq, setTicketsReq] = useState('');
  const [adsPerTicket, setAdsPerTicket] = useState('');
  
  // States for Add Draw
  const [drawProductId, setDrawProductId] = useState('');
  const [numWinners, setNumWinners] = useState('');
  const [drawPrizeAmount, setDrawPrizeAmount] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // States for Send Notification
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');

  // Real Data States
  const [usersList, setUsersList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [claimsList, setClaimsList] = useState([]);

  useEffect(() => {
    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsersList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Listen to withdrawals
    const unsubWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snap) => {
      setWithdrawalsList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Listen to products (show all to admin, but we'll filter in the UI where needed)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProductsList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Listen to claims
    const unsubClaims = onSnapshot(query(collection(db, 'claims'), orderBy('claimedAt', 'desc')), (snap) => {
      setClaimsList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => {
      unsubUsers();
      unsubWithdrawals();
      unsubProducts();
      unsubClaims();
    };
  }, []);

  const selectedProduct = productsList.find(p => p.id === drawProductId);
  const qualifiedUsers = usersList.filter(u => {
     if (!selectedProduct) return false;
     const target = selectedProduct.ticketsRequired || 6;
     const userTickets = u.productProgress?.[drawProductId]?.tickets || 0;
     return userTickets >= target;
  });

  const MOCK_STATS = [
    { label: 'Total Users', value: usersList.length || '0', icon: <Users /> },
    { label: 'Pending Payouts', value: withdrawalsList.filter(w=>w.status==='Pending').length, icon: <IndianRupee /> },
    { label: 'Fake Users Banned', value: '0', icon: <Shield /> }
  ];

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      await addDoc(collection(db, 'products'), {
        title: productTitle,
        prizeAmount: prizeAmount,
        drawDate: drawDate,
        ticketsRequired: parseInt(ticketsReq),
        adsRequiredPerTicket: parseInt(adsPerTicket),
        createdAt: new Date().toISOString(),
        active: true
      });

      // Send Notification
      await addDoc(collection(db, 'notifications'), {
        title: 'New Product Added!',
        message: `A new draw for ${productTitle} is now active. Earn tickets now!`,
        type: 'promo',
        createdAt: new Date().toISOString()
      });

      setStatusMsg('Product added successfully!');
      setProductTitle(''); setPrizeAmount(''); setDrawDate(''); setTicketsReq(''); setAdsPerTicket('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error adding product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDraw = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      // Randomly pick numWinners
      const shuffled = [...qualifiedUsers].sort(() => 0.5 - Math.random());
      const winnersCount = Math.min(parseInt(numWinners), qualifiedUsers.length);
      const winners = shuffled.slice(0, winnersCount);
      
      const winnersData = winners.map(w => ({
        uid: w.id,
        name: w.name || 'Anonymous',
        phone: w.phone || 'Unknown'
      }));

      // Save to draws collection
      await addDoc(collection(db, 'draws'), {
        productId: selectedProduct.id,
        title: selectedProduct.title,
        prizeAmount: drawPrizeAmount || selectedProduct.prizeAmount,
        date: new Date().toISOString().split('T')[0],
        winners: winnersData,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });
      // Mark product as inactive
      await updateDoc(doc(db, 'products', selectedProduct.id), {
        active: false
      });

      // Send Notification
      await addDoc(collection(db, 'notifications'), {
        title: 'Draw Results Announced!',
        message: `The lucky draw for ${selectedProduct.title} is completed. Check if you won!`,
        type: 'alert',
        createdAt: new Date().toISOString()
      });

      // Local state will update via onSnapshot
      setStatusMsg(`Draw completed! Selected ${winners.length} winners.`);
      setDrawProductId('');
      setNumWinners('');
      setDrawPrizeAmount('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error completing draw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWithdrawal = async (id, newStatus, uid, amount) => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status: newStatus });
      
      // Send Notification to user
      await addDoc(collection(db, 'notifications'), {
        title: `Withdrawal Status Update`,
        message: newStatus === 'Done' 
          ? `Your withdrawal of ${amount} coins has been completed successfully.` 
          : `Your withdrawal of ${amount} coins is currently marked as Not Done.`,
        type: newStatus === 'Done' ? 'success' : 'alert',
        userId: uid,
        createdAt: new Date().toISOString()
      });
      
      setWithdrawalsList(withdrawalsList.map(w => w.id === id ? {...w, status: newStatus} : w));
    } catch(e) {
      console.error(e);
    }
  };

  const handleUpdateClaim = async (id, newStatus, uid, productTitle) => {
    try {
      await updateDoc(doc(db, 'claims', id), { 
        status: newStatus,
        settledAt: newStatus === 'Done' ? new Date().toISOString() : null
      });

      // Send Notification to user
      if (uid) {
        await addDoc(collection(db, 'notifications'), {
          title: `Claim Status Update`,
          message: newStatus === 'Done' 
            ? `Your claim for ${productTitle} has been marked as Done.` 
            : `Your claim for ${productTitle} is currently marked as Not Done.`,
          type: newStatus === 'Done' ? 'success' : 'alert',
          userId: uid,
          createdAt: new Date().toISOString()
        });
      }

      setClaimsList(claimsList.map(c => c.id === id ? {...c, status: newStatus, settledAt: newStatus === 'Done' ? new Date().toISOString() : null} : c));
    } catch (e) {
      console.error("Error updating claim:", e);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        createdAt: new Date().toISOString()
      });
      setStatusMsg('Notification sent to all users!');
      setNotifTitle(''); setNotifMessage('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error sending notification.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="admin-grid">
            {MOCK_STATS.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <p>{stat.label}</p>
                  <h3>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        );
      case 'withdrawals':
        return (
          <div className="admin-table-container">
            <h3>Pending Withdrawals</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>UPI ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalsList.map(w => (
                  <tr key={w.id}>
                    <td>{w.userName || 'User'}</td>
                    <td>{w.amount} Coins</td>
                    <td>{w.upiId}</td>
                    <td>
                      <span className={`status-badge ${w.status === 'Done' ? 'approved' : 'pending'}`}>
                        {w.status || 'Not Done'}
                      </span>
                    </td>
                    <td className="action-cell" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{
                          background: w.status === 'Done' ? '#10B981' : '#E5E7EB',
                          color: w.status === 'Done' ? 'white' : '#374151',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleUpdateWithdrawal(w.id, 'Done', w.uid, w.amount)}
                      >
                        <CheckCircle size={14}/> Done
                      </button>
                      <button 
                        style={{
                          background: (w.status === 'Not Done' || !w.status || w.status === 'Pending') ? '#EF4444' : '#E5E7EB',
                          color: (w.status === 'Not Done' || !w.status || w.status === 'Pending') ? 'white' : '#374151',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleUpdateWithdrawal(w.id, 'Not Done', w.uid, w.amount)}
                      >
                        <XCircle size={14}/> Not Done
                      </button>
                    </td>
                  </tr>
                ))}
                {withdrawalsList.length === 0 && <tr><td colSpan="5">No withdrawals found.</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case 'users':
        return (
          <div className="admin-list-container">
            <h3>Manage Users</h3>
            {usersList.map(u => (
              <div key={u.id} className="user-item">
                <div>
                  <strong>{u.name || 'Anonymous'}</strong>
                  <p>{u.phone} • {u.coins} Coins</p>
                </div>
                <button className="btn-ban">Ban Device</button>
              </div>
            ))}
            {usersList.length === 0 && <p>No users found.</p>}
          </div>
        );
      case 'products':
        return (
          <div className="admin-form-container">
            <h3>Add New Product</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Title</label>
                <input type="text" placeholder="e.g. BookMyShow Voucher" value={productTitle} onChange={e=>setProductTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Prize Amount/Value</label>
                <input type="text" placeholder="e.g. ₹200" value={prizeAmount} onChange={e=>setPrizeAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Draw Date</label>
                <input type="date" value={drawDate} onChange={e=>setDrawDate(e.target.value)} required />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Tickets Required</label>
                  <input type="number" placeholder="e.g. 6" value={ticketsReq} onChange={e=>setTicketsReq(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Ads Per Ticket</label>
                  <input type="number" placeholder="e.g. 6" value={adsPerTicket} onChange={e=>setAdsPerTicket(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Product'}</button>
            </form>
          </div>
        );
      case 'draws':
        return (
          <div className="admin-form-container">
            <h3>Perform Draw</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleAddDraw}>
              <div className="form-group">
                <label>Select Product</label>
                <select value={drawProductId} onChange={e => setDrawProductId(e.target.value)} required>
                  <option value="">-- Select Active Product --</option>
                  {productsList.filter(p => p.active !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.title} (Target: {p.ticketsRequired || 6})</option>
                  ))}
                </select>
              </div>
              
              {selectedProduct && (
                <div className="form-group" style={{background: 'rgba(247, 192, 74, 0.2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary-orange)'}}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Qualified Members: <span style={{ color: 'green' }}>{qualifiedUsers.length}</span></p>
                </div>
              )}

              <div className="form-group">
                <label>Number of Winners to Select</label>
                <input 
                  type="number" 
                  min="1" 
                  max={qualifiedUsers.length || 1} 
                  placeholder="e.g. 10" 
                  value={numWinners} 
                  onChange={e => setNumWinners(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Custom Prize Amount (Optional)</label>
                <input 
                  type="text" 
                  placeholder={selectedProduct ? `Current: ${selectedProduct.prizeAmount}` : "e.g. ₹500"} 
                  value={drawPrizeAmount} 
                  onChange={e => setDrawPrizeAmount(e.target.value)} 
                />
                <p style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>Leave blank to use the product's default prize amount.</p>
              </div>
              
              <button type="submit" className="btn-submit" disabled={isSubmitting || !selectedProduct || qualifiedUsers.length === 0}>
                {isSubmitting ? 'Drawing...' : 'Draw Now'}
              </button>
            </form>
          </div>
        );
      case 'claims':
        return (
          <div className="admin-table-container">
            <h3>Manage Product Claims</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Prize</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claimsList.map(c => (
                  <tr key={c.id}>
                    <td>{c.userName}</td>
                    <td>{c.productTitle}</td>
                    <td>{c.prizeAmount || 'N/A'}</td>
                    <td>{c.userPhone}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'Done' ? 'approved' : 'pending'}`}>
                        {c.status || 'Not Done'}
                      </span>
                    </td>
                    <td className="action-cell" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{
                          background: c.status === 'Done' ? '#10B981' : '#E5E7EB',
                          color: c.status === 'Done' ? 'white' : '#374151',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleUpdateClaim(c.id, 'Done', c.uid, c.productTitle)}
                      >
                        <CheckCircle size={14}/> Done
                      </button>
                      <button 
                        style={{
                          background: (c.status === 'Not Done' || !c.status || c.status === 'Pending') ? '#EF4444' : '#E5E7EB',
                          color: (c.status === 'Not Done' || !c.status || c.status === 'Pending') ? 'white' : '#374151',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleUpdateClaim(c.id, 'Not Done', c.uid, c.productTitle)}
                      >
                        <XCircle size={14}/> Not Done
                      </button>
                    </td>
                  </tr>
                ))}
                {claimsList.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign:'center'}}>No claims yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
        case 'notifications':
        return (
          <div className="admin-form-container">
            <h3>Send Global Notification</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleSendNotification}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="e.g. Draw Tonight!" value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  placeholder="Enter your message here..." 
                  value={notifMessage} 
                  onChange={e=>setNotifMessage(e.target.value)} 
                  required 
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={notifType} onChange={e=>setNotifType(e.target.value)}>
                  <option value="info">General Info</option>
                  <option value="promo">Promotion / New Product</option>
                  <option value="alert">Draw Alert</option>
                  <option value="success">Success / Payment</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Now'}</button>
            </form>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="admin-page page-container">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <Logo size={40} showText={false} />
          <div>
            <h2>Admin Panel</h2>
            <p>Manage ViewCash platform</p>
          </div>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><TrendingUp size={16} /> Overview</button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><PlusCircle size={16} /> Add Product</button>
        <button className={activeTab === 'draws' ? 'active' : ''} onClick={() => setActiveTab('draws')}><Trophy size={16} /> Add Draw</button>
        <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}><Bell size={16} /> Send Notif</button>
        <button className={activeTab === 'claims' ? 'active' : ''} onClick={() => setActiveTab('claims')}><Package size={16} /> Claims</button>
        <button className={activeTab === 'withdrawals' ? 'active' : ''} onClick={() => setActiveTab('withdrawals')}><IndianRupee size={16} /> Withdrawals</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><Shield size={16} /> Users</button>
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
