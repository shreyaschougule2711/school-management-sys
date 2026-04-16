import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, UserCheck, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const CircularProgress = ({ percentage, size = 130, strokeWidth = 11, color = '#10b981' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div className="circ-text">
        <span className="circ-val">{percentage}%</span>
        <span className="circ-label">Present</span>
      </div>
    </div>
  );
};

const Attendance = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [selectedClass, setSelectedClass] = useState('5th');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Student view
  const [myAttendance, setMyAttendance] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0, records: [] });

  useEffect(() => {
    if (isStudent && user?.id) {
      fetch(`/api/attendance/summary/${user.id}`)
        .then(r => r.json())
        .then(setMyAttendance)
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (isTeacher || isAdmin) {
      fetchStudentsForClass();
    }
  }, [selectedClass]);

  const fetchStudentsForClass = async () => {
    try {
      const res = await fetch(`/api/students?standard=${selectedClass}`);
      const data = await res.json();
      setStudents(data);
      // Pre-fill attendance
      const map = {};
      data.forEach(s => { map[s.id] = 'Present'; });
      
      // Check existing attendance
      const attRes = await fetch(`/api/attendance?standard=${selectedClass}&date=${selectedDate}`);
      const attData = await attRes.json();
      attData.forEach(a => { map[a.studentId] = a.status; });
      
      setAttendanceMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if ((isTeacher || isAdmin) && students.length > 0) {
      // Re-check attendance for new date
      fetch(`/api/attendance?standard=${selectedClass}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => {
          const map = {};
          students.forEach(s => { map[s.id] = 'Present'; });
          data.forEach(a => { map[a.studentId] = a.status; });
          setAttendanceMap(map);
        })
        .catch(() => {});
    }
  }, [selectedDate]);

  const toggleAttendance = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: attendanceMap[s.id] || 'Present'
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: selectedClass,
          date: selectedDate,
          records,
          teacherId: user.id,
          teacherName: user.name,
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: data.message, type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      setToast({ msg: 'Failed to save attendance', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSendBulkSMS = async () => {
    try {
      const res = await fetch('/api/attendance/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standard: selectedClass, month: new Date().toLocaleString('default', { month: 'long' }) })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: `Monthly Attendance SMS sent successfully for ${selectedClass} Std!`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch(e) {
      setToast({ msg: 'Failed to send SMS', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'Absent').length;

  // =================== STUDENT VIEW ===================
  if (isStudent) {
    return (
      <div className="attendance-page">
        <div className="page-header">
          <h1>My Attendance</h1>
          <p>Track your attendance record and percentage</p>
        </div>

        <div className="student-att-grid">
          <div className="glass-card att-visual-card">
            <h3>📊 Attendance Overview</h3>
            <div className="att-visual-content">
              <CircularProgress 
                percentage={myAttendance.percentage || 0} 
                size={160} 
                strokeWidth={14}
                color={myAttendance.percentage >= 75 ? '#10b981' : '#f43f5e'}
              />
              <div className="att-stats-col">
                <div className="att-stat present">
                  <CheckCircle size={20}/>
                  <div><strong>{myAttendance.present}</strong><span>Present</span></div>
                </div>
                <div className="att-stat absent">
                  <XCircle size={20}/>
                  <div><strong>{myAttendance.absent}</strong><span>Absent</span></div>
                </div>
                <div className="att-stat late">
                  <Clock size={20}/>
                  <div><strong>{myAttendance.late}</strong><span>Late</span></div>
                </div>
                <div className="att-stat total">
                  <Calendar size={20}/>
                  <div><strong>{myAttendance.total}</strong><span>Total Days</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card att-records-card">
            <h3>📋 Recent Records</h3>
            <div className="records-list">
              {myAttendance.records?.length === 0 && <p className="empty-msg">No attendance records yet.</p>}
              {myAttendance.records?.slice(0, 15).map((rec, i) => (
                <div key={i} className="record-row">
                  <span className="rec-date">{new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={`status-dot ${rec.status.toLowerCase()}`}>
                    {rec.status === 'Present' ? <CheckCircle size={14}/> : rec.status === 'Absent' ? <XCircle size={14}/> : <Clock size={14}/>}
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`${attendanceStyles}`}</style>
      </div>
    );
  }

  // =================== TEACHER/ADMIN VIEW ===================
  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Mark Attendance</h1>
          <p>Select a class and date to mark student attendance</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="class-tabs">
          {STANDARDS.map(std => (
            <button
              key={std}
              className={`class-tab ${selectedClass === std ? 'active' : ''}`}
              onClick={() => setSelectedClass(std)}
            >
              {std} Std
            </button>
          ))}
        </div>
        <div className="date-picker-wrap">
          <Calendar size={16}/>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="att-summary-bar glass-card">
        <div className="att-sum-item">
          <Users size={18}/>
          <span>Total: <strong>{students.length}</strong></span>
        </div>
        <div className="att-sum-item present-c">
          <CheckCircle size={18}/>
          <span>Present: <strong>{presentCount}</strong></span>
        </div>
        <div className="att-sum-item absent-c">
          <XCircle size={18}/>
          <span>Absent: <strong>{absentCount}</strong></span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state glass-card">
          <Users size={48} color="var(--text-muted)"/>
          <h3>No Students Found</h3>
          <p>No students registered in {selectedClass} Standard yet.</p>
        </div>
      ) : (
        <div className="attendance-grid glass-card">
          {students.map((student, i) => (
            <motion.div 
              key={student.id} 
              className="att-student-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="att-student-info">
                <div className="att-avatar">{student.name.charAt(0)}</div>
                <div>
                  <strong>{student.name}</strong>
                  <span>{student.email}</span>
                </div>
              </div>
              <div className="att-buttons">
                {['Present', 'Absent', 'Late'].map(status => (
                  <button
                    key={status}
                    className={`att-btn ${status.toLowerCase()} ${attendanceMap[student.id] === status ? 'selected' : ''}`}
                    onClick={() => toggleAttendance(student.id, status)}
                  >
                    {status === 'Present' && <CheckCircle size={14}/>}
                    {status === 'Absent' && <XCircle size={14}/>}
                    {status === 'Late' && <Clock size={14}/>}
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <div className="save-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleSendBulkSMS}>
            📱 Send Monthly SMS Report
          </button>
          <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={saving}>
            {saving ? <span className="spinner"></span> : <><UserCheck size={18}/> Save Attendance</>}
          </button>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div 
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <CheckCircle size={18}/> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`${attendanceStyles}`}</style>
    </div>
  );
};

const attendanceStyles = `
  .page-header { margin-bottom: 24px; }
  .page-header h1 { font-size: 1.6rem; }
  .page-header p { color: var(--text-muted); margin-top: 4px; }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .class-tabs { display: flex; gap: 8px; flex-wrap: wrap; }

  .class-tab {
    padding: 8px 16px;
    border-radius: var(--radius-full);
    background: var(--bg-input);
    border: 1.5px solid var(--border);
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-muted);
    transition: all 0.15s;
  }
  .class-tab:hover { border-color: var(--primary); color: var(--primary); }
  .class-tab.active { background: var(--grad-primary); color: white; border-color: transparent; }

  .date-picker-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-muted);
  }
  .date-picker-wrap input {
    background: none;
    border: none;
    color: var(--text-main);
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    outline: none;
  }

  .att-summary-bar {
    display: flex;
    gap: 24px;
    padding: 16px 24px;
    margin-bottom: 20px;
  }
  .att-sum-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); }
  .att-sum-item strong { color: var(--text-main); }
  .present-c { color: #10b981; }
  .absent-c { color: #f43f5e; }

  .attendance-grid { padding: 8px; }

  .att-student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .att-student-row:last-child { border-bottom: none; }

  .att-student-info { display: flex; align-items: center; gap: 12px; }

  .att-avatar {
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

  .att-student-info strong { font-size: 0.9rem; display: block; }
  .att-student-info span { font-size: 0.75rem; color: var(--text-muted); }

  .att-buttons { display: flex; gap: 8px; }

  .att-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    border: 1.5px solid var(--border);
    background: var(--bg-input);
    color: var(--text-muted);
    transition: all 0.15s;
  }
  .att-btn:hover { border-color: currentColor; }
  .att-btn.present.selected { background: #d1fae5; color: #065f46; border-color: #10b981; }
  .att-btn.absent.selected { background: #fee2e2; color: #b91c1c; border-color: #f43f5e; }
  .att-btn.late.selected { background: #fef3c7; color: #92400e; border-color: #f59e0b; }

  .save-bar {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-state {
    text-align: center;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .empty-state h3 { font-size: 1.1rem; }
  .empty-state p { color: var(--text-muted); }

  /* Student view */
  .student-att-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .att-visual-card, .att-records-card { padding: 28px; }
  .att-visual-card h3, .att-records-card h3 { font-size: 1.05rem; margin-bottom: 24px; }

  .att-visual-content {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .circular-progress {
    position: relative;
    flex-shrink: 0;
  }
  .circ-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .circ-val { font-size: 1.8rem; font-weight: 900; font-family: 'Outfit', sans-serif; }
  .circ-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

  .att-stats-col { display: flex; flex-direction: column; gap: 10px; flex: 1; }

  .att-stat {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: var(--bg-input);
  }
  .att-stat div { display: flex; flex-direction: column; }
  .att-stat strong { font-size: 0.9rem; }
  .att-stat span { font-size: 0.7rem; color: var(--text-muted); }
  .att-stat.present { color: #10b981; }
  .att-stat.absent { color: #f43f5e; }
  .att-stat.late { color: #f59e0b; }
  .att-stat.total { color: var(--primary); border: 1px solid var(--border); }

  .records-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
  .record-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: var(--bg-input);
    border-radius: var(--radius-sm);
  }
  .rec-date { font-size: 0.85rem; font-weight: 600; }
  .status-dot {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: var(--radius-full);
  }
  .status-dot.present { background: #d1fae5; color: #065f46; }
  .status-dot.absent { background: #fee2e2; color: #b91c1c; }
  .status-dot.late { background: #fef3c7; color: #92400e; }

  .empty-msg {
    color: var(--text-muted);
    text-align: center;
    padding: 24px;
    font-style: italic;
  }

  @media (max-width: 900px) {
    .student-att-grid { grid-template-columns: 1fr; }
    .att-visual-content { flex-direction: column; }
    .att-student-row { flex-direction: column; gap: 12px; align-items: flex-start; }
  }
`;

export default Attendance;
