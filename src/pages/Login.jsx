import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Eye, EyeOff, LogIn, Phone, ArrowLeft, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot Password State
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user);
        navigate(`/dashboard/${data.user.role}`);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Cannot connect to server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        setForgotMessage('Account found! Please enter your new password.');
        setForgotStep(2);
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('Password reset successful! You can now login.');
        exitForgotMode();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const exitForgotMode = () => {
    setForgotMode(false);
    setForgotStep(1);
    setForgotEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotMessage('');
    setError('');
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
            <h2>{forgotMode ? 'Reset Password' : 'Welcome Back'}</h2>
            <p>{forgotMode ? 'Reset your password using OTP verification' : 'Sign in to your Parishram Vidyalay account'}</p>
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

          {forgotMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="success-banner"
            >
              {forgotMessage}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!forgotMode ? (
              <motion.form key="login" onSubmit={handleLogin} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="role-selector">
                  {['student', 'teacher', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`role-btn ${role === r ? 'active' : ''}`}
                      onClick={() => setRole(r)}
                    >
                      <span className="role-dot"></span>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label><Mail size={15}/> Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><KeyRound size={15}/> Password</label>
                  <div className="password-field">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="forgot-link-row">
                  <button type="button" className="forgot-btn" onClick={() => setForgotMode(true)}>
                    <Lock size={14}/> Forgot Password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <LogIn size={18}/> Sign In to Dashboard
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="step-indicator">
                  {[1, 2].map(s => (
                    <div key={s} className={`step-dot ${forgotStep >= s ? 'active' : ''}`}>
                      {s}
                    </div>
                  ))}
                </div>

                {forgotStep === 1 && (
                  <form onSubmit={handleCheckEmail}>
                    <div className="form-group">
                      <label><Mail size={15}/> Registered Email ID</label>
                      <input 
                        type="email" 
                        placeholder="Enter your registered email ID" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
                      {loading ? <span className="spinner"></span> : <><Mail size={18}/> Verify Email</>}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                      <label><KeyRound size={15}/> New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={4}
                      />
                    </div>
                    <div className="form-group">
                      <label><KeyRound size={15}/> Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={4}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
                      {loading ? <span className="spinner"></span> : 'Reset Password'}
                    </button>
                  </form>
                )}

                <button className="back-to-login-btn" onClick={exitForgotMode}>
                  <ArrowLeft size={16}/> Back to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!forgotMode && (
            <div className="auth-footer">
              <p>
                Don't have an account? <Link to="/register">Create Account</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 1rem;
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
          max-width: 440px;
          padding: 2.5rem;
          box-shadow: var(--shadow-premium);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
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

        .success-banner {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #059669;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .role-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }

        .role-btn {
          padding: 10px 8px;
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
          gap: 6px;
        }

        .role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
          transition: all var(--transition-fast);
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

        .role-btn.active .role-dot {
          background: white;
        }

        .form-group {
          margin-bottom: 20px;
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

        .form-group input:focus, .form-group select:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

        .forgot-link-row {
          text-align: right;
          margin-bottom: 16px;
          margin-top: -8px;
        }

        .forgot-btn {
          background: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }

        .forgot-btn:hover {
          text-decoration: underline;
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
          margin-top: 28px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 700;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-input);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--text-muted);
          transition: all 0.3s;
        }

        .step-dot.active {
          background: var(--grad-primary);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .otp-input {
          text-align: center;
          font-size: 1.5rem !important;
          letter-spacing: 12px;
          font-weight: 800;
        }

        .back-to-login-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 20px auto 0;
          background: none;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
        }

        .back-to-login-btn:hover {
          color: var(--primary);
        }

        @media (max-width: 480px) {
          .auth-card { padding: 1.5rem; }
          .auth-header h2 { font-size: 1.4rem; }
          .role-selector { gap: 6px; }
          .role-btn { padding: 8px 4px; font-size: 0.78rem; }
        }
      `}</style>
    </div>
  );
};

export default Login;
