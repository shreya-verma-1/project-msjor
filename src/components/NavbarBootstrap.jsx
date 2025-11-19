import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <BookOpen size={32} className="me-2 text-primary-custom" />
          <span className="fw-bold text-primary-custom">Digital Learning</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active fw-bold' : ''}`} 
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/about') ? 'active fw-bold' : ''}`} 
                to="/about"
              >
                About
              </Link>
            </li>
            
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/notes') ? 'active fw-bold' : ''}`} 
                    to="/notes"
                  >
                    Notes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/quizzes') ? 'active fw-bold' : ''}`} 
                    to="/quizzes"
                  >
                    Quizzes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/pyqs') ? 'active fw-bold' : ''}`} 
                    to="/pyqs"
                  >
                    PYQs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/lectures') ? 'active fw-bold' : ''}`} 
                    to="/lectures"
                  >
                    Lectures
                  </Link>
                </li>
              </>
            )}
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/contact') ? 'active fw-bold' : ''}`} 
                to="/contact"
              >
                Contact
              </Link>
            </li>

            {currentUser ? (
              <>
                {userRole === 'student' && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link d-flex align-items-center" 
                      to="/student/profile"
                    >
                      <User size={18} className="me-1" />
                      Profile
                    </Link>
                  </li>
                )}
                {userRole === 'teacher' && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link d-flex align-items-center" 
                      to="/teacher/dashboard"
                    >
                      <LayoutDashboard size={18} className="me-1" />
                      Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button 
                    onClick={handleLogout}
                    className="btn btn-link nav-link text-danger d-flex align-items-center"
                  >
                    <LogOut size={18} className="me-1" />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-custom-primary btn-sm" to="/student-signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;