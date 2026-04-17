import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Receipt, ArrowDownRight, CreditCard, Clock, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = isStudent ? `/api/transactions?studentId=${user.id}` : '/api/transactions';
        const res = await fetch(url);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user, isStudent]);

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'card': return <CreditCard size={16} />;
      case 'upi': return <Smartphone size={16} />;
      case 'bank transfer': return <Clock size={16} />;
      default: return <Receipt size={16} />;
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>{isStudent ? 'Your recent payment history and receipts' : 'All transaction records across the institution'}</p>
      </div>

      <div className="glass-card transactions-card">
        {isLoading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <Receipt size={48} color="var(--text-muted)" />
            <h3>No Transactions Found</h3>
            <p>There are no payment records available yet.</p>
          </div>
        ) : (
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID / Receipt</th>
                  {!isStudent && <th>Student Details</th>}
                  <th>Date & Time</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th className="amount-col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <motion.tr 
                    key={t.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <div className="tx-id">
                        <ArrowDownRight size={16} className="tx-icon" />
                        <strong>{t.receiptNo}</strong>
                      </div>
                    </td>
                    {!isStudent && (
                      <td>
                        <div className="student-info">
                          <span className="name">{t.studentName}</span>
                          <span className="std">Class {t.standard}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="tx-date">
                        <span>{new Date(t.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                        <span className="time">{new Date(t.date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tx-method">
                        {getMethodIcon(t.method)}
                        <span>{t.method}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge success">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    </td>
                    <td className="amount-col">
                      <span className="amount positive">+₹{t.amount?.toLocaleString()}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-size: 1.6rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-muted); font-size: 0.95rem; }

        .transactions-card {
          padding: 0;
          overflow: hidden;
        }

        .transactions-table-container {
          overflow-x: auto;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .transactions-table th {
          padding: 16px 24px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          background: var(--bg-input);
          border-bottom: 1px solid var(--border);
        }

        .transactions-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .transactions-table tr:last-child td {
          border-bottom: none;
        }

        .transactions-table tr:hover td {
          background: var(--bg-hover);
        }

        .tx-id {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-icon {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px;
          border-radius: 50%;
          width: 26px;
          height: 26px;
        }

        .tx-id strong {
          font-size: 0.9rem;
          color: var(--text-main);
          font-family: monospace;
          background: var(--bg-input);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .student-info {
          display: flex;
          flex-direction: column;
        }

        .student-info .name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .student-info .std {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .tx-date {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        .tx-date .time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .tx-method {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
          background: var(--bg-main);
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          border: 1px solid var(--border);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-badge.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .amount-col {
          text-align: right;
        }

        .amount.positive {
          color: #10b981;
          font-weight: 700;
          font-size: 1.05rem;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          color: var(--text-main);
        }

        .empty-state p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .loading-state {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Transactions;
