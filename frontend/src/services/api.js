import axios from 'axios';

// Set up axios defaults
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

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
      const response = await axios.get('/api/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  // Get a single message
  getMessage: async (id) => {
    try {
      const response = await axios.get(`/api/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new message
  createMessage: async (messageData) => {
    try {
      console.log('Sending message data:', messageData);
      const response = await axios.post('/api/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },
  
  // Create a message with attachment
  createMessageWithAttachment: async (formData) => {
    try {
      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await axios.post('/api/messages/with-attachment', formData, {
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
      const response = await axios.delete(`/api/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  }
};

export { messageApi }; 