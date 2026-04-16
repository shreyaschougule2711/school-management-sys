import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Shield, Sun, Moon, Palette, Bell, Lock, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-grid">
        {/* Profile Section */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <User size={20}/>
            <h3>Profile Information</h3>
          </div>
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label"><User size={15}/> Full Name</span>
                <span className="detail-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><Mail size={15}/> Email</span>
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><Shield size={15}/> Role</span>
                <span className="detail-value role-badge">{user?.role?.toUpperCase() || 'N/A'}</span>
              </div>
              {user?.phone && (
                <div className="detail-row">
                  <span className="detail-label"><Phone size={15}/> Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
              )}
              {user?.standard && (
                <div className="detail-row">
                  <span className="detail-label"><BookOpen size={15}/> Class</span>
                  <span className="detail-value">{user.standard} Standard</span>
                </div>
              )}
              {user?.subject && (
                <div className="detail-row">
                  <span className="detail-label"><BookOpen size={15}/> Subject</span>
                  <span className="detail-value">{user.subject}</span>
                </div>
              )}
              {user?.parentName && (
                <div className="detail-row">
                  <span className="detail-label"><User size={15}/> Parent</span>
                  <span className="detail-value">{user.parentName}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <Palette size={20}/>
            <h3>Appearance</h3>
          </div>
          
          <div className="theme-option">
            <div className="theme-info">
              {theme === 'light' ? <Sun size={24} color="#f59e0b"/> : <Moon size={24} color="#6366f1"/>}
              <div>
                <strong>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</strong>
                <p>Switch between light and dark themes</p>
              </div>
            </div>
            <button className={`theme-toggle-btn ${theme === 'dark' ? 'dark' : ''}`} onClick={toggleTheme}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="theme-preview-cards">
            <div 
              className={`preview-card ${theme === 'light' ? 'selected' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              <div className="preview-light">
                <div className="preview-bar"></div>
                <div className="preview-content">
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>
                </div>
              </div>
              <span>Light</span>
            </div>
            <div 
              className={`preview-card ${theme === 'dark' ? 'selected' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              <div className="preview-dark">
                <div className="preview-bar"></div>
                <div className="preview-content">
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>
                </div>
              </div>
              <span>Dark</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <Bell size={20}/>
            <h3>Notifications</h3>
          </div>
          <div className="notification-options">
            {['Assignment Updates', 'Attendance Alerts', 'Fee Reminders', 'School Notices'].map((item, i) => (
              <div key={i} className="notif-row">
                <span>{item}</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <Lock size={20}/>
            <h3>Security</h3>
          </div>
          <p className="section-desc">Manage your account security settings</p>
          <button className="btn btn-secondary" onClick={() => showToast('Password change feature coming soon!')}>
            <Lock size={16}/> Change Password
          </button>
        </section>
      </div>

      {toast && (
        <motion.div 
          className="toast toast-info"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <CheckCircle size={18}/> {toast}
        </motion.div>
      )}

      <style>{`
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .settings-section { padding: 28px; }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: var(--primary);
        }

        .settings-section-header h3 {
          font-size: 1.05rem;
          color: var(--text-main);
        }

        .profile-card {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .profile-details { flex: 1; }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .detail-row:last-child { border: none; }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .detail-value {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .role-badge {
          background: var(--grad-primary);
          color: white !important;
          padding: 3px 12px;
          border-radius: var(--radius-full);
          font-size: 0.7rem !important;
          letter-spacing: 1px;
        }

        .theme-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .theme-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .theme-info strong { display: block; font-size: 0.95rem; }
        .theme-info p { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

        .theme-toggle-btn {
          width: 52px;
          height: 28px;
          background: var(--border);
          border-radius: 14px;
          position: relative;
          transition: background 0.2s;
          padding: 0;
        }

        .theme-toggle-btn.dark {
          background: var(--primary);
        }

        .toggle-thumb {
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .theme-toggle-btn.dark .toggle-thumb {
          transform: translateX(24px);
        }

        .theme-preview-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .preview-card {
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .preview-card.selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .preview-card span {
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 8px;
          display: block;
        }

        .preview-light, .preview-dark {
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
        }

        .preview-light {
          background: #f0f2f5;
        }

        .preview-dark {
          background: #0a0e1a;
        }

        .preview-bar {
          height: 12px;
        }

        .preview-light .preview-bar { background: white; border-bottom: 1px solid #e2e8f0; }
        .preview-dark .preview-bar { background: #111827; border-bottom: 1px solid #1e293b; }

        .preview-content { padding: 8px; }
        .preview-line { height: 4px; border-radius: 2px; margin-bottom: 4px; }
        .preview-line.short { width: 60%; }

        .preview-light .preview-line { background: #e2e8f0; }
        .preview-dark .preview-line { background: #1e293b; }

        .notification-options { display: flex; flex-direction: column; }

        .notif-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .notif-row:last-child { border: none; }

        .switch {
          position: relative;
          width: 44px;
          height: 24px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border);
          border-radius: 12px;
          transition: 0.2s;
        }

        .slider:before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        input:checked + .slider {
          background: var(--primary);
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        .section-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr; }
          .profile-card { flex-direction: column; align-items: center; text-align: center; }
          .detail-row { flex-direction: column; gap: 4px; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
