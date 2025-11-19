import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const StudentSignupBootstrap = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '',
    rollNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const classes = [6, 7, 8, 9, 10, 11, 12];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.class) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        class: formData.class,
        rollNumber: formData.rollNumber,
        role: 'student',
        createdAt: new Date().toISOString()
      });

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please enter a valid email.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center mb-4">
              <div className="d-inline-flex justify-content-center align-items-center bg-primary rounded-circle mb-3" style={{ width: '48px', height: '48px' }}>
                <User className="text-white" size={24} />
              </div>
              <h2 className="fw-bold">Student Sign Up</h2>
              <p className="text-muted">
                Or{' '}
                <a href="/student-login" className="text-primary text-decoration-none">
                  sign in to your account
                </a>
              </p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <AlertCircle className="me-2" size={20} />
                    <div>{error}</div>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <CheckCircle className="me-2" size={20} />
                    <div>{success}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={20} className="text-muted" />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Mail size={20} className="text-muted" />
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="class" className="form-label">
                        Class *
                      </label>
                      <select
                        id="class"
                        name="class"
                        required
                        value={formData.class}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Select your class</option>
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            Class {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="rollNumber" className="form-label">
                        Roll Number
                      </label>
                      <input
                        id="rollNumber"
                        name="rollNumber"
                        type="text"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter roll number"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={20} className="text-muted" />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={20} className="text-muted" />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSignupBootstrap;