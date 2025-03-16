import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      console.log("Login successful in Login component");
      
      // Navigate directly to dashboard
      if (process.env.NODE_ENV === 'production') {
        // In production, use window.location for a full page reload
        window.location.href = '/dashboard';
      } else {
        // In development, use React Router
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error("Login error in component:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">🔐</span>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your time capsules</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
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
                <span>Unlocking...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account yet? <Link to="/register" className="auth-link">Create Account</Link></p>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <Link to="/" className="btn btn-text">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;