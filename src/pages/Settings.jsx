import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Shield, Sun, Moon, Palette, Bell, Lock, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/user/profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, profileImage: reader.result })
        });
        const data = await res.json();
        if (data.success) {
          login(data.user);
          showToast('Profile image updated successfully!');
        }
      } catch (err) {
        showToast('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: passwords.current, newPassword: passwords.new })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        showToast(data.message);
      }
    } catch (e) {
      showToast('Server error');
    } finally {
      setPassLoading(false);
    }
  };

  const tabs = [
    { id: 'Profile', icon: <User size={18}/>, label: 'Profile Information' },
    { id: 'Appearance', icon: <Palette size={18}/>, label: 'Appearance' },
    { id: 'Notifications', icon: <Bell size={18}/>, label: 'Notifications' },
    { id: 'Security', icon: <Lock size={18}/>, label: 'Security' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <aside className="settings-sidebar glass-card">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="settings-content glass-card">
          <AnimatePresence mode="wait">
            {activeTab === 'Profile' && (
              <motion.div 
                key="Profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="settings-section"
              >
                <div className="settings-section-header">
                  <User size={20}/>
                  <h3>Profile Information</h3>
                </div>
                <div className="profile-card">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="avatar-img" />
                      ) : (
                        user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                      )}
                      {uploading && <div className="avatar-overlay"><div className="spinner"></div></div>}
                    </div>
                    <label className="avatar-upload-btn">
                      <Save size={14}/> Change Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                    </label>
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
              </motion.div>
            )}

            {activeTab === 'Appearance' && (
              <motion.div 
                key="Appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="settings-section"
              >
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
              </motion.div>
            )}

            {activeTab === 'Notifications' && (
              <motion.div 
                key="Notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="settings-section"
              >
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
              </motion.div>
            )}

            {activeTab === 'Security' && (
              <motion.div 
                key="Security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="settings-section"
              >
                <div className="settings-section-header">
                  <Lock size={20}/>
                  <h3>Security</h3>
                </div>
                <p className="section-desc">Keep your account secure by updating your password regularly.</p>
                <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={passLoading}>
                    {passLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
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

        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          min-height: 480px;
        }

        .settings-sidebar {
          padding: 24px 16px;
          align-self: start;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .settings-nav-btn:hover {
          background: var(--bg-hover);
          color: var(--text-main);
        }

        .settings-nav-btn.active {
          background: var(--grad-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .settings-content {
          padding: 32px;
          overflow: hidden;
        }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: var(--primary);
        }

        .settings-section-header h3 {
          font-size: 1.15rem;
          color: var(--text-main);
        }

        .profile-card {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          max-width: 600px;
        }

        .profile-avatar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 2.2rem;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          position: relative;
          overflow: hidden;
          border: 4px solid var(--bg-card);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-upload-btn {
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.1);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .avatar-upload-btn:hover {
          background: var(--primary);
          color: white;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .profile-details { flex: 1; }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .detail-row:last-child { border: none; }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .detail-value {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .role-badge {
          background: var(--grad-primary);
          color: white !important;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem !important;
          letter-spacing: 1px;
        }

        .theme-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          margin-bottom: 24px;
          max-width: 600px;
        }

        .theme-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .theme-info strong { display: block; font-size: 1rem; }
        .theme-info p { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

        .theme-toggle-btn {
          width: 56px;
          height: 30px;
          background: var(--border);
          border-radius: 15px;
          position: relative;
          transition: background 0.2s;
          padding: 0;
        }

        .theme-toggle-btn.dark {
          background: var(--primary);
        }

        .toggle-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .theme-toggle-btn.dark .toggle-thumb {
          transform: translateX(26px);
        }

        .theme-preview-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 600px;
        }

        .preview-card {
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .preview-card.selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .preview-card span {
          font-size: 0.9rem;
          font-weight: 700;
          margin-top: 12px;
          display: block;
        }

        .preview-light, .preview-dark {
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-light { background: #f0f2f5; }
        .preview-dark { background: #0a0e1a; }

        .preview-bar { height: 16px; }

        .preview-light .preview-bar { background: white; border-bottom: 1px solid #e2e8f0; }
        .preview-dark .preview-bar { background: #111827; border-bottom: 1px solid #1e293b; }

        .preview-content { padding: 12px; }
        .preview-line { height: 6px; border-radius: 3px; margin-bottom: 6px; }
        .preview-line.short { width: 60%; }

        .preview-light .preview-line { background: #e2e8f0; }
        .preview-dark .preview-line { background: #1e293b; }

        .notification-options {
          display: flex;
          flex-direction: column;
          max-width: 600px;
        }

        .notif-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .notif-row:last-child { border: none; }

        .switch {
          position: relative;
          width: 48px;
          height: 26px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border);
          border-radius: 13px;
          transition: 0.2s;
        }

        .slider:before {
          content: '';
          position: absolute;
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        input:checked + .slider { background: var(--primary); }
        input:checked + .slider:before { transform: translateX(22px); }

        .section-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .settings-layout { 
            grid-template-columns: 1fr; 
          }
          .settings-sidebar {
            padding: 16px;
          }
          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .settings-nav-btn {
            white-space: nowrap;
          }
          .profile-card { flex-direction: column; align-items: center; text-align: center; }
          .detail-row { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Settings;

