import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageApi } from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageApi.getMessages();
        setMessages(Array.isArray(data) ? data : []);
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

  const getDeliveryStatus = (date) => {
    const now = new Date();
    const scheduledDate = new Date(date);
    
    if (scheduledDate < now) {
      return { status: 'delivered', text: 'Delivered' };
    }
    
    const timeLeft = formatDistanceToNow(scheduledDate, { addSuffix: true });
    return { status: 'pending', text: `Delivery ${timeLeft}` };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-animation">
            <span className="loading-icon">⏳</span>
          </div>
          <p>Loading your time capsules...</p>
        </div>
      </div>
    );
  }

  const messageList = Array.isArray(messages) ? messages : [];

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Your Time Capsule Messages</h2>
        <Link to="/create" className="btn btn-primary">
          <i className="create-icon">✉️</i> Create New Time Capsule
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {messageList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Time Capsules Yet</h3>
          <p>You haven't created any time capsule messages yet. Send a message to your future self or someone special.</p>
          <Link to="/create" className="btn btn-primary">Create Your First Time Capsule</Link>
        </div>
      ) : (
        <div className="grid">
          {messageList.map(message => {
            const deliveryStatus = getDeliveryStatus(message.scheduled_date);
            
            return (
              <div key={message.id} className="message-card">
                <div className={`status-badge ${deliveryStatus.status}`}>
                  {deliveryStatus.text}
                </div>
                
                <h3>{message.subject}</h3>
                
                <p className="message-date">
                  {format(new Date(message.scheduled_date), 'PPP')}
                </p>
                
                <p className="message-recipient">
                  <i className="recipient-icon">👤</i> {message.recipient_email}
                </p>
                
                <div className="message-preview">
                  {message.content.length > 100 
                    ? `${message.content.substring(0, 100)}...` 
                    : message.content}
                </div>
                
                {message.has_attachment && (
                  <div className="attachment-indicator">
                    <i className="attachment-icon">📎</i> Has attachment
                  </div>
                )}
                
                <div className="message-actions">
                  <button 
                    onClick={() => handleDelete(message.id)} 
                    className="btn btn-icon btn-danger"
                    title="Delete this time capsule"
                  >
                    🗑️
                  </button>
                </div>
                
                <Link to={`/messages/${message.id}`} className="message-link">
                  View Time Capsule
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;