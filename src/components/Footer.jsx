import { GraduationCap, Mail, Phone, MapPin, Globe, MessageCircle, Send, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer section-padding">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-container mb-6">
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

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/admissions">Admissions</Link></li>
              <li><Link to="/login">Student Portal</Link></li>
              <li><Link to="/login">Staff Portal</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Academics</h3>
            <ul className="footer-links">
              <li><a href="#">Curriculum</a></li>
              <li><a href="#">School Calendar</a></li>
              <li><a href="#">Examinations</a></li>
              <li><a href="#">E-Library</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>123 Education Boulevard, Tech City, ST 12345</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <span>contact@parishramvidyalay.edu</span>
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

        .footer-brand .school-name {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-desc {
          color: var(--text-muted);
          margin-bottom: 24px;
          max-width: 300px;
        }

        .social-links {
          display: flex;
          gap: 12px;
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

        .footer h4 {
          font-size: 1.1rem;
          margin-bottom: 24px;
          position: relative;
        }

        .footer h4::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 2px;
          background: var(--grad-primary);
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
        }

        .footer ul a:hover {
          color: var(--primary);
          padding-left: 5px;
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .text-primary {
          color: var(--primary);
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-bottom a {
          color: var(--text-main);
          font-weight: 600;
          margin: 0 8px;
        }

        .mb-6 { margin-bottom: 1.5rem; }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
