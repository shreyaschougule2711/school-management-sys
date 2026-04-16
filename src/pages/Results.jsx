import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, FileText, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];

const Results = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const [studentResults, setStudentResults] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState(null);

  // Teacher specific state
  const [students, setStudents] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('10th');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  useEffect(() => {
    if (isStudent) {
      fetch(`/api/results?studentId=${user.id}`).then(r => r.json()).then(data => {
        setStudentResults(data);
        if (data.length > 0) setIsPublished(data[0].published);
      }).catch(()=>{});
    } else if (isTeacher) {
      fetch(`/api/students?standard=${selectedStandard}`).then(r => r.json()).then(setStudents).catch(()=>{});
    }
  }, [user, selectedStandard]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const internal = parseInt(formData.get('internal'));
    const theory = parseInt(formData.get('theory'));
    const total = internal + theory;
    let grade = 'F';
    if (total >= 90) grade = 'A+';
    else if (total >= 80) grade = 'A';
    else if (total >= 70) grade = 'B';
    else if (total >= 60) grade = 'C';
    else if (total >= 50) grade = 'D';

    const payload = {
      studentId: parseInt(selectedStudent),
      studentName: students.find(s => s.id === parseInt(selectedStudent))?.name,
      standard: selectedStandard,
      subject: formData.get('subject'),
      internal,
      theory,
      total,
      grade
    };

    await fetch('/api/results', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    showToast('Marks saved successfully!');
    e.target.reset();
  };

  const downloadMarksheet = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Parishram Vidyalay Dundage - Marksheet`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Student: ${user.name}`, 14, 32);
    doc.text(`Class: ${user.standard} Standard`, 14, 38);
    
    const tableData = studentResults.map(r => [
      r.subject, r.internal, r.theory, r.total, r.grade
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Subject', 'Internal (20)', 'Theory (80)', 'Total (100)', 'Grade']],
      body: tableData,
    });

    doc.save(`Marksheet_${user.name.split(' ').join('_')}.pdf`);
  };

  if (isTeacher) {
    return (
      <div className="results-page">
        <div className="page-header">
          <h1>Marks Entry Panel</h1>
          <p>Enter examination marks for your students.</p>
        </div>
        
        <div className="glass-card section-padded mt-6" style={{ maxWidth: '600px' }}>
          <h3>📝 Enter Terminal Exam Marks</h3>
          <form className="mt-6" onSubmit={handleScoreSubmit}>
            <div className="form-group">
              <label>Select Standard</label>
              <select className="form-input" value={selectedStandard} onChange={e => setSelectedStandard(e.target.value)}>
                {['5th', '6th', '7th', '8th', '9th', '10th'].map(s => <option key={s} value={s}>{s} Std</option>)}
              </select>
            </div>
            
            <div className="form-group mt-4">
              <label>Select Student</label>
              <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                <option value="">Choose Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group mt-4">
              <label>Select Subject</label>
              <select name="subject" className="form-input" required>
                <option value="">Choose Subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid-2 mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Internal Marks (Max 20)</label>
                <input type="number" name="internal" className="form-input" max="20" min="0" required />
              </div>
              <div className="form-group">
                <label>Theory Marks (Max 80)</label>
                <input type="number" name="theory" className="form-input" max="80" min="0" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-6 w-full">Save Marks</button>
          </form>
        </div>

        <AnimatePresence>
          {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
            {toast.msg}
          </motion.div>}
        </AnimatePresence>

        <style>{`.section-padded { padding: 28px; } .form-input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-main); }`}</style>
      </div>
    );
  }

  // Student View
  return (
    <div className="results-page">
      <div className="page-header">
        <h1>Examination Results</h1>
        <p>Terminal Examination | 2026-27</p>
      </div>

      {!isPublished ? (
        <div className="glass-card mt-8" style={{ padding: '40px', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '16px' }}/>
          <h3>Results Not Available</h3>
          <p className="text-muted mt-2">The school administration has not published the results for your class yet. Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid mt-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="stat-card glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="stat-icon" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', color: '#065f46', borderRadius: '12px' }}><Award /></div>
              <div className="stat-content">
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
                <h3 className="stat-value">Passed</h3>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ height: 'fit-content', margin: 'auto 0' }} onClick={downloadMarksheet}>
              <Download size={18}/> Download PDF Marksheet
            </button>
          </div>

          <div className="glass-card mt-8" style={{ overflow: 'hidden' }}>
            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Subject</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Internal (20)</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Theory (80)</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Total (100)</th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((res, i) => (
                  <tr key={i}>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}><strong>{res.subject}</strong></td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>{res.internal}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>{res.theory}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}><strong>{res.total}</strong></td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ background: 'var(--grad-primary)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: '800' }}>{res.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
