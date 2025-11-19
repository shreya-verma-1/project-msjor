import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const QuizTakeBootstrap = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Debug: Log the params object structure
  console.log('Full params object:', params);
  console.log('Params keys:', Object.keys(params));
  
  // Try to extract quizId from params
  const quizId = params.id || params.quizId;
  console.log('Extracted quizId:', quizId);
  console.log('Current URL:', window.location.href);
  console.log('Full path:', window.location.pathname);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleSubmit();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const fetchQuiz = async () => {
    if (!quizId) {
      console.error('No quiz ID provided');
      navigate('/quizzes');
      setLoading(false);
      return;
    }
    
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        const quizData = { id: quizDoc.id, ...quizDoc.data() };
        setQuiz(quizData);
        setTimeLeft(quizData.duration * 60);
      } else {
        navigate('/quizzes');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (quiz && quiz.questions && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setQuizCompleted(true);

    try {
      await addDoc(collection(db, 'quizResults'), {
        studentId: currentUser.uid,
        quizId: quiz.id,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score: finalScore,
        answers: answers,
        totalQuestions: quiz.questions.length,
        completedAt: new Date().toISOString(),
        timeTaken: (quiz.duration * 60) - timeLeft
      });
    } catch (err) {
      console.error('Error saving quiz result:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <h2 className="mb-4">Quiz not found</h2>
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn btn-primary"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center py-5">
        <div className="container">
          <div className="card shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
            <div className="card-body p-4 p-md-5 text-center">
              <h1 className="display-5 fw-bold text-primary mb-4">{quiz.title}</h1>
              
              <div className="row g-4 mb-5 text-start">
                <div className="col-md-6">
                  <p className="mb-2"><strong className="text-muted">Subject:</strong> {quiz.subject}</p>
                  <p className="mb-2"><strong className="text-muted">Class:</strong> {quiz.class}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2"><strong className="text-muted">Questions:</strong> {quiz.questions.length}</p>
                  <p className="mb-0"><strong className="text-muted">Duration:</strong> {quiz.duration} minutes</p>
                </div>
              </div>

              <div className="alert alert-primary text-start">
                <h5 className="alert-heading">Instructions:</h5>
                <ul className="mb-0">
                  <li>Answer all questions within the time limit</li>
                  <li>You can navigate between questions using Next/Previous buttons</li>
                  <li>Select one option for each question</li>
                  <li>Submit the quiz before time runs out</li>
                  <li>Your score will be calculated automatically</li>
                </ul>
              </div>

              <button 
                onClick={startQuiz} 
                className="btn btn-primary btn-lg px-5 py-3 mt-5"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const correctAnswers = Math.round((score / 100) * quiz.questions.length);
    const incorrectAnswers = quiz.questions.length - correctAnswers;
    const resultVariant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
    const resultIcon = score >= 80 ? <CheckCircle size={48} className="mb-3" /> : <XCircle size={48} className="mb-3" />;

    return (
      <div className="bg-light min-vh-100 d-flex align-items-center py-5">
        <div className="container">
          <div className="card shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
            <div className="card-body p-4 p-md-5 text-center">
              <div className={`bg-${resultVariant}-subtle d-inline-flex p-3 rounded-circle mb-4`}>
                {resultIcon}
              </div>
              
              <h1 className="display-5 fw-bold text-primary mb-4">Quiz Completed!</h1>
              
              <div className={`bg-${resultVariant} text-white rounded-4 p-5 mb-5`}>
                <p className="h5 mb-2">Your Score</p>
                <p className="display-1 fw-bold mb-2">{score}%</p>
                <p className="h5 text-white-50">
                  {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                </p>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="p-4 bg-white rounded-3 shadow-sm h-100">
                    <p className="text-muted mb-1">Total Questions</p>
                    <p className="h2 fw-bold text-primary">{quiz.questions.length}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-4 bg-success bg-opacity-10 rounded-3 h-100">
                    <p className="text-muted mb-1">Correct</p>
                    <p className="h2 fw-bold text-success">{correctAnswers}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-4 bg-danger bg-opacity-10 rounded-3 h-100">
                    <p className="text-muted mb-1">Incorrect</p>
                    <p className="h2 fw-bold text-danger">{incorrectAnswers}</p>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3 d-sm-flex justify-content-center">
                <button
                  onClick={() => navigate('/student/report')}
                  className="btn btn-primary px-5"
                >
                  View Report
                </button>
                <button
                  onClick={() => navigate('/quizzes')}
                  className="btn btn-outline-primary px-5"
                >
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h4 mb-0 text-primary">{quiz.title}</h1>
                <p className="text-muted mb-0">{quiz.subject} - Class {quiz.class}</p>
              </div>
              <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
                <Clock className="text-primary me-2" />
                <span className="fw-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="progress w-100 me-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                  aria-valuenow={currentQuestion + 1}
                  aria-valuemin="0"
                  aria-valuemax={quiz.questions.length}
                ></div>
              </div>
              <span className="text-muted">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
            </div>

            <div className="mb-5">
              <h4 className="mb-4">{currentQ.question}</h4>
              
              <div className="list-group">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action text-start ${
                      answers[currentQuestion] === index ? 'active' : ''
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <div>{option}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="btn btn-outline-primary"
              >
                Previous
              </button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="btn btn-success px-4"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn btn-primary px-4"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakeBootstrap;