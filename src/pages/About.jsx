import { motion } from 'framer-motion';
import { Target, Eye, Award, Clock, Users, BookOpen, GraduationCap, MapPin } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: <Clock size={32} />, label: 'Established', value: '1961' },
    { icon: <GraduationCap size={32} />, label: 'Grades', value: '5th - 10th' },
    { icon: <BookOpen size={32} />, label: 'Library Books', value: '4579+' },
    { icon: <Award size={32} />, label: 'Type', value: 'Pvt. Aided' },
  ];

  const highlights = [
    { title: 'Modern Facilities', desc: 'Equipped with 8 well-maintained classrooms, functional computer systems, and dedicated sports playground.' },
    { title: 'Holistic Environment', desc: 'A co-educational rural school in Gadhinglaj, providing midday meals and a robust academic curriculum.' },
    { title: 'Cultural Identity', desc: 'Rooted in Maharashtra tradition with Marathi as the primary medium of instruction, fostering local excellence.' },
  ];

  return (
    <div className="about-page glass-bg">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="badge"
            style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
          >
            Since 1961
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '4rem', fontWeight: 900, marginTop: '20px', marginBottom: '20px' }}
          >
            Parishram <span className="gradient-text">Vidyalay Dundage</span>
          </motion.h1>
          <p className="max-w-2xl mx-auto text-xl" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
            Nurturing rural excellence in the Gadhinglaj region of Kolhapur for over six decades. 
            Providing high-quality education and character development to the leaders of tomorrow.
          </p>
          <div className="mt-8" style={{ display: 'flex', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            <MapPin size={16} /> At Post Dundage, Tal - Gadhinglaj Pincode - 416501 (+91 8379801244)
          </div>
        </div>
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.7))', zIndex: 0 }}></div>
      </section>

      {/* Stats Grid */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card stat-card"
                style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--border)' }}
              >
                <div style={{ color: 'var(--primary)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{stat.value}</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy & History */}
      <section className="section-padding bg-hover">
        <div className="container grid md-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Legacy of Learning</h2>
            <p className="text-muted leading-relaxed mb-6">
              Establishing a standard of excellence since 1961, our institution has been more than just a school. 
              It is a community hub in Dundage where generations have learned the values of hard work and integrity.
            </p>
            <p className="text-muted leading-relaxed">
              With Marathi as our medium of instruction, we ensure that every child receives the finest education in 
              their mother tongue, while preparing them for the challenges of a globalized world.
            </p>
          </div>
          <div className="grid gap-6">
            {highlights.map((h, i) => (
              <div key={i} className="glass-card p-6" style={{ background: 'var(--bg-main)' }}>
                <h4 className="font-bold text-primary mb-2">{h.title}</h4>
                <p className="text-muted text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Sections */}
      <section className="section-padding">
        <div className="container grid md-cols-2" style={{ display: 'grid', gap: '40px' }}>
          <div className="glass-card p-12" style={{ background: 'var(--bg-hover)', borderLeft: '6px solid var(--primary)' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Eye size={30} className="text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
            <p className="text-muted leading-relaxed">
              To empower rural youth with knowledge and skills that bridge the gap between tradition 
              and modernity, making them self-reliant and socially conscious individuals.
            </p>
          </div>
          <div className="glass-card p-12" style={{ background: 'var(--bg-hover)', borderLeft: '6px solid var(--accent)' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Target size={30} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-muted leading-relaxed">
              To provide accessible, inclusive, and high-quality Marathi medium education with 
              state-of-the-art facilities, fostering an environment where every student in the Dundage region 
              can excel academically and personally.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .about-hero { 
          min-height: 500px; 
          display: flex; 
          align-items: center; 
          background: url('/assets/hero_actual.jpg'); 
          background-size: cover; 
          background-position: center; 
          color: white; 
          position: relative;
        }
        .text-4xl { font-size: 2.5rem; }
        .text-3xl { font-size: 1.8rem; }
        .font-bold { font-weight: 700; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .leading-relaxed { line-height: 1.7; }
        .max-w-2xl { max-width: 42rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
      `}</style>
    </div>
  );
};

export default About;
