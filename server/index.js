import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== REAL SMS SYSTEM (Fast2SMS) ====================
const sendRealSMS = async (numbers, message) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'your_fast2sms_api_key_here') {
    console.log(`[SMS SIMULATION] API Key not set. Message to ${numbers}: "${message}"`);
    return { success: true, simulated: true };
  }

  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'q',
      message: message,
      language: 'english',
      flash: 0,
      numbers: Array.isArray(numbers) ? numbers.join(',') : numbers,
    }, {
      headers: { 'authorization': apiKey }
    });
    console.log('[SMS REAL] API Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[SMS ERROR] Failed to send real SMS:', error.response?.data || error.message);
    return { success: false, error: error.message || 'Unknown network error' };
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PUBLIC_DIR = path.resolve(process.cwd(), 'dist');
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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
      { id: 1, name: 'Admin User', role: 'admin', email: 'admin@parishramvidyalay.edu', password: 'admin123', phone: '8379801244' },
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

  // Notes
  if (!fs.existsSync(path.join(DATA_DIR, 'notes.json'))) {
    writeJSON('notes.json', []);
  }

  // Quizzes
  if (!fs.existsSync(path.join(DATA_DIR, 'quizzes.json'))) {
    writeJSON('quizzes.json', []);
  }

  // OTP Store (temporary)
  if (!fs.existsSync(path.join(DATA_DIR, 'otps.json'))) {
    writeJSON('otps.json', []);
  }

  // Subjects per class
  if (!fs.existsSync(path.join(DATA_DIR, 'subjects.json'))) {
    writeJSON('subjects.json', [
      { standard: '5th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'] },
      { standard: '6th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'] },
      { standard: '7th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'] },
      { standard: '8th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer Science'] },
      { standard: '9th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer Science'] },
      { standard: '10th', subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer Science'] },
    ]);
  }

  // Marks structure per subject per class
  if (!fs.existsSync(path.join(DATA_DIR, 'marks_structure.json'))) {
    writeJSON('marks_structure.json', []);
  }

  // SMS Log
  if (!fs.existsSync(path.join(DATA_DIR, 'sms_log.json'))) {
    writeJSON('sms_log.json', []);
  }
};

initializeData();

// ==================== OTP SYSTEM ====================

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/api/otp/send', async (req, res) => {
  const { phone, purpose } = req.body; // purpose: 'register' | 'forgot_password'
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

  const otps = readJSON('otps.json');
  // Remove expired OTPs
  const now = Date.now();
  const activeOtps = otps.filter(o => now - o.createdAt < 300000); // 5 min expiry

  const otp = generateOTP();
  activeOtps.push({
    phone,
    otp,
    purpose: purpose || 'register',
    createdAt: now,
    verified: false
  });
  writeJSON('otps.json', activeOtps);

  console.log(`[OTP SYSTEM] OTP for ${phone}: ${otp} (Purpose: ${purpose || 'register'})`);
  
  // Send Real SMS
  const smsMsg = `Your Parishram Vidyalay OTP is: ${otp}. Valid for 5 minutes.`;
  await sendRealSMS(phone, smsMsg);

  // Log SMS
  const smsLog = readJSON('sms_log.json');
  smsLog.push({
    id: Date.now(),
    to: phone,
    message: smsMsg,
    sentAt: new Date().toISOString(),
    type: 'otp'
  });
  writeJSON('sms_log.json', smsLog);

  res.json({ success: true, message: 'OTP sent to your phone.', otp_for_testing: otp });
});

app.post('/api/otp/verify', (req, res) => {
  const { phone, otp, purpose } = req.body;
  const otps = readJSON('otps.json');
  const now = Date.now();
  
  const match = otps.find(o => 
    o.phone === phone && 
    o.otp === otp && 
    (o.purpose || 'register') === (purpose || 'register') &&
    !o.verified &&
    now - o.createdAt < 300000
  );

  if (match) {
    match.verified = true;
    writeJSON('otps.json', otps);
    res.json({ success: true, message: 'OTP verified successfully!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
  }
});

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

  // Verify OTP was completed for the phone
  const otps = readJSON('otps.json');
  const verifiedOtp = otps.find(o => o.phone === phone && o.verified && o.purpose === 'register');
  if (!verifiedOtp) {
    return res.status(400).json({ success: false, message: 'Phone number not verified. Please complete OTP verification first.' });
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
  
  // Initialize fee record for students
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

  // Clean up used OTP
  const remainingOtps = otps.filter(o => !(o.phone === phone && o.verified && o.purpose === 'register'));
  writeJSON('otps.json', remainingOtps);
  
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});




// Forgot Password - Check email existence
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this email address.' });
  }

  res.json({ success: true, message: 'User found. You can now reset your password.' });
});

