import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Trophy, Bell, Settings, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero_actual.jpg';
import principalImg from '../assets/principal.jpg';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [infra, setInfra] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(() => { });
    fetch('/api/infrastructure').then(r => r.json()).then(setInfra).catch(() => { });
    fetch('/api/teachers').then(r => r.json()).then(setTeachers).catch(() => { });
    fetch('/api/gallery').then(r => r.json()).then(setGallery).catch(() => { });
  }, []);

  const highlights = [
    { icon: <BookOpen className="w-8 h-8" />, title: 'Academic Excellence', desc: 'Ranked #1 in state for STEM education and holistic learning.' },
    { icon: <Users className="w-8 h-8" />, title: 'Expert Faculty', desc: 'Over 100+ PhD and Master-level educators dedicated to student growth.' },
    { icon: <Trophy className="w-8 h-8" />, title: 'Modern Infrastructure', desc: 'State-of-the-art labs, library, and sports facilities.' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <img src={heroBg} alt="School Campus" className="hero-img" />
        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge">Welcome to Parishram Vidyalay Dundage</span>
            <h1>Empowering Minds for a <span className="gradient-text">Brighter Future</span></h1>
            <p className="hero-subtitle">
              Nurturing character, excellence, and global citizenship through
              innovative education and personal mentorship.
            </p>
            <div className="hero-btns">
              <Link to="/admissions" className="btn btn-primary">Apply Now <ArrowRight size={20} /></Link>
              <Link to="/about" className="btn btn-secondary">Explore Campus</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Marquee */}
      <div className="announcements glass">
        <div className="container marquee-container">
          <div className="announcement-label">
            <Bell size={18} /> <span>LATEST:</span>
          </div>
          <div className="marquee">
            <p> Admissions are open for Academic Year 2026-27 | Annual Sports Meet on May 15th | Parent-Teacher Meeting scheduled for Saturday...</p>
          </div>
        </div>
      </div>

      {/* Scrolling Gallery Highlights */}
      {gallery.length > 0 && (
        <section className="gallery-highlights overflow-hidden py-10" style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header-compact mb-6" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <br></br>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>CAMPUS HIGHLIGHTS</h3>
            </div>

            <div className="gallery-scroll-wrapper">
              <div className="gallery-scroll-content">
                {[...gallery, ...gallery].map((img, idx) => (
                  <div
                    key={idx}
                    className="gallery-item-card"
                    style={{ flexShrink: 0, width: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-main)' }}
                  >
                    <img src={img.imageBase64} alt={img.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{img.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Admin Events / Highlights Section */}
      {events.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--bg-main)' }}>
          <div className="container">
            <div className="section-header text-center">
              <h2>Top Highlights & Events</h2>
              <p>Latest updates added by the school administration.</p>
            </div>
            <div className="highlights-grid">
              {events.map((ev, idx) => (
                <motion.div key={idx} whileHover={{ y: -10 }} className="highlight-card glass-card p-8" style={{ border: '1px solid var(--primary)' }}>
                  <div className="icon-wrapper" style={{ background: 'var(--grad-fresh)' }}><Trophy className="w-8 h-8" /></div>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Traditional Highlights Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Choose Us?</h2>
            <p>Parishram Vidyalay Dundage is the preferred choice for parents and students.</p>
          </div>
          <div className="highlights-grid">
            {highlights.map((item, idx) => (
              <motion.div key={idx} whileHover={{ y: -10 }} className="highlight-card glass-card p-8">
                <div className="icon-wrapper">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="section-padding" style={{ background: 'var(--bg-hover)' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2>Our Respected Faculty</h2>
            <p>Learn from the brightest minds. Our teachers are highly qualified experts in their fields.</p>
          </div>
          <div className="faculty-grid">
            <div className="faculty-card principal-card glass-card">
              <div className="faculty-avatar">
                <img src={principalImg} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <div className="faculty-info">
                <h3>D.G. DIWATE</h3>
                <span className="faculty-role">Principal</span>
                <span className="faculty-degree">M.A., B.Ed.</span>
              </div>
            </div>
            {teachers.map((t, idx) => (
              <div key={idx} className="faculty-card glass-card">
                <div className="faculty-avatar">
                  {t.profileImage ? (
                    <img src={t.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    t.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="faculty-info">
                  <h3>{t.name}</h3>
                  <span className="faculty-subject">{t.subject || 'General Studies'}</span>
                  <span className="faculty-degree">{t.degree || 'M.A., B.Ed.'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      {infra.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="section-header text-center">
              <h2>Infrastructure & Facilities</h2>
              <p>State-of-the-art facilities providing the best environment for our students.</p>
            </div>
            <div className="infra-grid">
              {infra.map((item, idx) => (
                <div key={idx} className="infra-card glass-card">
                  <Settings className="infra-icon" />
                  <div className="infra-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: <strong>{item.quantity}</strong></p>
                    <span className={`status-badge ${item.status === 'Available' ? 'available' : 'maintenance'}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .hero { position: relative; height: 100vh; min-height: 700px; display: flex; align-items: center; overflow: hidden; color: white; }
        .hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(2, 6, 23, 0.9) 0%, rgba(2, 6, 23, 0.4) 100%); z-index: -1; }
        .hero-content { max-width: 800px; }
        .badge { background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.3); color: var(--primary-light); padding: 6px 16px; border-radius: 100px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 24px; display: inline-block; }
        .hero h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 24px; color: white; }
        .gradient-text { background: linear-gradient(to right, #60a5fa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.25rem; color: #cbd5e1; margin-bottom: 40px; max-width: 600px; }
        .hero-btns { display: flex; gap: 16px; }
        
        .announcements { padding: 12px 0; border-bottom: 1px solid var(--border); }
        .marquee-container { display: flex; align-items: center; gap: 20px; overflow: hidden; }
        .announcement-label { display: flex; align-items: center; gap: 8px; background: var(--primary); color: white; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; white-space: nowrap; }
        .marquee { overflow: hidden; position: relative; }
        .marquee p { display: inline-block; white-space: nowrap; animation: slide 30s linear infinite; }
        @keyframes slide { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-header h2 { font-size: 2.5rem; margin-bottom: 16px; }
        
        .highlights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
        .highlight-card { padding: 40px; text-align: center; transition: all 0.3s ease; }
        .icon-wrapper { width: 80px; height: 80px; background: var(--grad-primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; }
        
        .faculty-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .faculty-card { padding: 24px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); }
        .principal-card { background: var(--grad-primary); color: white; grid-column: 1 / -1; max-width: 500px; margin: 0 auto 24px auto; justify-content: center; text-align: center; flex-direction: column; padding: 40px;}
        .principal-card .faculty-avatar { width: 80px; height: 80px; font-size: 2rem; background: white; color: var(--primary); }
        .faculty-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--grad-warm); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; }
        .faculty-info { display: flex; flex-direction: column; }
        .faculty-info h3 { font-size: 1.1rem; margin-bottom: 4px; }
        .faculty-subject { font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-bottom: 4px; }
        .faculty-degree { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }
        .principal-card .faculty-degree { color: rgba(255,255,255,0.8); }

        .infra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .infra-card { padding: 20px; display: flex; align-items: center; gap: 16px; }
        .infra-icon { width: 40px; height: 40px; color: var(--primary); }
        .infra-details h4 { font-size: 1.05rem; margin-bottom: 6px; }
        .infra-details p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
        .status-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
        .status-badge.available { background: #d1fae5; color: #065f46; }
        .status-badge.maintenance { background: #fee2e2; color: #b91c1c; }

        .gallery-scroll-wrapper { overflow: hidden; position: relative; padding: 20px 0; }
        .gallery-scroll-content { display: flex; gap: 20px; animation: scroll-left 40s linear infinite; width: max-content; }
        .gallery-scroll-content:hover { animation-play-state: paused; }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .p-8 { padding: 2rem; }
        .text-center { text-align: center; }

        @media (max-width: 768px) {
          .hero h1 { font-size: 2.5rem; }
          .hero-btns { flex-direction: column; }
          .faculty-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Home;
