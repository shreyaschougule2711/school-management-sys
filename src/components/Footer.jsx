import { GraduationCap, Mail, Phone, MapPin, Globe, MessageCircle, Send, Users, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tab) => {
    if (window.innerWidth > 768) return;
    const isNew = activeTab !== tab;
    setActiveTab(isNew ? tab : null);
    
    if (isNew) {
      setTimeout(() => {
        const el = document.getElementById(`footer-tab-${tab}`);
        if (el) {
          const offset = 80; // Buffer for floating nav if any
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  };

  return (
    <footer className="footer section-padding">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-wrap mb-4">
              <img src="/assets/logo.png" alt="School Logo" className="footer-logo-img" />
              <span className="school-name">Parishram Vidyalay Dundage</span>
            </div>
            <p className="school-desc">
              Empowering students through academic excellence and holistic development, shaping the 
              next generation of global innovators since 1995.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><Globe size={20}/></a>
              <a href="#" className="social-icon"><MessageCircle size={20}/></a>
              <a href="#" className="social-icon"><Send size={20}/></a>
              <a href="#" className="social-icon"><Users size={20}/></a>
            </div>
          </div>

          <div className="footer-col" id="footer-tab-quick">
            <h3 onClick={() => toggleTab('quick')} className={activeTab === 'quick' ? 'active' : ''}>
              Quick Links
              <ChevronDown className={`mobile-chevron ${activeTab === 'quick' ? 'rotate' : ''}`} size={18} />
            </h3>
            <ul className={`footer-links ${activeTab === 'quick' ? 'show' : ''}`}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/admissions">Admissions</Link></li>
              <li><Link to="/login">Student Portal</Link></li>
              <li><Link to="/login">Staff Portal</Link></li>
            </ul>
          </div>

          <div className="footer-col" id="footer-tab-academic">
            <h3 onClick={() => toggleTab('academic')} className={activeTab === 'academic' ? 'active' : ''}>
              Academics
              <ChevronDown className={`mobile-chevron ${activeTab === 'academic' ? 'rotate' : ''}`} size={18} />
            </h3>
            <ul className={`footer-links ${activeTab === 'academic' ? 'show' : ''}`}>
              <li><a href="#events">Curriculum</a></li>
              <li><Link to="/dashboard/timetable">School Calendar</Link></li>
              <li><a href="#highlights">Examinations</a></li>
              <li><Link to="/dashboard/notes">E-Library</Link></li>
            </ul>
          </div>

          <div className="footer-col" id="footer-tab-contact">
            <h3 onClick={() => toggleTab('contact')} className={activeTab === 'contact' ? 'active' : ''}>
              Contact Us
              <ChevronDown className={`mobile-chevron ${activeTab === 'contact' ? 'rotate' : ''}`} size={18} />
            </h3>
            <ul className={`contact-info ${activeTab === 'contact' ? 'show' : ''}`}>
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>At Post Dundage, Tal - Gadhinglaj Pincode - 416501</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <span>+91 8379801244</span>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <span>contact@parishramvidyalay.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Parishram Vidyalay Dundage. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a></p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          color: var(--text-main);
          padding-top: 80px;
          padding-bottom: 40px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .footer-logo-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 50%;
          background: white;
          padding: 2px;
        }

        .footer-brand .school-name {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .school-desc {
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 350px;
        }

        .footer h3 {
          font-size: 1.25rem;
          margin-bottom: 24px;
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-chevron {
          display: none;
          transition: transform 0.3s ease;
        }

        .mobile-chevron.rotate {
          transform: rotate(180deg);
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .social-icon:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: translateY(-3px);
        }

        .footer ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer ul a {
          color: var(--text-muted);
          font-weight: 500;
          transition: all 0.2s;
        }

        .footer ul a:hover {
          color: var(--primary);
          padding-left: 5px;
        }

        .contact-info li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .contact-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-bottom a {
          color: var(--primary);
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .footer { padding-top: 40px; }
          .footer-grid { grid-template-columns: 1fr; gap: 0; }
          .footer-brand { margin-bottom: 40px; }
          
          .footer h3 {
            cursor: pointer;
            padding: 16px 0;
            margin-bottom: 0;
            border-bottom: 1px solid var(--border);
          }
          
          .footer h3.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }

          .mobile-chevron {
            display: block;
          }

          .footer-links, .contact-info {
            max-height: 0;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            margin-bottom: 0;
          }

          .footer-links.show, .contact-info.show {
            max-height: 500px;
            opacity: 1;
            padding: 20px 0;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
