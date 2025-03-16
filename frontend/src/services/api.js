import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:8000';

// Add a request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token but don't redirect automatically
      localStorage.removeItem('token');
      console.error("Authentication error:", error);
    }
    return Promise.reject(error);
  }
);

// Message API
const messageApi = {
  // Get all messages
  getMessages: async () => {
    try {
      const response = await axios.get('/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  // Get a single message
  getMessage: async (id) => {
    try {
      const response = await axios.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new message
  createMessage: async (messageData) => {
    try {
      const response = await axios.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },
  
  // Create a message with attachment
  createMessageWithAttachment: async (formData) => {
    try {
      const response = await axios.post('/messages/with-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating message with attachment:', error);
      throw error;
    }
  },
  
  // Delete a message
  deleteMessage: async (id) => {
    try {
      const response = await axios.delete(`/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  }
};

export { messageApi }; 