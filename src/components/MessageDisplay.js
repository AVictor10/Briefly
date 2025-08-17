import React from 'react';

const MessageDisplay = ({ message }) => {
  // Only render if message exists
  if (!message.text) return null;

  return (
    <div className={`message ${message.type}`}>
      {message.text}
    </div>
  );
};

export default MessageDisplay;