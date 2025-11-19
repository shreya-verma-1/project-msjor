import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/NavbarBootstrap';
import Footer from './components/FooterBootstrap';
import Home from './pages/HomeBootstrap';
import About from './pages/AboutBootstrap';
import Contact from './pages/ContactBootstrap';
import Terms from './pages/TermsBootstrap';
import Login from './pages/auth/LoginBootstrap';
import StudentLogin from './pages/auth/StudentLoginBootstrap';
import TeacherLogin from './pages/auth/TeacherLoginBootstrap';
import TeacherSignup from './pages/auth/TeacherSignupBootstrap';
import StudentSignup from './pages/auth/StudentSignupBootstrap';
import StudentDashboard from './pages/student/StudentDashboardBootstrap';
import TeacherDashboard from './pages/teacher/TeacherDashboardBootstrap';
import Notes from './pages/NotesBootstrap';
import Quizzes from './pages/QuizzesBootstrap';
import QuizTake from './pages/QuizTakeBootstrap';
import RecordedLectures from './pages/RecordedLecturesBootstrap';
import PYQs from './pages/PYQsBootstrap';
import StudentProfile from './pages/student/StudentProfileBootstrap';
import StudentReport from './pages/student/StudentReport';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/teacher-signup" element={<TeacherSignup />} />
              <Route path="/student-signup" element={<StudentSignup />} />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/report" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentReport />
                  </ProtectedRoute>
                } 
              />
              
              {/* Teacher Routes */}
              <Route 
                path="/teacher/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Content Routes (accessible to all authenticated users) */}
              <Route 
                path="/notes" 
                element={
                  <ProtectedRoute>
                    <Notes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quizzes" 
                element={
                  <ProtectedRoute>
                    <Quizzes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:id" 
                element={
                  <ProtectedRoute>
                    <QuizTake />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lectures" 
                element={
                  <ProtectedRoute>
                    <RecordedLectures />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pyqs" 
                element={
                  <ProtectedRoute>
                    <PYQs />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;