import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Briefcase, BookOpen, TrendingUp, FileText, Bell, Plus, Trash2, Save, Send, MessageSquare, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ students: 0, teachers: 0, assignments: 0, totalUsers: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // States for features
  const [events, setEvents] = useState([]);
  const [infra, setInfra] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [results, setResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [ttRows, setTtRows] = useState(Array(8).fill({ time: '', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' }));
  const [gallery, setGallery] = useState([]);
  const [notices, setNotices] = useState([]);
  const [ttStandard, setTtStandard] = useState('');
  const [feeConfigs, setFeeConfigs] = useState([]);
  const [currentFeeConfig, setCurrentFeeConfig] = useState({ standard: '', tuitionFee: 0, examFee: 0, libraryFee: 0, sportsFee: 0 });

  // Subject Management
  const [subjectStandard, setSubjectStandard] = useState('5th');
  const [classSubjects, setClassSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

  // Marks Structure
  const [msStandard, setMsStandard] = useState('5th');
  const [msSubjects, setMsSubjects] = useState([]);
  const [msSubject, setMsSubject] = useState('');
  const [msComponents, setMsComponents] = useState([{ name: 'Internal', maxMarks: 20 }, { name: 'Theory', maxMarks: 80 }]);

  // SMS
  const [smsType, setSmsType] = useState('class');
  const [smsRecipient, setSmsRecipient] = useState('5th');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsLog, setSmsLog] = useState([]);

  // Password Override
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');

  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchInfra();
    fetchTimetables();
    fetchResults();
    fetchGallery();
    fetchNotices();
    fetchFeeConfigs();
  }, []);

  useEffect(() => {
    fetchClassSubjects();
  }, [subjectStandard]);

  useEffect(() => {
    fetchMsSubjects();
  }, [msStandard]);

  useEffect(() => {
    if (msSubject) fetchMarksStructure();
  }, [msSubject, msStandard]);

  useEffect(() => {
    if (activeTab === 'SMS') fetchSmsLog();
  }, [activeTab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const [sRes, tRes, uRes, aRes] = await Promise.all([
        fetch('/api/students'), fetch('/api/teachers'), fetch('/api/users'), fetch('/api/assignments')
      ]);
      const s = await sRes.json(); const t = await tRes.json();
      const u = await uRes.json(); const a = await aRes.json();
      setStats({ students: s.length, teachers: t.length, totalUsers: u.length, assignments: a.length });
      setAllUsers(u);
      setRecentUsers(u.slice(-5).reverse());
    } catch (e) {}
  };

  const fetchEvents = () => fetch('/api/events').then(r => r.json()).then(setEvents).catch(()=>{});
  const fetchInfra = () => fetch('/api/infrastructure').then(r => r.json()).then(setInfra).catch(()=>{});
  const fetchTimetables = () => fetch('/api/timetables').then(r => r.json()).then(setTimetables).catch(()=>{});
  const fetchResults = () => fetch('/api/results').then(r => r.json()).then(setResults).catch(()=>{});
  const fetchGallery = () => fetch('/api/gallery').then(r => r.json()).then(setGallery).catch(()=>{});
  const fetchNotices = () => fetch('/api/notices').then(r => r.json()).then(setNotices).catch(()=>{});
  const fetchFeeConfigs = () => fetch('/api/fee-config').then(r => r.json()).then(setFeeConfigs).catch(()=>{});
  const fetchSmsLog = () => fetch('/api/sms/log').then(r => r.json()).then(setSmsLog).catch(()=>{});
  
  const fetchClassSubjects = () => {
    fetch(`/api/subjects?standard=${subjectStandard}`)
      .then(r => r.json())
      .then(data => setClassSubjects(data.subjects || []))
      .catch(() => {});
  };

  const fetchMsSubjects = () => {
    fetch(`/api/subjects?standard=${msStandard}`)
      .then(r => r.json())
      .then(data => setMsSubjects(data.subjects || []))
      .catch(() => {});
  };

  const fetchMarksStructure = () => {
    fetch(`/api/marks-structure?standard=${msStandard}&subject=${msSubject}`)
      .then(r => r.json())
      .then(data => setMsComponents(data.components || [{ name: 'Internal', maxMarks: 20 }, { name: 'Theory', maxMarks: 80 }]))
      .catch(() => {});
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // --- Home Content Handlers ---
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.get('title'), description: formData.get('description') })
    });
    fetchEvents(); e.target.reset();
    showToast('Event added to Home Page!');
  };

  const handleAddInfra = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/infrastructure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name'), quantity: formData.get('quantity'), status: formData.get('status') })
    });
    fetchInfra(); e.target.reset();
    showToast('Infrastructure added!');
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/notices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.get('title'), content: formData.get('content'), tag: formData.get('tag') })
    });
    fetchNotices(); e.target.reset();
    showToast('Notice published!');
  };

  const handleDeleteUser = async (id) => { if (!confirm('Remove this user?')) return; await fetch(`/api/users/${id}`, { method: 'DELETE' }); fetchStats(); showToast('User removed'); };
  const handleDeleteEvent = async (id) => { await fetch(`/api/events/${id}`, { method: 'DELETE' }); fetchEvents(); showToast('Event removed'); };
  const handleDeleteInfra = async (id) => { await fetch(`/api/infrastructure/${id}`, { method: 'DELETE' }); fetchInfra(); showToast('Infrastructure removed'); };
  const handleDeleteNotice = async (id) => { await fetch(`/api/notices/${id}`, { method: 'DELETE' }); fetchNotices(); showToast('Notice removed'); };

  // --- Fee Config ---
  const handleFeeConfigChange = (e) => { const { name, value } = e.target; setCurrentFeeConfig(prev => ({ ...prev, [name]: value })); };
  const handleLoadFeeConfig = (standard) => {
    const config = feeConfigs.find(c => c.standard === standard);
    setCurrentFeeConfig(config || { standard, tuitionFee: 0, examFee: 0, libraryFee: 0, sportsFee: 0 });
  };
  const handleSaveFeeConfig = async (e) => {
    e.preventDefault();
    await fetch('/api/fee-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentFeeConfig) });
    fetchFeeConfigs(); showToast(`Fee structure for ${currentFeeConfig.standard} Std saved!`);
  };

  // --- Timetable ---
  const handleTtChange = (index, field, value) => { const n = [...ttRows]; n[index] = { ...n[index], [field]: value }; setTtRows(n); };
  const handleSaveTimetable = async (e) => {
    e.preventDefault();
    if (!ttStandard) { showToast('Please select a class!', 'error'); return; }
    const schedule = ttRows.map(row => ({ time: row.time || '00:00', mon: row.mon || '-', tue: row.tue || '-', wed: row.wed || '-', thu: row.thu || '-', fri: row.fri || '-', sat: row.sat || '-' }));
    await fetch('/api/timetables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standard: ttStandard, schedule }) });
    fetchTimetables(); showToast(`Timetable for ${ttStandard} Std updated!`);
  };
  const handleLoadExistingTt = async (standard) => {
    setTtStandard(standard);
    if (!standard) return;
    try { const res = await fetch(`/api/timetables?standard=${standard}`); const data = await res.json(); setTtRows(data?.schedule?.length > 0 ? data.schedule : Array(8).fill({ time: '', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' })); } catch(e) {}
  };

  // --- Results ---
  const handlePublishResults = async (standard) => {
    await fetch('/api/results/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standard }) });
    fetchResults(); showToast(`Results for ${standard} Std published!`);
  };

  // --- Gallery ---
  const handleAddGallery = async (e) => {
    e.preventDefault();
    const file = e.target.elements.image.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    const formData = new FormData(e.target);
    await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formData.get('title'), imageBase64: base64 }) });
    fetchGallery(); e.target.reset(); showToast('Image added!');
  };
  const handleDeleteGallery = async (id) => { if(!confirm('Delete?')) return; await fetch(`/api/gallery/${id}`, { method: 'DELETE' }); fetchGallery(); showToast('Image removed.'); };

  // --- Subject Management ---
  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (classSubjects.includes(newSubject.trim())) { showToast('Subject already exists', 'error'); return; }
    setClassSubjects([...classSubjects, newSubject.trim()]);
    setNewSubject('');
  };

  const handleRemoveSubject = (sub) => {
    setClassSubjects(classSubjects.filter(s => s !== sub));
  };

  const handleSaveSubjects = async () => {
    await fetch('/api/subjects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard: subjectStandard, subjects: classSubjects })
    });
    showToast(`Subjects for ${subjectStandard} Std saved!`);
  };

  // --- Marks Structure ---
  const handleAddComponent = () => {
    setMsComponents([...msComponents, { name: '', maxMarks: 0 }]);
  };
  const handleRemoveComponent = (idx) => {
    setMsComponents(msComponents.filter((_, i) => i !== idx));
  };
  const handleComponentChange = (idx, field, value) => {
    const n = [...msComponents];
    n[idx] = { ...n[idx], [field]: field === 'maxMarks' ? parseInt(value) || 0 : value };
    setMsComponents(n);
  };
  const handleSaveMarksStructure = async () => {
    if (!msSubject) { showToast('Select a subject first', 'error'); return; }
    if (msComponents.some(c => !c.name || c.maxMarks <= 0)) { showToast('Fill all component details', 'error'); return; }
    await fetch('/api/marks-structure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard: msStandard, subject: msSubject, components: msComponents })
    });
    showToast(`Marks structure for ${msSubject} (${msStandard}) saved!`);
  };

  // --- SMS ---
  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!smsMessage.trim()) { showToast('Enter a message', 'error'); return; }
    const payload = { message: smsMessage, type: smsType };
    if (smsType === 'individual') payload.to = smsPhone;
    if (smsType === 'class') payload.recipients = smsRecipient;
    
    const res = await fetch('/api/sms/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      setSmsMessage('');
      fetchSmsLog();
    } else {
      showToast(data.message, 'error');
    }
  };

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    if (!adminNewPassword || adminNewPassword.length < 4) {
      showToast('Password must be at least 4 chars', 'error');
      return;
    }
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: changingPasswordUser.id, newPassword: adminNewPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      setChangingPasswordUser(null);
      setAdminNewPassword('');
    } else {
      showToast(data.message, 'error');
    }
  };

  // --- PDF Report ---
  const generateAttendancePDF = async (standard) => {
    try {
      const res = await fetch(`/api/attendance?standard=${standard}`);
      const data = await res.json();
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text(`Attendance Report - ${standard} Standard`, 14, 22);
      doc.setFontSize(11); doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      const tableData = data.map(record => [record.date, record.studentName, record.status, record.teacherName]);
      autoTable(doc, { startY: 36, head: [['Date', 'Student Name', 'Status', 'Marked By']], body: tableData });
      doc.save(`Attendance_${standard}_Std.pdf`);
      showToast('PDF downloaded!');
    } catch (e) { showToast('Error generating PDF', 'error'); }
  };

  const tabs = ['Overview', 'Users', 'Subjects', 'Marks Config', 'Home Content', 'Gallery', 'Timetable', 'Results', 'Fees Setup', 'SMS', 'Reports'];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Administrator Control Center</h1>
        <p>System-wide overview and management.</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="tab-pane animate-fade-in">
          <div className="stats-grid">
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-primary)' }}><Users size={24}/></div>
              <div className="stat-content"><span className="stat-label">Total Users</span><h3 className="stat-value">{stats.totalUsers || 0}</h3></div>
            </motion.div>
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-fresh)' }}><GraduationCap size={24}/></div>
              <div className="stat-content"><span className="stat-label">Students</span><h3 className="stat-value">{stats.students}</h3></div>
            </motion.div>
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-warm)' }}><Briefcase size={24}/></div>
              <div className="stat-content"><span className="stat-label">Teachers</span><h3 className="stat-value">{stats.teachers}</h3></div>
            </motion.div>
          </div>
          <section className="glass-card section-padded">
            <h3>👤 Recent Registrations</h3>
            <div className="mt-4">
              {recentUsers.length === 0 && <p className="empty-msg">No recent registrations.</p>}
              {recentUsers.map(u => (
                <div key={u.id} className="user-item-row">
                  <div>
                    <strong>{u.name}</strong> • <span className="text-muted">{u.role}</span>
                    <div style={{fontSize: '0.75rem', opacity: 0.7}}>{u.email}</div>
                  </div>
                  <div className="action-btns">
                    {u.role !== 'admin' && <button onClick={() => setChangingPasswordUser(u)} className="edit-btn">Change Pass</button>}
                    {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="del-btn">Remove</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* USERS MANAGEMENT */}
      {activeTab === 'Users' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>👥 System Users Management</h3>
            <div className="text-muted">Total: {allUsers.length} users</div>
          </div>
          <div className="user-management-table table-responsive">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} className="border-bottom">
                    <td className="p-4"><strong>{u.name}</strong></td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4"><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td className="p-4">
                      <div className="action-btns">
                        {u.role !== 'admin' && <button onClick={() => setChangingPasswordUser(u)} className="edit-btn">Change Pass</button>}
                        {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="del-btn">Remove</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS MANAGEMENT */}
      {activeTab === 'Subjects' && (
        <div className="tab-pane animate-fade-in">
          <div className="glass-card section-padded" style={{ maxWidth: '600px' }}>
            <h3>📚 Manage Subjects per Class</h3>
            <p className="text-muted mt-2 mb-6">Define what subjects are taught in each class. These subjects will be used for marks entry and notes.</p>
            
            <div className="form-group">
              <label>Select Standard</label>
              <select className="form-input" value={subjectStandard} onChange={e => setSubjectStandard(e.target.value)}>
                {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
              </select>
            </div>

            <div className="subject-list mt-6">
              <h4 className="mb-4">Subjects for {subjectStandard} Standard ({classSubjects.length})</h4>
              {classSubjects.map((sub, i) => (
                <div key={i} className="subject-item">
                  <span className="subject-pill">{sub}</span>
                  <button className="del-btn-sm" onClick={() => handleRemoveSubject(sub)}><Trash2 size={14}/></button>
                </div>
              ))}
              {classSubjects.length === 0 && <p className="empty-msg">No subjects defined yet.</p>}
            </div>

            <div className="add-subject-row mt-6">
              <input type="text" className="form-input" placeholder="New subject name..." value={newSubject} onChange={e => setNewSubject(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())} />
              <button className="btn btn-secondary" onClick={handleAddSubject}><Plus size={16}/> Add</button>
            </div>

            <button className="btn btn-primary w-full mt-6" onClick={handleSaveSubjects}>
              <Save size={16}/> Save Subjects for {subjectStandard} Std
            </button>
          </div>
        </div>
      )}

      {/* MARKS STRUCTURE CONFIG */}
      {activeTab === 'Marks Config' && (
        <div className="tab-pane animate-fade-in">
          <div className="glass-card section-padded" style={{ maxWidth: '700px' }}>
            <h3>⚙️ Marks Structure Configuration</h3>
            <p className="text-muted mt-2 mb-6">Define how marks are split for each subject. This replaces the fixed 20+80 system — you can define any number of components (e.g., Practical: 30, Written: 50, Viva: 20).</p>
            
            <div className="form-row-2 mb-6">
              <div className="form-group">
                <label>Select Standard</label>
                <select className="form-input" value={msStandard} onChange={e => { setMsStandard(e.target.value); setMsSubject(''); }}>
                  {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Subject</label>
                <select className="form-input" value={msSubject} onChange={e => setMsSubject(e.target.value)}>
                  <option value="">Choose Subject...</option>
                  {msSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {msSubject && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="mb-4">Components for {msSubject}</h4>
                <div className="components-list">
                  {msComponents.map((comp, i) => (
                    <div key={i} className="component-row">
                      <input type="text" className="form-input" placeholder="Component name (e.g. Practical)" value={comp.name} onChange={e => handleComponentChange(i, 'name', e.target.value)} />
                      <div className="max-marks-input">
                        <input type="number" className="form-input" placeholder="Max" min={1} value={comp.maxMarks || ''} onChange={e => handleComponentChange(i, 'maxMarks', e.target.value)} />
                        <span>marks</span>
                      </div>
                      <button className="del-btn-sm" onClick={() => handleRemoveComponent(i)}><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="component-total mt-4">
                  <span>Total Maximum Marks:</span>
                  <strong>{msComponents.reduce((s, c) => s + (parseInt(c.maxMarks) || 0), 0)}</strong>
                </div>
                <div className="mt-4" style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={handleAddComponent}><Plus size={16}/> Add Component</button>
                  <button className="btn btn-primary" onClick={handleSaveMarksStructure}><Save size={16}/> Save Structure</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* HOME CONTENT */}
      {activeTab === 'Home Content' && (
        <div className="tab-pane animate-fade-in admin-grid">
          <section className="glass-card section-padded">
            <h3>📢 Add Highlight/Event</h3>
            <form onSubmit={handleAddEvent} className="mt-4">
              <input type="text" name="title" placeholder="Event Title" required className="form-input" />
              <textarea name="description" placeholder="Event Description..." required className="form-input mt-4" rows="3"></textarea>
              <button type="submit" className="btn btn-primary mt-4 w-full">Add Event</button>
            </form>
            <div className="mt-6">
              <h4>Current Events:</h4>
              <div className="mt-2">
                {events.map(ev => (
                  <div key={ev.id} className="list-item-row">
                    <span>{ev.title}</span>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="del-btn">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="glass-card section-padded">
            <h3>🏗️ Manage Infrastructure</h3>
            <form onSubmit={handleAddInfra} className="mt-4">
              <input type="text" name="name" placeholder="Item Name" required className="form-input" />
              <input type="number" name="quantity" placeholder="Quantity" required className="form-input mt-4" />
              <select name="status" className="form-input mt-4"><option>Available</option><option>Under Maintenance</option></select>
              <button type="submit" className="btn btn-secondary w-full mt-4">Add Infrastructure</button>
            </form>
            <div className="mt-6">
              <h4>Current Items ({infra.length}):</h4>
              <div className="mt-2">
                {infra.map(i => (
                  <div key={i.id} className="list-item-row">
                    <span>{i.name} ({i.quantity})</span>
                    <button onClick={() => handleDeleteInfra(i.id)} className="del-btn">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="glass-card section-padded" style={{ gridColumn: '1 / -1' }}>
            <h3>📢 Manage Notices</h3>
            <form onSubmit={handleAddNotice} className="mt-4 notice-form">
              <input type="text" name="title" placeholder="Notice Title" required className="form-input" />
              <select name="tag" className="form-input"><option>Event</option><option>Academic</option><option>Meeting</option><option>Holiday</option></select>
              <textarea name="content" placeholder="Announcement content..." required className="form-input" style={{ gridColumn: '1 / -1', height: '80px' }}></textarea>
              <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Publish Notice</button>
            </form>
            <div className="mt-6 notices-grid">
              {notices.map(n => (
                <div key={n.id} className="notice-card">
                  <div className="notice-card-header">
                    <span className="badge-sm">{n.tag}</span>
                    <button onClick={() => handleDeleteNotice(n.id)} className="del-btn">Delete</button>
                  </div>
                  <h5 className="mt-2">{n.title}</h5>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{n.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* GALLERY */}
      {activeTab === 'Gallery' && (
        <div className="tab-pane animate-fade-in admin-grid">
          <section className="glass-card section-padded">
            <h3>🎬 Upload Scrolling Highlights</h3>
            <form onSubmit={handleAddGallery} className="mt-4">
              <div className="form-group"><label>Title</label><input type="text" name="title" placeholder="e.g. Science Fair 2026" required className="form-input" /></div>
              <div className="form-group mt-4"><label>Select Image</label><input type="file" name="image" accept="image/*" required className="form-input" /></div>
              <button type="submit" className="btn btn-primary mt-6 w-full">Upload</button>
            </form>
          </section>
          <section className="glass-card section-padded">
            <h3>🖼️ Current Highlights ({gallery.length})</h3>
            <div className="gallery-admin-grid mt-4">
              {gallery.map(img => (
                <div key={img.id} className="gallery-admin-item">
                  <img src={img.imageBase64} alt={img.title} />
                  <button onClick={() => handleDeleteGallery(img.id)} className="gallery-del-btn">✕</button>
                  <div className="gallery-title">{img.title}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TIMETABLE */}
      {activeTab === 'Timetable' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>📅 Manage Class Timetables</h3>
          <form onSubmit={handleSaveTimetable} className="mt-6">
            <div className="form-group mb-6">
              <label>Target Class</label>
              <select className="form-input" required style={{ maxWidth: '300px' }} value={ttStandard} onChange={(e) => handleLoadExistingTt(e.target.value)}>
                <option value="">Select Class...</option>
                {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
              </select>
            </div>
            <div className="timetable-builder">
              {ttRows.map((row, idx) => (
                <div key={idx} className="period-block">
                  <div className="period-header">
                    <span className="period-label">LECTURE {idx + 1}</span>
                    <input type="text" className="form-input" placeholder="Time (e.g. 08:30 - 09:15)" value={row.time} onChange={e => handleTtChange(idx, 'time', e.target.value)} required style={{ maxWidth: '200px' }} />
                  </div>
                  <div className="tt-day-grid">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                      <div key={day}>
                        <label className="tt-day-label">{day.toUpperCase()}</label>
                        <input type="text" className="form-input" placeholder="Subject" value={row[day]} onChange={e => handleTtChange(idx, day, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary mt-8" style={{ padding: '14px 40px' }}>Save Timetable</button>
          </form>
        </div>
      )}

      {/* FEES SETUP */}
      {activeTab === 'Fees Setup' && (
        <div className="tab-pane animate-fade-in">
          <div className="glass-card section-padded" style={{ maxWidth: '600px' }}>
            <h3>💳 Class-wise Fee Settings</h3>
            <form onSubmit={handleSaveFeeConfig} className="form-grid mt-6">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Select Standard</label>
                <select name="standard" className="form-input" required value={currentFeeConfig.standard} onChange={(e) => handleLoadFeeConfig(e.target.value)}>
                  <option value="">Choose Class...</option>
                  {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
                </select>
              </div>
              <div className="form-group"><label>Tuition Fee (₹)</label><input type="number" name="tuitionFee" value={currentFeeConfig.tuitionFee} onChange={handleFeeConfigChange} required className="form-input" /></div>
              <div className="form-group"><label>Exam Fee (₹)</label><input type="number" name="examFee" value={currentFeeConfig.examFee} onChange={handleFeeConfigChange} required className="form-input" /></div>
              <div className="form-group"><label>Library Fee (₹)</label><input type="number" name="libraryFee" value={currentFeeConfig.libraryFee} onChange={handleFeeConfigChange} required className="form-input" /></div>
              <div className="form-group"><label>Sports Fee (₹)</label><input type="number" name="sportsFee" value={currentFeeConfig.sportsFee} onChange={handleFeeConfigChange} required className="form-input" /></div>
              <div className="fee-total-box" style={{ gridColumn: '1 / -1' }}>
                Total Annual Fee: <span className="text-primary">₹{(parseFloat(currentFeeConfig.tuitionFee)||0) + (parseFloat(currentFeeConfig.examFee)||0) + (parseFloat(currentFeeConfig.libraryFee)||0) + (parseFloat(currentFeeConfig.sportsFee)||0)}</span>
              </div>
              <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Save Fee Structure</button>
            </form>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {activeTab === 'Results' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>✅ Publish Exam Results</h3>
          <p className="text-muted">Students cannot see results until published.</p>
          <div className="class-publish-list mt-6">
            {STANDARDS.map(std => {
              const classResults = results.filter(r => r.standard === std);
              const isPublished = classResults.length > 0 && classResults[0].published;
              return (
                <div key={std} className="publish-row">
                  <span><strong>{std} Standard</strong> • {classResults.length} records</span>
                  {isPublished ? <span className="badge-success">Published</span> : <button className="btn btn-success btn-sm" onClick={() => handlePublishResults(std)}>Publish Now</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SMS PANEL */}
      {activeTab === 'SMS' && (
        <div className="tab-pane animate-fade-in admin-grid">
          <section className="glass-card section-padded">
            <h3><MessageSquare size={20}/> Send SMS</h3>
            <p className="text-muted mt-2 mb-6">Send custom messages to students and parents.</p>
            <form onSubmit={handleSendSms}>
              <div className="form-group">
                <label>Recipient Type</label>
                <select className="form-input" value={smsType} onChange={e => setSmsType(e.target.value)}>
                  <option value="individual">Individual (Phone Number)</option>
                  <option value="class">Entire Class</option>
                  <option value="all">All Students</option>
                </select>
              </div>
              {smsType === 'individual' && (
                <div className="form-group mt-4">
                  <label>Phone Number</label>
                  <input type="tel" className="form-input" placeholder="Enter phone number" value={smsPhone} onChange={e => setSmsPhone(e.target.value)} required />
                </div>
              )}
              {smsType === 'class' && (
                <div className="form-group mt-4">
                  <label>Select Class</label>
                  <select className="form-input" value={smsRecipient} onChange={e => setSmsRecipient(e.target.value)}>
                    {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
                  </select>
                </div>
              )}
              <div className="form-group mt-4">
                <label>Message</label>
                <textarea className="form-input" placeholder="Type your message here..." value={smsMessage} onChange={e => setSmsMessage(e.target.value)} rows={4} required />
              </div>
              <div className="btn-group-row mt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  <Send size={16}/> Send SMS
                </button>
                <button 
                  type="button" 
                  className="btn btn-whatsapp flex-1"
                  onClick={() => {
                    if (!smsMessage.trim()) return alert('Enter message');
                    let phone = smsPhone;
                    if (smsType === 'class' || smsType === 'all') {
                      alert('WhatsApp bulk send is only available for individual selection. For class/all, please use individual selection or the SMS System.');
                      return;
                    }
                    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(smsMessage)}`, '_blank');
                  }}
                >
                  <MessageSquare size={16}/> WhatsApp
                </button>
              </div>
            </form>
          </section>
          <section className="glass-card section-padded">
            <h3>📋 SMS Log (Recent)</h3>
            <div className="sms-log mt-4">
              {smsLog.length === 0 && <p className="empty-msg">No messages sent yet.</p>}
              {smsLog.slice(0, 20).map((log, i) => (
                <div key={i} className="sms-log-item">
                  <div className="sms-log-meta">
                    <span className="sms-to">To: {log.to}</span>
                    <span className="sms-time">{new Date(log.sentAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="sms-log-msg">{log.message}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === 'Reports' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>📄 Download Attendance Reports (PDF)</h3>
          <p className="text-muted mt-2">Select a class to generate a PDF report.</p>
          <div className="report-btns mt-6">
            {STANDARDS.map(std => (
              <button key={std} className="btn btn-secondary" onClick={() => generateAttendancePDF(std)}>
                <FileText size={16}/> {std} Std Report
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin Change Password Modal */}
      <AnimatePresence>
        {changingPasswordUser && (
          <div className="modal-overlay" onClick={() => setChangingPasswordUser(null)}>
            <motion.div 
              className="modal-content" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3>Change Password for {changingPasswordUser.name}</h3>
              <p className="text-muted mb-4">Set a new password for this {changingPasswordUser.role}.</p>
              <form onSubmit={handleAdminChangePassword}>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter new password" 
                    value={adminNewPassword}
                    onChange={e => setAdminNewPassword(e.target.value)}
                    required
                    minLength={4}
                    autoFocus
                  />
                </div>
                <div className="mt-6" style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setChangingPasswordUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Update Password</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
          {toast.msg}
        </motion.div>}
      </AnimatePresence>

      <style>{`
        .admin-tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tab-btn { background: none; border: none; padding: 8px 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: var(--radius-sm); white-space: nowrap; font-size: 0.85rem; transition: all 0.2s; }
        .tab-btn:hover { color: var(--primary); background: var(--bg-hover); }
        .tab-btn.active { background: var(--bg-hover); color: var(--primary); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .stat-card { padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .stat-value { font-size: 1.3rem; font-weight: 800; display: block; margin-top: 2px; }
        .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .section-padded { padding: 28px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-input); color: var(--text-main); font-family: inherit; font-size: 0.9rem; }
        .form-input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .notice-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .user-item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border); }
        .action-btns { display: flex; gap: 12px; }
        .list-item-row { display: flex; justify-content: space-between; padding: 10px; background: var(--bg-input); border-radius: 8px; margin-bottom: 8px; }
        .del-btn { color: #ef4444; background: none; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
        .edit-btn { color: var(--primary); background: none; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
        .del-btn-sm { color: #ef4444; background: none; border: none; cursor: pointer; padding: 4px; }
        
        /* Table styles */
        table { border-collapse: collapse; }
        .border-bottom { border-bottom: 1px solid var(--border); }
        .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .role-badge.student { background: rgba(96, 165, 250, 0.15); color: #2563eb; }
        .role-badge.teacher { background: rgba(168, 85, 247, 0.15); color: #7c3aed; }
        .role-badge.admin { background: rgba(245, 158, 11, 0.15); color: #d97706; }

        .publish-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 12px; }
        .badge-success { background: #10b981; color: white; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700; }
        .badge-sm { background: var(--primary); color: white; font-size: 0.6rem; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 800; }
        .report-btns { display: flex; gap: 12px; flex-wrap: wrap; }

        /* Subject Management */
        .subject-list { display: flex; flex-direction: column; gap: 8px; }
        .subject-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border); }
        .subject-pill { font-weight: 700; font-size: 0.9rem; }
        .add-subject-row { display: flex; gap: 8px; }
        .add-subject-row input { flex: 1; }

        /* Marks Structure */
        .components-list { display: flex; flex-direction: column; gap: 10px; }
        .component-row { display: flex; gap: 10px; align-items: center; }
        .component-row .form-input:first-child { flex: 2; }
        .max-marks-input { display: flex; align-items: center; gap: 6px; flex: 1; }
        .max-marks-input input { flex: 1; }
        .max-marks-input span { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
        .component-total { display: flex; justify-content: space-between; padding: 12px 16px; background: rgba(99, 102, 241, 0.06); border-radius: var(--radius-sm); }
        .component-total strong { font-size: 1.1rem; color: var(--primary); }

        /* Gallery */
        .gallery-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
        .gallery-admin-item { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
        .gallery-admin-item img { width: 100%; height: 100px; object-fit: cover; }
        .gallery-del-btn { position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 0.7rem; cursor: pointer; }
        .gallery-title { font-size: 0.65rem; padding: 4px; color: var(--text-muted); text-align: center; }

        /* Timetable */
        .timetable-builder { display: flex; flex-direction: column; gap: 24px; }
        .period-block { padding: 20px; background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border); }
        .period-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .period-label { font-weight: 800; color: var(--primary); font-size: 0.9rem; }
        .tt-day-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
        .tt-day-label { font-size: 0.75rem; font-weight: 700; opacity: 0.6; display: block; margin-bottom: 4px; }

        /* Fee */
        .fee-total-box { padding: 16px; background: var(--bg-input); border-radius: var(--radius-md); text-align: right; font-size: 1.1rem; font-weight: 800; }

        /* Notices */
        .notices-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
        .notice-card { padding: 16px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border); }
        .notice-card-header { display: flex; justify-content: space-between; align-items: start; }

        /* SMS */
        .sms-log { display: flex; flex-direction: column; gap: 12px; max-height: 500px; overflow-y: auto; }
        .sms-log-item { padding: 12px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border); }
        .sms-log-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .sms-to { font-weight: 700; font-size: 0.85rem; }
        .sms-time { font-size: 0.7rem; color: var(--text-muted); }
        .sms-log-msg { font-size: 0.82rem; color: var(--text-muted); }

        .btn-whatsapp { background: #25d366; color: white; border: none; }
        .btn-whatsapp:hover { background: #128c7e; }
        .btn-group-row { display: flex; gap: 12px; }
        .flex-1 { flex: 1; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
        .modal-content { background: var(--bg-card); padding: 32px; border-radius: var(--radius-lg); width: 100%; max-width: 450px; box-shadow: var(--shadow-premium); border: 1px solid var(--border); }

        @media (max-width: 768px) {
          .admin-grid { grid-template-columns: 1fr; }
          .form-row-2, .form-grid, .notice-form { grid-template-columns: 1fr; }
          .tt-day-grid { grid-template-columns: 1fr; }
          .component-row { flex-direction: column; align-items: stretch; }
          .add-subject-row { flex-direction: column; }
          .tab-btn { padding: 6px 10px; font-size: 0.78rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
