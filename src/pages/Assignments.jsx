import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Upload, Plus, Trash2, Send, FileText, Clock, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const Assignments = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [assignments, setAssignments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(user?.subject || 'Mathematics');
  const [newDesc, setNewDesc] = useState('');
  const [newStandard, setNewStandard] = useState('5th');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFileBase64, setNewFileBase64] = useState('');
  const [newFileName, setNewFileName] = useState('');

  // Submit form
  const [submitContent, setSubmitContent] = useState('');
  const [submitFileBase64, setSubmitFileBase64] = useState('');
  const [submitFileName, setSubmitFileName] = useState('');

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      let url = '/api/assignments';
      if (isStudent && user?.standard) url += `?standard=${user.standard}`;
      if (isTeacher) url += `?teacherId=${user.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setAssignments(data.reverse());
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          description: newDesc,
          standard: newStandard,
          dueDate: newDueDate,
          teacherId: user.id,
          teacherName: user.name,
          fileBase64: newFileBase64,
          fileName: newFileName
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Assignment posted successfully!');
        setShowCreateModal(false);
        setNewTitle(''); setNewDesc(''); setNewDueDate('');
        fetchAssignments();
      }
    } catch (e) {
      showToast('Failed to post assignment', 'error');
    }
  };

  const handleSubmit = async (assignmentId) => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          content: submitContent,
          fileName: submitFileName || 'submission.txt',
          fileBase64: submitFileBase64
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Assignment submitted!');
        setShowSubmitModal(null);
        setSubmitContent(''); setSubmitFileName('');
        fetchAssignments();
      }
    } catch (e) {
      showToast('Submission failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      showToast('Assignment deleted');
      fetchAssignments();
    } catch (e) {
      showToast('Delete failed', 'error');
    }
  };

  const getSubmissionStatus = (asm) => {
    if (!isStudent) return null;
    return asm.submissions?.find(s => s.studentId === user?.id);
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h1>{isTeacher ? 'Post & Manage Assignments' : isAdmin ? 'All Assignments' : 'My Assignments'}</h1>
          <p>{isTeacher ? 'Create assignments for your classes' : 'View and submit your assignments'}</p>
        </div>
        {(isTeacher || isAdmin) && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18}/> New Assignment
          </button>
        )}
      </div>

      <div className="assignments-list">
        {assignments.length === 0 && (
          <div className="empty-state glass-card">
            <FileText size={48} color="var(--text-muted)" />
            <h3>No Assignments</h3>
            <p>{isTeacher ? 'Post your first assignment to get started.' : 'No assignments have been posted for your class yet.'}</p>
          </div>
        )}

        {assignments.map((asm) => {
          const submission = getSubmissionStatus(asm);
          const isPastDue = new Date(asm.dueDate) < new Date();
          
          return (
            <motion.div 
              key={asm.id} 
              className="assignment-card glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="asm-header">
                <div className="asm-icon-wrap">
                  <BookOpen size={22}/>
                </div>
                <div className="asm-meta">
                  <h3>{asm.title}</h3>
                  <span>{asm.subject} • {asm.teacherName} • Class {asm.standard}</span>
                </div>
                <div className="asm-badges">
                  {submission ? (
                    <span className="status-pill submitted"><CheckCircle size={14}/> Submitted</span>
                  ) : isPastDue ? (
                    <span className="status-pill overdue">Overdue</span>
                  ) : (
                    <span className="status-pill pending"><Clock size={14}/> Pending</span>
                  )}
                </div>
              </div>
              
              {asm.description && (
                <p className="asm-description">{asm.description}</p>
              )}
              {asm.fileBase64 && (
                <a href={asm.fileBase64} download={asm.fileName} className="btn btn-secondary btn-sm mb-4" style={{display: 'inline-flex'}}>
                  <FileText size={14}/> Download Question PDF
                </a>
              )}

              <div className="asm-footer">
                <div className="due-info">
                  <Clock size={15}/>
                  <span>Due: <strong>{new Date(asm.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                </div>

                <div className="asm-actions">
                  {isStudent && !submission && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(asm.id)}>
                      <Upload size={15}/> Submit
                    </button>
                  )}
                  {isStudent && submission && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowSubmitModal(asm.id)}>
                      <Upload size={15}/> Re-submit
                    </button>
                  )}
                  {(isTeacher || isAdmin) && (
                    <>
                      <span className="submission-count">
                        {asm.submissions?.length || 0} submissions
                      </span>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(asm.id)}>
                        <Trash2 size={15}/>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {(isTeacher || isAdmin) && asm.submissions?.length > 0 && (
                <div className="submissions-preview">
                  <h4>Recent Submissions:</h4>
                  {asm.submissions.slice(-3).map((sub, i) => (
                    <div key={i} className="sub-item">
                      <div style={{display:'flex', flexDirection:'column'}}>
                        <span className="sub-name">{sub.studentName}</span>
                        <span className="sub-date">{new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
                      </div>
                      {sub.fileBase64 && (
                        <a href={sub.fileBase64} download={sub.fileName} className="badge badge-success" style={{alignSelf:'center', color:'white', background:'#10b981', padding:'4px 8px', borderRadius:'4px'}}>PDF</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>📝 Create New Assignment</h3>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Assignment title" required />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Class</label>
                    <select value={newStandard} onChange={e => setNewStandard(e.target.value)}>
                      {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the assignment..." rows={3}></textarea>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Attach PDF (Optional)</label>
                  <input type="file" accept=".pdf" onChange={async e => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewFileName(file.name);
                      setNewFileBase64(await toBase64(file));
                    }
                  }} />
                </div>
                <button type="submit" className="btn btn-primary w-full"><Send size={16}/> Post Assignment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(null)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>📤 Submit Assignment</h3>
                <button className="close-btn" onClick={() => setShowSubmitModal(null)}><X size={20}/></button>
              </div>
              <div className="form-group">
                <label>Your Answer / Notes</label>
                <textarea 
                  value={submitContent} 
                  onChange={e => setSubmitContent(e.target.value)} 
                  placeholder="Write your answer or paste your work here..."
                  rows={5}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Upload PDF Answer (Optional)</label>
                <input type="file" accept=".pdf" onChange={async e => {
                  const file = e.target.files[0];
                  if (file) {
                    setSubmitFileName(file.name);
                    setSubmitFileBase64(await toBase64(file));
                  }
                }} />
              </div>
              <button className="btn btn-primary w-full" onClick={() => handleSubmit(showSubmitModal)}>
                <Upload size={16}/> Submit Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {toast.type === 'success' ? <CheckCircle size={18}/> : null}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .assignments-list { display: flex; flex-direction: column; gap: 20px; }

        .assignment-card { padding: 28px; }

        .asm-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        
        .asm-icon-wrap {
          width: 46px;
          height: 46px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .asm-meta { flex: 1; }
        .asm-meta h3 { font-size: 1.05rem; margin-bottom: 4px; }
        .asm-meta span { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

        .asm-description { 
          color: var(--text-muted); 
          font-size: 0.9rem; 
          margin-bottom: 16px;
          padding: 12px 16px;
          background: var(--bg-input);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--primary);
        }

        .asm-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .due-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .asm-actions { display: flex; align-items: center; gap: 10px; }

        .submission-count {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          padding: 4px 12px;
          background: var(--bg-input);
          border-radius: var(--radius-full);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: var(--radius-full);
        }
        .status-pill.pending { background: #fef3c7; color: #92400e; }
        .status-pill.submitted { background: #d1fae5; color: #065f46; }
        .status-pill.overdue { background: #fee2e2; color: #b91c1c; }

        .submissions-preview {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .submissions-preview h4 { font-size: 0.85rem; margin-bottom: 10px; color: var(--text-muted); }
        .sub-item { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-input); border-radius: var(--radius-sm); margin-bottom: 6px; }
        .sub-name { font-weight: 600; font-size: 0.85rem; }
        .sub-date { font-size: 0.75rem; color: var(--text-muted); }

        .empty-state {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-state h3 { font-size: 1.2rem; }
        .empty-state p { color: var(--text-muted); }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .close-btn { background: none; color: var(--text-muted); padding: 4px; }
        .close-btn:hover { color: var(--text-main); }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; }
          .asm-header { flex-wrap: wrap; }
          .asm-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
          .form-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Assignments;
