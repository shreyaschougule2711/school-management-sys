import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookText, 
  CheckSquare, 
  ClipboardCheck, 
  IndianRupee, 
  Receipt,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const SidebarItem = ({ icon, label, path, active, onClick }) => (
  <Link to={path} onClick={onClick}>
    <div className={`sidebar-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="activeRule" className="active-indicator" />}
    </div>
  </Link>
);

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const role = user?.role || location.pathname.split('/')[2] || 'student';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    student: [
      { icon: <LayoutDashboard size={20}/>, label: 'Overview', path: '/dashboard/student' },
      { icon: <Calendar size={20}/>, label: 'Timetable', path: '/dashboard/timetable' },
      { icon: <BookText size={20}/>, label: 'Assignments', path: '/dashboard/assignments' },
      { icon: <ClipboardCheck size={20}/>, label: 'Attendance', path: '/dashboard/attendance' },
      { icon: <CheckSquare size={20}/>, label: 'Exams & Results', path: '/dashboard/results' },
      { icon: <IndianRupee size={20}/>, label: 'Fees', path: '/dashboard/fees' },
      { icon: <Receipt size={20}/>, label: 'Transactions', path: '/dashboard/transactions' },
    ],
    teacher: [
      { icon: <LayoutDashboard size={20}/>, label: 'Teacher Panel', path: '/dashboard/teacher' },
      { icon: <ClipboardCheck size={20}/>, label: 'Mark Attendance', path: '/dashboard/attendance' },
      { icon: <BookText size={20}/>, label: 'Post Assignments', path: '/dashboard/assignments' },
      { icon: <CheckSquare size={20}/>, label: 'Add Marks', path: '/dashboard/results' },
    ],
    admin: [
      { icon: <LayoutDashboard size={20}/>, label: 'Admin Panel', path: '/dashboard/admin' },
      { icon: <ClipboardCheck size={20}/>, label: 'Attendance', path: '/dashboard/attendance' },
      { icon: <BookText size={20}/>, label: 'Assignments', path: '/dashboard/assignments' },
      { icon: <IndianRupee size={20}/>, label: 'Fees', path: '/dashboard/fees' },
      { icon: <Receipt size={20}/>, label: 'Transactions', path: '/dashboard/transactions' },
    ]
  };

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="dashboard-container">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/assets/logo.png" alt="Logo" className="logo-img-sm" />
          <div className="sidebar-title">
            <h2>Parishram Vidyalay</h2>
            <span className="subtitle">Dundage</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="menu-group">
            <span className="group-label">Main Menu</span>
            {menuItems[role]?.map((item) => (
              <SidebarItem 
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </div>

          <div className="menu-group secondary-group">
            <span className="group-label">Preferences</span>
            <Link to="/dashboard/settings" onClick={() => setIsSidebarOpen(false)}>
              <div className={`sidebar-item ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}>
                <Settings size={20}/>
                <span>Settings</span>
                {location.pathname === '/dashboard/settings' && <motion.div layoutId="activeRule" className="active-indicator" />}
              </div>
            </Link>
            <div className="sidebar-item theme-toggle-item" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              <div className={`theme-switch ${theme === 'dark' ? 'on' : ''}`}>
                <div className="theme-switch-thumb" />
              </div>
            </div>
            <div className="sidebar-item logout" onClick={() => { setIsSidebarOpen(false); handleLogout(); }}>
              <LogOut size={20}/>
              <span>Logout</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20}/>
              <span className="notification-dot"></span>
            </button>
            <div className="user-profile" onClick={() => navigate('/dashboard/settings')}>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{role.toUpperCase()}</span>
              </div>
              <div className="avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="avatar-img-round" />
                ) : userInitials}
              </div>
            </div>
          </div>
        </header>

        <section className="content-scroll">
          <div className="container-fluid">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <style>{`
        .dashboard-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-main);
        }

        .sidebar {
          width: 280px;
          height: 100%;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border);
        }

        .logo-img-sm {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 50%;
          background: white;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sidebar-title h2 {
          font-size: 1rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .sidebar-title .subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px 24px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .menu-group {
          margin-bottom: 24px;
        }

        .secondary-group {
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .group-label {
          display: block;
          padding: 0 16px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all var(--transition-fast);
          position: relative;
          cursor: pointer;
          margin-bottom: 2px;
        }

        .sidebar-item:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .sidebar-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          font-weight: 700;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 15%;
          height: 70%;
          width: 3px;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
        }

        .theme-toggle-item {
          position: relative;
        }

        .theme-switch {
          margin-left: auto;
          width: 40px;
          height: 22px;
          background: var(--border);
          border-radius: 11px;
          position: relative;
          transition: background var(--transition-fast);
        }

        .theme-switch.on {
          background: var(--primary);
        }

        .theme-switch-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform var(--transition-fast);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .theme-switch.on .theme-switch-thumb {
          transform: translateX(18px);
        }

        .logout:hover { 
          color: #ef4444 !important; 
          background: rgba(239, 68, 68, 0.08) !important; 
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .dashboard-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
          flex-shrink: 0;
        }

        .header-search {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .header-search .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .header-search input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-main);
          font-size: 0.9rem;
        }

        .header-search input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          background: none;
          color: var(--text-muted);
          position: relative;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background: var(--bg-hover);
          color: var(--primary);
        }

        .notification-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid var(--bg-card);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .user-profile:hover {
          background: var(--bg-hover);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          background: var(--grad-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 0.85rem;
          overflow: hidden;
        }

        .avatar-img-round {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .container-fluid {
          max-width: 1200px;
        }

        @media (max-width: 1024px) {
          .sidebar { width: 240px; }
          .content-scroll { padding: 24px; }
        }

        @media (max-width: 768px) {
          .sidebar { 
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            transition: transform var(--transition-normal);
            box-shadow: none;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: var(--shadow-xl);
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
          }
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            background: none;
            color: var(--text-main);
          }
          .mobile-close-btn {
            display: flex;
            margin-left: auto;
            background: none;
            color: var(--text-muted);
          }
          .dashboard-header { padding: 0 16px; gap: 12px; }
          .header-search { max-width: none; }
          .user-info { display: none; }
          .content-scroll { padding: 16px; }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn, .mobile-close-btn { display: none; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
