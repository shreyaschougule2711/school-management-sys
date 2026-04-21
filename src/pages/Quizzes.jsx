import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Plus, Play, CheckCircle, XCircle, Trash2, Users, BarChart3, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STANDARDS = ['5th', '6th', '7th', '8th', '9th', '10th'];

const Quizzes = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const [quizzes, setQuizzes] = useState([]);
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null); // For student attempt
  const [viewResults, setViewResults] = useState(null); // For viewing results

  // Create quiz state
  const [newQuiz, setNewQuiz] = useState({
    title: '', subject: '', standard: '5th',
    startTime: '', endTime: '', duration: 10,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  // Student attempt state
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = () => {
    let url = '/api/quizzes?';
    if (isStudent && user?.standard) url += `standard=${user.standard}`;
    fetch(url).then(r => r.json()).then(setQuizzes).catch(() => {});
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Teacher - Create Quiz
  const handleAddQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setNewQuiz(prev => {
      const q = [...prev.questions];
      if (field === 'question') q[idx].question = value;
      else if (field === 'correctAnswer') q[idx].correctAnswer = parseInt(value);
      return { ...prev, questions: q };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setNewQuiz(prev => {
      const q = [...prev.questions];
      q[qIdx].options[oIdx] = value;
      return { ...prev, questions: q };
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    // Validate
    if (newQuiz.questions.some(q => !q.question || q.options.some(o => !o))) {
      showToast('Please fill all questions and options', 'error');
      return;
    }

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuiz, teacherId: user.id, teacherName: user.name })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Quiz created successfully!');
        setShowCreate(false);
        setNewQuiz({ title: '', subject: '', standard: '5th', startTime: '', endTime: '', duration: 10, questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
        fetchQuizzes();
      }
    } catch (e) {
      showToast('Failed to create quiz', 'error');
    }
  };

  // Student - Attempt Quiz
  const startQuiz = (quiz) => {
    const now = new Date();
    if (quiz.startTime && new Date(quiz.startTime) > now) {
      showToast('This quiz has not started yet.', 'error');
      return;
    }
    if (quiz.endTime && new Date(quiz.endTime) < now) {
      showToast('This quiz has already ended.', 'error');
      return;
    }
    if (quiz.submissions?.find(s => s.studentId === user.id)) {
      showToast('You have already submitted this quiz.', 'error');
      return;
    }
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeLeft((quiz.duration || 10) * 60);
    setQuizResult(null);
  };

  // Timer
  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeQuiz]);

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, studentName: user.name, answers })
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data.result);
        showToast(autoSubmit ? 'Time is up! Quiz auto-submitted.' : 'Quiz submitted successfully!');
        fetchQuizzes();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Submission failed', 'error');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    fetchQuizzes();
    showToast('Quiz deleted');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    if (quiz.startTime && new Date(quiz.startTime) > now) return 'upcoming';
    if (quiz.endTime && new Date(quiz.endTime) < now) return 'ended';
    return 'active';
  };

  return (
    <div className="quizzes-page">
      <div className="page-header">
        <div>
          <h1>📝 Quizzes</h1>
          <p>{isTeacher ? 'Create quizzes and view results' : isStudent ? 'Attempt quizzes and view scores' : 'Monitor quiz performance'}</p>
        </div>
        {(isTeacher || isAdmin) && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18}/> Create Quiz
          </button>
        )}
      </div>

      {/* Quiz Attempt View */}
      {activeQuiz && !quizResult && (
        <div className="quiz-attempt glass-card">
          <div className="quiz-attempt-header">
            <div>
              <h2>{activeQuiz.title}</h2>
              <span className="quiz-meta">{activeQuiz.subject} • {activeQuiz.standard} Std</span>
            </div>
            <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
              <Clock size={18}/>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="questions-list">
            {activeQuiz.questions.map((q, qi) => (
              <div key={qi} className="question-block">
                <div className="question-number">Q{qi + 1}.</div>
                <p className="question-text">{q.question}</p>
                <div className="options-list">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`option-item ${answers[qi] === oi ? 'selected' : ''}`}>
                      <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => {
                        const newAnswers = [...answers];
                        newAnswers[qi] = oi;
                        setAnswers(newAnswers);
                      }} />
                      <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-attempt-footer">
            <span className="answered-count">{answers.filter(a => a !== -1).length} / {activeQuiz.questions.length} answered</span>
            <button className="btn btn-primary" onClick={() => handleSubmitQuiz(false)}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Result View */}
      {quizResult && (
        <motion.div className="quiz-result glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="result-header">
            <Trophy size={48} color={quizResult.percentage >= 50 ? '#10b981' : '#ef4444'}/>
            <h2>Quiz Complete!</h2>
          </div>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-stat-value">{quizResult.score}/{quizResult.totalQuestions}</span>
              <span className="result-stat-label">Score</span>
            </div>
            <div className="result-stat">
              <span className="result-stat-value" style={{ color: quizResult.percentage >= 50 ? '#10b981' : '#ef4444' }}>{quizResult.percentage}%</span>
              <span className="result-stat-label">Percentage</span>
            </div>
          </div>
          <div className="result-details">
            {quizResult.evaluation.map((e, i) => (
              <div key={i} className={`result-item ${e.correct ? 'correct' : 'wrong'}`}>
                <span className="result-q-num">Q{i + 1}</span>
                {e.correct ? <CheckCircle size={18} color="#10b981"/> : <XCircle size={18} color="#ef4444"/>}
                <span>{e.correct ? 'Correct' : `Wrong (Correct: ${String.fromCharCode(65 + e.correctAnswer)})`}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary mt-6" onClick={() => { setActiveQuiz(null); setQuizResult(null); }}>
            Back to Quizzes
          </button>
        </motion.div>
      )}

      {/* Quiz List */}
      {!activeQuiz && !quizResult && (
        <div className="quizzes-grid">
          {quizzes.length === 0 ? (
            <div className="empty-state glass-card">
              <Trophy size={48} color="var(--text-muted)"/>
              <h3>No Quizzes Yet</h3>
              <p>{isTeacher ? 'Create your first quiz to get started.' : 'No quizzes available for your class yet.'}</p>
            </div>
          ) : (
            quizzes.map((quiz, i) => {
              const status = getQuizStatus(quiz);
              const submitted = quiz.submissions?.find(s => s.studentId === user?.id);
              return (
                <motion.div key={quiz.id} className="quiz-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
                  <div className={`quiz-status-badge ${status}`}>
                    {status === 'active' ? '🟢 Active' : status === 'upcoming' ? '🟡 Upcoming' : '🔴 Ended'}
                  </div>
                  <h3>{quiz.title}</h3>
                  <div className="quiz-card-meta">
                    <span>{quiz.subject}</span>
                    <span>{quiz.standard} Std</span>
                    <span>{quiz.questions?.length || 0} Qs</span>
                    <span>{quiz.duration}m</span>
                  </div>
                  {quiz.startTime && <div className="quiz-schedule">Start: {new Date(quiz.startTime).toLocaleString('en-IN')}</div>}
                  {quiz.endTime && <div className="quiz-schedule">End: {new Date(quiz.endTime).toLocaleString('en-IN')}</div>}
                  <div className="quiz-card-footer">
                    {isStudent && (
                      submitted ? (
                        <span className="submitted-badge"><CheckCircle size={14}/> Submitted ({submitted.percentage}%)</span>
                      ) : status === 'active' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => startQuiz(quiz)}>
                          <Play size={14}/> Start Quiz
                        </button>
                      ) : status === 'upcoming' ? (
                        <span className="upcoming-badge"><Clock size={14}/> Starts Soon</span>
                      ) : (
                        <span className="ended-badge">Quiz Ended</span>
                      )
                    )}
                    {(isTeacher || isAdmin) && (
                      <div className="quiz-card-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewResults(quiz)}>
                          <BarChart3 size={14}/> Results ({quiz.submissions?.length || 0})
                        </button>
                        {isTeacher && quiz.teacherId === user.id && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuiz(quiz.id)}>
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* View Results Modal */}
      <AnimatePresence>
        {viewResults && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '600px' }}>
              <div className="modal-header-row">
                <h3>📊 {viewResults.title} - Results</h3>
                <button className="modal-close" onClick={() => setViewResults(null)}><X size={20}/></button>
              </div>
              {viewResults.submissions?.length === 0 ? (
                <p className="text-muted text-center p-8">No submissions yet.</p>
              ) : (
                <div className="results-table-wrap">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Score</th>
                        <th>%</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewResults.submissions || []).sort((a,b) => b.percentage - a.percentage).map((s, i) => (
                        <tr key={i}>
                          <td><strong>{s.studentName}</strong></td>
                          <td>{s.score}/{s.totalQuestions}</td>
                          <td><span className={`pct-badge ${s.percentage >= 50 ? 'pass' : 'fail'}`}>{s.percentage}%</span></td>
                          <td style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{new Date(s.submittedAt).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Quiz Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content create-quiz-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="modal-header-row">
                <h3>📋 Create New Quiz</h3>
                <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateQuiz} className="create-quiz-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Quiz Title</label>
                    <input className="form-input" placeholder="e.g. Chapter 5 Test" value={newQuiz.title} onChange={e => setNewQuiz(p => ({...p, title: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input className="form-input" placeholder="e.g. Mathematics" value={newQuiz.subject} onChange={e => setNewQuiz(p => ({...p, subject: e.target.value}))} required />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Class</label>
                    <select className="form-input" value={newQuiz.standard} onChange={e => setNewQuiz(p => ({...p, standard: e.target.value}))}>
                      {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="datetime-local" className="form-input" value={newQuiz.startTime} onChange={e => setNewQuiz(p => ({...p, startTime: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="datetime-local" className="form-input" value={newQuiz.endTime} onChange={e => setNewQuiz(p => ({...p, endTime: e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" className="form-input" value={newQuiz.duration} onChange={e => setNewQuiz(p => ({...p, duration: parseInt(e.target.value) || 10}))} min={1} max={180} style={{maxWidth:'120px'}} />
                </div>

                <h4 className="mt-6 mb-4">Questions ({newQuiz.questions.length})</h4>
                <div className="questions-builder">
                  {newQuiz.questions.map((q, qi) => (
                    <div key={qi} className="question-builder-block">
                      <div className="qb-header">
                        <span className="qb-num">Q{qi + 1}</span>
                        {newQuiz.questions.length > 1 && (
                          <button type="button" className="qb-remove" onClick={() => handleRemoveQuestion(qi)}><Trash2 size={14}/></button>
                        )}
                      </div>
                      <input className="form-input mb-3" placeholder="Question text" value={q.question} onChange={e => handleQuestionChange(qi, 'question', e.target.value)} required />
                      <div className="options-builder">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="option-builder-item">
                            <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => handleQuestionChange(qi, 'correctAnswer', oi)} />
                            <span className="opt-letter">{String.fromCharCode(65 + oi)}</span>
                            <input className="form-input" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => handleOptionChange(qi, oi, e.target.value)} required />
                          </div>
                        ))}
                      </div>
                      <div className="correct-hint">✅ Mark the correct answer using the radio button</div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-secondary mt-4" onClick={handleAddQuestion}>
                  <Plus size={16}/> Add Question
                </button>
                <button type="submit" className="btn btn-primary w-full mt-6">Create Quiz</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <motion.div className={`toast toast-${toast.type}`} initial={{opacity:0,x:100}} animate={{opacity:1,x:0}} exit={{opacity:0,x:100}}>
          {toast.msg}
        </motion.div>}
      </AnimatePresence>

      <style>{`
        .quizzes-page .page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .page-header h1 { font-size: 1.6rem; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }

        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 20px; }
        .empty-state h3 { margin-top: 16px; }
        .empty-state p { color: var(--text-muted); margin-top: 8px; }

        .quiz-card { padding: 24px; position: relative; }
        .quiz-status-badge {
          display: inline-block; padding: 3px 10px; border-radius: var(--radius-full);
          font-size: 0.7rem; font-weight: 800; margin-bottom: 12px;
        }
        .quiz-status-badge.active { background: #d1fae5; color: #065f46; }
        .quiz-status-badge.upcoming { background: #fef3c7; color: #92400e; }
        .quiz-status-badge.ended { background: #fee2e2; color: #b91c1c; }

        .quiz-card h3 { font-size: 1.05rem; margin-bottom: 8px; }
        .quiz-card-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .quiz-card-meta span {
          padding: 2px 8px; border-radius: var(--radius-full);
          font-size: 0.7rem; font-weight: 700;
          background: var(--bg-input); border: 1px solid var(--border);
        }
        .quiz-schedule { font-size: 0.75rem; color: var(--text-muted); }
        .quiz-card-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }
        .quiz-card-actions { display: flex; gap: 8px; }

        .submitted-badge { display: flex; align-items: center; gap: 4px; color: #10b981; font-weight: 700; font-size: 0.85rem; }
        .upcoming-badge { display: flex; align-items: center; gap: 4px; color: #f59e0b; font-weight: 700; font-size: 0.85rem; }
        .ended-badge { color: var(--text-muted); font-weight: 600; font-size: 0.85rem; }

        /* Quiz Attempt */
        .quiz-attempt { padding: 28px; }
        .quiz-attempt-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid var(--border);
          flex-wrap: wrap; gap: 12px;
        }
        .quiz-meta { font-size: 0.85rem; color: var(--text-muted); }
        .timer {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; background: var(--bg-input);
          border-radius: var(--radius-full); font-weight: 800;
          font-size: 1.2rem; color: var(--primary);
          border: 2px solid var(--border);
        }
        .timer.warning { color: #ef4444; border-color: #ef4444; animation: pulse 1s infinite; }

        .question-block {
          padding: 20px; background: var(--bg-input);
          border-radius: var(--radius-md); border: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .question-number { font-weight: 800; color: var(--primary); font-size: 0.85rem; margin-bottom: 8px; }
        .question-text { font-weight: 600; margin-bottom: 12px; }
        .options-list { display: flex; flex-direction: column; gap: 8px; }
        .option-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; background: var(--bg-card);
          border-radius: var(--radius-sm); border: 1.5px solid var(--border);
          cursor: pointer; transition: all 0.2s;
        }
        .option-item:hover { border-color: var(--primary); }
        .option-item.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.08); }
        .option-item input { display: none; }
        .option-letter {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--border); display: flex; align-items: center;
          justify-content: center; font-weight: 800; font-size: 0.75rem;
          flex-shrink: 0;
        }
        .option-item.selected .option-letter { background: var(--primary); color: white; }

        .quiz-attempt-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);
        }
        .answered-count { font-weight: 600; color: var(--text-muted); }

        /* Quiz Result */
        .quiz-result { padding: 40px; text-align: center; max-width: 600px; margin: 0 auto; }
        .result-header { margin-bottom: 24px; }
        .result-header h2 { margin-top: 12px; }
        .result-stats { display: flex; justify-content: center; gap: 40px; margin-bottom: 28px; }
        .result-stat { display: flex; flex-direction: column; align-items: center; }
        .result-stat-value { font-size: 2rem; font-weight: 900; }
        .result-stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .result-details { text-align: left; }
        .result-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: var(--radius-sm);
          margin-bottom: 6px; font-size: 0.85rem;
        }
        .result-item.correct { background: rgba(16, 185, 129, 0.08); }
        .result-item.wrong { background: rgba(239, 68, 68, 0.08); }
        .result-q-num { font-weight: 800; color: var(--text-muted); width: 32px; }

        /* Create Quiz Modal */
        .create-quiz-modal { max-width: 700px; max-height: 90vh; overflow-y: auto; }
        .modal-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-close { background: none; color: var(--text-muted); }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 10px 14px; border-radius: var(--radius-md);
          border: 1px solid var(--border); background: var(--bg-input);
          color: var(--text-main); font-family: inherit; font-size: 0.9rem;
        }
        .form-input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

        .question-builder-block {
          padding: 20px; background: var(--bg-input);
          border-radius: var(--radius-md); border: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .qb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .qb-num { font-weight: 800; color: var(--primary); }
        .qb-remove { background: none; color: #ef4444; }
        .mb-3 { margin-bottom: 12px; }
        .options-builder { display: flex; flex-direction: column; gap: 8px; }
        .option-builder-item { display: flex; align-items: center; gap: 8px; }
        .option-builder-item input[type="radio"] { flex-shrink: 0; }
        .opt-letter {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--border); display: flex; align-items: center;
          justify-content: center; font-weight: 800; font-size: 0.7rem;
          flex-shrink: 0;
        }
        .correct-hint { font-size: 0.7rem; color: var(--text-muted); margin-top: 8px; font-style: italic; }
        .mt-6 { margin-top: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }

        /* Results Table */
        .results-table-wrap { overflow-x: auto; }
        .results-table { width: 100%; border-collapse: collapse; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border); }
        .results-table th { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
        .pct-badge { padding: 2px 10px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.8rem; }
        .pct-badge.pass { background: #d1fae5; color: #065f46; }
        .pct-badge.fail { background: #fee2e2; color: #b91c1c; }

        @media (max-width: 768px) {
          .quizzes-grid { grid-template-columns: 1fr; }
          .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
          .quiz-attempt-header { flex-direction: column; text-align: center; }
          .result-stats { gap: 20px; }
          .quiz-attempt-footer { flex-direction: column; gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default Quizzes;
