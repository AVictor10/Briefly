import React from 'react';

const CustomPrompt = ({ prompt, setPrompt }) => {
  return (
    <section className="section">
      <h2>2. Enter Summary Instructions</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your instructions (e.g., 'Summarize in bullet points for executives' or 'Focus only on action items')"
        rows="4"
        className="textarea"
      />
    </section>
  );
};

export default CustomPrompt;