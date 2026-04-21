import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, FileText, Download, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const Results = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const [studentResults, setStudentResults] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState(null);

  // Teacher specific state
  const [students, setStudents] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('10th');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksStructure, setMarksStructure] = useState(null);
  const [marksValues, setMarksValues] = useState([]);
  
  useEffect(() => {
    if (isStudent) {
      fetch(`/api/results?studentId=${user.id}`).then(r => r.json()).then(data => {
        setStudentResults(data);
        if (data.length > 0) setIsPublished(data[0].published);
      }).catch(()=>{});
    } else if (isTeacher || isAdmin) {
      fetchStudents();
      fetchSubjects();
    }
  }, [user, selectedStandard]);

  const fetchStudents = () => {
    fetch(`/api/students?standard=${selectedStandard}`).then(r => r.json()).then(setStudents).catch(()=>{});
  };

  const fetchSubjects = () => {
    fetch(`/api/subjects?standard=${selectedStandard}`)
      .then(r => r.json())
      .then(data => setSubjects(data.subjects || []))
      .catch(() => {});
  };

  useEffect(() => {
    if ((isTeacher || isAdmin) && selectedSubject && selectedStandard) {
      fetch(`/api/marks-structure?standard=${selectedStandard}&subject=${selectedSubject}`)
        .then(r => r.json())
        .then(data => {
          setMarksStructure(data);
          setMarksValues(data.components.map(c => ({ ...c, obtained: 0 })));
        })
        .catch(() => {});
    }
  }, [selectedSubject, selectedStandard]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    
    // Validate marks
    for (const m of marksValues) {
      if (m.obtained > m.maxMarks) {
        showToast(`${m.name}: Obtained marks cannot exceed ${m.maxMarks}`, 'error');
        return;
      }
      if (m.obtained < 0) {
        showToast(`${m.name}: Marks cannot be negative`, 'error');
        return;
      }
    }

    const total = marksValues.reduce((sum, m) => sum + parseInt(m.obtained || 0), 0);
    const totalMax = marksValues.reduce((sum, m) => sum + parseInt(m.maxMarks), 0);
    const percentage = totalMax > 0 ? ((total / totalMax) * 100).toFixed(1) : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const payload = {
      studentId: parseInt(selectedStudent),
      studentName: students.find(s => s.id === parseInt(selectedStudent))?.name,
      standard: selectedStandard,
      subject: selectedSubject,
      marks: marksValues.map(m => ({ component: m.name, maxMarks: parseInt(m.maxMarks), obtained: parseInt(m.obtained) })),
      total,
      totalMax,
      percentage: parseFloat(percentage),
      grade
    };

    await fetch('/api/results', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    showToast(`Marks saved! Total: ${total}/${totalMax} (${percentage}%) - Grade: ${grade}`);
    setMarksValues(marksValues.map(m => ({ ...m, obtained: 0 })));
  };

  const downloadMarksheet = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with school name
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PARISHRAM VIDYALAY DUNDAGE', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('TERMINAL EXAMINATION MARKSHEET 2026-27', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text('Affiliated to State Board | Dundage, Maharashtra', pageWidth / 2, 36, { align: 'center' });

    // Student Info Box
    doc.setTextColor(15, 23, 42);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 52, pageWidth - 28, 32, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 20, 62);
    doc.text('Class:', 120, 62);
    doc.text('Roll No:', 20, 74);
    doc.text('Academic Year:', 120, 74);
    
    doc.setFont('helvetica', 'normal');
    doc.text(user.name, 58, 62);
    doc.text(`${user.standard} Standard`, 140, 62);
    doc.text(`${user.id}`, 48, 74);
    doc.text('2026-27', 155, 74);

    // Marks Table
    const hasFlexibleMarks = studentResults.some(r => r.marks && Array.isArray(r.marks));
    
    let tableHead, tableBody;

    if (hasFlexibleMarks) {
      // Get all unique component names
      const allComponents = new Set();
      studentResults.forEach(r => {
        if (r.marks) r.marks.forEach(m => allComponents.add(m.component));
      });
      const components = [...allComponents];
      
      tableHead = [['#', 'Subject', ...components.map(c => c), 'Total', 'Max', '%', 'Grade']];
      tableBody = studentResults.map((r, i) => {
        const compValues = components.map(c => {
          const mark = r.marks?.find(m => m.component === c);
          return mark ? `${mark.obtained}` : '-';
        });
        const totalMax = r.totalMax || r.marks?.reduce((s, m) => s + m.maxMarks, 0) || 100;
        const pct = r.percentage || (totalMax > 0 ? ((r.total / totalMax) * 100).toFixed(1) : 0);
        return [i + 1, r.subject, ...compValues, r.total, totalMax, `${pct}%`, r.grade];
      });
    } else {
      // Legacy 20+80 format
      tableHead = [['#', 'Subject', 'Internal', 'Theory', 'Total', 'Grade']];
      tableBody = studentResults.map((r, i) => [
        i + 1, r.subject, r.internal || '-', r.theory || '-', r.total, r.grade
      ]);
    }

    // Grand Total Row
    const grandTotal = studentResults.reduce((sum, r) => sum + (r.total || 0), 0);
    const grandMax = studentResults.reduce((sum, r) => sum + (r.totalMax || 100), 0);
    const grandPct = grandMax > 0 ? ((grandTotal / grandMax) * 100).toFixed(1) : 0;
    let overallGrade = 'F';
    if (grandPct >= 90) overallGrade = 'A+';
    else if (grandPct >= 80) overallGrade = 'A';
    else if (grandPct >= 70) overallGrade = 'B+';
    else if (grandPct >= 60) overallGrade = 'B';
    else if (grandPct >= 50) overallGrade = 'C';
    else if (grandPct >= 40) overallGrade = 'D';

    autoTable(doc, {
      startY: 92,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { halign: 'left', cellWidth: 35 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = doc.lastAutoTable.finalY + 5;

    // Grand Total Section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, finalY, pageWidth - 28, 28, 3, 3, 'F');
    doc.setDrawColor(99, 102, 241);
    doc.roundedRect(14, finalY, pageWidth - 28, 28, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Grand Total: ${grandTotal} / ${grandMax}`, 20, finalY + 12);
    doc.text(`Overall Percentage: ${grandPct}%`, 20, finalY + 22);
    
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(14);
    doc.text(`Grade: ${overallGrade}`, pageWidth - 20, finalY + 17, { align: 'right' });

    // Result Status
    const resultY = finalY + 38;
    const passed = parseFloat(grandPct) >= 40;
    doc.setFillColor(passed ? 16 : 239, passed ? 185 : 68, passed ? 129 : 68);
    doc.roundedRect(pageWidth / 2 - 30, resultY, 60, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(passed ? 'PASSED' : 'FAILED', pageWidth / 2, resultY + 8.5, { align: 'center' });

    // Footer
    const footerY = resultY + 30;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, footerY);
    doc.text('This is a computer-generated document.', 14, footerY + 6);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 70, footerY - 2, pageWidth - 14, footerY - 2);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text('Principal Signature', pageWidth - 42, footerY + 6, { align: 'center' });

    // Watermark
    doc.setTextColor(230, 230, 250);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    doc.text('PVD', pageWidth / 2, 180, { align: 'center', angle: 45 });

    doc.save(`Marksheet_${user.name.split(' ').join('_')}_${user.standard}.pdf`);
    showToast('Marksheet downloaded successfully!');
  };

  if (isTeacher || isAdmin) {
    return (
      <div className="results-page">
        <div className="page-header">
          <h1>📝 Marks Entry Panel</h1>
          <p>Enter examination marks for your students using the admin-defined marks structure.</p>
        </div>
        
        <div className="glass-card section-padded mt-6" style={{ maxWidth: '700px' }}>
          <h3>📊 Enter Exam Marks</h3>
          <p className="text-muted mt-2 mb-6">Select a class, student, and subject. The marks structure will be loaded based on admin configuration.</p>
          
          <form className="mt-4" onSubmit={handleScoreSubmit}>
            <div className="form-row-3">
              <div className="form-group">
                <label>Select Standard</label>
                <select className="form-input" value={selectedStandard} onChange={e => { setSelectedStandard(e.target.value); setSelectedSubject(''); }}>
                  {STANDARDS.map(s => <option key={s} value={s}>{s} Std</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Student</label>
                <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                  <option value="">Choose Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Subject</label>
                <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
                  <option value="">Choose Subject...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {marksStructure && selectedSubject && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="marks-entry-section">
                <div className="marks-structure-header">
                  <span>📋 Marks Structure for <strong>{selectedSubject}</strong></span>
                  <span className="total-max-badge">Total: {marksStructure.totalMaxMarks || marksValues.reduce((s, m) => s + parseInt(m.maxMarks), 0)} marks</span>
                </div>
                <div className="marks-components">
                  {marksValues.map((comp, i) => (
                    <div key={i} className="mark-component-row">
                      <div className="comp-info">
                        <span className="comp-name">{comp.name}</span>
                        <span className="comp-max">Max: {comp.maxMarks}</span>
                      </div>
                      <div className="comp-input-wrap">
                        <input 
                          type="number" 
                          className="form-input comp-input" 
                          placeholder="0"
                          min="0" 
                          max={comp.maxMarks} 
                          value={comp.obtained || ''} 
                          onChange={e => {
                            const newValues = [...marksValues];
                            newValues[i] = { ...newValues[i], obtained: e.target.value };
                            setMarksValues(newValues);
                          }}
                          required 
                        />
                        <span className="comp-divider">/ {comp.maxMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="marks-total-preview">
                  <span>Running Total:</span>
                  <strong>{marksValues.reduce((s, m) => s + parseInt(m.obtained || 0), 0)} / {marksValues.reduce((s, m) => s + parseInt(m.maxMarks), 0)}</strong>
                </div>
              </motion.div>
            )}

            <button type="submit" className="btn btn-primary mt-6 w-full" disabled={!selectedStudent || !selectedSubject}>
              Save Marks
            </button>
          </form>
        </div>

        <AnimatePresence>
          {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
            {toast.msg}
          </motion.div>}
        </AnimatePresence>

        <style>{`
          .section-padded { padding: 28px; }
          .form-input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-main); font-family: inherit; }
          .form-input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
          .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
          
          .marks-entry-section {
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 20px;
            margin-top: 20px;
          }
          .marks-structure-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 0.9rem;
            flex-wrap: wrap;
            gap: 8px;
          }
          .total-max-badge {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: var(--radius-full);
            font-size: 0.8rem;
            font-weight: 700;
          }
          .marks-components {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .mark-component-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--bg-card);
            border-radius: var(--radius-sm);
            border: 1px solid var(--border);
          }
          .comp-info { display: flex; flex-direction: column; }
          .comp-name { font-weight: 700; font-size: 0.9rem; }
          .comp-max { font-size: 0.75rem; color: var(--text-muted); }
          .comp-input-wrap { display: flex; align-items: center; gap: 8px; }
          .comp-input { width: 80px !important; text-align: center; font-weight: 700; font-size: 1.1rem; }
          .comp-divider { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
          .marks-total-preview {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding: 12px 16px;
            background: rgba(99, 102, 241, 0.06);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
          }
          .marks-total-preview strong {
            font-size: 1.2rem;
            color: var(--primary);
          }

          @media (max-width: 768px) {
            .form-row-3 { grid-template-columns: 1fr; }
            .mark-component-row { flex-direction: column; gap: 8px; align-items: flex-start; }
            .comp-input-wrap { width: 100%; }
            .comp-input { flex: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Student View
  const hasFlexibleMarks = studentResults.some(r => r.marks && Array.isArray(r.marks));
  const grandTotal = studentResults.reduce((sum, r) => sum + (r.total || 0), 0);
  const grandMax = studentResults.reduce((sum, r) => sum + (r.totalMax || 100), 0);
  const grandPct = grandMax > 0 ? ((grandTotal / grandMax) * 100).toFixed(1) : 0;
  let overallGrade = 'F';
  if (grandPct >= 90) overallGrade = 'A+';
  else if (grandPct >= 80) overallGrade = 'A';
  else if (grandPct >= 70) overallGrade = 'B+';
  else if (grandPct >= 60) overallGrade = 'B';
  else if (grandPct >= 50) overallGrade = 'C';
  else if (grandPct >= 40) overallGrade = 'D';

  // Get all unique components for flexible view
  const allComponents = new Set();
  studentResults.forEach(r => {
    if (r.marks) r.marks.forEach(m => allComponents.add(m.component));
  });
  const components = [...allComponents];

  return (
    <div className="results-page">
      <div className="page-header">
        <h1>📄 Examination Results</h1>
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
          {/* Summary Cards */}
          <div className="result-summary-cards mt-8">
            <div className="result-summary-card glass-card">
              <div className="rsc-icon" style={{ background: '#d1fae5', color: '#065f46' }}><Award size={24}/></div>
              <div className="rsc-content">
                <span className="rsc-label">Overall Grade</span>
                <h3 className="rsc-value">{overallGrade}</h3>
              </div>
            </div>
            <div className="result-summary-card glass-card">
              <div className="rsc-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><CheckCircle size={24}/></div>
              <div className="rsc-content">
                <span className="rsc-label">Percentage</span>
                <h3 className="rsc-value">{grandPct}%</h3>
              </div>
            </div>
            <div className="result-summary-card glass-card">
              <div className="rsc-icon" style={{ background: '#fef3c7', color: '#92400e' }}><FileText size={24}/></div>
              <div className="rsc-content">
                <span className="rsc-label">Total Marks</span>
                <h3 className="rsc-value">{grandTotal}/{grandMax}</h3>
              </div>
            </div>
            <button className="download-marksheet-btn btn btn-primary" onClick={downloadMarksheet}>
              <Download size={18}/> Download PDF Marksheet
            </button>
          </div>

          <div className="glass-card mt-8 table-responsive">
            <table className="dashboard-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell" style={{ textAlign: 'left' }}>Subject</th>
                  {hasFlexibleMarks ? (
                    components.map(c => <th key={c} className="th-cell">{c}</th>)
                  ) : (
                    <>
                      <th className="th-cell">Internal (20)</th>
                      <th className="th-cell">Theory (80)</th>
                    </>
                  )}
                  <th className="th-cell">Total</th>
                  <th className="th-cell">Grade</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((r, i) => (
                  <tr key={i} className="tr-row">
                    <td className="td-cell">{i + 1}</td>
                    <td className="td-cell" style={{ textAlign: 'left' }}><strong>{r.subject}</strong></td>
                    {hasFlexibleMarks ? (
                      components.map(c => {
                        const mark = r.marks?.find(m => m.component === c);
                        return <td key={c} className="td-cell">{mark ? `${mark.obtained}/${mark.maxMarks}` : '-'}</td>;
                      })
                    ) : (
                      <>
                        <td className="td-cell">{r.internal}</td>
                        <td className="td-cell">{r.theory}</td>
                      </>
                    )}
                    <td className="td-cell"><strong>{r.total}</strong></td>
                    <td className="td-cell">
                      <span className="grade-badge">{r.grade}</span>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="td-cell" colSpan={hasFlexibleMarks ? components.length + 2 : 4} style={{ textAlign: 'right', fontWeight: 800 }}>Grand Total</td>
                  <td className="td-cell"><strong>{grandTotal}/{grandMax}</strong></td>
                  <td className="td-cell"><span className="grade-badge overall">{overallGrade}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .result-summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: center;
        }
        .result-summary-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .rsc-icon {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rsc-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .rsc-value { font-size: 1.4rem; font-weight: 800; margin-top: 2px; }

        .download-marksheet-btn {
          height: fit-content;
          padding: 14px 24px;
          justify-self: center;
        }

        .th-cell {
          padding: 14px 16px;
          text-align: center;
          background: var(--bg-input);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid var(--border);
        }
        .td-cell {
          padding: 14px 16px;
          text-align: center;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }
        .tr-row:hover { background: var(--bg-hover); }
        .total-row { background: var(--bg-input); }
        .total-row .td-cell { border-bottom: none; }

        .grade-badge {
          background: var(--grad-primary);
          color: white;
          padding: 4px 14px;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 0.8rem;
        }
        .grade-badge.overall {
          background: linear-gradient(135deg, #10b981, #059669);
          font-size: 0.9rem;
          padding: 6px 16px;
        }

        @media (max-width: 768px) {
          .result-summary-cards { grid-template-columns: 1fr 1fr; }
          .download-marksheet-btn { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .result-summary-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Results;
