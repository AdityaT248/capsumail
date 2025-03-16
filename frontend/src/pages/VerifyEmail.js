import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/auth/verify?token=${token}`);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.detail || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  if (loading) {
    return <div className="loading">Verifying your email...</div>;
  }
  
  return (
    <div className="container">
      <div className="auth-container">
        <h2>Email Verification</h2>
        
        {error && (
          <div>
            <div className="error">{error}</div>
            <p>The verification link may have expired or is invalid.</p>
          </div>
        )}
        
        {success && (
          <div>
            <div className="success">Your email has been verified successfully!</div>
            <p>You can now log in to your account.</p>
          </div>
        )}
        
        <div className="auth-footer">
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;