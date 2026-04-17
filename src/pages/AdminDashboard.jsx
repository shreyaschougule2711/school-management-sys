import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Settings, Briefcase, BookOpen, TrendingUp, Calendar, FileText, CheckSquare, Settings as SettingsIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ students: 0, teachers: 0, assignments: 0, totalUsers: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  
  // States for new features
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
    fetchEvents();
    e.target.reset();
    showToast('Event added to Home Page!');
  };

  const handleAddInfra = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/infrastructure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name'), quantity: formData.get('quantity'), status: formData.get('status') })
    });
    fetchInfra();
    e.target.reset();
    showToast('Infrastructure added!');
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/notices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.get('title'), content: formData.get('content'), tag: formData.get('tag') })
    });
    fetchNotices();
    e.target.reset();
    showToast('Notice published!');
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently remove this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchStats();
    showToast('User removed');
  };

  const handleDeleteEvent = async (id) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
    showToast('Event removed');
  };

  const handleDeleteInfra = async (id) => {
    await fetch(`/api/infrastructure/${id}`, { method: 'DELETE' });
    fetchInfra();
    showToast('Infrastructure removed');
  };

  const handleDeleteNotice = async (id) => {
    await fetch(`/api/notices/${id}`, { method: 'DELETE' });
    fetchNotices();
    showToast('Notice removed');
  };

  // --- Fee Config Handlers ---
  const handleFeeConfigChange = (e) => {
    const { name, value } = e.target;
    setCurrentFeeConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleLoadFeeConfig = (standard) => {
    const config = feeConfigs.find(c => c.standard === standard);
    if (config) {
      setCurrentFeeConfig(config);
    } else {
      setCurrentFeeConfig({ standard, tuitionFee: 0, examFee: 0, libraryFee: 0, sportsFee: 0 });
    }
  };

  const handleSaveFeeConfig = async (e) => {
    e.preventDefault();
    await fetch('/api/fee-config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentFeeConfig)
    });
    fetchFeeConfigs();
    showToast(`Fee structure for ${currentFeeConfig.standard} Std saved!`);
  };

  // --- Timetable Handlers ---
  const handleTtChange = (index, field, value) => {
    const newRows = [...ttRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setTtRows(newRows);
  };

  const handleSaveTimetable = async (e) => {
    e.preventDefault();
    const standard = ttStandard;
    if (!standard) { showToast('Please select a class!', 'error'); return; }
    
    const schedule = ttRows.map(row => ({
      time: row.time || '00:00',
      mon: row.mon || '-', tue: row.tue || '-', wed: row.wed || '-', thu: row.thu || '-', fri: row.fri || '-', sat: row.sat || '-'
    }));

    await fetch('/api/timetables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard, schedule })
    });
    fetchTimetables();
    showToast(`Timetable for ${standard} Std updated!`);
  };

  const handleLoadExistingTt = async (standard) => {
    setTtStandard(standard);
    if (!standard) return;
    try {
      const res = await fetch(`/api/timetables?standard=${standard}`);
      const data = await res.json();
      if (data && data.schedule && data.schedule.length > 0) {
        setTtRows(data.schedule);
      } else {
        setTtRows(Array(8).fill({ time: '', mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' }));
      }
    } catch(e) {}
  };

  // --- Results Handlers ---
  const handlePublishResults = async (standard) => {
    await fetch('/api/results/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard })
    });
    fetchResults();
    showToast(`Results for ${standard} Std published successfully!`);
  };

  // --- Attendance PDF Export ---
  const generateAttendancePDF = async (standard) => {
    try {
      const res = await fetch(`/api/attendance?standard=${standard}`);
      const data = await res.json();
      
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Attendance Report - ${standard} Standard`, 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      const tableData = data.map(record => [
        record.date, record.studentName, record.status, record.teacherName
      ]);

      autoTable(doc, {
        startY: 36,
        head: [['Date', 'Student Name', 'Status', 'Marked By']],
        body: tableData,
      });

      doc.save(`Attendance_${standard}_Std.pdf`);
      showToast('PDF downloaded successfully!');
    } catch (e) {
      showToast('Error generating PDF', 'error');
    }
  };

  // --- Gallery Handlers ---
  const handleAddGallery = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = e.target.elements.image.files[0];
    if (!file) return;
    
    const base64 = await toBase64(file);
    await fetch('/api/gallery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.get('title'), imageBase64: base64 })
    });
    fetchGallery();
    e.target.reset();
    showToast('Image added to scrolling highlights!');
  };

  const handleDeleteGallery = async (id) => {
    if(!confirm('Delete this image?')) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    fetchGallery();
    showToast('Image removed.');
  };

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Administrator Control Center</h1>
        <p>System-wide overview and management.</p>
      </div>

      <div className="admin-tabs">
        {['Overview', 'Home Content', 'Gallery', 'Timetable', 'Results', 'Fees Setup', 'Reports'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="tab-pane animate-fade-in">
          <div className="stats-grid">
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-primary)' }}><Users size={24}/></div>
              <div className="stat-content">
                <span className="stat-label">Total Users</span>
                <h3 className="stat-value">{stats.totalUsers || 0}</h3>
              </div>
            </motion.div>
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-fresh)' }}><GraduationCap size={24}/></div>
              <div className="stat-content">
                <span className="stat-label">Students</span>
                <h3 className="stat-value">{stats.students}</h3>
              </div>
            </motion.div>
            <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
              <div className="stat-icon" style={{ background: 'var(--grad-warm)' }}><Briefcase size={24}/></div>
              <div className="stat-content">
                <span className="stat-label">Teachers</span>
                <h3 className="stat-value">{stats.teachers}</h3>
              </div>
            </motion.div>
          </div>

          <div className="admin-grid">
            <section className="glass-card section-padded">
              <h3>👤 Recent Registrations</h3>
              <div className="recent-users-list mt-4">
                {recentUsers.length === 0 && <p className="empty-msg">No recent registrations.</p>}
                {recentUsers.map(u => (
                  <div key={u.id} className="user-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <strong>{u.name}</strong> • <span className="text-muted">{u.role}</span>
                    </div>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'Home Content' && (
        <div className="tab-pane animate-fade-in admin-grid">
          {/* Events Management */}
          <section className="glass-card section-padded">
            <h3>📢 Add Highlight/Event</h3>
            <form onSubmit={handleAddEvent} className="mt-4">
              <input type="text" name="title" placeholder="Event Title" required className="form-input" />
              <textarea name="description" placeholder="Event Description/Highlight details..." required className="form-input mt-4" rows="3"></textarea>
              <button type="submit" className="btn btn-primary mt-4 w-full">Add Event to Home</button>
            </form>
            <div className="mt-6">
              <h4>Current Events:</h4>
              <div className="list-group mt-2">
                {events.map(ev => (
                  <div key={ev.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span>{ev.title}</span>
                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Infrastructure Management */}
          <section className="glass-card section-padded">
            <h3>🏗️ Manage Infrastructure / Equipment</h3>
            <form onSubmit={handleAddInfra} className="mt-4">
              <input type="text" name="name" placeholder="Item Name (e.g. Microscopes)" required className="form-input" />
              <input type="number" name="quantity" placeholder="Quantity" required className="form-input mt-4" />
              <select name="status" className="form-input mt-4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', marginBottom: '16px' }}>
                <option>Available</option>
                <option>Under Maintenance</option>
              </select>
              <button type="submit" className="btn btn-secondary w-full">Add Infrastructure</button>
            </form>
            <div className="mt-6">
              <h4>Current Items ({infra.length}):</h4>
              <div className="list-group mt-2">
                {infra.map(i => (
                  <div key={i.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span>{i.name} ({i.quantity})</span>
                    <button onClick={() => handleDeleteInfra(i.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Notices Management */}
          <section className="glass-card section-padded" style={{ gridColumn: '1 / -1' }}>
             <h3>📢 Manage Notices / Announcements</h3>
             <form onSubmit={handleAddNotice} className="mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" name="title" placeholder="Notice Title" required className="form-input" />
                <select name="tag" className="form-input">
                   <option>Event</option>
                   <option>Academic</option>
                   <option>Meeting</option>
                   <option>Holiday</option>
                </select>
                <textarea name="content" placeholder="Announcement content..." required className="form-input" style={{ gridColumn: '1 / -1', height: '100px' }}></textarea>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Publish Notice</button>
             </form>
             <div className="mt-8">
                <h4>Recent Notices: ({notices.length})</h4>
                <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                   {notices.map(n => (
                     <div key={n.id} className="glass-card" style={{ padding: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                           <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem' }}>{n.tag}</span>
                           <button onClick={() => handleDeleteNotice(n.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </div>
                        <h5 className="mt-2">{n.title}</h5>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{n.content}</p>
                     </div>
                   ))}
                </div>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'Gallery' && (
        <div className="tab-pane animate-fade-in admin-grid">
          <section className="glass-card section-padded">
            <h3>🎬 Upload Scrolling Highlights (Gallery)</h3>
            <p className="text-muted mb-4">Add images that will appear in the scrolling gallery on the home screen.</p>
            <form onSubmit={handleAddGallery} className="mt-4">
              <div className="form-group">
                <label>Highlight Title</label>
                <input type="text" name="title" placeholder="e.g. Science Fair 2026" required className="form-input" />
              </div>
              <div className="form-group mt-4">
                <label>Select Image</label>
                <input type="file" name="image" accept="image/*" required className="form-input" />
              </div>
              <button type="submit" className="btn btn-primary mt-6 w-full">Upload to Highlights</button>
            </form>
          </section>

          <section className="glass-card section-padded">
            <h3>🖼️ Current Highlights ({gallery.length})</h3>
            <div className="gallery-admin-list mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {gallery.map(img => (
                <div key={img.id} className="gallery-admin-item" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={img.imageBase64} alt={img.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  <button 
                    onClick={() => handleDeleteGallery(img.id)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                  <div style={{ fontSize: '0.65rem', padding: '4px', color: 'var(--text-muted)', textAlign: 'center' }}>{img.title}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'Timetable' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>📅 Manage Class Timetables</h3>
          <form onSubmit={handleSaveTimetable} className="mt-6">
            <div className="form-group mb-6">
              <label>Target Class (Load to Update)</label>
              <select 
                className="form-input" 
                required 
                style={{ maxWidth: '300px' }}
                value={ttStandard}
                onChange={(e) => handleLoadExistingTt(e.target.value)}
              >
                <option value="">Select Class Standard...</option>
                {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
              </select>
            </div>
            
            <div className="timetable-builder-simple" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {ttRows.map((row, idx) => (
                <div key={idx} className="period-block" style={{ padding: '20px', background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>LECTURE {idx + 1}</span>
                    <input type="text" className="form-input" placeholder="Time Slot (e.g. 08:30 - 09:15)" value={row.time} onChange={e => handleTtChange(idx, 'time', e.target.value)} required style={{ maxWidth: '200px' }} />
                  </div>
                  <div className="timetable-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>MONDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.mon} onChange={e => handleTtChange(idx, 'mon', e.target.value)} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>TUESDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.tue} onChange={e => handleTtChange(idx, 'tue', e.target.value)} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>WEDNESDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.wed} onChange={e => handleTtChange(idx, 'wed', e.target.value)} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>THURSDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.thu} onChange={e => handleTtChange(idx, 'thu', e.target.value)} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>FRIDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.fri} onChange={e => handleTtChange(idx, 'fri', e.target.value)} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>SATURDAY</label><input type="text" className="form-input" placeholder="Subject" value={row.sat} onChange={e => handleTtChange(idx, 'sat', e.target.value)} /></div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary mt-8 btn-lg" style={{ padding: '14px 40px' }}>Save 8-Lecture Timetable</button>
          </form>
        </div>
      )}

      {activeTab === 'Fees Setup' && (
        <div className="tab-pane animate-fade-in admin-grid">
           <section className="glass-card section-padded">
              <h3>💳 Class-wise Fee Settings</h3>
              <p className="text-muted mb-6">Set the annual fee structure for each class. Students will see these values in their dashboard.</p>
              <form onSubmit={handleSaveFeeConfig} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Select Standard</label>
                    <select name="standard" className="form-input" required value={currentFeeConfig.standard} onChange={(e) => handleLoadFeeConfig(e.target.value)}>
                       <option value="">Choose Class...</option>
                       {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
                    </select>
                 </div>
                 <div className="form-group">
                    <label>Tuition Fee (₹)</label>
                    <input type="number" name="tuitionFee" value={currentFeeConfig.tuitionFee} onChange={handleFeeConfigChange} required className="form-input" />
                 </div>
                 <div className="form-group">
                    <label>Exam Fee (₹)</label>
                    <input type="number" name="examFee" value={currentFeeConfig.examFee} onChange={handleFeeConfigChange} required className="form-input" />
                 </div>
                 <div className="form-group">
                    <label>Library Fee (₹)</label>
                    <input type="number" name="libraryFee" value={currentFeeConfig.libraryFee} onChange={handleFeeConfigChange} required className="form-input" />
                 </div>
                 <div className="form-group">
                    <label>Sports & Activity Fee (₹)</label>
                    <input type="number" name="sportsFee" value={currentFeeConfig.sportsFee} onChange={handleFeeConfigChange} required className="form-input" />
                 </div>
                 <div className="glass-card p-6" style={{ gridColumn: '1 / -1', background: 'var(--bg-input)', textAlign: 'right' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Total Annual Fee: <span className="text-primary">₹{
                      (parseFloat(currentFeeConfig.tuitionFee)||0) + 
                      (parseFloat(currentFeeConfig.examFee)||0) + 
                      (parseFloat(currentFeeConfig.libraryFee)||0) + 
                      (parseFloat(currentFeeConfig.sportsFee)||0)
                    }</span></span>
                 </div>
                 <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Save Fee Structure</button>
              </form>
           </section>
        </div>
      )}

      {activeTab === 'Results' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>✅ Publish Exam Results</h3>
          <p className="text-muted">Students cannot see their results until they are published by the admin.</p>
          <div className="class-tabs mt-6">
            {STANDARDS.map(std => {
              const classResults = results.filter(r => r.standard === std);
              const isPublished = classResults.length > 0 && classResults[0].published;
              return (
                <div key={std} className="publish-row">
                  <span><strong>{std} Standard</strong> • {classResults.length} records</span>
                  {isPublished ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => handlePublishResults(std)}>Publish Now</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>📄 Download Attendance Reports (PDF)</h3>
          <p className="text-muted mt-2">Select a class to generate and download a complete attendance PDF report.</p>
          <div className="report-btns mt-6">
            {STANDARDS.map(std => (
              <button key={std} className="btn btn-secondary" onClick={() => generateAttendancePDF(std)}>
                <FileText size={16}/> {std} Std Report
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
          {toast.msg}
        </motion.div>}
      </AnimatePresence>

      <style>{`
        .admin-tabs { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; overflow-x: auto; }
        .tab-btn { background: none; border: none; padding: 8px 16px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: var(--radius-sm); white-space: nowrap; }
        .tab-btn.active { background: var(--bg-hover); color: var(--primary); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .stat-card { padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .stat-value { font-size: 1.3rem; font-weight: 800; display: block; margin-top: 2px; }
        .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .section-padded { padding: 28px; }
        .user-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: 8px;}
        .user-avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: var(--grad-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
        .user-details { flex: 1; display: flex; flex-direction: column; }
        .role-pill { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full); text-transform: uppercase; }
        .role-pill.student { background: #e0e7ff; color: #4338ca; }
        .role-pill.teacher { background: #d1fae5; color: #065f46; }
        .form-input { width: 100%; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-input); color: var(--text-main); font-family: inherit;}
        .timetable-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .timetable-grid label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; display: block; }
        .publish-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 12px; }
        .badge { padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700; }
        .badge-success { background: #10b981; color: white; }
        .report-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) { .admin-grid { grid-template-columns: 1fr; } .timetable-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
