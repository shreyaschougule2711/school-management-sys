import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Download, Eye, Trash2, BookOpen, Filter, Search, File, Image, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const Notes = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const [notes, setNotes] = useState([]);
  const [filterStandard, setFilterStandard] = useState(isStudent ? (user?.standard || '') : '');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [toast, setToast] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '', description: '', standard: '5th', subject: '', fileName: '', fileType: '', fileBase64: ''
  });

  useEffect(() => {
    fetchNotes();
  }, [filterStandard, filterSubject]);

  useEffect(() => {
    if (filterStandard) {
      fetch(`/api/subjects?standard=${filterStandard}`)
        .then(r => r.json())
        .then(data => setSubjects(data.subjects || []))
        .catch(() => {});
    }
  }, [filterStandard]);

  const fetchNotes = () => {
    let url = '/api/notes?';
    if (filterStandard) url += `standard=${filterStandard}&`;
    if (filterSubject) url += `subject=${filterSubject}&`;
    fetch(url).then(r => r.json()).then(setNotes).catch(() => {});
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('File size must be under 20MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadData(prev => ({
        ...prev,
        fileName: file.name,
        fileType: file.type,
        fileBase64: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.fileBase64) {
      showToast('Please select a file', 'error');
      return;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadData,
          teacherId: user.id,
          teacherName: user.name
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Note uploaded successfully!');
        setShowUpload(false);
        setUploadData({ title: '', description: '', standard: '5th', subject: '', fileName: '', fileType: '', fileBase64: '' });
        fetchNotes();
      }
    } catch (e) {
      showToast('Upload failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
    showToast('Note deleted');
  };

  const handlePreview = async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      const data = await res.json();
      setPreviewNote(data);
    } catch (e) {
      showToast('Failed to load note', 'error');
    }
  };

  const handleDownload = async (noteId, fileName) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      const data = await res.json();
      const link = document.createElement('a');
      link.href = data.fileBase64;
      link.download = fileName;
      link.click();
      showToast('Download started!');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('doc')) return '📝';
    return '📎';
  };

  const getFileTypeLabel = (fileType) => {
    if (fileType?.includes('pdf')) return 'PDF';
    if (fileType?.includes('png')) return 'PNG';
    if (fileType?.includes('jpeg') || fileType?.includes('jpg')) return 'JPG';
    if (fileType?.includes('word') || fileType?.includes('doc')) return 'DOC';
    return 'FILE';
  };

  const filteredNotes = notes.filter(n => 
    !searchQuery || 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1>📚 Study Notes</h1>
          <p>{isTeacher ? 'Upload and manage notes for your students' : 'Access notes shared by your teachers'}</p>
        </div>
        {(isTeacher || isAdmin) && (
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <Upload size={18}/> Upload Note
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="notes-filters glass-card">
        <div className="filter-group">
          <Filter size={16}/>
          <select value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
            <option value="">All Classes</option>
            {STANDARDS.map(s => <option key={s} value={s}>{s} Std</option>)}
          </select>
        </div>
        {subjects.length > 0 && (
          <div className="filter-group">
            <BookOpen size={16}/>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="filter-group search-filter">
          <Search size={16}/>
          <input type="text" placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state glass-card">
            <FileText size={48} color="var(--text-muted)" />
            <h3>No Notes Found</h3>
            <p>No notes available for the selected filters.</p>
          </div>
        ) : (
          filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              className="note-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="note-type-badge">{getFileTypeLabel(note.fileType)}</div>
              <div className="note-icon">{getFileIcon(note.fileType)}</div>
              <h3 className="note-title">{note.title}</h3>
              {note.description && <p className="note-desc">{note.description}</p>}
              <div className="note-meta">
                <span className="note-class">{note.standard} Std</span>
                <span className="note-subject">{note.subject}</span>
              </div>
              <div className="note-teacher">
                By {note.teacherName} • {new Date(note.uploadedAt).toLocaleDateString('en-IN')}
              </div>
              <div className="note-actions">
                <button className="note-action-btn view" onClick={() => handlePreview(note.id)}>
                  <Eye size={16}/> View
                </button>
                <button className="note-action-btn download" onClick={() => handleDownload(note.id, note.fileName)}>
                  <Download size={16}/> Download
                </button>
                {(isTeacher && note.teacherId === user.id || isAdmin) && (
                  <button className="note-action-btn delete" onClick={() => handleDelete(note.id)}>
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '550px' }}>
              <div className="modal-header-row">
                <h3>📤 Upload Study Note</h3>
                <button className="modal-close" onClick={() => setShowUpload(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-input" placeholder="Note title" value={uploadData.title} onChange={e => setUploadData(p => ({...p, title: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea className="form-input" placeholder="Brief description..." value={uploadData.description} onChange={e => setUploadData(p => ({...p, description: e.target.value}))} rows={2} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Class</label>
                    <select className="form-input" value={uploadData.standard} onChange={e => setUploadData(p => ({...p, standard: e.target.value}))}>
                      {STANDARDS.map(s => <option key={s} value={s}>{s} Std</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" className="form-input" placeholder="Subject name" value={uploadData.subject} onChange={e => setUploadData(p => ({...p, subject: e.target.value}))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Select File (PDF, DOC, JPG, PNG)</label>
                  <div className="file-upload-zone">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                    {uploadData.fileName ? (
                      <div className="file-selected">
                        <File size={20}/>
                        <span>{uploadData.fileName}</span>
                      </div>
                    ) : (
                      <div className="file-placeholder">
                        <Upload size={24}/>
                        <span>Click or drag to upload</span>
                        <span className="file-hint">Max 20MB • PDF, DOC, JPG, PNG</span>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">Upload Note</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNote && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewNote(null)}>
            <motion.div className="modal-content preview-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3>{previewNote.title}</h3>
                <button className="modal-close" onClick={() => setPreviewNote(null)}><X size={20}/></button>
              </div>
              <div className="preview-body">
                {previewNote.fileType?.includes('pdf') ? (
                  <iframe src={previewNote.fileBase64} className="pdf-preview" title="PDF Preview" />
                ) : previewNote.fileType?.includes('image') ? (
                  <img src={previewNote.fileBase64} alt={previewNote.title} className="image-preview" />
                ) : (
                  <div className="no-preview">
                    <File size={48} color="var(--text-muted)"/>
                    <p>Preview not available for this file type.</p>
                    <button className="btn btn-primary mt-4" onClick={() => handleDownload(previewNote.id, previewNote.fileName)}>
                      <Download size={18}/> Download File
                    </button>
                  </div>
                )}
              </div>
              <div className="preview-footer">
                <button className="btn btn-primary" onClick={() => handleDownload(previewNote.id, previewNote.fileName)}>
                  <Download size={18}/> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
          {toast.msg}
        </motion.div>}
      </AnimatePresence>

      <style>{`
        .notes-page .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .notes-filters {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .filter-group select, .filter-group input {
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-main);
          font-size: 0.85rem;
        }
        .search-filter { flex: 1; min-width: 200px; }
        .search-filter input { width: 100%; }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }
        .empty-state h3 { margin-top: 16px; }
        .empty-state p { color: var(--text-muted); margin-top: 8px; }

        .note-card {
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .note-type-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.65rem;
          font-weight: 800;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }

        .note-icon { font-size: 2rem; }

        .note-title {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 4px;
          padding-right: 60px;
        }

        .note-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-meta {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .note-class, .note-subject {
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
        }
        .note-class { background: #e0e7ff; color: #4338ca; }
        .note-subject { background: #d1fae5; color: #065f46; }

        .note-teacher {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: auto;
          padding-top: 8px;
        }

        .note-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }

        .note-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          background: var(--bg-input);
          border: 1px solid var(--border);
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .note-action-btn.view:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary); border-color: var(--primary); }
        .note-action-btn.download:hover { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
        .note-action-btn.delete { flex: 0; padding: 8px 10px; }
        .note-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-close { background: none; color: var(--text-muted); }
        .modal-close:hover { color: var(--text-main); }

        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.9rem;
        }
        .form-input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }

        .file-upload-zone {
          position: relative;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: center;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .file-upload-zone:hover { border-color: var(--primary); }
        .file-upload-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .file-hint { font-size: 0.7rem; opacity: 0.7; }
        .file-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-weight: 600;
        }

        .preview-modal {
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .preview-body { flex: 1; min-height: 0; overflow: auto; }
        .pdf-preview { width: 100%; height: 500px; border: none; border-radius: 8px; }
        .image-preview { width: 100%; border-radius: 8px; }
        .no-preview { text-align: center; padding: 40px; }
        .no-preview p { color: var(--text-muted); margin-top: 12px; }
        .preview-footer { padding-top: 16px; border-top: 1px solid var(--border); margin-top: 16px; }

        @media (max-width: 768px) {
          .notes-grid { grid-template-columns: 1fr; }
          .form-row-2 { grid-template-columns: 1fr; }
          .notes-filters { flex-direction: column; }
          .filter-group { width: 100%; }
          .filter-group select, .filter-group input { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Notes;
