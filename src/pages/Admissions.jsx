import { motion } from 'framer-motion';
import { Download, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admissions = () => {
  const steps = [
    { title: 'Inquiry', desc: 'Fill out the online inquiry form or visit the campus.' },
    { title: 'Assessment', desc: 'Entrance test for Class 5-10 students followed by an interview.' },
    { title: 'Documents', desc: 'Submit birth certificate, previous school records, and photos.' },
    { title: 'Fee Payment', desc: 'Secure the seat by paying the admission and first term fees.' },
  ];

  return (
    <div className="admissions-page section-padding">
      <div className="container">
        <div className="section-header">
          <span className="badge">Joining Zenith</span>
          <h1>Admission <span className="gradient-text">Process</span></h1>
          <p>We welcome applications from students who are eager to learn and grow in a dynamic environment.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="step-card glass-card"
            >
              <div className="step-num">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="admission-content glass-card mt-20">
          <div className="content-flex">
            <div className="info-block">
              <h3>Eligibility Criteria</h3>
              <ul>
                <li><CheckCircle size={16} /> Minimum age: 10 years for Class 5</li>
                <li><CheckCircle size={16} /> Previous academic records consistent above 60%</li>
                <li><CheckCircle size={16} /> Proficiency in English and Mathematics</li>
              </ul>
            </div>
            <div className="info-block">
              <h3>Important Dates</h3>
              <div className="date-item">
                <Calendar size={18} />
                <span>Form Release: <strong>May 1st, 2026</strong></span>
              </div>
              <div className="date-item">
                <Calendar size={18} />
                <span>Entrance Exam: <strong>June 15th, 2026</strong></span>
              </div>
            </div>
          </div>
          
          <div className="download-section">
            <p>Download the full information brochure and offline application form.</p>
            <div className="flex gap-4" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => alert('Starting download: Zenith_Prospectus_2026.pdf')}
              >
                <Download size={18}/> Prospectus.pdf
              </button>
              <Link to="/register" className="btn btn-primary">Apply Online Now</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .section-header { text-align: center; margin-bottom: 60px; }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }
        .step-card {
          padding: 32px;
          position: relative;
        }
        .step-num {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 40px;
          height: 40px;
          background: var(--grad-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          box-shadow: var(--shadow-md);
        }
        .admission-content { padding: 48px; margin-top: 80px; }
        .content-flex {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .info-block h3 { margin-bottom: 24px; color: var(--primary); }
        .info-block ul { list-style: none; }
        .info-block li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .date-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 16px;
          background: var(--bg-main);
          border-radius: var(--radius-md);
        }
        .download-section {
          text-align: center;
          border-top: 1px solid var(--border);
          padding-top: 40px;
        }
        .mt-20 { margin-top: 5rem; }
        .flex { display: flex; }
        .gap-4 { gap: 1rem; }
        @media (max-width: 768px) {
          .content-flex { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Admissions;
