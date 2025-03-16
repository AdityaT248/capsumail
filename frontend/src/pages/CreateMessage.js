import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateMessage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    recipient_email: currentUser?.email || '',
    subject: '',
    content: '',
    scheduled_date: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Ensure the date is in ISO format with timezone information
      const scheduledDate = new Date(formData.scheduled_date);
      
      if (file) {
        // Create FormData for file upload
        const formDataWithFile = new FormData();
        formDataWithFile.append('recipient_email', formData.recipient_email);
        formDataWithFile.append('subject', formData.subject);
        formDataWithFile.append('content', formData.content);
        formDataWithFile.append('scheduled_date', scheduledDate.toISOString());
        formDataWithFile.append('file', file);
        
        await messageApi.createMessageWithAttachment(formDataWithFile);
      } else {
        await messageApi.createMessage({
          ...formData,
          scheduled_date: scheduledDate.toISOString()
        });
      }
      
      setSuccess('Message scheduled successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error("Error creating message:", err);
      setError(err.response?.data?.detail || 'Failed to schedule message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="message-form card">
        <h2>Create a Time Capsule Message</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipient_email">Recipient Email</label>
            <input
              type="email"
              id="recipient_email"
              name="recipient_email"
              value={formData.recipient_email}
              onChange={handleChange}
              required
            />
            <small>Who should receive this message? (Can be your own email)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Message</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              required
            ></textarea>
            <small>Write a message to your future self or someone else</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="scheduled_date">Delivery Date</label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
            <small>When should this message be delivered?</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="file">Attachment (Optional)</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMessage;