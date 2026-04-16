import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Receipt, CheckCircle, Clock, CreditCard, Wallet, X, Upload, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Fees = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const [feeData, setFeeData] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [toast, setToast] = useState(null);
  const [upiDetails, setUpiDetails] = useState({ upiId: '', qrImageBase64: '' });
  
  // Settings Form
  const [formUpiId, setFormUpiId] = useState('');
  const [formQrImage, setFormQrImage] = useState('');

  useEffect(() => {
    fetchUpiDetails();
    if (isStudent) {
      fetch(`/api/fees?studentId=${user.id}`).then(r => r.json()).then(data => {
        if (data.length > 0) setFeeData(data[0]);
      }).catch(() => {});
    } else {
      fetch('/api/fees').then(r => r.json()).then(setAllFees).catch(() => {});
    }
  }, [user]);

  const fetchUpiDetails = () => {
    fetch('/api/upi').then(r => r.json()).then(data => {
      setUpiDetails(data);
      setFormUpiId(data.upiId);
      setFormQrImage(data.qrImageBase64);
    }).catch(() => {});
  };

  const handlePay = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return;
    try {
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, amount: parseFloat(payAmount), method: payMethod })
      });
      const data = await res.json();
      if (data.success) {
        setFeeData(data.feeRecord);
        setShowPayModal(false);
        setPayAmount('');
        setToast({ msg: 'Payment recorded successfully!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      setToast({ msg: 'Payment failed', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSaveUpiConfig = async () => {
    try {
      const res = await fetch('/api/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: formUpiId, qrImageBase64: formQrImage })
      });
      if (res.ok) {
        fetchUpiDetails();
        setShowSettingsModal(false);
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

  const paidPct = feeData ? Math.min(100, (feeData.paidAmount / feeData.totalFee) * 100).toFixed(0) : 0;

  if (isStudent) {
    return (
      <div className="fees-page">
        <div className="page-header">
          <h1>Fee Details</h1>
          <p>View your fee structure and payment history</p>
        </div>

        {!feeData ? (
          <div className="empty-state glass-card">
            <IndianRupee size={48} color="var(--text-muted)" />
            <h3>No Fee Record</h3>
            <p>Your fee record has not been created yet. Please contact the administration.</p>
          </div>
        ) : (
          <>
            <div className="fee-overview-grid">
              <div className="glass-card fee-progress-card">
                <h3>💰 Payment Progress</h3>
                <div className="progress-visual">
                  <div className="progress-bar-wrap">
                    <motion.div 
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${paidPct}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ background: paidPct >= 100 ? '#10b981' : 'var(--grad-primary)' }}
                    />
                  </div>
                  <div className="progress-labels">
                    <span>₹{feeData.paidAmount.toLocaleString()} paid</span>
                    <span>₹{feeData.totalFee.toLocaleString()} total</span>
                  </div>
                </div>
                <div className="fee-status-row">
                  <span className={`fee-status ${feeData.status.toLowerCase()}`}>
                    {feeData.status === 'Paid' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                    {feeData.status}
                  </span>
                  <span className="remaining">Due: ₹{(feeData.totalFee - feeData.paidAmount).toLocaleString()}</span>
                </div>
                {feeData.status !== 'Paid' && (
                  <button className="btn btn-primary mt-4" onClick={() => setShowPayModal(true)}>
                    <CreditCard size={16}/> Make Payment
                  </button>
                )}
              </div>

              <div className="glass-card fee-breakdown-card">
                <h3>📋 Fee Breakdown</h3>
                <div className="breakdown-list">
                  <div className="fee-row"><span>Tuition Fee</span><strong>₹{feeData.tuitionFee?.toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Examination Fee</span><strong>₹{feeData.examFee?.toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Library Fee</span><strong>₹{feeData.libraryFee?.toLocaleString()}</strong></div>
                  <div className="fee-row"><span>Sports Fee</span><strong>₹{feeData.sportsFee?.toLocaleString()}</strong></div>
                  <div className="fee-row total"><span>Total Fee</span><strong>₹{feeData.totalFee?.toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            {feeData.payments?.length > 0 && (
              <div className="glass-card mt-8 payment-history-card">
                <h3>🧾 Payment History</h3>
                <div className="payment-list">
                  {feeData.payments.map((p, i) => (
                    <div key={i} className="payment-row">
                      <div className="payment-icon"><Receipt size={18}/></div>
                      <div className="payment-info">
                        <strong>₹{p.amount.toLocaleString()}</strong>
                        <span>{p.method} • {new Date(p.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <span className="receipt-no">{p.receiptNo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pay Modal */}
        <AnimatePresence>
          {showPayModal && (
            <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
              <motion.div className="modal-content" onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="modal-header">
                  <h3>💳 Make Payment</h3>
                  <button className="close-btn" onClick={() => setShowPayModal(false)}><X size={20}/></button>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Enter amount" min="1" />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>
                
                {payMethod === 'UPI' && (
                  <div className="upi-payment-section">
                    <h4>Scan to Pay</h4>
                    {upiDetails.qrImageBase64 ? (
                      <img src={upiDetails.qrImageBase64} alt="UPI QR Code" className="qr-code-img" />
                    ) : (
                      <p className="no-qr-msg">No QR Code available. Please contact admin.</p>
                    )}
                    {upiDetails.upiId && <p className="upi-id-display"><strong>UPI ID:</strong> {upiDetails.upiId}</p>}
                    <p className="upi-help">Scan with Google Pay, PhonePe, Paytm, etc. After successful payment, confirm below.</p>
                  </div>
                )}

                <button className="btn btn-primary w-full mt-4" onClick={handlePay}>
                  <Wallet size={16}/> Confirm Payment
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
  }

  // Admin/Teacher view
  return (
    <div className="fees-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Fee Management</h1>
          <p>Overview of all student fee records</p>
        </div>
        {isAdmin && (
          <button className="btn btn-secondary" onClick={() => setShowSettingsModal(true)}>
            <Settings size={16}/> Payment Settings
          </button>
        )}
      </div>

      {allFees.length === 0 ? (
        <div className="empty-state glass-card">
          <IndianRupee size={48} color="var(--text-muted)" />
          <h3>No Fee Records</h3>
          <p>Fee records are auto-created when students register.</p>
        </div>
      ) : (
        <div className="glass-card fee-table-card">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allFees.map((f, i) => (
                <tr key={i}>
                  <td><strong>{f.studentName}</strong></td>
                  <td>{f.standard}</td>
                  <td>₹{f.totalFee?.toLocaleString()}</td>
                  <td>₹{f.paidAmount?.toLocaleString()}</td>
                  <td>₹{(f.totalFee - f.paidAmount)?.toLocaleString()}</td>
                  <td>
                    <span className={`fee-status ${f.status.toLowerCase()}`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Payment Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <motion.div className="modal-content" onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3>⚙️ Payment Settings</h3>
                <button className="close-btn" onClick={() => setShowSettingsModal(false)}><X size={20}/></button>
              </div>
              <div className="form-group">
                <label>School UPI ID</label>
                <input 
                  type="text" 
                  value={formUpiId} 
                  onChange={e => setFormUpiId(e.target.value)} 
                  placeholder="e.g. school@sbi" 
                />
              </div>
              <div className="form-group">
                <label>Upload UPI QR Code Img</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {formQrImage && (
                  <div className="qr-preview">
                    <img src={formQrImage} alt="QR Preview" />
                  </div>
                )}
              </div>
              <button className="btn btn-primary w-full" onClick={handleSaveUpiConfig}>
                Save Settings
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

  @media (max-width: 768px) { .fee-overview-grid { grid-template-columns: 1fr; } }
`;

export default Fees;
