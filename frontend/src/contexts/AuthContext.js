import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:8000';

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Get current user info
          const response = await axios.get('/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          console.log("Authentication successful on initial load", response.data);
        } catch (err) {
          // Token might be expired or invalid
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/register', {
        name,
        email,
        password
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      
      // Use FormData for token endpoint (OAuth2 standard)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('/auth/token', formData);
      
      // Save token to localStorage
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Get user info
      const userResponse = await axios.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set authentication state
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      
      console.log("Login successful, user authenticated:", userResponse.data);
      
      return userResponse.data;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 