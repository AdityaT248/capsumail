import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">TimeCapsule</h3>
            <p className="footer-description">
              Send messages to your future self. Reflect, remember, and reconnect with your past.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Links</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Sign Up</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <p>Email: support@timecapsule.example.com</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} TimeCapsule. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 