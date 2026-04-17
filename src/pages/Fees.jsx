import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Receipt, CheckCircle, Clock, CreditCard, Wallet, X, Upload, Settings, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Fees = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const [feeData, setFeeData] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStandard, setFilterStandard] = useState('');
  const [showAdminPayModal, setShowAdminPayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adminPayAmount, setAdminPayAmount] = useState('');
  
  const fetchAllFees = () => {
    fetch('/api/fees').then(r => r.json()).then(setAllFees).catch(() => {});
  };
  
  // Settings Form
  const [formUpiId, setFormUpiId] = useState('');
  const [formQrImage, setFormQrImage] = useState('');

  useEffect(() => {
    if (isStudent && user?.id) {
      fetch(`/api/fees?studentId=${user.id}`).then(r => r.json()).then(data => {
        if (data.length > 0) setFeeData(data[0]);
      }).catch(() => {});
    } else if (!isStudent) {
      fetchAllFees();
    }
  }, [user, isStudent]);

  const handleRecordPayment = async () => {
    if (!adminPayAmount || parseFloat(adminPayAmount) <= 0) return;
    try {
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.studentId, amount: parseFloat(adminPayAmount), method: 'Offline/Cash' })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllFees();
        setAdminPayAmount('');
        setShowAdminPayModal(false);
        setToast({ msg: 'Payment Success!', type: 'success' });
        setTimeout(() => setToast(null), 2000);
      }
    } catch (e) {
      setToast({ msg: 'Failed', type: 'error' });
    }
  };

  const handleDeleteEntireRecord = async (studentId) => {
    if (!confirm('DELETE THE ENTIRE TRANSACTION RECORD? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/fees/${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllFees();
        setToast({ msg: 'Record deleted', type: 'success' });
        setTimeout(() => setToast(null), 2000);
      }
    } catch(e) {}
  };

  const handleDeleteIndividualPayment = async (paymentId) => {
    if (!confirm('Delete this specific payment? Amount will be deducted from total paid.')) return;
    try {
      const res = await fetch(`/api/fees/${selectedStudent.studentId}/payments/${paymentId}`, { method: 'DELETE' });
      if (res.ok) {
        const allRes = await fetch('/api/fees');
        const allData = await allRes.json();
        setAllFees(allData);
        const updatedStudent = allData.find(s => s.studentId === selectedStudent.studentId);
        if (updatedStudent) setSelectedStudent(updatedStudent);
        setToast({ msg: 'Payment deleted', type: 'success' });
        setTimeout(() => setToast(null), 2000);
      }
    } catch(e) {}
  };

  const handleSaveUpiConfig = async () => {
    try {
      const res = await fetch('/api/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: formUpiId, qrImageBase64: formQrImage })
      });
      if (res.ok) {
        setToast({ msg: 'Payment Settings Saved!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch(e) {
      setToast({ msg: 'Failed to save settings', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormQrImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const total = feeData?.totalFee || 0;
  const paid = feeData?.paidAmount || 0;
  const paidPct = total > 0 ? Math.min(100, (paid / total) * 100).toFixed(0) : 0;

  if (isStudent) {
    return (
      <div className="fees-page">
        <div className="page-header">
          <h1>Fee Details</h1>
          <p>View your fee structure and payment history</p>
        </div>

        {(!feeData || feeData.totalFee === 0) ? (
          <div className="empty-state glass-card">
            <IndianRupee size={48} color="var(--text-muted)" />
            <h3>Fee Structure Not Found</h3>
            <p>The administration has not yet configured the fees for <strong>{user?.standard || 'your'} Standard</strong>. Please contact the office or check back later.</p>
          </div>
        ) : (
          <div className="student-fee-content">
            <div className="fee-overview-grid">
               {/* Pending Dues - Main Focus */}
               <div className="glass-card fee-progress-card main-dues-card">
                 <div className="dues-header">
                    <h3>📢 Current Outstanding Dues</h3>
                    <div className="due-amount-large">₹{(total - paid).toLocaleString()}</div>
                 </div>
                 
                 <div className="progress-visual mt-6">
                    <div className="progress-bar-wrap">
                      <motion.div 
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${paidPct}%` }}
                        style={{ background: '#10b981' }}
                      />
                    </div>
                    <div className="progress-labels">
                      <span>{paidPct}% Paid</span>
                      <span>Total: ₹{total.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="mt-8 p-4 border rounded-lg bg-blue-50 text-blue-800 text-sm font-semibold flex items-center gap-3">
                    <CreditCard size={20}/>
                    <span>Payments are only accepted <strong>Offline</strong> at the School Office.</span>
                 </div>
               </div>

               <div className="glass-card fee-breakdown-card">
                <h3>📋 Fee Structure</h3>
                <div className="breakdown-list">
                  <div className="fee-row"><span>Tuition Fee</span><strong>₹{(feeData?.tuitionFee || 0).toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Examination Fee</span><strong>₹{(feeData?.examFee || 0).toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Library Fee</span><strong>₹{(feeData?.libraryFee || 0).toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Sports Fee</span><strong>₹{(feeData?.sportsFee || 0).toLocaleString()}</strong></div>
                  <div className="fee-row total"><span>Total Annual Fee</span><strong>₹{total.toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            {(feeData?.payments?.length > 0) && (
              <div className="glass-card mt-8 payment-history-card">
                <h3>🧾 Recent Payment Receipts</h3>
                <div className="payment-list">
                  {feeData.payments.map((p, i) => (
                    <div key={i} className="payment-row">
                      <div className="payment-icon text-success"><CheckCircle size={18}/></div>
                      <div className="payment-info">
                        <strong>₹{p.amount?.toLocaleString()}</strong>
                        <span>Offline Receipt • {p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                      </div>
                      <span className="receipt-no">{p.receiptNo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}><CheckCircle size={18}/>{toast.msg}</motion.div>}
        </AnimatePresence>

        <style>{`${feeStyles}`}</style>
      </div>
    );
  }

  // Admin/Teacher view
  const filteredFees = allFees.filter(f => {
    const matchesSearch = f.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStd = filterStandard ? f.standard === filterStandard : true;
    return matchesSearch && matchesStd;
  });

  return (
    <div className="fees-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Fee Management</h1>
          <p>Overview of all student fee records</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAdmin && (
            <p className="text-sm border p-2 rounded bg-yellow-50 text-yellow-800">
               ⚠️ All payments MUST be recorded manually here after receiving cash/offline.
            </p>
          )}
        </div>
      </div>

      <div className="admin-controls glass-card mb-6 grid-adaptive" style={{ padding: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>SEARCH STUDENT</label>
            <input type="text" placeholder="Enter name..." className="form-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>FILTER BY CLASS</label>
            <select className="form-input" value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
                <option value="">All Classes</option>
                {['5th', '6th', '7th', '8th', '9th', '10th'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
      </div>

      {filteredFees.length === 0 ? (
        <div className="empty-state glass-card">
          <IndianRupee size={48} color="var(--text-muted)" />
          <h3>No Records Found</h3>
          <p>Try adjusting your filters or check if student fees are configured.</p>
        </div>
      ) : (
        <div className="glass-card fee-table-card table-responsive">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th className="highlight-column">Due Amount</th>
                <th>Status</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((f, i) => {
                const due = f.totalFee - f.paidAmount;
                return (
                  <tr key={i}>
                    <td><strong>{f.studentName}</strong></td>
                    <td><span className="badge-std">{f.standard}</span></td>
                    <td>₹{f.totalFee || 0}</td>
                    <td className="text-success">₹{f.paidAmount || 0}</td>
                    <td className="highlight-column">
                        {(!f.totalFee || f.totalFee === 0) ? (
                           <span className="text-muted" style={{fontSize: '0.7rem'}}>⚠️ Set Fee in Setup</span>
                        ) : (
                           <span className="text-danger" style={{ fontWeight: 800 }}>₹{(f.totalFee - f.paidAmount).toLocaleString()}</span>
                        )}
                    </td>
                    <td>
                      <span className={`fee-status ${f.status.toLowerCase()}`}>
                        {f.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success btn-xs" onClick={() => { setSelectedStudent(f); setShowAdminPayModal(true); }}>
                             + Pay
                          </button>
                          <button className="btn btn-secondary btn-xs" onClick={() => { setSelectedStudent(f); setShowHistoryModal(true); }}>
                             History
                          </button>
                          <button className="btn btn-xs" style={{ background: '#fef2f2', color: '#b91c1c' }} onClick={() => handleDeleteEntireRecord(f.studentId)}>
                             Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Record Payment Modal */}
      <AnimatePresence>
        {showAdminPayModal && (
          <div className="modal-overlay" onClick={() => setShowAdminPayModal(false)}>
            <motion.div className="modal-content" onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3>💵 Record Offline Payment</h3>
                <button className="close-btn" onClick={() => setShowAdminPayModal(false)}><X size={20}/></button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                 <strong>Student:</strong> {selectedStudent?.studentName} <br/>
                 <strong>Due Amount:</strong> <span className="text-danger">₹{(selectedStudent?.totalFee - selectedStudent?.paidAmount).toLocaleString()}</span>
              </div>
              <div className="form-group">
                <label>Amount Received (₹)</label>
                <input 
                  type="number" 
                  value={adminPayAmount} 
                  onChange={e => setAdminPayAmount(e.target.value)} 
                  placeholder="e.g. 5000" 
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted mb-4">Recording this will update the student's dashboard instantly.</p>
              <button className="btn btn-primary w-full" onClick={handleRecordPayment}>
                Confirm Payment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Transaction History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
            <motion.div className="modal-content" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3>📜 Payment History: {selectedStudent?.studentName}</h3>
                <button className="close-btn" onClick={() => setShowHistoryModal(false)}><X size={20}/></button>
              </div>
              <div className="payment-history-list mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {(!selectedStudent?.payments || selectedStudent.payments.length === 0) ? (
                   <p className="text-center py-6 text-muted">No transactions recorded.</p>
                ) : (
                   selectedStudent.payments.map((p, idx) => (
                     <div key={idx} className="payment-item-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                        <div>
                           <div style={{fontWeight: 700}}>₹{p.amount.toLocaleString()}</div>
                           <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{new Date(p.date).toLocaleDateString()} • {p.method}</div>
                        </div>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px' }} onClick={() => handleDeleteIndividualPayment(p.id)}>
                           Delete
                        </button>
                     </div>
                   ))
                )}
              </div>
              <button className="btn btn-secondary w-full mt-6" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}><CheckCircle size={18}/>{toast.msg}</motion.div>}
      </AnimatePresence>

      <style>{`${feeStyles}`}</style>
    </div>
  );
};

const feeStyles = `
  .page-header { margin-bottom: 28px; }
  .page-header h1 { font-size: 1.6rem; }
  .page-header p { color: var(--text-muted); margin-top: 4px; }

  .fee-overview-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
  .fee-progress-card, .fee-breakdown-card { padding: 28px; }
  .fee-progress-card h3, .fee-breakdown-card h3 { font-size: 1.05rem; margin-bottom: 20px; }

  .progress-visual { margin-bottom: 16px; }
  .progress-bar-wrap {
    height: 14px;
    background: var(--bg-input);
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 8px;
    border: 1px solid var(--border);
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 7px;
    transition: width 1s ease;
  }
  .progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

  .fee-status-row { display: flex; justify-content: space-between; align-items: center; }
  .fee-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: var(--radius-full);
  }
  .fee-status.paid { background: #d1fae5; color: #065f46; }
  .fee-status.unpaid { background: #fee2e2; color: #b91c1c; }
  .fee-status.partial { background: #fef3c7; color: #92400e; }
  .remaining { font-size: 0.85rem; font-weight: 700; color: #f43f5e; }

  .breakdown-list { display: flex; flex-direction: column; }
  .fee-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
  .fee-row:last-child { border: none; }
  .fee-row.total { font-weight: 800; color: var(--primary); border-top: 2px solid var(--border); margin-top: 4px; padding-top: 16px; }

  .payment-history-card { padding: 28px; }
  .payment-history-card h3 { font-size: 1.05rem; margin-bottom: 20px; }
  .payment-list { display: flex; flex-direction: column; gap: 10px; }
  .payment-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: var(--bg-input);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }
  .payment-icon { color: #10b981; }
  .payment-info { flex: 1; display: flex; flex-direction: column; }
  .payment-info strong { font-size: 0.95rem; }
  .payment-info span { font-size: 0.75rem; color: var(--text-muted); }
  .receipt-no { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; background: var(--bg-main); padding: 4px 10px; border-radius: var(--radius-full); }

  .fee-table-card { padding: 8px; overflow-x: auto; }
  .fee-table { width: 100%; border-collapse: collapse; }
  .fee-table th { padding: 14px 18px; text-align: left; font-size: 0.8rem; color: var(--text-muted); border-bottom: 2px solid var(--border); font-weight: 700; }
  .fee-table td { padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }

  .empty-state {
    text-align: center; padding: 60px 40px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .empty-state h3 { font-size: 1.1rem; }
  .empty-state p { color: var(--text-muted); }

  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .close-btn { background: none; color: var(--text-muted); padding: 4px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  .form-group input, .form-group select {
    width: 100%; padding: 10px 14px; border-radius: var(--radius-md);
    background: var(--bg-input); border: 1.5px solid var(--border); color: var(--text-main); font-family: inherit; font-size: 0.9rem;
  }
  .form-group input:focus, .form-group select:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  
  .upi-payment-section {
    background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md);
    padding: 20px; text-align: center; margin-bottom: 16px;
  }
  .upi-payment-section h4 { margin-bottom: 10px; }
  .qr-code-img { width: 160px; height: 160px; object-fit: contain; margin: 0 auto; background: white; padding: 8px; border-radius: 8px; border: 1px solid var(--border); display: block; }
  .no-qr-msg { color: var(--text-muted); font-size: 0.85rem; padding: 20px 0; }
  .upi-id-display { margin-top: 12px; font-size: 0.95rem; }
  .upi-help { font-size: 0.8rem; color: var(--text-muted); margin-top: 8px; }
  .qr-preview img { width: 120px; height: 120px; object-fit: contain; background: white; margin-top: 10px; border-radius: 6px; padding: 4px; }

  .mt-4 { margin-top: 1rem; }
  .mt-8 { margin-top: 2rem; }

  @media (max-width: 768px) { 
    .fee-overview-grid { grid-template-columns: 1fr; } 
    .due-amount-large { font-size: 2.2rem !important; }
    .page-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
  }


  /* Payment Gateway Enhancements */
  .payment-gateway-modal { max-width: 420px; overflow: hidden; padding: 0; position: relative; border: none; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  .payment-brand-header { background: #1a1a1a; color: white; padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
  .school-logo-sm { width: 44px; height: 44px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2); }
  .brand-info h4 { font-size: 0.95rem; margin: 0; letter-spacing: 0.5px; }
  .brand-info p { font-size: 0.7rem; color: rgba(255,255,255,0.6); margin: 2px 0 0; }
  .payment-brand-header .close-btn { color: white; opacity: 0.5; }
  .payment-brand-header .close-btn:hover { opacity: 1; }

  .gateway-summary { background: rgba(99,102,241,0.05); border: 1px dashed var(--primary); padding: 20px; border-radius: 12px; margin: 0 24px 24px; text-align: center; }
  .summary-label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700; }
  .summary-amount { display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: var(--text-main); }
  .amount-input { background: transparent !important; border: none !important; font-size: 2rem !important; font-weight: 800 !important; max-width: 150px; text-align: left; padding: 0 !important; color: var(--text-main); outline: none !important; box-shadow: none !important; }
  .amount-input::placeholder { color: var(--border); }

  .payment-methods-grid { margin: 0 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .gateway-btn-container { padding: 24px; }
  .method-card { background: var(--bg-main); border: 2px solid var(--border); border-radius: 12px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; user-select: none; }
  .method-card:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.02); }
  .method-card.selected { border-color: var(--primary); background: rgba(99,102,241,0.05); color: var(--primary); }
  .method-card span { font-size: 0.75rem; font-weight: 600; text-align: center; }
  .upi-logo { height: 24px; object-fit: contain; filter: grayscale(1); opacity: 0.7; }
  .method-card.selected .upi-logo { filter: none; opacity: 1; }

  .gateway-btn { padding: 14px; font-size: 1rem; font-weight: 700; letter-spacing: 0.5px; border-radius: 10px; display: flex; justify-content: center; align-items: center; }
  .secure-badge { font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: center; align-items: center; }

  .back-btn { background: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
  .back-btn:hover { color: var(--primary); }

  .card-mockup { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 24px; color: white; position: relative; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); overflow: hidden; }
  .card-mockup::before { content:''; position:absolute; top:-50%; right:-20%; width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%; }
  .card-chip { width: 44px; height: 32px; background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); border-radius: 6px; margin-bottom: 24px; position:relative; overflow:hidden;}
  .card-chip::after { content:''; position:absolute; top:50%; width:100%; height:1px; background:rgba(0,0,0,0.2); }
  .card-network { position: absolute; top: 24px; right: 24px; font-style: italic; font-weight: 900; font-size: 1.2rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5)); }
  .card-no { font-family: monospace; font-size: 1.3rem; letter-spacing: 2px; margin-bottom: 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .card-info { display: flex; justify-content: space-between; font-family: monospace; }
  .card-info small { font-size: 0.55rem; color: rgba(255,255,255,0.6); display: block; margin-bottom: 2px; }
  .card-info div { font-size: 0.9rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

  .card-input { font-family: monospace; letter-spacing: 1px; font-size: 1rem !important; }
  
  .qr-container { position: relative; width: 200px; height: 200px; margin: 0 auto; background: white; padding: 12px; border-radius: 16px; border: 2px solid var(--border); box-shadow: 0 8px 24px rgba(0,0,0,0.05); overflow: hidden; }
  .qr-container.placeholder { display: flex; align-items: center; justify-content: center; color: var(--text-muted); background: var(--bg-input); }
  .qr-code-img { width: 100%; height: 100%; object-fit: contain; }
  .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #10b981; box-shadow: 0 0 10px #10b981; animation: scan 2s infinite linear; opacity: 0.7; }
  @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }

  .pin-input { font-family: monospace; font-size: 1.5rem !important; letter-spacing: 12px !important; text-align: center; border: 2px solid var(--primary) !important; background: rgba(99,102,241,0.05) !important; color: var(--primary) !important; }

  .processing-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; }
  .spinner-orbit { width: 60px; height: 60px; border: 4px solid var(--bg-input); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s infinite linear; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .secure-logos { background: #f0fdf4; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; font-weight: 600; }

  .check-circle-large { display: flex; justify-content: center; margin-bottom: 20px; }
  .text-muted { color: var(--text-muted); }
  .text-center { text-align: center; }
  .mb-2 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-6 { margin-top: 24px; }
  .pb-4 { padding-bottom: 16px; }
  .border-b { border-bottom: 1px solid var(--border); }
  .text-green-500 { color: #10b981; }
  .inline { display: inline; }
  .mr-1 { margin-right: 4px; }
  .ml-2 { margin-left: 8px; }
  
  .highlight-column { background: rgba(239, 68, 68, 0.03); border-left: 1px solid var(--border); border-right: 1px solid var(--border); }
  .text-danger { color: #ef4444; }
  .text-success { color: #10b981; }
  .badge-std { background: var(--bg-hover); padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; }

  /* UPI Intent Styles */
  .upi-intent-options { margin-bottom: 24px; text-align: left; }
  .intent-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
  .intent-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .intent-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: all 0.2s;
  }
  .intent-btn:hover { border-color: var(--primary); background: rgba(99,102,241,0.02); transform: translateY(-2px); }
  .intent-btn img { width: 32px; height: 32px; object-fit: contain; }
  .intent-btn span { font-size: 0.65rem; font-weight: 700; color: var(--text-main); }

  .divider { position: relative; text-align: center; margin: 24px 0; }
  .divider:before { content:''; position:absolute; top:50%; left:0; width:100%; height:1px; background: var(--border); z-index: 1; }
  .divider span { position: relative; z-index: 2; background: var(--bg-input); padding: 0 12px; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
`;

export default Fees;
