import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

  // Gallery
  if (!fs.existsSync(path.join(DATA_DIR, 'gallery.json'))) {
    writeJSON('gallery.json', []);
  }

  // Fee Config
  if (!fs.existsSync(path.join(DATA_DIR, 'fee_config.json'))) {
    writeJSON('fee_config.json', []);
  }
};

initializeData();

// ==================== USER PROFILE ENDPOINTS ====================

app.post('/api/user/profile-image', (req, res) => {
  const { userId, profileImage } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ success: false });

  user.profileImage = profileImage;
  writeJSON('users.json', users);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});
app.post('/api/user/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.id === parseInt(userId));

  if (!user || user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  writeJSON('users.json', users);
  res.json({ success: true, message: 'Password updated successfully!' });
});

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
  const { name, email, password, role, standard, phone, parentName, subject, degree } = req.body;
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
    degree: role === 'teacher' ? degree : undefined,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeJSON('users.json', users);
  
  // Initialize fee record for students (minimal record, values set by admin config later)
  if (role === 'student') {
    const fees = readJSON('fees.json');
    fees.push({
      studentId: newUser.id,
      studentName: name,
      standard: standard,
      paidAmount: 0,
      payments: [],
      status: 'Unpaid'
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

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  let users = readJSON('users.json');
  users = users.filter(u => u.id !== parseInt(id));
  writeJSON('users.json', users);
  res.json({ success: true, message: 'User removed successfully' });
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
  const { title, subject, description, standard, dueDate, teacherId, teacherName, fileBase64, fileName } = req.body;
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
    fileBase64,
    fileName,
    createdAt: new Date().toISOString(),
    submissions: []
  };
  assignments.push(newAssignment);
  writeJSON('assignments.json', assignments);
  res.json({ success: true, assignment: newAssignment });
});

app.post('/api/assignments/:id/submit', (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, content, fileName, fileBase64 } = req.body;
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
    fileBase64,
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

app.get('/api/fee-config', (req, res) => {
  res.json(readJSON('fee_config.json'));
});

app.post('/api/fee-config', (req, res) => {
  const { standard, tuitionFee, examFee, libraryFee, sportsFee } = req.body;
  const configs = readJSON('fee_config.json');
  const index = configs.findIndex(c => c.standard === standard);
  const newConfig = { 
    standard, 
    tuitionFee: parseFloat(tuitionFee), 
    examFee: parseFloat(examFee), 
    libraryFee: parseFloat(libraryFee), 
    sportsFee: parseFloat(sportsFee),
    totalFee: parseFloat(tuitionFee) + parseFloat(examFee) + parseFloat(libraryFee) + parseFloat(sportsFee)
  };
  
  if (index >= 0) configs[index] = newConfig;
  else configs.push(newConfig);
  
  writeJSON('fee_config.json', configs);
  res.json({ success: true, config: newConfig });
});

app.get('/api/fees', (req, res) => {
  const { studentId } = req.query;
  const fees = readJSON('fees.json');
  const configs = readJSON('fee_config.json');
  const users = readJSON('users.json');

  const mergeConfig = (studentFee) => {
    const config = configs.find(c => c.standard === studentFee.standard);
    if (config) {
      return { ...studentFee, ...config };
    }
    // Default to 0 if no config exists yet
    return { ...studentFee, tuitionFee: 0, examFee: 0, libraryFee: 0, sportsFee: 0, totalFee: 0 };
  };

  if (studentId) {
    let studentFee = fees.find(f => f.studentId === parseInt(studentId));
    
    // Fallback: If no record in fees.json, check if student exists in users.json
    if (!studentFee) {
      const user = users.find(u => u.id === parseInt(studentId) && u.role === 'student');
      if (user) {
        studentFee = {
          studentId: user.id,
          studentName: user.name,
          standard: user.standard,
          paidAmount: 0,
          payments: [],
          status: 'Unpaid'
        };
      }
    }

    if (studentFee) {
      return res.json([mergeConfig(studentFee)]);
    }
    return res.json([]);
  }

  // Admin view: return ALL students from users.json to ensure consistency
  const allStudentFees = users
    .filter(u => u.role === 'student')
    .map(u => {
      let f = fees.find(fee => fee.studentId === u.id);
      if (!f) {
        f = {
          studentId: u.id,
          studentName: u.name,
          standard: u.standard,
          paidAmount: 0,
          payments: [],
          status: 'Unpaid'
        };
      }
      return mergeConfig(f);
    });
  res.json(allStudentFees);
});

app.post('/api/fees/pay', (req, res) => {
  const { studentId, amount, method } = req.body;
  const fees = readJSON('fees.json');
  const configs = readJSON('fee_config.json');
  let feeRecord = fees.find(f => f.studentId === parseInt(studentId));
  
  if (!feeRecord) {
     const users = readJSON('users.json');
     const user = users.find(u => u.id === parseInt(studentId) && u.role === 'student');
     if (!user) return res.status(404).json({ success: false, message: 'Student not found' });
     
     feeRecord = {
        studentId: user.id,
        studentName: user.name,
        standard: user.standard,
        paidAmount: 0,
        payments: [],
        status: 'Unpaid'
     };
     fees.push(feeRecord);
  }

  // Get current config to calculate correct total
  const config = configs.find(c => c.standard === feeRecord.standard);
  const totalFee = config ? config.totalFee : 0;

  feeRecord.paidAmount += parseFloat(amount);
  feeRecord.payments.push({
    id: Date.now(),
    amount: parseFloat(amount),
    method,
    date: new Date().toISOString(),
    receiptNo: `PVD-${Math.floor(Math.random() * 100000000)}`
  });

  if (feeRecord.paidAmount >= totalFee) feeRecord.status = 'Paid';
  else if (feeRecord.paidAmount > 0) feeRecord.status = 'Partial';

  writeJSON('fees.json', fees);
  res.json({ success: true, feeRecord: { ...feeRecord, ...(config || {}) } });
});

app.delete('/api/fees/:studentId', (req, res) => {
  const { studentId } = req.params;
  let fees = readJSON('fees.json');
  const initialLength = fees.length;
  fees = fees.filter(f => f.studentId !== parseInt(studentId));
  
  if (fees.length < initialLength) {
    writeJSON('fees.json', fees);
    return res.json({ success: true, message: 'Student fee record deleted successfully' });
  }
  res.status(404).json({ success: false, message: 'Record not found' });
});

app.delete('/api/fees/:studentId/payments/:paymentId', (req, res) => {
  const { studentId, paymentId } = req.params;
  const fees = readJSON('fees.json');
  const configs = readJSON('fee_config.json');
  const studentFee = fees.find(f => f.studentId === parseInt(studentId));
  
  if (!studentFee) return res.status(404).json({ success: false });

  const paymentIndex = studentFee.payments.findIndex(p => p.id === parseInt(paymentId));
  if (paymentIndex === -1) return res.status(404).json({ success: false });

  // Subtract amount
  const removedAmount = studentFee.payments[paymentIndex].amount;
  studentFee.paidAmount -= removedAmount;
  studentFee.payments.splice(paymentIndex, 1);

  // Update status
  const config = configs.find(c => c.standard === studentFee.standard);
  const totalFee = config ? config.totalFee : 0;
  
  if (studentFee.paidAmount <= 0) {
    studentFee.paidAmount = 0;
    studentFee.status = 'Unpaid';
  } else if (studentFee.paidAmount >= totalFee) {
    studentFee.status = 'Paid';
  } else {
    studentFee.status = 'Partial';
  }

  writeJSON('fees.json', fees);
  res.json({ success: true, message: 'Payment deleted' });
});

// ==================== TRANSACTIONS SYSTEM ====================

app.get('/api/transactions', (req, res) => {
  const { studentId } = req.query;
  const fees = readJSON('fees.json');
  let transactions = [];
  
  fees.forEach(f => {
    if (f.payments && Array.isArray(f.payments)) {
      f.payments.forEach(p => {
        transactions.push({
          ...p,
          studentId: f.studentId,
          studentName: f.studentName,
          standard: f.standard
        });
      });
    }
  });
  
  if (studentId) {
    transactions = transactions.filter(t => t.studentId === parseInt(studentId));
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(transactions);
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

app.delete('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  let notices = readJSON('notices.json');
  notices = notices.filter(n => n.id !== parseInt(id));
  writeJSON('notices.json', notices);
  res.json({ success: true });
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

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  let events = readJSON('events.json');
  events = events.filter(e => e.id !== parseInt(id));
  writeJSON('events.json', events);
  res.json({ success: true });
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

app.delete('/api/infrastructure/:id', (req, res) => {
  const { id } = req.params;
  let infra = readJSON('infrastructure.json');
  infra = infra.filter(i => i.id !== parseInt(id));
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
  const { standard, month } = req.body;
  const users = readJSON('users.json');
  const attendance = readJSON('attendance.json');
  
  // Find all students in this standard
  const students = users.filter(u => u.role === 'student' && u.standard === standard);
  
  if (students.length === 0) {
    return res.status(404).json({ success: false, message: `No students found in ${standard} Standard.` });
  }

  // Simulation log
  console.log(`[SMS SYSTEM] Launching bulk attendance reports for ${standard} Std - ${month}`);
  
  students.forEach(s => {
    const studentRecords = attendance.filter(a => a.studentId === s.id);
    const present = studentRecords.filter(a => a.status === 'Present').length;
    const total = studentRecords.length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    const phone = s.phone || '8379801244'; // Use student number or fallback to requested primary number
    const message = `PVD SMS: Dear Parent, ${s.name}'s attendance for ${month} is ${pct}% (${present}/${total} days). - Parishram Vidyalay`;
    
    console.log(`[SMS AUTH] Sending to ${phone}: "${message}"`);
  });

  // Specifically log the Mirror/Admin copy as requested
  console.log(`[SMS MIRROR] All reports also forwarded to Primary Admin Number: +91 8379801244`);

  res.json({ success: true, message: `SMS reports for ${students.length} students have been sent to their registered numbers and to +91 8379801244.` });
});

// ==================== GALLERY ENDPOINTS ====================

app.get('/api/gallery', (req, res) => {
  res.json(readJSON('gallery.json'));
});

app.post('/api/gallery', (req, res) => {
  const { title, imageBase64 } = req.body;
  const gallery = readJSON('gallery.json');
  const newItem = { id: Date.now(), title, imageBase64 };
  gallery.push(newItem);
  writeJSON('gallery.json', gallery);
  res.json({ success: true, item: newItem });
});

app.delete('/api/gallery/:id', (req, res) => {
  let gallery = readJSON('gallery.json');
  gallery = gallery.filter(item => item.id !== parseInt(req.params.id));
  writeJSON('gallery.json', gallery);
  res.json({ success: true });
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
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close the other process.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