// Reset Password - Direct reset (No OTP as requested)
app.post('/api/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  const users = readJSON('users.json');
  
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.password = newPassword;
  writeJSON('users.json', users);

  res.json({ success: true, message: 'Password reset successfully! You can now login.' });
});

// Admin Password Change Endpoint
app.post('/api/admin/change-password', (req, res) => {
  const { userId, newPassword } = req.body;
  const users = readJSON('users.json');
  
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.password = newPassword;
  writeJSON('users.json', users);

  res.json({ success: true, message: `Password for ${user.name} updated successfully!` });
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

// ==================== SUBJECTS MANAGEMENT (Admin) ====================

app.get('/api/subjects', (req, res) => {
  const { standard } = req.query;
  const subjects = readJSON('subjects.json');
  if (standard) {
    const classSubjects = subjects.find(s => s.standard === standard);
    return res.json(classSubjects || { standard, subjects: [] });
  }
  res.json(subjects);
});

app.post('/api/subjects', (req, res) => {
  const { standard, subjects: subjectList } = req.body;
  const allSubjects = readJSON('subjects.json');
  const index = allSubjects.findIndex(s => s.standard === standard);
  if (index >= 0) {
    allSubjects[index].subjects = subjectList;
  } else {
    allSubjects.push({ standard, subjects: subjectList });
  }
  writeJSON('subjects.json', allSubjects);
  res.json({ success: true, message: `Subjects for ${standard} updated successfully!` });
});

// ==================== MARKS STRUCTURE (Admin) ====================

app.get('/api/marks-structure', (req, res) => {
  const { standard, subject } = req.query;
  const structures = readJSON('marks_structure.json');
  if (standard && subject) {
    const s = structures.find(s => s.standard === standard && s.subject === subject);
    return res.json(s || { standard, subject, components: [{ name: 'Internal', maxMarks: 20 }, { name: 'Theory', maxMarks: 80 }] });
  }
  if (standard) {
    return res.json(structures.filter(s => s.standard === standard));
  }
  res.json(structures);
});

app.post('/api/marks-structure', (req, res) => {
  const { standard, subject, components } = req.body;
  // components = [{ name: "Practical", maxMarks: 30 }, { name: "Theory", maxMarks: 70 }]
  const structures = readJSON('marks_structure.json');
  const index = structures.findIndex(s => s.standard === standard && s.subject === subject);
  const totalMax = components.reduce((sum, c) => sum + parseInt(c.maxMarks), 0);
  const entry = { standard, subject, components, totalMaxMarks: totalMax };
  
  if (index >= 0) structures[index] = entry;
  else structures.push(entry);
  
  writeJSON('marks_structure.json', structures);
  res.json({ success: true, message: `Marks structure for ${subject} (${standard}) saved!` });
});

// ==================== NOTES SYSTEM ====================

app.get('/api/notes', (req, res) => {
  const { standard, subject } = req.query;
  let notes = readJSON('notes.json');
  if (standard) notes = notes.filter(n => n.standard === standard);
  if (subject) notes = notes.filter(n => n.subject === subject);
  // Don't send file data in listing, just metadata
  const listing = notes.map(({ fileBase64, ...rest }) => rest);
  res.json(listing);
});

app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const notes = readJSON('notes.json');
  const note = notes.find(n => n.id === parseInt(id));
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json(note);
});

