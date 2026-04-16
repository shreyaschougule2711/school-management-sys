import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  
  useEffect(() => {
    // If student, fetch for their standard. If admin/teacher, default to 10th or show a selector
    const std = user?.standard || '10th';
    fetch(`/api/timetables?standard=${std}`)
      .then(r => r.json())
      .then(data => {
        if (data.schedule) setSchedule(data.schedule);
      }).catch(()=>{});
  }, [user]);

  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

  return (
    <div className="timetable-page">
      <div className="section-header">
        <h1>Weekly Timetable</h1>
        <p>Class {user?.standard || '10th'} | Academic Session 2026-27</p>
      </div>

      {schedule.length === 0 ? (
        <div className="glass-card mt-8" style={{ padding: '40px', textAlign: 'center' }}>
          <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '16px' }}/>
          <h3>Timetable Not Generated</h3>
          <p className="text-muted mt-2">The administration has not set the timetable for your class yet.</p>
        </div>
      ) : (
        <div className="glass-card mt-8 overflow-hidden">
          <table className="timetable-table">
            <thead>
              <tr>
                <th><Clock size={16}/> Time Slot</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={i} className={row.break ? 'break-row' : ''}>
                  <td className="time-slot">{row.time}</td>
                  {row.break ? (
                    <td colSpan="5" className="break-text">Short Interval / Recess</td>
                  ) : (
                    days.map(day => (
                      <td key={day}>
                        <div className="subject-box">
                          <span className="subject-name">{row[day] || '-'}</span>
                        </div>
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .timetable-table { width: 100%; border-collapse: collapse; }
        .timetable-table th {
          background: var(--bg-main);
          padding: 20px;
          text-align: left;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 2px solid var(--border);
        }
        .timetable-table td { padding: 12px; border-bottom: 1px solid var(--border); }
        .time-slot { font-weight: 700; color: var(--primary); background: rgba(99, 102, 241, 0.03); }
        .break-row { background: #f8fafc; }
        .break-text { text-align: center; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; }
        .subject-box { display: flex; flex-direction: column; }
        .subject-name { font-weight: 700; font-size: 0.95rem; }
        .teacher-name { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .overflow-hidden { overflow: hidden; }
        .mt-8 { margin-top: 2rem; }
      `}</style>
    </div>
  );
};

export default Timetable;
