import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { messageApi } from '../services/api';
import { format } from 'date-fns';

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await messageApi.getMessage(id);
        setMessage(data);
      } catch (err) {
        setError('Failed to load message details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageApi.deleteMessage(id);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete message');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading message details...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container">
        <div className="error">Message not found</div>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container message-detail">
      <div className="card">
        <div className="dashboard-header">
          <h2>{message.subject}</h2>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
        
        <p className="message-date">
          <strong>Scheduled for:</strong> {format(new Date(message.scheduled_date), 'PPP pp')}
        </p>
        
        <p>
          <strong>To:</strong> {message.recipient_email}
        </p>
        
        <p>
          <strong>Status:</strong> {message.is_sent ? 'Sent' : 'Scheduled'}
        </p>
        
        <div className="message-content">
          {message.content}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="attachment-list">
            <h3>Attachments</h3>
            {message.attachments.map(attachment => (
              <div key={attachment.id} className="attachment-item">
                <span>{attachment.file_path.split('/').pop()}</span>
              </div>
            ))}
          </div>
        )}
        
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default MessageDetail;