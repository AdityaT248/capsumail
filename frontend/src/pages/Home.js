import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Send Messages to Your Future Self</h1>
          <p>
            TimeCapsule lets you schedule emails to be delivered at a future date.
            Capture your thoughts, goals, and memories today, and rediscover them tomorrow.
          </p>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </section>
      
      <section className="features container">
        <h2>How It Works</h2>
        <div className="grid">
          <div className="feature-card">
            <h3>Write a Message</h3>
            <p>Compose a message to your future self or someone special.</p>
          </div>
          <div className="feature-card">
            <h3>Set a Delivery Date</h3>
            <p>Choose when you want your message to be delivered.</p>
          </div>
          <div className="feature-card">
            <h3>Receive in the Future</h3>
            <p>Get surprised by your past thoughts when the time comes.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;