import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageApi } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageApi.getMessages();
        setMessages(data);
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageApi.deleteMessage(id);
        setMessages(messages.filter(message => message.id !== id));
      } catch (err) {
        setError('Failed to delete message');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Your Time Capsule Messages</h2>
        <Link to="/create-message" className="btn btn-primary">Create New Message</Link>
      </div>

      {error && <div className="error">{error}</div>}

      {messages.length === 0 ? (
        <div className="card">
          <p>You don't have any scheduled messages yet.</p>
          <Link to="/create-message" className="btn btn-secondary">Create Your First Message</Link>
        </div>
      ) : (
        <div className="grid">
          {messages.map(message => (
            <div key={message.id} className="card message-card">
              <h3>{message.subject}</h3>
              <p className="message-date">
                Scheduled for: {format(new Date(message.scheduled_date), 'PPP')}
              </p>
              <p>
                To: {message.recipient_email}
              </p>
              <p>
                {message.content.length > 100 
                  ? `${message.content.substring(0, 100)}...` 
                  : message.content}
              </p>
              <div className="message-actions">
                <button 
                  onClick={() => handleDelete(message.id)} 
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
              <Link to={`/messages/${message.id}`} className="btn btn-secondary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;