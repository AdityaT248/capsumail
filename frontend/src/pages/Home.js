import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Send Messages Through Time</h1>
          <p>
            Create digital time capsules that deliver your thoughts, memories, and attachments 
            to your future self or loved ones at the exact moment you choose.
          </p>
          {isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">My Time Capsules</Link>
              <Link to="/create-message" className="btn btn-secondary">Create New Capsule</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Start Your Journey</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </div>
          )}
        </div>
      </section>
      
      <section className="features container">
        <h2>Preserve Moments in Time</h2>
        <div className="grid">
          <div className="feature-card">
            <i className="feature-icon">✍️</i>
            <h3>Capture Today</h3>
            <p>Write letters to your future self, preserve your current thoughts, goals, and dreams.</p>
          </div>
          <div className="feature-card">
            <i className="feature-icon">🗓️</i>
            <h3>Schedule Delivery</h3>
            <p>Set the perfect date for your message to arrive—next week, next year, or on a special anniversary.</p>
          </div>
          <div className="feature-card">
            <i className="feature-icon">💌</i>
            <h3>Rediscover Later</h3>
            <p>Experience the joy of receiving messages from your past self exactly when you need them most.</p>
          </div>
        </div>
      </section>
      
      <section className="testimonials container">
        <h2>What People Are Saying</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="quote">"I sent myself a message on my wedding day to be opened on our 5th anniversary. Reading it brought back all those emotions and memories."</div>
            <div className="author">— Sarah T.</div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"I use TimeCapsule to send encouragement to my future self during tough times. It's like having a conversation across time."</div>
            <div className="author">— Michael R.</div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"I wrote letters to my daughter for her to open on each birthday until she turns 18. This platform makes it so easy."</div>
            <div className="author">— Jessica M.</div>
          </div>
        </div>
      </section>
      
      <section className="cta container">
        <div className="cta-content">
          <h2>Begin Your Time Travel Journey</h2>
          <p>Start creating meaningful connections between your present and future self today.</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-large">Create Your First Time Capsule</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;