import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardCheck, Search, GraduationCap, UserCheck, ChevronDown, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('5th');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, assignmentsPosted: 0, attendanceMarked: 0 });

  useEffect(() => {
    fetchStudents(selectedClass);
    fetchStats();
  }, [selectedClass]);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(setAllStudents).catch(() => {});
  }, []);

  const fetchStudents = async (standard) => {
    try {
      const res = await fetch(`/api/students?standard=${standard}`);
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch(`/api/assignments?teacherId=${user?.id}`)
      ]);
      const studentsData = await studentsRes.json();
      const assignmentsData = await assignmentsRes.json();
      setStats({
        totalStudents: studentsData.length,
        assignmentsPosted: assignmentsData.length,
        attendanceMarked: 0
      });
    } catch (e) {}
  };

  const filteredStudents = searchQuery 
    ? allStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.standard || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  return (
    <div className="teacher-dashboard">
      <div className="page-header">
        <div>
          <h1>Teacher Panel</h1>
          <p>Welcome, {user?.name}. Manage your classes and students.</p>
        </div>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
          <div className="stat-icon" style={{ background: 'var(--grad-primary)' }}><Users size={24}/></div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <h3 className="stat-value">{stats.totalStudents}</h3>
          </div>
        </motion.div>
        <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
          <div className="stat-icon" style={{ background: 'var(--grad-fresh)' }}><ClipboardCheck size={24}/></div>
          <div className="stat-content">
            <span className="stat-label">Assignments Posted</span>
            <h3 className="stat-value">{stats.assignmentsPosted}</h3>
          </div>
        </motion.div>
        <motion.div className="stat-card glass-card" whileHover={{ y: -4 }}>
          <div className="stat-icon" style={{ background: 'var(--grad-warm)' }}><BookOpen size={24}/></div>
          <div className="stat-content">
            <span className="stat-label">Subject</span>
            <h3 className="stat-value">{user?.subject || 'General'}</h3>
          </div>
        </motion.div>
      </div>

      <div className="teacher-grid">
        {/* Class Selector + Student List */}
        <section className="glass-card section-padded">
          <div className="section-header-row">
            <h3>🎓 Browse by Class</h3>
          </div>
          
          <div className="class-tabs">
            {STANDARDS.map(std => (
              <button
                key={std}
                className={`class-tab ${selectedClass === std ? 'active' : ''}`}
                onClick={() => { setSelectedClass(std); setSearchQuery(''); }}
              >
                {std} Std
              </button>
            ))}
          </div>

          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search student by name, email, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="student-list">
            {filteredStudents.length === 0 ? (
              <p className="empty-msg">No students found{searchQuery ? ` for "${searchQuery}"` : ` in ${selectedClass} Standard`}.</p>
            ) : (
              filteredStudents.map((student, i) => (
                <motion.div 
                  key={student.id} 
                  className="student-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="student-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="student-info-col">
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                  </div>
                  <span className="class-badge">{student.standard || 'N/A'}</span>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="glass-card section-padded">
          <div className="section-header-row">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <motion.button 
              className="action-tile"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/attendance')}
            >
              <div className="action-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <UserCheck size={28}/>
              </div>
              <span>Mark Attendance</span>
              <p>Record daily attendance</p>
            </motion.button>
            <motion.button 
              className="action-tile"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/assignments')}
            >
              <div className="action-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <BookOpen size={28}/>
              </div>
              <span>Post Assignment</span>
              <p>Create new homework</p>
            </motion.button>
            <motion.button 
              className="action-tile"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/results')}
            >
              <div className="action-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <CheckSquare size={28}/>
              </div>
              <span>Add Marks</span>
              <p>Enter exam results</p>
            </motion.button>
          </div>
        </section>

        {/* Dedicated Marks Section for Maximum Visibility */}
        <section className="glass-card section-padded mt-6" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header-row">
            <h3>📈 Student Marks Management</h3>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/results')}>Open Full Marks Panel</button>
          </div>
          <p className="text-muted mb-4">You can now add and manage student marks for terminal and final examinations. Click below to start entering scores.</p>
          <div className="quick-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="mini-card" style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MAPPING STATUS</span>
              <h4 style={{ margin: '4px 0 0' }}>All Classes Enabled</h4>
            </div>
            <div className="mini-card" style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LAST UPDATE</span>
              <h4 style={{ margin: '4px 0 0' }}>Just Now</h4>
            </div>
            <div className="mini-card" style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL RECORDS</span>
              <h4 style={{ margin: '4px 0 0' }}>Syncing...</h4>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .page-header {
          margin-bottom: 28px;
        }
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .stat-value { font-size: 1.3rem; font-weight: 800; display: block; margin-top: 2px; }

        .teacher-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .section-padded {
          padding: 28px;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header-row h3 { font-size: 1.05rem; }

        .class-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .class-tab {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .class-tab:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .class-tab.active {
          background: var(--grad-primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: 16px;
          color: var(--text-muted);
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
        }

        .student-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .student-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1px solid var(--border);
          transition: all var(--transition-fast);
        }

        .student-row:hover {
          border-color: var(--primary);
          background: var(--bg-hover);
        }

        .student-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .student-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .student-info-col strong { font-size: 0.9rem; }
        .student-info-col span { font-size: 0.75rem; color: var(--text-muted); }

        .class-badge {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.7rem;
        }

        .actions-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-tile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          text-align: left;
          color: var(--text-main);
          transition: all var(--transition-fast);
        }

        .action-tile:hover {
          border-color: var(--primary);
          background: var(--bg-hover);
        }

        .action-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-tile span { 
          font-weight: 700; 
          font-size: 0.95rem;
          display: block;
        }

        .action-tile p { 
          font-size: 0.75rem; 
          color: var(--text-muted); 
          margin-top: 2px; 
        }

        .empty-msg {
          color: var(--text-muted);
          text-align: center;
          padding: 32px;
          font-style: italic;
        }

        @media (max-width: 900px) {
          .teacher-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
