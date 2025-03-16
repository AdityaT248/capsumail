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
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
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

  // Calculate delivery date difference for display
  const getDeliveryDateMessage = () => {
    if (!formData.scheduled_date) return '';
    
    const now = new Date();
    const scheduledDate = new Date(formData.scheduled_date);
    const diffTime = Math.abs(scheduledDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Your message will be delivered today!';
    if (diffDays === 1) return 'Your message will be delivered tomorrow!';
    return `Your message will be delivered in ${diffDays} days!`;
  };

  return (
    <div className="container">
      <div className="message-form">
        <h2>Create a Time Capsule Message</h2>
        <p className="form-intro">
          Write a message to your future self or someone special. This digital time capsule 
          will deliver your thoughts, memories, and attachments at the exact date and time you choose.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipient_email">
              <i className="icon">✉️</i> Recipient Email
            </label>
            <input
              type="email"
              id="recipient_email"
              name="recipient_email"
              value={formData.recipient_email}
              onChange={handleChange}
              required
              placeholder="Who will receive this message?"
            />
            <small>This can be your own email or someone else's</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">
              <i className="icon">📝</i> Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="A title for your time capsule"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">
              <i className="icon">💌</i> Your Message
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              required
              placeholder="Write your thoughts, memories, or a message to your future self..."
            ></textarea>
            <small>What would you like to say to the future?</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="scheduled_date">
              <i className="icon">🗓️</i> Delivery Date
            </label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
            <small>Choose when your message will be delivered</small>
          </div>
          
          {formData.scheduled_date && (
            <div className="countdown">
              <span>{getDeliveryDateMessage()}</span>
            </div>
          )}
          
          <div className="form-group">
            <label>
              <i className="icon">📎</i> Attachment (Optional)
            </label>
            <div 
              className={`file-upload ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="file-upload-content">
                {file ? (
                  <div className="file-info">
                    <i className="file-icon">📄</i>
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <>
                    <i className="upload-icon">📤</i>
                    <p>Drag and drop a file here, or click to select</p>
                    <small>Add a photo, document, or any file to your time capsule</small>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="message-preview">
            <div className="preview-header">
              <h3>{formData.subject || 'Your Time Capsule'}</h3>
              <div className="preview-date">
                To be opened on: {formData.scheduled_date ? new Date(formData.scheduled_date).toLocaleString() : 'the future'}
              </div>
            </div>
            <div className="preview-content">
              {formData.content || 'Your message will appear here...'}
            </div>
            {file && (
              <div className="preview-attachment">
                <i className="attachment-icon">📎</i> {file.name}
              </div>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Sealing your time capsule...' : 'Seal this time capsule'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMessage;