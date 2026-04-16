import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PUBLIC_DIR = path.resolve(process.cwd(), 'dist');
const DATA_DIR = path.resolve(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read/write JSON files
const readJSON = (filename, defaultData = []) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Initialize default data files
const initializeData = () => {
  // Users
  if (!fs.existsSync(path.join(DATA_DIR, 'users.json'))) {
    writeJSON('users.json', [
      { id: 1, name: 'Admin User', role: 'admin', email: 'admin@parishramvidyalay.edu', password: 'admin123' },
    ]);
  }

  // Assignments
  if (!fs.existsSync(path.join(DATA_DIR, 'assignments.json'))) {
    writeJSON('assignments.json', []);
  }

  // Attendance
  if (!fs.existsSync(path.join(DATA_DIR, 'attendance.json'))) {
    writeJSON('attendance.json', []);
  }

  // Fees
  if (!fs.existsSync(path.join(DATA_DIR, 'fees.json'))) {
    writeJSON('fees.json', []);
  }

  // Results
  if (!fs.existsSync(path.join(DATA_DIR, 'results.json'))) {
    writeJSON('results.json', []);
  }

  // Timetables
  if (!fs.existsSync(path.join(DATA_DIR, 'timetables.json'))) {
    writeJSON('timetables.json', []);
  }

  // Events/Highlights
  if (!fs.existsSync(path.join(DATA_DIR, 'events.json'))) {
    writeJSON('events.json', []);
  }

  // Infrastructure
  if (!fs.existsSync(path.join(DATA_DIR, 'infrastructure.json'))) {
    writeJSON('infrastructure.json', []);
  }

  // UPI Info
  if (!fs.existsSync(path.join(DATA_DIR, 'upi.json'))) {
    writeJSON('upi.json', { upiId: '', qrImageBase64: '' });
  }

  // Notices
  if (!fs.existsSync(path.join(DATA_DIR, 'notices.json'))) {
    writeJSON('notices.json', [
      { id: 1, title: 'Annual Sports Meet', date: '2026-05-15', tag: 'Event', content: 'Annual sports meet will be held on May 15th.' },
      { id: 2, title: 'Final Exam Schedule Out', date: '2026-06-01', tag: 'Academic', content: 'Final examination schedule has been released.' },
      { id: 3, title: 'Parent-Teacher Meeting', date: '2026-04-20', tag: 'Meeting', content: 'PTM scheduled for all classes.' },
    ]);
  }
};

initializeData();

// ==================== AUTH ENDPOINTS ====================

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
  }
});

app.post('/api/register', (req, res) => {
  const { name, email, password, role, standard, phone, parentName, subject } = req.body;
  const users = readJSON('users.json');
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    password, 
    role,
    standard: role === 'student' ? standard : undefined,
    phone,
    parentName: role === 'student' ? parentName : undefined,
    subject: role === 'teacher' ? subject : undefined,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeJSON('users.json', users);
  
  // Initialize fee record for students
  if (role === 'student') {
    const fees = readJSON('fees.json');
    fees.push({
      studentId: newUser.id,
      studentName: name,
      standard: standard,
      tuitionFee: 25000,
      examFee: 3000,
      libraryFee: 1500,
      sportsFee: 2000,
      totalFee: 31500,
      paidAmount: 0,
      status: 'Unpaid',
      payments: []
    });
    writeJSON('fees.json', fees);
  }
  
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// ==================== USER ENDPOINTS ====================

app.get('/api/users', (req, res) => {
  const users = readJSON('users.json');
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

app.get('/api/students', (req, res) => {
  const { standard } = req.query;
  const users = readJSON('users.json');
  let students = users.filter(u => u.role === 'student').map(({ password, ...rest }) => rest);
  if (standard) {
    students = students.filter(s => s.standard === standard);
  }
  res.json(students);
});

app.get('/api/teachers', (req, res) => {
  const users = readJSON('users.json');
  const teachers = users.filter(u => u.role === 'teacher').map(({ password, ...rest }) => rest);
  res.json(teachers);
});

// ==================== ASSIGNMENT ENDPOINTS ====================

app.get('/api/assignments', (req, res) => {
  const { standard, teacherId, studentId } = req.query;
  let assignments = readJSON('assignments.json');
  if (standard) assignments = assignments.filter(a => a.standard === standard);
  if (teacherId) assignments = assignments.filter(a => a.teacherId === parseInt(teacherId));
  res.json(assignments);
});

app.post('/api/assignments', (req, res) => {
  const { title, subject, description, standard, dueDate, teacherId, teacherName } = req.body;
  const assignments = readJSON('assignments.json');
  const newAssignment = {
    id: Date.now(),
    title,
    subject,
    description,
    standard,
    dueDate,
    teacherId,
    teacherName,
    createdAt: new Date().toISOString(),
    submissions: []
  };
  assignments.push(newAssignment);
  writeJSON('assignments.json', assignments);
  res.json({ success: true, assignment: newAssignment });
});

app.post('/api/assignments/:id/submit', (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, content, fileName } = req.body;
  const assignments = readJSON('assignments.json');
  const assignment = assignments.find(a => a.id === parseInt(id));
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
  
  // Remove old submission if exists
  assignment.submissions = assignment.submissions.filter(s => s.studentId !== studentId);
  assignment.submissions.push({
    studentId,
    studentName,
    content,
    fileName,
    submittedAt: new Date().toISOString(),
    status: 'Submitted'
  });
  
  writeJSON('assignments.json', assignments);
  res.json({ success: true, message: 'Assignment submitted successfully!' });
});

app.delete('/api/assignments/:id', (req, res) => {
  const { id } = req.params;
  let assignments = readJSON('assignments.json');
  assignments = assignments.filter(a => a.id !== parseInt(id));
  writeJSON('assignments.json', assignments);
  res.json({ success: true });
});

// ==================== ATTENDANCE ENDPOINTS ====================

app.get('/api/attendance', (req, res) => {
  const { standard, date, studentId } = req.query;
  let attendance = readJSON('attendance.json');
  if (standard) attendance = attendance.filter(a => a.standard === standard);
  if (date) attendance = attendance.filter(a => a.date === date);
  if (studentId) attendance = attendance.filter(a => a.studentId === parseInt(studentId));
  res.json(attendance);
});

app.post('/api/attendance', (req, res) => {
  const { standard, date, records, teacherId, teacherName } = req.body;
  let attendance = readJSON('attendance.json');
  
  // Remove existing records for same standard and date
  attendance = attendance.filter(a => !(a.standard === standard && a.date === date));
  
  // Add new records
  const newRecords = records.map(r => ({
    id: Date.now() + Math.random(),
    studentId: r.studentId,
    studentName: r.studentName,
    standard,
    date,
    status: r.status, // 'Present' | 'Absent' | 'Late'
    teacherId,
    teacherName,
    markedAt: new Date().toISOString()
  }));
  
  attendance.push(...newRecords);
  writeJSON('attendance.json', attendance);
  res.json({ success: true, message: `Attendance marked for ${records.length} students` });
});

app.get('/api/attendance/summary/:studentId', (req, res) => {
  const { studentId } = req.params;
  const attendance = readJSON('attendance.json');
  const studentRecords = attendance.filter(a => a.studentId === parseInt(studentId));
  
  const total = studentRecords.length;
  const present = studentRecords.filter(a => a.status === 'Present').length;
  const absent = studentRecords.filter(a => a.status === 'Absent').length;
  const late = studentRecords.filter(a => a.status === 'Late').length;
  const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
  
  res.json({
    total,
    present,
    absent, 
    late,
    percentage: parseFloat(percentage),
    records: studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
  });
});

// ==================== FEES ENDPOINTS ====================

app.get('/api/fees', (req, res) => {
  const { studentId } = req.query;
  let fees = readJSON('fees.json');
  if (studentId) fees = fees.filter(f => f.studentId === parseInt(studentId));
  res.json(fees);
});

app.post('/api/fees/pay', (req, res) => {
  const { studentId, amount, method } = req.body;
  const fees = readJSON('fees.json');
  const feeRecord = fees.find(f => f.studentId === parseInt(studentId));
  if (!feeRecord) return res.status(404).json({ success: false, message: 'Fee record not found' });
  
  feeRecord.paidAmount += amount;
  feeRecord.payments.push({
    id: Date.now(),
    amount,
    method,
    date: new Date().toISOString(),
    receiptNo: `PVD-${Date.now().toString().slice(-8)}`
  });
  feeRecord.status = feeRecord.paidAmount >= feeRecord.totalFee ? 'Paid' : 'Partial';
  
  writeJSON('fees.json', fees);
  res.json({ success: true, feeRecord });
});



// ==================== NOTICES ENDPOINTS ====================

app.get('/api/notices', (req, res) => {
  const notices = readJSON('notices.json');
  res.json(notices);
});

app.post('/api/notices', (req, res) => {
  const { title, content, tag } = req.body;
  const notices = readJSON('notices.json');
  const newNotice = {
    id: Date.now(),
    title,
    content,
    tag,
    date: new Date().toISOString().split('T')[0]
  };
  notices.push(newNotice);
  writeJSON('notices.json', notices);
  res.json({ success: true, notice: newNotice });
});

// ==================== RESULTS ENDPOINTS ====================
app.get('/api/results', (req, res) => {
  const { standard, studentId } = req.query;
  let results = readJSON('results.json');
  if (standard) results = results.filter(r => r.standard === standard);
  if (studentId) results = results.filter(r => r.studentId === parseInt(studentId));
  res.json(results);
});

app.post('/api/results', (req, res) => {
  const { studentId, studentName, standard, subject, internal, theory, total, grade } = req.body;
  const results = readJSON('results.json');
  // Upsert result for subject
  const existingIndex = results.findIndex(r => r.studentId === studentId && r.subject === subject);
  const resultRecord = {
    id: Date.now(), studentId, studentName, standard, subject, internal, theory, total, grade, published: false, date: new Date().toISOString()
  };
  if (existingIndex >= 0) results[existingIndex] = resultRecord;
  else results.push(resultRecord);
  
  writeJSON('results.json', results);
  res.json({ success: true, message: 'Result saved successfully' });
});

app.post('/api/results/publish', (req, res) => {
  const { standard } = req.body;
  const results = readJSON('results.json');
  results.forEach(r => { if (r.standard === standard) r.published = true; });
  writeJSON('results.json', results);
  res.json({ success: true, message: 'Results published successfully' });
});

// ==================== TIMETABLES ====================
app.get('/api/timetables', (req, res) => {
  const { standard } = req.query;
  const tables = readJSON('timetables.json');
  if (standard) {
    const table = tables.find(t => t.standard === standard);
    res.json(table || { standard, schedule: [] });
  } else {
    res.json(tables);
  }
});

app.post('/api/timetables', (req, res) => {
  const { standard, schedule } = req.body;
  const tables = readJSON('timetables.json');
  const index = tables.findIndex(t => t.standard === standard);
  if (index >= 0) tables[index] = { standard, schedule };
  else tables.push({ standard, schedule });
  writeJSON('timetables.json', tables);
  res.json({ success: true, message: 'Timetable updated' });
});

// ==================== EVENTS / HIGHLIGHTS ====================
app.get('/api/events', (req, res) => {
  res.json(readJSON('events.json'));
});

app.post('/api/events', (req, res) => {
  const { title, description, icon } = req.body;
  const events = readJSON('events.json');
  const ev = { id: Date.now(), title, description, icon };
  events.push(ev);
  writeJSON('events.json', events);
  res.json({ success: true, event: ev });
});

// ==================== INFRASTRUCTURE ====================
app.get('/api/infrastructure', (req, res) => {
  res.json(readJSON('infrastructure.json'));
});

app.post('/api/infrastructure', (req, res) => {
  const { name, category, quantity, status } = req.body;
  const infra = readJSON('infrastructure.json');
  infra.push({ id: Date.now(), name, category, quantity, status });
  writeJSON('infrastructure.json', infra);
  res.json({ success: true });
});

// ==================== UPI / PAYMENTS ====================
app.get('/api/upi', (req, res) => {
  res.json(readJSON('upi.json'));
});

app.post('/api/upi', (req, res) => {
  const { upiId, qrImageBase64 } = req.body;
  writeJSON('upi.json', { upiId, qrImageBase64 });
  res.json({ success: true });
});

app.post('/api/attendance/sms', (req, res) => {
  // Mock SMS functionality
  const { studentId, month } = req.body;
  // In real life, fetch phone number from users.json and trigger SMS API (like Twilio)
  console.log(`[SMS MOCK] Sending ${month} attendance report to student ${studentId}`);
  res.json({ success: true, message: 'SMS sent successfully!' });
});

// Serve frontend static files
console.log('📂 Serving static files from:', PUBLIC_DIR);
app.use(express.static(PUBLIC_DIR));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