app.post('/api/notes', (req, res) => {
  const { title, description, standard, subject, fileName, fileType, fileBase64, teacherId, teacherName } = req.body;
  const notes = readJSON('notes.json');
  const newNote = {
    id: Date.now(),
    title,
    description,
    standard,
    subject,
    fileName,
    fileType,
    fileBase64,
    teacherId,
    teacherName,
    uploadedAt: new Date().toISOString()
  };
  notes.push(newNote);
  writeJSON('notes.json', notes);
  res.json({ success: true, note: { ...newNote, fileBase64: undefined } });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  let notes = readJSON('notes.json');
  notes = notes.filter(n => n.id !== parseInt(id));
  writeJSON('notes.json', notes);
  res.json({ success: true });
});

// ==================== QUIZ SYSTEM ====================

app.get('/api/quizzes', (req, res) => {
  const { standard, teacherId, studentId } = req.query;
  let quizzes = readJSON('quizzes.json');
  if (standard) quizzes = quizzes.filter(q => q.standard === standard);
  if (teacherId) quizzes = quizzes.filter(q => q.teacherId === parseInt(teacherId));
  // Don't send answers in listing
  const listing = quizzes.map(q => ({
    ...q,
    questions: q.questions.map(({ correctAnswer, ...rest }) => rest)
  }));
  res.json(listing);
});

app.get('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  const quizzes = readJSON('quizzes.json');
  const quiz = quizzes.find(q => q.id === parseInt(id));
  if (!quiz) return res.status(404).json({ success: false });
  // Remove correct answers for student view
  const studentQuiz = {
    ...quiz,
    questions: quiz.questions.map(({ correctAnswer, ...rest }) => rest)
  };
  res.json(studentQuiz);
});

app.get('/api/quizzes/:id/full', (req, res) => {
  // Full quiz with answers for teacher/admin
  const { id } = req.params;
  const quizzes = readJSON('quizzes.json');
  const quiz = quizzes.find(q => q.id === parseInt(id));
  if (!quiz) return res.status(404).json({ success: false });
  res.json(quiz);
});

app.post('/api/quizzes', (req, res) => {
  const { title, subject, standard, startTime, endTime, duration, questions, teacherId, teacherName } = req.body;
  const quizzes = readJSON('quizzes.json');
  const newQuiz = {
    id: Date.now(),
    title,
    subject,
    standard,
    startTime,
    endTime,
    duration, // in minutes
    questions, // [{ question, options: [a,b,c,d], correctAnswer: index }]
    teacherId,
    teacherName,
    submissions: [],
    createdAt: new Date().toISOString()
  };
  quizzes.push(newQuiz);
  writeJSON('quizzes.json', quizzes);
  res.json({ success: true, quiz: { ...newQuiz, questions: newQuiz.questions.map(({ correctAnswer, ...rest }) => rest) } });
});

app.post('/api/quizzes/:id/submit', (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, answers } = req.body; // answers = [selectedIndex, ...]
  const quizzes = readJSON('quizzes.json');
  const quiz = quizzes.find(q => q.id === parseInt(id));
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  // Check if already submitted
  if (quiz.submissions.find(s => s.studentId === studentId)) {
    return res.status(400).json({ success: false, message: 'You have already submitted this quiz.' });
  }

  // Check schedule
  const now = new Date();
  if (quiz.endTime && new Date(quiz.endTime) < now) {
    return res.status(400).json({ success: false, message: 'Quiz has ended.' });
  }

  // Auto-evaluate
  let score = 0;
  const totalQuestions = quiz.questions.length;
  const evaluation = quiz.questions.map((q, i) => {
    const correct = answers[i] === q.correctAnswer;
    if (correct) score++;
    return { questionIndex: i, selectedAnswer: answers[i], correctAnswer: q.correctAnswer, correct };
  });

  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;

  const submission = {
    studentId,
    studentName,
    answers,
    score,
    totalQuestions,
    percentage: parseFloat(percentage),
    evaluation,
    submittedAt: new Date().toISOString()
  };

  quiz.submissions.push(submission);
  writeJSON('quizzes.json', quizzes);

  res.json({ 
    success: true, 
    message: 'Quiz submitted successfully!',
    result: { score, totalQuestions, percentage: parseFloat(percentage), evaluation }
  });
});

