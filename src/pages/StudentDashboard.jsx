import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, GraduationCap, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CircularProgress = ({ percentage, size = 120, strokeWidth = 10, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="percentage-value">{percentage}%</span>
        <span className="percentage-label">Attendance</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, gradient }) => (
  <motion.div 
    className="stat-card glass-card"
    whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
    transition={{ duration: 0.2 }}
  >
    <div className={`stat-icon`} style={{ background: gradient || color }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-label">{label}</span>
      <h3 className="stat-value">{value}</h3>
    </div>
  </motion.div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });

  useEffect(() => {
    fetch('/api/notices').then(r => r.json()).then(setNotices).catch(() => {});
    
    if (user?.id) {
      fetch(`/api/assignments?standard=${user.standard || ''}`)
        .then(r => r.json())
        .then(data => setAssignments(data.slice(-5)))
        .catch(() => {});

      fetch(`/api/attendance/summary/${user.id}`)
        .then(r => r.json())
        .then(setAttendanceSummary)
        .catch(() => {});
    }
  }, [user]);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="student-dashboard">
      <div className="welcome-banner glass-card">
        <div className="welcome-text">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Hello, {user?.name || 'Student'}! 👋
          </motion.h1>
          <p>Here's what's happening today{user?.standard ? ` in Class ${user.standard}` : ''}.</p>
        </div>
        <div className="banner-date">
          <Calendar size={18} />
          <span>{currentDate}</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon={<GraduationCap size={24}/>} 
          label="Attendance" 
          value={`${attendanceSummary.percentage}%`} 
          gradient="var(--grad-primary)" 
        />
        <StatCard 
          icon={<BookOpen size={24}/>} 
          label="Assignments" 
          value={`${assignments.length}`}
          gradient="var(--grad-warm)" 
        />
        <StatCard 
          icon={<TrendingUp size={24}/>} 
          label="Present Days" 
          value={attendanceSummary.present} 
          gradient="var(--grad-fresh)" 
        />
        <StatCard 
          icon={<Clock size={24}/>} 
          label="Absent Days" 
          value={attendanceSummary.absent} 
          gradient="linear-gradient(135deg, #f43f5e, #e11d48)" 
        />
      </div>

      <div className="dashboard-grid">
        {/* Attendance Visual */}
        <section className="dashboard-section glass-card">
          <div className="section-header-row">
            <h3>📊 Attendance Overview</h3>
          </div>
          <div className="attendance-visual">
            <CircularProgress 
              percentage={attendanceSummary.percentage || 0} 
              size={150} 
              strokeWidth={12}
              color={attendanceSummary.percentage >= 75 ? '#10b981' : '#f43f5e'}
            />
            <div className="attendance-breakdown">
              <div className="breakdown-item">
                <CheckCircle size={18} color="#10b981" />
                <div>
                  <span className="breakdown-label">Present</span>
                  <strong>{attendanceSummary.present} days</strong>
                </div>
              </div>
              <div className="breakdown-item">
                <XCircle size={18} color="#f43f5e" />
                <div>
                  <span className="breakdown-label">Absent</span>
                  <strong>{attendanceSummary.absent} days</strong>
                </div>
              </div>
              <div className="breakdown-item">
                <Clock size={18} color="#f59e0b" />
                <div>
                  <span className="breakdown-label">Late</span>
                  <strong>{attendanceSummary.late} days</strong>
                </div>
              </div>
              <div className="breakdown-item total">
                <Calendar size={18} color="var(--primary)" />
                <div>
                  <span className="breakdown-label">Total Days</span>
                  <strong>{attendanceSummary.total} days</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Notices */}
        <section className="dashboard-section glass-card">
          <div className="section-header-row">
            <h3>📢 Recent Notices</h3>
          </div>
          <div className="notice-list">
            {notices.length === 0 && <p className="empty-msg">No notices yet.</p>}
            {notices.slice(-4).map((notice, i) => (
              <div key={i} className="notice-item">
                <span className={`tag ${(notice.tag || '').toLowerCase()}`}>{notice.tag}</span>
                <h4>{notice.title}</h4>
                <span className="notice-date">{notice.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Assignments */}
      <section className="dashboard-section glass-card mt-8">
        <div className="section-header-row">
          <h3>📝 Recent Assignments</h3>
        </div>
        {assignments.length === 0 ? (
          <p className="empty-msg">No assignments posted yet for your class.</p>
        ) : (
          <div className="assignments-scroll">
            {assignments.map((asm, i) => (
              <div key={i} className="mini-assignment-card">
                <div className="mini-asm-left">
                  <div className="mini-asm-icon" style={{ background: `hsl(${(i * 60) + 200}, 70%, 95%)`, color: `hsl(${(i * 60) + 200}, 70%, 45%)` }}>
                    <BookOpen size={18}/>
                  </div>
                  <div>
                    <h4>{asm.title}</h4>
                    <span>{asm.subject} • Due: {new Date(asm.dueDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <span className={`status-pill ${asm.submissions?.find(s => s.studentId === user?.id) ? 'submitted' : 'pending'}`}>
                  {asm.submissions?.find(s => s.studentId === user?.id) ? 'Submitted' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .welcome-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 32px;
          margin-bottom: 28px;
          background: var(--grad-primary) !important;
          color: white;
          border: none !important;
        }

        .welcome-banner h1 { font-size: 1.6rem; color: white; }
        .welcome-banner p { color: rgba(255,255,255,0.8); margin-top: 4px; }

        .banner-date {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 10px 18px;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.85rem;
          backdrop-filter: blur(10px);
        }

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
        .stat-value { font-size: 1.4rem; font-weight: 800; display: block; margin-top: 2px; }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        .dashboard-section {
          padding: 28px;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header-row h3 {
          font-size: 1.05rem;
        }

        .attendance-visual {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .circular-progress {
          position: relative;
          flex-shrink: 0;
        }

        .circular-progress-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .percentage-value {
          font-size: 1.6rem;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
        }

        .percentage-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .attendance-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-input);
          border-radius: var(--radius-sm);
        }

        .breakdown-item div {
          display: flex;
          flex-direction: column;
        }

        .breakdown-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .breakdown-item strong {
          font-size: 0.85rem;
        }

        .breakdown-item.total {
          border: 1px solid var(--border);
        }

        .notice-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notice-item {
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }

        .notice-item:last-child { border: none; padding-bottom: 0; }

        .notice-item h4 { margin: 6px 0 4px; font-size: 0.9rem; }

        .tag {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .tag.academic { background: #e0e7ff; color: #4338ca; }
        .tag.event { background: #fef3c7; color: #92400e; }
        .tag.homework { background: #d1fae5; color: #065f46; }
        .tag.meeting { background: #fce7f3; color: #9d174d; }

        .notice-date { font-size: 0.75rem; color: var(--text-muted); }

        .empty-msg {
          color: var(--text-muted);
          text-align: center;
          padding: 24px;
          font-style: italic;
        }

        .assignments-scroll {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mini-assignment-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          transition: all var(--transition-fast);
        }

        .mini-assignment-card:hover {
          border-color: var(--primary);
          background: var(--bg-hover);
        }

        .mini-asm-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mini-asm-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mini-asm-left h4 { font-size: 0.9rem; margin-bottom: 2px; }
        .mini-asm-left span { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

        .status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-full);
        }

        .status-pill.pending { background: #fee2e2; color: #b91c1c; }
        .status-pill.submitted { background: #d1fae5; color: #065f46; }

        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .attendance-visual { flex-direction: column; }
          .welcome-banner { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
