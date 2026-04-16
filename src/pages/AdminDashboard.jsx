import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Settings, Briefcase, BookOpen, TrendingUp, Calendar, FileText, CheckSquare, Settings as SettingsIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchInfra();
    fetchTimetables();
    fetchResults();
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

  // --- Timetable Handlers ---
  const handleSaveTimetable = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const standard = formData.get('standard');
    // Simplified: Just saving one major row as an example
    const schedule = [
      { time: '08:30 - 12:30', mon: formData.get('mon'), tue: formData.get('tue'), wed: formData.get('wed'), thu: formData.get('thu'), fri: formData.get('fri') }
    ];
    await fetch('/api/timetables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard, schedule })
    });
    fetchTimetables();
    showToast(`Timetable for ${standard} Std saved!`);
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

      doc.autoTable({
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

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Administrator Control Center</h1>
        <p>System-wide overview and management.</p>
      </div>

      <div className="admin-tabs">
        {['Overview', 'Home Content', 'Timetable', 'Results', 'Reports'].map(tab => (
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
              <div className="user-list mt-4">
                {recentUsers.length === 0 && <p className="empty-msg">No recent registrations.</p>}
                {recentUsers.map((u, i) => (
                  <div key={u.id} className="user-row">
                    <div className="user-avatar-sm">{u.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="user-details">
                      <strong>{u.name}</strong><span>{u.email}</span>
                    </div>
                    <span className={`role-pill ${u.role}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'Home Content' && (
        <div className="tab-pane animate-fade-in admin-grid">
          <section className="glass-card section-padded">
            <h3>📢 Add Highlight/Event</h3>
            <form onSubmit={handleAddEvent} className="mt-4">
              <input type="text" name="title" placeholder="Event Title" required className="form-input" />
              <textarea name="description" placeholder="Event Description/Highlight details..." required className="form-input mt-4" rows="3"></textarea>
              <button type="submit" className="btn btn-primary mt-4 w-full">Add Event to Home</button>
            </form>
            <div className="mt-6">
              <h4>Current Events: {events.length}</h4>
            </div>
          </section>

          <section className="glass-card section-padded">
            <h3>🏗️ Manage Infrastructure / Equipment</h3>
            <form onSubmit={handleAddInfra} className="mt-4">
              <input type="text" name="name" placeholder="Item Name (e.g. Microscopes)" required className="form-input" />
              <input type="number" name="quantity" placeholder="Quantity" required className="form-input mt-4" />
              <select name="status" className="form-input mt-4">
                <option>Available</option>
                <option>Under Maintenance</option>
              </select>
              <button type="submit" className="btn btn-secondary mt-4 w-full">Add Infrastructure</button>
            </form>
            <div className="mt-6">
              <h4>Current Items: {infra.length}</h4>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'Timetable' && (
        <div className="tab-pane animate-fade-in glass-card section-padded">
          <h3>📅 Manage Class Timetables</h3>
          <form onSubmit={handleSaveTimetable} className="mt-6">
            <select name="standard" className="form-input mb-4" required>
              <option value="">Select Class Standard...</option>
              {STANDARDS.map(s => <option key={s} value={s}>{s} Standard</option>)}
            </select>
            <div className="timetable-grid">
              <div><label>Monday</label><input type="text" name="mon" className="form-input" placeholder="Subject" /></div>
              <div><label>Tuesday</label><input type="text" name="tue" className="form-input" placeholder="Subject" /></div>
              <div><label>Wednesday</label><input type="text" name="wed" className="form-input" placeholder="Subject" /></div>
              <div><label>Thursday</label><input type="text" name="thu" className="form-input" placeholder="Subject" /></div>
              <div><label>Friday</label><input type="text" name="fri" className="form-input" placeholder="Subject" /></div>
            </div>
            <button type="submit" className="btn btn-primary mt-6">Save Class Timetable</button>
          </form>
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
