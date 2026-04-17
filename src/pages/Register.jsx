import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, KeyRound, Eye, EyeOff, UserPlus, Phone, BookOpen, Users, Award } from 'lucide-react';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Art'];

const Register = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [standard, setStandard] = useState('5th');
  const [parentName, setParentName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [degree, setDegree] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, email, password, role, phone,
          standard: role === 'student' ? standard : undefined,
          parentName: role === 'student' ? parentName : undefined,
          subject: role === 'teacher' ? subject : undefined,
          degree: role === 'teacher' ? degree : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/login', { state: { registered: true } });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Cannot connect to server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="container auth-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-card glass-card"
        >
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/assets/logo.png" alt="School Logo" className="auth-logo-img" />
            </div>
            <h2>Create Account</h2>
            <p>Join the Parishram Vidyalay Dundage community</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="error-banner"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister}>
            <div className="role-selector">
              {['student', 'teacher'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-btn ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r === 'student' ? <Users size={16}/> : <BookOpen size={16}/>}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label><User size={15}/> Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><Mail size={15}/> Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><Phone size={15}/> Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {role === 'student' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label><BookOpen size={15}/> Standard / Class</label>
                    <select value={standard} onChange={(e) => setStandard(e.target.value)}>
                      {STANDARDS.map(s => (
                        <option key={s} value={s}>{s} Standard</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label><Users size={15}/> Parent / Guardian Name</label>
                    <input 
                      type="text" 
                      placeholder="Parent's name" 
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'teacher' && (
              <div className="form-row">
                <div className="form-group">
                  <label><BookOpen size={15}/> Subject Specialization</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><Award size={15}/> Degree / Qualification</label>
                  <input 
                    type="text" 
                    placeholder="e.g. M.Sc. B.Ed." 
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label><KeyRound size={15}/> Create Password</label>
              <div className="password-field">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min. 4 chars)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                />
                <button 
                  type="button" 
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <UserPlus size={18}/> Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 2rem;
          position: relative;
          overflow: hidden;
        }

        .auth-bg-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          background: var(--secondary);
          bottom: -50px;
          left: -50px;
          animation: float 8s ease-in-out infinite reverse;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          background: var(--accent);
          top: 50%;
          left: 50%;
          animation: float 7s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .auth-container {
          display: flex;
          justify-content: center;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          box-shadow: var(--shadow-premium);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .auth-logo-img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          border-radius: 50%;
          background: white;
          padding: 4px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .auth-header h2 {
          font-size: 1.75rem;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #dc2626;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .role-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }

        .role-btn {
          padding: 11px 8px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-muted);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .role-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .role-btn.active {
          background: var(--grad-primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-muted);
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          color: var(--text-main);
          font-size: 0.9rem;
        }

        .form-group select {
          cursor: pointer;
          appearance: auto;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .password-field {
          position: relative;
        }

        .password-field input {
          padding-right: 48px;
        }

        .toggle-pass {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          color: var(--text-muted);
          padding: 4px;
        }

        .toggle-pass:hover {
          color: var(--primary);
        }

        .submit-btn {
          width: 100%;
          justify-content: center;
          padding: 14px;
          font-size: 0.95rem;
          margin-top: 8px;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 700;
        }

        @media (max-width: 500px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Register;
