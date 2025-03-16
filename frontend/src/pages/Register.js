import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">✨</span>
          <h2>Create Your Account</h2>
          <p className="auth-subtitle">Begin your journey through time</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="icon">✉️</i> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="icon">🔒</i> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="icon">🔐</i> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className="auth-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <Link to="/" className="btn btn-text">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;