app.delete('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  let quizzes = readJSON('quizzes.json');
  quizzes = quizzes.filter(q => q.id !== parseInt(id));
  writeJSON('quizzes.json', quizzes);
  res.json({ success: true });
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
    return { ...studentFee, tuitionFee: 0, examFee: 0, libraryFee: 0, sportsFee: 0, totalFee: 0 };
  };

  if (studentId) {
    let studentFee = fees.find(f => f.studentId === parseInt(studentId));
    
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

  const removedAmount = studentFee.payments[paymentIndex].amount;
  studentFee.paidAmount -= removedAmount;
  studentFee.payments.splice(paymentIndex, 1);

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
  const { studentId, studentName, standard, subject, marks, total, grade } = req.body;
  // marks = [{ component: "Practical", maxMarks: 30, obtained: 25 }, ...]
  const results = readJSON('results.json');
  const existingIndex = results.findIndex(r => r.studentId === studentId && r.subject === subject);
  const resultRecord = {
    id: Date.now(), studentId, studentName, standard, subject, marks, total, grade, published: false, date: new Date().toISOString()
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

// ==================== SMS SYSTEM ====================

app.post('/api/attendance/sms', (req, res) => {
  const { standard, month } = req.body;
  const users = readJSON('users.json');
  const attendance = readJSON('attendance.json');
  
  const students = users.filter(u => u.role === 'student' && u.standard === standard);
  
  if (students.length === 0) {
    return res.status(404).json({ success: false, message: `No students found in ${standard} Standard.` });
  }

  console.log(`[SMS SYSTEM] Launching bulk attendance reports for ${standard} Std - ${month}`);
  
  const smsLog = readJSON('sms_log.json');
  
  students.forEach(s => {
    const studentRecords = attendance.filter(a => a.studentId === s.id);
    const present = studentRecords.filter(a => a.status === 'Present').length;
    const total = studentRecords.length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    const phone = s.phone || '8379801244';
    const message = `PVD SMS: Dear Parent, ${s.name}'s attendance for ${month} is ${pct}% (${present}/${total} days). - Parishram Vidyalay`;
    
    console.log(`[SMS AUTH] Sending to ${phone}: "${message}"`);
    
    smsLog.push({
      id: Date.now() + Math.random(),
      to: phone,
      message,
      sentAt: new Date().toISOString(),
      type: 'attendance_report',
      standard,
      month
    });

    // Send Real SMS
    sendRealSMS(phone, message);
  });

  console.log(`[SMS MIRROR] All reports also forwarded to Primary Admin Number: +91 8379801244`);
  writeJSON('sms_log.json', smsLog);

  res.json({ success: true, message: `SMS reports for ${students.length} students have been sent to their registered numbers and to +91 8379801244.` });
});

app.post('/api/sms/send', (req, res) => {
  const { to, message, recipients, type } = req.body;
  // recipients can be: 'individual' phone, 'class' standard, 'all'
  const users = readJSON('users.json');
  const smsLog = readJSON('sms_log.json');
  
  let targetPhones = [];
  
  if (type === 'individual' && to) {
    targetPhones = [to];
  } else if (type === 'class' && recipients) {
    const classStudents = users.filter(u => u.role === 'student' && u.standard === recipients);
    targetPhones = classStudents.map(s => s.phone || 'N/A').filter(p => p !== 'N/A');
  } else if (type === 'all') {
    const allStudents = users.filter(u => u.role === 'student');
    targetPhones = allStudents.map(s => s.phone || 'N/A').filter(p => p !== 'N/A');
  }

  if (targetPhones.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid phone numbers found for the selected recipients.' });
  }

  targetPhones.forEach(phone => {
    smsLog.push({
      id: Date.now() + Math.random(),
      to: phone,
      message,
      sentAt: new Date().toISOString(),
      type: 'custom'
    });
  });

  writeJSON('sms_log.json', smsLog);
  
  // Send Real SMS
  if (targetPhones.length > 0) {
    sendRealSMS(targetPhones, message);
  }

  res.json({ success: true, message: `SMS sent to ${targetPhones.length} recipient(s).`, count: targetPhones.length });
});

app.get('/api/sms/log', (req, res) => {
  const log = readJSON('sms_log.json');
  res.json(log.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 100));
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

// Serve uploads
app.use('/uploads', express.static(UPLOADS_DIR));

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
