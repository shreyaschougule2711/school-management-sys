import { motion } from 'framer-motion';
import { Download, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Admissions = () => {
  const steps = [
    { title: 'Inquiry', desc: 'Fill out the online inquiry form or visit the Dundage campus.' },
    { title: 'Documents', desc: 'Submit all the required documents (LC, Photo, Aadhar, etc.) as per school norms.' },
    { title: 'Registration', desc: 'Complete registration. Please note: No admission fee is required.' },
  ];

  const downloadProspectus = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(67, 56, 202); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PARISHRAM VIDYALAY DUNDAGE', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('School Admission Prospectus 2026-27', 105, 30, { align: 'center' });

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Welcome to Parishram Vidyalay', 20, 55);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize('Our institution provides high-quality Marathi medium education for rural students in the Gadhinglaj region. We focus on holistic development, academic rigor, and character building.', 170);
    doc.text(splitText, 20, 65);

    doc.setFontSize(14);
    doc.text('Admission Process', 20, 85);
    autoTable(doc, {
      startY: 90,
      head: [['Step', 'Description']],
      body: [
        ['1. Inquiry', 'Submit online form or visit campus'],
        ['2. Documentation', 'Submit all the required documents'],
        ['3. Registration', 'Final seat allotment (Zero Admission Fee)']
      ],
      theme: 'grid'
    });

    doc.setFontSize(14);
    doc.text('Eligibility Criteria', 20, 140);
    doc.setFontSize(11);
    doc.text('1. Students must be in between 5th standard to 10th standard.', 20, 150);

    doc.setFontSize(14);
    doc.text('Contact Information', 20, 165);

    doc.save('Admission_Prospectus_Parishram_Vidyalay.pdf');
  };

  return (
    <div className="admissions-page section-padding">
      <div className="container">
        <div className="section-header">
          <span className="badge">Admission Open 2026-27</span>
          <h1>Start Your <span className="gradient-text">Journey</span></h1>
          <p>Join a community dedicated to academic rigor and rural excellence. No hidden fees, no entrance exams.</p>
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
                <li><CheckCircle size={16} /> Students must be in between 5th standard to 10th standard.</li>
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
                <span>Starting Date: <strong>June 15th, 2026</strong></span>
              </div>
            </div>
          </div>
          
          <div className="download-section">
            <p>Download the full information brochure and offline application form.</p>
            <div className="flex gap-4" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={downloadProspectus}
              >
                <FileText size={18}/> Download Prospectus
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
