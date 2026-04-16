import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Admissions', path: '/admissions' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo-container">
          <div className="nav-logo-icon">प</div>
          <span className="school-name">Parishram Vidyalay Dundage</span>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
          </button>
          <Link to="/login" className="btn btn-primary">Portal Login</Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="mobile-controls">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
          </button>
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mobile-nav glass"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-nav-link"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Portal Login</Link>
        </motion.div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          z-index: 1000;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }
        
        .navbar.scrolled {
          height: 70px;
          border-bottom: 1px solid var(--border);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo-icon {
          width: 38px;
          height: 38px;
          background: var(--grad-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .school-name {
          font-weight: 800;
          font-size: 1.3rem;
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Outfit', sans-serif;
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 28px;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          font-weight: 600;
          color: var(--text-muted);
          position: relative;
          font-size: 0.95rem;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--grad-primary);
          border-radius: 2px;
        }

        .theme-btn {
          background: var(--bg-input);
          border: 1px solid var(--border);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .theme-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--bg-hover);
        }

        .mobile-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-toggle {
          display: block;
          background: none;
          color: var(--text-main);
        }

        @media (min-width: 768px) {
          .mobile-controls {
            display: none;
          }
        }

        .mobile-nav {
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .mobile-nav-link {
          font-size: 1.1rem;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
