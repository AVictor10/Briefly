import axios from 'axios';

// Base URL for your Flask backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for AI processing
});

// API service functions
export const apiService = {
  // Generate AI summary
  generateSummary: async (transcript, customPrompt = '') => {
    try {
      const response = await api.post('/api/summary/generate', {
        transcript: transcript,
        customPrompt: customPrompt
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw 'Request timed out. Please try again.';
      }
      throw error.response?.data?.error || error.message || 'Failed to generate summary';
    }
  },
 
  // Share summary via email
  shareSummary: async (summary, recipients, subject = 'Meeting Summary') => {
    try {
      const response = await api.post('/api/email/send', {
        summary: summary,
        recipients: recipients,
        subject: subject
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw 'Request timed out. Please try again.';
      }
      throw error.response?.data?.error || error.message || 'Failed to share summary';
    }
  }
};

// Legacy function for backward compatibility
export const shareSummary = async ({ summary, recipients, subject }) => {
  const response = await api.post("/api/email/send", {
    summary,
    recipients,
    subject,
  });
  return response.data;
};

export default apiService;