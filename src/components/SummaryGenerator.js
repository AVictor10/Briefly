import React from 'react';
import { apiService } from '../services/api';

const SummaryGenerator = ({
  transcript,
  customPrompt,
  setSummary,
  isLoading,
  setIsLoading,
  setMessage
}) => {
  const generateSummary = async () => {
    // Validation
    if (!transcript.trim()) {
      setMessage({ text: 'Please upload a transcript file first', type: 'error' });
      return;
    }
    
    if (!customPrompt.trim()) {
      setMessage({ text: 'Please enter summary instructions', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' }); // Clear previous messages
    
    try {
      // Call the real API
      const response = await apiService.generateSummary(transcript, customPrompt);
      setSummary(response.summary);
      setMessage({ text: 'Summary generated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating summary:', error);
      setMessage({ 
        text: typeof error === 'string' ? error : 'Failed to generate summary. Please try again.',
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>3. Generate Summary</h2>
      <button
        onClick={generateSummary}
        disabled={isLoading}
        className="btn"
      >
        {isLoading ? 'Processing...' : 'Generate AI Summary'}
      </button>
      
      {isLoading && (
        <div className="loading">
          <p>Processing your meeting notes with AI...</p>
          <p><small>This may take up to 30 seconds</small></p>
        </div>
      )}
    </section>
  );
};

export default SummaryGenerator;