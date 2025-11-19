import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Brain, Video, FileText, BarChart3, Clock,
  CheckCircle, TrendingUp, Award, Calendar, Download,
  Play, Eye, User, LogOut, Settings
} from 'lucide-react';

const StudentDashboardBootstrap = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalLectures: 0,
    totalPYQs: 0,
    completedQuizzes: 0,
    averageScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [availableContent, setAvailableContent] = useState({
    notes: [],
    quizzes: [],
    lectures: [],
    pyqs: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
      fetchStats();
      fetchRecentActivity();
      fetchAvailableContent();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch quiz results to calculate stats
      const quizResultsQuery = query(
        collection(db, 'quizResults'),
        where('studentId', '==', currentUser.uid),
        orderBy('completedAt', 'desc')
      );
      const quizResultsSnapshot = await getDocs(quizResultsQuery);
      const quizResults = quizResultsSnapshot.docs.map(doc => doc.data());
      
      const completedQuizzes = quizResults.length;
      const averageScore = completedQuizzes > 0 
        ? Math.round(quizResults.reduce((acc, result) => acc + result.score, 0) / completedQuizzes)
        : 0;

      // Fetch content counts
      const [notesSnapshot, quizzesSnapshot, lecturesSnapshot, pyqsSnapshot] = await Promise.all([
        getDocs(collection(db, 'notes')),
        getDocs(collection(db, 'quizzes')),
        getDocs(collection(db, 'lectures')),
        getDocs(collection(db, 'pyqs'))
      ]);

      setStats({
        totalNotes: notesSnapshot.size,
        totalQuizzes: quizzesSnapshot.size,
        totalLectures: lecturesSnapshot.size,
        totalPYQs: pyqsSnapshot.size,
        completedQuizzes,
        averageScore
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const quizResultsQuery = query(
        collection(db, 'quizResults'),
        where('studentId', '==', currentUser.uid),
        orderBy('completedAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(quizResultsQuery);
      const activity = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'quiz',
        timestamp: doc.data().completedAt?.toDate?.() || new Date()
      }));
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContent = async () => {
    try {
      // First try to fetch quizzes without orderBy to see if they exist
      const quizzesTestSnapshot = await getDocs(collection(db, 'quizzes'));
      console.log('Total quizzes in DB:', quizzesTestSnapshot.size);
      
      // Check if quizzes have uploadedAt field
      const hasUploadedAt = quizzesTestSnapshot.docs.some(doc => doc.data().uploadedAt);
      console.log('Quizzes have uploadedAt field:', hasUploadedAt);
      
      const [notesSnapshot, quizzesSnapshot, lecturesSnapshot, pyqsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'notes'), orderBy('uploadedAt', 'desc'), limit(3))),
        hasUploadedAt 
          ? getDocs(query(collection(db, 'quizzes'), orderBy('uploadedAt', 'desc'), limit(3)))
          : getDocs(query(collection(db, 'quizzes'), limit(3))),
        getDocs(query(collection(db, 'lectures'), orderBy('uploadedAt', 'desc'), limit(3))),
        getDocs(query(collection(db, 'pyqs'), orderBy('uploadedAt', 'desc'), limit(3)))
      ]);

      const content = {
        notes: notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        quizzes: quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        lectures: lecturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        pyqs: pyqsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
      console.log('Fetched content:', content);
      console.log('Quizzes fetched:', quizzesSnapshot.size);
      setAvailableContent(content);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Debug function to add a test quiz
  const addTestQuiz = async () => {
    try {
      const { Timestamp, addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');
      const { currentUser } = await import('../../context/AuthContext').then(m => m.useAuth());
      
      const testQuiz = {
        title: 'Test Quiz - Mathematics',
        description: 'A test quiz for debugging purposes',
        subject: 'Mathematics',
        class: '10',
        duration: 30,
        questions: [
          {
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1
          },
          {
            question: 'What is 5 x 5?',
            options: ['20', '25', '30', '35'],
            correctAnswer: 1
          }
        ],
        uploadedBy: currentUser?.uid || 'test-user',
        uploadedAt: Timestamp.now(),
        totalQuestions: 2,
        type: 'quiz'
      };
      
      await addDoc(collection(db, 'quizzes'), testQuiz);
      console.log('Test quiz added successfully!');
      // Refresh the content
      fetchAvailableContent();
    } catch (error) {
      console.error('Error adding test quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {userData?.name || 'Student'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateTo('/student/profile')}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalNotes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedQuizzes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lectures</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalLectures}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigateTo('/notes')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Notes</span>
            </button>
            <button
              onClick={() => navigateTo('/quizzes')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <Brain className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Take Quiz</span>
            </button>
            <button
              onClick={() => navigateTo('/lectures')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <Video className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Watch Lectures</span>
            </button>
            <button
              onClick={() => navigateTo('/pyqs')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Practice PYQs</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Quiz Completed</p>
                      <p className="text-sm text-gray-500">{activity.quizTitle || 'Quiz'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{activity.score}%</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>

        {/* Available Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notes</h2>
            {availableContent.notes.length > 0 ? (
              <div className="space-y-3">
                {availableContent.notes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{note.title}</p>
                      <p className="text-sm text-gray-500">{note.subject} - Class {note.class}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('/notes')}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notes available</p>
            )}
          </div>

          {/* Recent Quizzes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Quizzes</h2>
            {availableContent.quizzes.length > 0 ? (
              <div className="space-y-3">
                {availableContent.quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{quiz.title}</p>
                      <p className="text-sm text-gray-500">{quiz.subject} - {quiz.questions?.length || 0} questions</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Button clicked!');
                        console.log('Navigating to quiz:', quiz);
                        console.log('Quiz ID:', quiz.id);
                        console.log('Quiz object keys:', Object.keys(quiz));
                        if (!quiz.id) {
                          console.error('Quiz ID is undefined!');
                          return;
                        }
                        navigateTo(`/quiz/${quiz.id}`);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No quizzes available</p>
            )}
          </div>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Tools</h3>
          <button
            onClick={addTestQuiz}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Test Quiz
          </button>
          <p className="text-sm text-yellow-700 mt-2">
            Total Quizzes in DB: {stats.totalQuizzes}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardBootstrap;