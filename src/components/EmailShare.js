import React, { useState } from 'react';
import { apiService } from '../services/api';

const EmailShare = ({ summary, setMessage }) => {
  const [subject, setSubject] = useState('Meeting Summary');
  const [recipients, setRecipients] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const shareViaEmail = async () => {
    // Validation
    if (!subject.trim()) {
      setMessage({ text: 'Please enter an email subject', type: 'error' });
      return;
    }
    
    if (!recipients.trim()) {
      setMessage({ text: 'Please enter at least one email address', type: 'error' });
      return;
    }
    
    if (!summary.trim()) {
      setMessage({ text: 'No summary to share. Please generate a summary first', type: 'error' });
      return;
    }
    
    // Validate email format
    const emailList = recipients.split('\n').map(email => email.trim()).filter(email => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (let email of emailList) {
      if (!emailRegex.test(email)) {
        setMessage({ text: `Invalid email format: ${email}`, type: 'error' });
        return;
      }
    }
    
    setIsSharing(true);
    setMessage({ text: '', type: '' }); // Clear previous messages
    
    try {
      // Convert newline-separated emails to comma-separated for backend
      const recipientString = emailList.join(', ');
      
      // Call the real API
      const response = await apiService.shareSummary(summary, recipientString, subject);
      
      setMessage({
        text: `Summary successfully sent to ${emailList.length} recipient(s)!`,
        type: 'success'
      });
      
      setRecipients(''); // Clear recipients after successful send
    } catch (error) {
      console.error('Error sharing summary:', error);
      setMessage({ 
        text: typeof error === 'string' ? error : 'Failed to send summary. Please try again.',
        type: 'error' 
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Only render if summary exists
  if (!summary) return null;

  return (
    <section className="section">
      <h2>4. Share Summary via Email</h2>
      <div className="email-form">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email Subject"
          className="input"
        />
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="Enter email addresses (one per line)"
          rows="3"
          className="textarea"
        />
        <button
          onClick={shareViaEmail}
          disabled={isSharing}
          className="btn share-btn"
        >
          {isSharing ? 'Sending...' : 'Send Summary'}
        </button>
      </div>
      {!process.env.REACT_APP_EMAIL_CONFIGURED && (
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          <em>Note: Email functionality requires backend email configuration</em>
        </p>
      )}
    </section>
  );
};

export default EmailShare;